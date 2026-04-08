import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULTS = [
  {
    nom: "Alcool éthylique",
    description: "Alcool de parfumerie — consommé automatiquement lors des ventes",
    unite: "ml",
    seuilAlerte: 500,
    isDefault: true,
  },
  {
    nom: "Flacon 30ml",
    description: "Flacons verre 30ml vides",
    unite: "unité",
    seuilAlerte: 10,
    isDefault: true,
  },
  {
    nom: "Flacon 50ml",
    description: "Flacons verre 50ml vides",
    unite: "unité",
    seuilAlerte: 10,
    isDefault: true,
  },
  {
    nom: "Flacon 100ml",
    description: "Flacons verre 100ml vides",
    unite: "unité",
    seuilAlerte: 10,
    isDefault: true,
  },
] as const;

/** Crée les 4 articles par défaut s'ils n'existent pas encore. */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const created: string[] = [];

  for (const item of DEFAULTS) {
    const existing = await prisma.matierePremiere.findUnique({ where: { nom: item.nom } });
    if (!existing) {
      await prisma.matierePremiere.create({
        data: {
          nom: item.nom,
          description: item.description,
          unite: item.unite,
          seuilAlerte: item.seuilAlerte,
          isDefault: item.isDefault,
          stockMl: 0,
        },
      });
      created.push(item.nom);
    } else if (!existing.isDefault) {
      // Marquer comme default s'il existait sans le flag
      await prisma.matierePremiere.update({
        where: { id: existing.id },
        data: { isDefault: true, unite: item.unite },
      });
    }
  }

  return NextResponse.json({ created });
}
