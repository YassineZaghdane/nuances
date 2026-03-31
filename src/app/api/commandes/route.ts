/**
 * @module API Commandes
 * @description Création et liste des commandes
 * GET  : liste (auth requise)
 * POST : création (public)
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererNumeroCommande } from "@/lib/order-numbers";
import { envoyerConfirmationCommande } from "@/lib/email";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rateLimit";
import { TAILLE_ML } from "@/types";
import { z } from "zod";

const commandeSchema = z.object({
  client: z.object({
    nom:       z.string().min(2).max(100),
    telephone: z.string().min(8).max(20),
    email:     z.string().email().optional().or(z.literal("")),
    adresse:   z.string().max(200).optional(),
    ville:     z.string().max(100).optional(),
  }),
  lignes: z.array(z.object({
    produitId:    z.string().min(1).max(100),
    taille:       z.enum(["5ml","10ml","15ml","30ml","50ml","100ml","1ml","2ml","3ml","7ml","20ml","200ml"] as const),
    quantite:     z.number().int().min(1).max(99),
    prixUnitaire: z.number().positive().max(99999),
  })).min(1).max(20),
  fraisLivraison:   z.number().min(0).max(500).optional().default(0),
  modePaiement:     z.enum(["CASH","VIREMENT","PAIEMENT_LIVRAISON"]).optional().default("PAIEMENT_LIVRAISON"),
  source:           z.enum(["INSTAGRAM","WHATSAPP","BOUCHE_A_OREILLE","BOUTIQUE","SITE_WEB"]).optional().default("SITE_WEB"),
  adresseLivraison: z.string().max(200).optional(),
  villeLivraison:   z.string().max(100).optional(),
  notes:            z.string().max(500).optional(),
  statut:           z.enum(["EN_ATTENTE","LIVREE"]).optional(),
});

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pageRaw = parseInt(searchParams.get("page") || "1", 10);
    const limitRaw = parseInt(searchParams.get("limit") || "20", 10);
    const page = Math.max(1, Number.isFinite(pageRaw) ? pageRaw : 1);
    const limit = Math.min(
      50,
      Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 20)
    );
    const statut = searchParams.get("statut");
    const search = (
      searchParams.get("search") ||
      searchParams.get("q") ||
      ""
    ).trim();
    const ville = searchParams.get("ville");

    const where: Prisma.CommandeWhereInput = {};
    if (statut && statut !== "Tous") {
      where.statut = statut as Prisma.CommandeWhereInput["statut"];
    }
    if (ville) where.villeLivraison = ville;
    if (search) {
      where.OR = [
        { numero: { contains: search, mode: "insensitive" } },
        { client: { nom: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [commandes, total] = await Promise.all([
      prisma.commande.findMany({
        where,
        include: {
          client: { select: { nom: true, telephone: true } },
          lignes: { select: { quantite: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.commande.count({ where }),
    ]);

    const serialized = commandes.map((c) => ({
      ...c,
      montantTotal: Number(c.montantTotal),
      fraisLivraison: Number(c.fraisLivraison),
    }));

    return NextResponse.json({ commandes: serialized, total });
  } catch (error: unknown) {
    console.error("[GET /api/commandes]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(ip, 20, 60000)) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans une minute." },
      { status: 429 }
    );
  }

  const body = await request.json();

  const parsed = commandeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const client = data.client;
  const lignes = data.lignes;
  const modePaiement = data.modePaiement;
  const notes = data.notes ?? null;
  const statutBody = data.statut;
  const source = data.source;
  const adresse = client.adresse ?? data.adresseLivraison ?? "Boutique Nabeul";
  const ville = client.ville ?? data.villeLivraison ?? "Nabeul";
  const fraisLivraison = data.fraisLivraison;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let dbClient = await tx.client.findFirst({
        where: { telephone: client.telephone },
      });
      const clientSource = ["INSTAGRAM", "WHATSAPP", "BOUTIQUE", "SITE_WEB", "BOUCHE_A_OREILLE"].includes(source) ? source : "SITE_WEB";
      if (!dbClient) {
        dbClient = await tx.client.create({
          data: {
            nom: client.nom,
            telephone: client.telephone,
            email: client.email || null,
            adresse: adresse || null,
            ville: ville || null,
            source: clientSource as "INSTAGRAM" | "WHATSAPP" | "BOUCHE_A_OREILLE" | "BOUTIQUE" | "SITE_WEB",
          },
        });
      } else {
        await tx.client.update({
          where: { id: dbClient.id },
          data: {
            nom: client.nom,
            email: client.email || null,
            adresse: adresse || null,
            ville: ville || null,
          },
        });
      }

      const numero = await genererNumeroCommande(tx);
      let montantTotal = new Prisma.Decimal(0);
      for (const ligne of lignes) {
        const stock = await tx.stock.findUnique({
          where: {
            produitId_taille: { produitId: ligne.produitId, taille: ligne.taille },
          },
        });
        if (stock && stock.quantite < ligne.quantite) {
          throw new Error(
            `Stock insuffisant pour ${ligne.produitId} / ${ligne.taille}`
          );
        }
        montantTotal = montantTotal.plus(
          new Prisma.Decimal(ligne.prixUnitaire).mul(ligne.quantite)
        );
      }
      // Toujours utiliser le total calculé côté serveur — ne jamais faire confiance au client
      const montantTotalFinal = montantTotal.plus(new Prisma.Decimal(fraisLivraison));

      const statut = (statutBody === "LIVREE" ? "LIVREE" : "EN_ATTENTE") as "EN_ATTENTE" | "LIVREE";
      const statutPaiement = (statut === "LIVREE" ? "PAYE" : "EN_ATTENTE") as "PAYE" | "EN_ATTENTE";
      const lignesCreate = lignes.map((l: { produitId: string; taille: string; quantite: number; prixUnitaire: number }) => {
        const ml = TAILLE_ML[l.taille] ?? 0;
        return {
          produitId: l.produitId,
          taille: l.taille,
          volumeMl: ml,
          volumeMlTotal: ml * l.quantite,
          quantite: l.quantite,
          prixUnitaire: new Prisma.Decimal(l.prixUnitaire),
        };
      });

      const commandeData = {
        numero,
        clientId: dbClient.id,
        statut,
        modePaiement,
        statutPaiement,
        montantTotal: montantTotalFinal,
        fraisLivraison: new Prisma.Decimal(fraisLivraison),
        adresseLivraison: adresse || null,
        villeLivraison: ville || null,
        notes: notes || null,
        lignes: { create: lignesCreate },
      };

      let commande;
      const tryCreate = async (data: Prisma.CommandeUncheckedCreateInput) => tx.commande.create({ data });

      try {
        commande = await tryCreate({ ...commandeData, source });
      } catch (err1) {
        const msg1 = err1 instanceof Error ? err1.message : "";
        if (!msg1.includes("Unknown argument `source`")) throw err1;

        try {
          // Fallback temporaire si Prisma Client n'est pas encore régénéré avec le champ source.
          commande = await tryCreate(commandeData as unknown as Prisma.CommandeUncheckedCreateInput);
        } catch (err2) {
          const msg2 = err2 instanceof Error ? err2.message : "";

          if (!msg2.includes("Unknown argument `volumeMl`") && !msg2.includes("Unknown argument `volumeMlTotal`")) {
            throw err2;
          }

          const lignesSansVolume = lignes.map((l: { produitId: string; taille: string; quantite: number; prixUnitaire: number }) => ({
            produitId: l.produitId,
            taille: l.taille,
            quantite: l.quantite,
            prixUnitaire: new Prisma.Decimal(l.prixUnitaire),
          }));

          commande = await tryCreate({
            ...commandeData,
            lignes: { create: lignesSansVolume },
          } as unknown as Prisma.CommandeUncheckedCreateInput);
        }
      }

      for (const ligne of lignes) {
        const volumeMl = TAILLE_ML[ligne.taille] ?? 0;
        const volumeMlTotal = volumeMl * ligne.quantite;
        const stock = await tx.stock.findUnique({
          where: {
            produitId_taille: { produitId: ligne.produitId, taille: ligne.taille },
          },
        });
        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantite: stock.quantite - ligne.quantite },
          });
          await tx.mouvementStock.create({
            data: {
              produitId: ligne.produitId,
              taille: ligne.taille,
              volumeMl: volumeMlTotal,
              type: "SORTIE",
              quantite: ligne.quantite,
              raison: `Commande ${numero}`,
              commandeId: commande.id,
            },
          });
        }
      }

      await tx.livraison.create({
        data: {
          commandeId: commande.id,
          adresse,
          ville,
          statut: "EN_ATTENTE",
        },
      });

      return { numero, commandeId: commande.id, montantTotal: montantTotalFinal.toString() };
    });

    const commandeComplete = await prisma.commande.findUnique({
      where: { id: result.commandeId },
      include: {
        client: true,
        lignes: { include: { produit: { select: { nom: true } } } },
      },
    });

    if (commandeComplete?.client.email) {
      envoyerConfirmationCommande({
        clientEmail: commandeComplete.client.email,
        clientNom: commandeComplete.client.nom,
        numero: commandeComplete.numero,
        lignes: commandeComplete.lignes.map((l) => ({
          nom: l.produit?.nom || "Produit",
          taille: l.taille,
          quantite: l.quantite,
          prixUnitaire: Number(l.prixUnitaire),
        })),
        montantTotal: Number(commandeComplete.montantTotal),
        fraisLivraison: Number(commandeComplete.fraisLivraison || 0),
        adresseLivraison: commandeComplete.adresseLivraison || undefined,
        villeLivraison: commandeComplete.villeLivraison || undefined,
        modePaiement: commandeComplete.modePaiement || undefined,
      }).catch((err) => console.error("[Email] Erreur async:", err));
    }

    return Response.json({ numero: result.numero });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return Response.json({ error: message }, { status: 400 });
  }
}
