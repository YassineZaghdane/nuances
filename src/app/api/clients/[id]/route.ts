import { NextRequest } from "next/server";
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
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      commandes: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
  if (!client) return Response.json({ error: "Client non trouvé" }, { status: 404 });

  const caTotal = await prisma.commande.aggregate({
    where: { clientId: id, statut: "LIVREE" },
    _sum: { montantTotal: true },
  });

  return Response.json({
    ...client,
    commandes: client.commandes.map((c) => ({
      ...c,
      montantTotal: Number(c.montantTotal),
    })),
    caTotal: caTotal._sum.montantTotal ? Number(caTotal._sum.montantTotal) : 0,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role === "VENDEUR") {
    return Response.json({ error: "Accès interdit" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { nom, telephone, email, adresse, ville, source, notes } = body;

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(nom != null && { nom }),
      ...(telephone != null && { telephone }),
      ...(email !== undefined && { email: email || null }),
      ...(adresse !== undefined && { adresse: adresse || null }),
      ...(ville !== undefined && { ville: ville || null }),
      ...(source != null && { source }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });
  return Response.json(client);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}
