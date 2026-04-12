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
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
} as const;

const produitPostSchema = z.object({
  nom:         z.string().min(2).max(100),
  slug:        z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  prix:        z.number().positive().max(99999),
  prixAchat:   z.number().nonnegative().max(99999).optional().nullable(),
  prix30ml:    z.number().nonnegative().max(99999).optional().nullable(),
  prix50ml:    z.number().nonnegative().max(99999).optional().nullable(),
  prix100ml:   z.number().nonnegative().max(99999).optional().nullable(),
  categorieId: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  notes:       z.string().max(500).optional().nullable(),
  images:      z.array(z.string().min(1)).max(5).optional().default([]),
  actif:       z.boolean().optional().default(true),
  featured:    z.boolean().optional().default(false),
  exclusif:    z.boolean().optional().default(false),
  nouveaute:   z.boolean().optional().default(false),
  offre:       z.boolean().optional().default(false),
  offreLabel:  z.string().max(100).optional().nullable(),
});

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
        prix30ml: true,
        prix50ml: true,
        prix100ml: true,
        images: true,
        actif: true,
        featured: true,
        exclusif: true,
        nouveaute: true,
        offre: true,
        offreLabel: true,
        categorie: { select: { id: true, nom: true, slug: true } },
        stockKilo: { select: { stockMlTotal: true, stockKgTotal: true } },
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
      prix30ml: p.prix30ml != null ? Number(p.prix30ml) : null,
      prix50ml: p.prix50ml != null ? Number(p.prix50ml) : null,
      prix100ml: p.prix100ml != null ? Number(p.prix100ml) : null,
    }));

    return NextResponse.json(serialized, { headers: NO_STORE });
  } catch (error: unknown) {
    console.error("[GET /api/produits]", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500, headers: NO_STORE }
    );
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
    const parsed = produitPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const {
      nom,
      slug,
      description,
      notes,
      prix,
      prixAchat,
      prix30ml,
      prix50ml,
      prix100ml,
      images,
      categorieId,
      actif,
      featured,
      exclusif,
      nouveaute,
      offre,
      offreLabel,
    } = parsed.data;

    const slugFinal = (typeof slug === "string" && slug.trim()) || slugify(nom);

    const produit = await prisma.produit.create({
      data: {
        nom,
        slug: slugFinal,
        description: description || null,
        notes: notes || null,
        prix,
        prixAchat: prixAchat ?? null,
        prix30ml: prix30ml ?? null,
        prix50ml: prix50ml ?? null,
        prix100ml: prix100ml ?? null,
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
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
