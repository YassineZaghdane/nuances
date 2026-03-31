import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { livreur, statut, dateEstimee, dateLivree, notes } = body;

  const data: Record<string, unknown> = {};
  if (livreur !== undefined) data.livreur = livreur;
  if (statut !== undefined) data.statut = statut;
  if (dateEstimee !== undefined) data.dateEstimee = dateEstimee ? new Date(dateEstimee) : null;
  if (dateLivree !== undefined) data.dateLivree = dateLivree ? new Date(dateLivree) : null;
  if (notes !== undefined) data.notes = notes;

  const livraison = await prisma.livraison.update({
    where: { id },
    data,
    include: { commande: { include: { client: true } } },
  });

  return Response.json({
    ...livraison,
    commande: {
      ...livraison.commande,
      montantTotal: Number(livraison.commande.montantTotal),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}
