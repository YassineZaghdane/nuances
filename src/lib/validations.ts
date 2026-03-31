import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const produitSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  prix: z.number().positive("Prix invalide"),
  prixAchat: z.number().nonnegative().optional().nullable(),
  images: z.array(z.string().url()).default([]),
  actif: z.boolean().default(true),
  featured: z.boolean().default(false),
  categorieId: z.string().min(1, "Catégorie requise"),
});

export const clientSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  telephone: z.string().min(1, "Téléphone requis"),
  email: z.string().email().optional().or(z.literal("")),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  source: z.enum(["INSTAGRAM", "WHATSAPP", "BOUCHE_A_OREILLE", "BOUTIQUE", "SITE_WEB"]).default("SITE_WEB"),
  notes: z.string().optional(),
});

export const orderFormSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  telephone: z.string().min(8, "Téléphone requis"),
  email: z.string().email().optional().or(z.literal("")),
  adresse: z.string().min(5, "Adresse requise"),
  ville: z.string().min(2, "Ville requise"),
  modePaiement: z.enum(["CASH", "VIREMENT", "PAIEMENT_LIVRAISON"]).default("PAIEMENT_LIVRAISON"),
  notes: z.string().optional(),
  lignes: z.array(z.object({
    produitId: z.string(),
    taille: z.string(),
    quantite: z.number().int().positive(),
    prixUnitaire: z.number().positive(),
  })).min(1, "Panier vide"),
});

export const mouvementStockSchema = z.object({
  produitId: z.string(),
  taille: z.string(),
  type: z.enum(["ENTREE", "SORTIE", "AJUSTEMENT"]),
  quantite: z.number().int().positive(),
  raison: z.string().optional(),
});

export const depenseSchema = z.object({
  libelle: z.string().min(1),
  montant: z.number().positive(),
  categorie: z.enum(["ACHAT_STOCK", "LIVRAISON", "MARKETING", "LOYER", "AUTRE"]),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProduitInput = z.infer<typeof produitSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type OrderFormInput = z.infer<typeof orderFormSchema>;
export type MouvementStockInput = z.infer<typeof mouvementStockSchema>;
export type DepenseInput = z.infer<typeof depenseSchema>;
