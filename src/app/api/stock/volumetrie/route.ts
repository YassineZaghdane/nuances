export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { TAILLE_ML } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorieId = searchParams.get("categorieId");
  const produitId = searchParams.get("produitId");
  const periode = searchParams.get("periode") || "mois";

  const now = new Date();
  let dateDebut = new Date(now.getFullYear(), now.getMonth(), 1);
  if (periode === "semaine") {
    dateDebut = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (periode === "annee") {
    dateDebut = new Date(now.getFullYear(), 0, 1);
  } else if (periode === "tout") {
    dateDebut = new Date("2020-01-01");
  }

  const whereProduit: { categorieId?: string; id?: string } = {};
  if (categorieId) whereProduit.categorieId = categorieId;
  if (produitId) whereProduit.id = produitId;

  const stocks = await prisma.stock.findMany({
    where:
      Object.keys(whereProduit).length > 0
        ? { produit: whereProduit }
        : undefined,
    include: {
      produit: {
        include: { categorie: true, stockKilo: true },
      },
    },
  });

  const whereLignes: Prisma.LigneCommandeWhereInput = {
    commande: {
      statut: { in: ["LIVREE", "EXPEDIEE"] as const },
      createdAt: { gte: dateDebut },
    },
  };
  if (Object.keys(whereProduit).length > 0) {
    whereLignes.produit = whereProduit;
  }

  const lignes = await prisma.ligneCommande.findMany({
    where: whereLignes,
    include: {
      produit: { include: { categorie: true } },
      commande: { select: { createdAt: true } },
    },
  });

  type VenteItem = {
    produitId: string;
    produitNom: string;
    categorie: string;
    taille: string;
    volumeMl: number;
    quantiteVendue: number;
    volumeVenduMl: number;
    volumeVenduL: number;
    volumeVenduKg: number;
    ca: number;
  };

  const ventesMap: Record<string, VenteItem> = {};

  for (const ligne of lignes) {
    const ml =
      TAILLE_ML[ligne.taille] ?? (ligne.volumeMl || 0);
    const key = `${ligne.produitId}__${ligne.taille}`;
    if (!ventesMap[key]) {
      ventesMap[key] = {
        produitId: ligne.produitId,
        produitNom: ligne.produit.nom,
        categorie: ligne.produit.categorie?.nom || "",
        taille: ligne.taille,
        volumeMl: ml,
        quantiteVendue: 0,
        volumeVenduMl: 0,
        volumeVenduL: 0,
        volumeVenduKg: 0,
        ca: 0,
      };
    }
    ventesMap[key].quantiteVendue += ligne.quantite;
    ventesMap[key].volumeVenduMl += ml * ligne.quantite;
    ventesMap[key].volumeVenduL = ventesMap[key].volumeVenduMl / 1000;
    ventesMap[key].volumeVenduKg = ventesMap[key].volumeVenduMl / 1000;
    ventesMap[key].ca += Number(ligne.prixUnitaire) * ligne.quantite;
  }

  type CatItem = {
    categorie: string;
    totalMlVendu: number;
    totalKgVendu: number;
    totalFlacons: number;
    ca: number;
    parTaille: Record<string, number>;
  };

  const catMap: Record<string, CatItem> = {};

  for (const v of Object.values(ventesMap)) {
    if (!catMap[v.categorie]) {
      catMap[v.categorie] = {
        categorie: v.categorie,
        totalMlVendu: 0,
        totalKgVendu: 0,
        totalFlacons: 0,
        ca: 0,
        parTaille: {},
      };
    }
    catMap[v.categorie].totalMlVendu += v.volumeVenduMl;
    catMap[v.categorie].totalKgVendu =
      catMap[v.categorie].totalMlVendu / 1000;
    catMap[v.categorie].totalFlacons += v.quantiteVendue;
    catMap[v.categorie].ca += v.ca;
    catMap[v.categorie].parTaille[v.taille] =
      (catMap[v.categorie].parTaille[v.taille] || 0) + v.quantiteVendue;
  }

  const stockVolumetrique = stocks.map((s) => {
    const ml = TAILLE_ML[s.taille] ?? s.volumeMl ?? 0;
    return {
      produit: s.produit.nom,
      categorie: s.produit.categorie?.nom ?? "",
      taille: s.taille,
      volumeMl: ml,
      quantite: s.quantite,
      stockTotalMl: ml * s.quantite,
      stockTotalL: (ml * s.quantite) / 1000,
      stockTotalKg: (ml * s.quantite) / 1000,
      stockKgSource: s.produit.stockKilo?.stockKgTotal ?? null,
      seuilAlerte: s.seuilAlerte,
      enAlerte: s.quantite <= s.seuilAlerte,
    };
  });

  const ventesArr = Object.values(ventesMap);
  const totaux = {
    mlVendu: ventesArr.reduce((s, v) => s + v.volumeVenduMl, 0),
    kgVendu: ventesArr.reduce((s, v) => s + v.volumeVenduMl, 0) / 1000,
    flacons: ventesArr.reduce((s, v) => s + v.quantiteVendue, 0),
    ca: ventesArr.reduce((s, v) => s + v.ca, 0),
  };

  return NextResponse.json({
    periode: { debut: dateDebut, fin: now },
    stockVolumetrique,
    ventesParProduitTaille: ventesArr,
    ventesParCategorie: Object.values(catMap),
    totaux,
  });
}
