import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clientPostSchema = z.object({
  nom:       z.string().min(2).max(100),
  telephone: z.string().min(8).max(20),
  email:     z.string().email().optional().or(z.literal("")),
  adresse:   z.string().max(200).optional(),
  ville:     z.string().max(100).optional(),
  source:    z.enum(["INSTAGRAM","WHATSAPP","BOUCHE_A_OREILLE","BOUTIQUE","SITE_WEB"]).optional().default("BOUTIQUE"),
  notes:     z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

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

    // Fix N+1 : un seul groupBy au lieu de N aggregate()
    const clientIds = clients.map((c) => c.id);
    const caData = await prisma.commande.groupBy({
      by: ["clientId"],
      where: { clientId: { in: clientIds }, statut: "LIVREE" },
      _sum: { montantTotal: true },
    });
    const caMap = new Map(caData.map((d) => [d.clientId, Number(d._sum.montantTotal) || 0]));

    const withCa = clients.map(({ _count, ...c }) => ({
      ...c,
      totalCommandes: _count.commandes,
      caTotal: caMap.get(c.id) ?? 0,
    }));

    return NextResponse.json(withCa);
  } catch (error: unknown) {
    console.error("[GET /api/clients]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role === "VENDEUR") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = clientPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { nom, telephone, email, adresse, ville, source, notes } = parsed.data;

    const client = await prisma.client.create({
      data: {
        nom,
        telephone,
        email: email || null,
        adresse: adresse || null,
        ville: ville || null,
        source,
        notes: notes || null,
      },
    });
    return NextResponse.json(client);
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error("[POST /api/clients]", err);
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Ce téléphone est déjà enregistré" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
