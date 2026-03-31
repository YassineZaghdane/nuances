import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const STATUTS = ["EN_ATTENTE","CONFIRMEE","EN_PREPARATION","EXPEDIEE","LIVREE","ANNULEE","RETOURNEE"] as const;
const STATUTS_PAIEMENT = ["EN_ATTENTE","PAYE","REMBOURSE"] as const;
const MODES_PAIEMENT = ["CASH","VIREMENT","PAIEMENT_LIVRAISON"] as const;

const putSchema = z.object({
  statut:         z.enum(STATUTS).optional(),
  statutPaiement: z.enum(STATUTS_PAIEMENT).optional(),
  notes:          z.string().max(1000).optional().nullable(),
});

const patchSchema = z.object({
  statut:       z.enum(STATUTS).optional(),
  modePaiement: z.enum(MODES_PAIEMENT).optional(),
  note:         z.string().max(500).optional(),
});

function handlePrismaError(err: Error & { code?: string }): NextResponse {
  if (err.code === "P2025") return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (err.code === "P2002") return NextResponse.json({ error: "Conflit de données" }, { status: 409 });
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const commande = await prisma.commande.findUnique({
      where: { id },
      include: {
        client: true,
        lignes: { include: { produit: true } },
        livraison: true,
        facture: true,
      },
    });
    if (!commande) return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 });

    const serialized = {
      ...commande,
      montantTotal: Number(commande.montantTotal),
      fraisLivraison: Number(commande.fraisLivraison),
      lignes: commande.lignes.map((l) => ({
        ...l,
        prixUnitaire: Number(l.prixUnitaire),
      })),
      facture: commande.facture
        ? {
            ...commande.facture,
            montantHT:  Number(commande.facture.montantHT),
            tva:        Number(commande.facture.tva),
            montantTTC: Number(commande.facture.montantTTC),
          }
        : null,
    };
    return NextResponse.json(serialized);
  } catch (error: unknown) {
    console.error("[GET /api/commandes/id]", error);
    return handlePrismaError(error as Error & { code?: string });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const parsed = putSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.statut != null)         updateData.statut = parsed.data.statut;
    if (parsed.data.statutPaiement != null) updateData.statutPaiement = parsed.data.statutPaiement;
    if (parsed.data.notes != null)          updateData.notes = parsed.data.notes;

    const commande = await prisma.commande.update({ where: { id }, data: updateData });
    return NextResponse.json(commande);
  } catch (error: unknown) {
    console.error("[PUT /api/commandes/id]", error);
    return handlePrismaError(error as Error & { code?: string });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { statut, modePaiement, note } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (statut)       updateData.statut = statut;
    if (modePaiement) updateData.modePaiement = modePaiement;
    if (note) {
      const existing = await prisma.commande.findUnique({
        where: { id },
        select: { notes: true },
      });
      const ancien = existing?.notes || "";
      const timestamp = new Date().toLocaleString("fr-FR");
      updateData.notes = ancien ? `${ancien}\n[${timestamp}] ${note}` : `[${timestamp}] ${note}`;
    }

    const commande = await prisma.commande.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        lignes: { include: { produit: { select: { nom: true } } } },
      },
    });

    const serialized = {
      ...commande,
      montantTotal:   Number(commande.montantTotal),
      fraisLivraison: Number(commande.fraisLivraison),
      lignes: commande.lignes.map((l) => ({
        ...l,
        prixUnitaire: Number(l.prixUnitaire),
      })),
    };
    return NextResponse.json(serialized);
  } catch (error: unknown) {
    console.error("[PATCH /api/commandes/id]", error);
    return handlePrismaError(error as Error & { code?: string });
  }
}
