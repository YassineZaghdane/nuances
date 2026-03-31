/**
 * @module API Produits
 * @description CRUD produits — GET public, POST/PATCH/DELETE protégés
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const featured = searchParams.get("featured");
    const exclusif = searchParams.get("exclusif");
    const nouveaute = searchParams.get("nouveaute");
    const offre = searchParams.get("offre");
    const actif = searchParams.get("actif");
    const search = searchParams.get("search") || searchParams.get("q");
    const categorieId = searchParams.get("categorieId");
    const include = searchParams.get("include") || "";

    const where: Prisma.ProduitWhereInput = {};

    if (actif !== "false") where.actif = true;
    if (featured === "true") where.featured = true;
    if (exclusif === "true") where.exclusif = true;
    if (nouveaute === "true") where.nouveaute = true;
    if (offre === "true") where.offre = true;
    if (categorieId) where.categorieId = categorieId;
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const limitNum = limit ? Math.min(parseInt(limit, 10), 100) : undefined;
    if (limitNum !== undefined && (Number.isNaN(limitNum) || limitNum < 1)) {
      return NextResponse.json({ error: "limit invalide" }, { status: 400 });
    }

    const produits = await prisma.produit.findMany({
      where,
      select: {
        id: true,
        nom: true,
        slug: true,
        description: true,
        notes: true,
        prix: true,
        images: true,
        actif: true,
        featured: true,
        exclusif: true,
        nouveaute: true,
        offre: true,
        offreLabel: true,
        categorie: { select: { id: true, nom: true, slug: true } },
        stocks: {
          select: {
            taille: true,
            quantite: true,
            volumeMl: true,
            seuilAlerte: true,
          },
        },
        ...(include.includes("stockKilo")
          ? {
              stockKilo: { select: { stockKgTotal: true, stockMlTotal: true } },
            }
          : {}),
      },
      orderBy: [
        { featured: "desc" },
        { exclusif: "desc" },
        { nouveaute: "desc" },
        { createdAt: "desc" },
      ],
      ...(limitNum ? { take: limitNum } : {}),
    });

    const serialized = produits.map((p) => ({
      ...p,
      prix: Number(p.prix),
    }));

    return NextResponse.json(serialized);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[GET /api/produits]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const role = (session.user as { role?: string })?.role;
    if (role === "VENDEUR") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
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

    if (!nom || !prix || !categorieId) {
      return NextResponse.json(
        { error: "Champs requis: nom, slug (ou généré), prix, categorieId" },
        { status: 400 }
      );
    }

    const slugFinal = (typeof slug === "string" && slug.trim()) || slugify(nom);

    const produit = await prisma.produit.create({
      data: {
        nom,
        slug: slugFinal,
        description: description || null,
        notes: notes || null,
        prix,
        prixAchat: prixAchat ?? null,
        images: images || [],
        categorieId,
        actif: actif ?? true,
        featured: featured ?? false,
        exclusif: exclusif ?? false,
        nouveaute: nouveaute ?? false,
        offre: offre ?? false,
        offreLabel: offreLabel || null,
      },
      include: {
        categorie: true,
        stocks: true,
      },
    });

    return NextResponse.json(
      {
        ...produit,
        prix: Number(produit.prix),
        prixAchat: produit.prixAchat ? Number(produit.prixAchat) : null,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error("[POST /api/produits]", err);
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Slug déjà utilisé" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
