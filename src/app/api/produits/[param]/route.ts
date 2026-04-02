/**
 * @module API Produit [param]
 * @description GET par slug/id, PATCH et DELETE protégés
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { params: Promise<{ param: string }> };

function isCuid(param: string) {
  return /^c[a-z0-9]{24}$/i.test(param);
}

/** GET vitrine : slug → produit actif uniquement. ERP : id CUID → tous états. */
async function findProduitPublic(param: string) {
  return prisma.produit.findFirst({
    where: isCuid(param) ? { id: param } : { slug: param, actif: true },
    include: {
      categorie: true,
      stocks: true,
      stockKilo: true,
    },
  });
}

async function findProduitForMutation(param: string) {
  return prisma.produit.findFirst({
    where: { OR: [{ id: param }, { slug: param }] },
    include: {
      categorie: true,
      stocks: true,
      stockKilo: true,
    },
  });
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { param } = await params;
    const produit = await findProduitPublic(param);
    const noStore = {
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
    };
    if (!produit) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404, headers: noStore }
      );
    }
    return NextResponse.json(
      {
        ...produit,
        prix: Number(produit.prix),
        prixAchat: produit.prixAchat ? Number(produit.prixAchat) : null,
      },
      { headers: noStore }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "VENDEUR") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { param } = await params;
    const produit = await findProduitForMutation(param);
    if (!produit) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const {
      nom,
      slug,
      description,
      notes,
      prix,
      prixAchat,
      images,
      categorieId,
      actif,
      featured,
      exclusif,
      nouveaute,
      offre,
      offreLabel,
    } = body;

    const data: Prisma.ProduitUpdateInput = {};
    if (nom !== undefined) data.nom = nom;
    if (slug !== undefined) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (notes !== undefined) data.notes = notes;
    if (prix !== undefined) data.prix = prix;
    if (prixAchat !== undefined) data.prixAchat = prixAchat;
    if (images !== undefined) data.images = images;
    if (actif !== undefined) data.actif = actif;
    if (featured !== undefined) data.featured = featured;
    if (exclusif !== undefined) data.exclusif = exclusif;
    if (nouveaute !== undefined) data.nouveaute = nouveaute;
    if (offre !== undefined) data.offre = offre;
    if (offreLabel !== undefined) data.offreLabel = offreLabel;
    if (categorieId !== undefined) {
      data.categorie = { connect: { id: categorieId } };
    }

    const updated = await prisma.produit.update({
      where: { id: produit.id },
      data,
      include: { categorie: true, stocks: true },
    });

    return NextResponse.json({
      ...updated,
      prix: Number(updated.prix),
      prixAchat: updated.prixAchat ? Number(updated.prixAchat) : null,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[PATCH /api/produits]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Alias pour le formulaire ERP (ProduitForm utilise PUT). */
export async function PUT(req: Request, ctx: Params) {
  return PATCH(req, ctx);
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "VENDEUR") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const { param } = await params;
    const produit = await findProduitForMutation(param);
    if (!produit) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    const nbLignes = await prisma.ligneCommande.count({
      where: { produitId: produit.id },
    });

    if (nbLignes > 0) {
      await prisma.produit.update({
        where: { id: produit.id },
        data: { actif: false },
      });
      return NextResponse.json({
        message: "Produit désactivé (commandes liées)",
        desactive: true,
      });
    }

    await prisma.mouvementStock.deleteMany({ where: { produitId: produit.id } });
    await prisma.stock.deleteMany({ where: { produitId: produit.id } });
    await prisma.stockKilo.deleteMany({ where: { produitId: produit.id } });
    await prisma.produit.delete({ where: { id: produit.id } });

    return NextResponse.json({ message: "Produit supprimé" });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[DELETE /api/produits]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
