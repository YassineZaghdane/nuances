import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const factures = await prisma.facture.findMany({
    include: { commande: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
  });

  const serialized = factures.map((f) => ({
    ...f,
    montantHT: Number(f.montantHT),
    tva: Number(f.tva),
    montantTTC: Number(f.montantTTC),
    commande: {
      ...f.commande,
      montantTotal: Number(f.commande.montantTotal),
    },
  }));

  return Response.json(serialized);
}
