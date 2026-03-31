import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const clients = await prisma.client.findMany({
    where: q?.trim()
      ? {
          OR: [
            { nom: { contains: q.trim(), mode: "insensitive" } },
            { telephone: { contains: q.trim() } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { commandes: true } },
    },
    orderBy: { nom: "asc" },
    take: 100,
  });

  const withCa = await Promise.all(
    clients.map(async (c) => {
      const agg = await prisma.commande.aggregate({
        where: { clientId: c.id, statut: "LIVREE" },
        _sum: { montantTotal: true },
      });
      return {
        ...c,
        totalCommandes: c._count.commandes,
        caTotal: agg._sum.montantTotal ? Number(agg._sum.montantTotal) : 0,
      };
    })
  );

  return Response.json(withCa.map(({ _count, ...c }) => c));
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const role = (session.user as { role?: string })?.role;
  if (role === "VENDEUR") {
    return Response.json({ error: "Accès interdit" }, { status: 403 });
  }

  const body = await request.json();
  const { nom, telephone, email, adresse, ville, source, notes } = body;

  if (!nom || !telephone) {
    return Response.json({ error: "Nom et téléphone requis" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      nom,
      telephone,
      email: email || null,
      adresse: adresse || null,
      ville: ville || null,
      source: source || "BOUTIQUE",
      notes: notes || null,
    },
  });
  return Response.json(client);
}
