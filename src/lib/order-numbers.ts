import type { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function genererNumeroCommande(tx?: TransactionClient): Promise<string> {
  const client = (tx ?? prisma) as PrismaClient;
  const annee = new Date().getFullYear();
  const debutAnnee = new Date(`${annee}-01-01T00:00:00.000Z`);
  const count = await client.commande.count({
    where: { createdAt: { gte: debutAnnee } },
  });
  return `NP-${annee}-${String(count + 1).padStart(4, "0")}`;
}

export async function genererNumeroFacture(): Promise<string> {
  const annee = new Date().getFullYear();
  const debutAnnee = new Date(`${annee}-01-01T00:00:00.000Z`);
  const count = await prisma.facture.count({
    where: { createdAt: { gte: debutAnnee } },
  });
  return `FAC-${annee}-${String(count + 1).padStart(4, "0")}`;
}
