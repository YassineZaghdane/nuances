import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

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
  if (!commande) return Response.json({ error: "Commande non trouvée" }, { status: 404 });

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
          montantHT: Number(commande.facture.montantHT),
          tva: Number(commande.facture.tva),
          montantTTC: Number(commande.facture.montantTTC),
        }
      : null,
  };
  return Response.json(serialized);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { statut, statutPaiement, notes } = body;

  const data: Record<string, unknown> = {};
  if (statut != null) data.statut = statut;
  if (statutPaiement != null) data.statutPaiement = statutPaiement;
  if (notes != null) data.notes = notes;

  const commande = await prisma.commande.update({
    where: { id },
    data,
  });
  return Response.json(commande);
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
    const { statut, note, modePaiement } = body;

    const data: Record<string, unknown> = {};
    if (statut) data.statut = statut;
    if (modePaiement) data.modePaiement = modePaiement;
    if (note) {
      const existing = await prisma.commande.findUnique({
        where: { id },
        select: { notes: true },
      });
      const ancien = existing?.notes || "";
      const timestamp = new Date().toLocaleString("fr-FR");
      data.notes = ancien ? `${ancien}\n[${timestamp}] ${note}` : `[${timestamp}] ${note}`;
    }

    const commande = await prisma.commande.update({
      where: { id },
      data,
      include: {
        client: true,
        lignes: {
          include: { produit: { select: { nom: true } } },
        },
      },
    });

    const serialized = {
      ...commande,
      montantTotal: Number(commande.montantTotal),
      fraisLivraison: Number(commande.fraisLivraison),
      lignes: commande.lignes.map((l) => ({
        ...l,
        prixUnitaire: Number(l.prixUnitaire),
      })),
    };
    return NextResponse.json(serialized);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[PATCH /api/commandes/id]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
