import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "VENDEUR") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { id } = params;
    const { type, quantiteMl, raison } = (await req.json()) as {
      type: "ENTREE" | "SORTIE" | "AJUSTEMENT";
      quantiteMl: number;
      raison?: string;
    };

    if (!type || quantiteMl == null) {
      return NextResponse.json(
        { error: "Champs requis: type, quantiteMl" },
        { status: 400 }
      );
    }

    const qml = Number(quantiteMl);
    if (!Number.isFinite(qml) || qml < 0) {
      return NextResponse.json({ error: "quantiteMl invalide" }, { status: 400 });
    }

    const matiere = await prisma.matierePremiere.findUnique({ where: { id } });
    if (!matiere) {
      return NextResponse.json({ error: "Matière introuvable" }, { status: 404 });
    }

    let nouveauStock = matiere.stockMl;
    if (type === "ENTREE") nouveauStock += qml;
    if (type === "SORTIE") nouveauStock = Math.max(0, nouveauStock - qml);
    if (type === "AJUSTEMENT") nouveauStock = qml;

    const [updated, mouvement] = await prisma.$transaction([
      prisma.matierePremiere.update({
        where: { id },
        data: { stockMl: nouveauStock },
      }),
      prisma.mouvementMatiere.create({
        data: {
          matiereId: id,
          type,
          quantiteMl: qml,
          raison: raison || null,
          userId: (session.user as { id?: string }).id || null,
        },
      }),
    ]);

    return NextResponse.json({ matiere: updated, mouvement });
  } catch (error) {
    console.error("[POST /api/matieres/[id]/mouvement]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
