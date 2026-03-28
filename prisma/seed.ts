import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function genNumero(): Promise<string> {
  const count = await prisma.commande.count();
  return `NP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
}

async function main() {
  console.log("🌱 Seed démarré...");

  // Reset dans le bon ordre (FK)
  await prisma.ligneCommande.deleteMany();
  await prisma.facture.deleteMany();
  await prisma.livraison.deleteMany();
  await prisma.commande.deleteMany();
  await prisma.mouvementStock.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.stockKilo.deleteMany();
  await prisma.produit.deleteMany();
  await prisma.client.deleteMany();
  await prisma.categorie.deleteMany();
  // NE PAS supprimer User (garde l'admin)

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nuances.tn" },
    update: {},
    create: {
      email: "admin@nuances.tn",
      password: adminPassword,
      nom: "Admin Nuances",
      role: "ADMIN" as const,
      actif: true,
    },
  });
  console.log("User created:", admin.email);

  const vendeurExiste = await prisma.user.findUnique({
    where: { email: "vendeur@nuances.tn" },
  });
  if (!vendeurExiste) {
    await prisma.user.create({
      data: {
        email: "vendeur@nuances.tn",
        password: await bcrypt.hash("vendeur123", 10),
        nom: "Vendeur Boutique",
        role: "VENDEUR",
        actif: true,
      },
    });
    console.log("✅ Vendeur créé: vendeur@nuances.tn / vendeur123");
  }

  const categories = await Promise.all([
    prisma.categorie.upsert({ where: { slug: "boise" }, update: {}, create: { nom: "Boisé", slug: "boise" } }),
    prisma.categorie.upsert({ where: { slug: "floral" }, update: {}, create: { nom: "Floral", slug: "floral" } }),
    prisma.categorie.upsert({ where: { slug: "oriental" }, update: {}, create: { nom: "Oriental", slug: "oriental" } }),
    prisma.categorie.upsert({ where: { slug: "frais" }, update: {}, create: { nom: "Frais", slug: "frais" } }),
  ]);

  const productNames = [
    { nom: "Ambre Nuit", slug: "ambre-nuit", cat: 0, notes: "Boisé · Oriental · Ambré" },
    { nom: "Fleur de Jasmin", slug: "fleur-de-jasmin", cat: 1, notes: "Floral · Frais" },
    { nom: "Oud Royal", slug: "oud-royal", cat: 0, notes: "Boisé · Oud" },
    { nom: "Rose d'Orient", slug: "rose-d-orient", cat: 1, notes: "Floral · Oriental" },
    { nom: "Musk Blanc", slug: "musk-blanc", cat: 2, notes: "Oriental · Musc" },
    { nom: "Citron Vert", slug: "citron-vert", cat: 3, notes: "Frais · Citrus" },
    { nom: "Santal Noble", slug: "santal-noble", cat: 0, notes: "Boisé · Bois de santal" },
    { nom: "Iris d'Argent", slug: "iris-d-argent", cat: 1, notes: "Floral · Poudré" },
    { nom: "Vanille Noire", slug: "vanille-noire", cat: 2, notes: "Oriental · Vanille" },
    { nom: "Bergamote Soleil", slug: "bergamote-soleil", cat: 3, notes: "Frais · Héspéridé" },
    { nom: "Cuir Vintage", slug: "cuir-vintage", cat: 0, notes: "Boisé · Cuir" },
    { nom: "Jardin Secret", slug: "jardin-secret", cat: 1, notes: "Floral · Vert" },
  ];

  for (let i = 0; i < productNames.length; i++) {
    const p = productNames[i];
    const cat = categories[p.cat];
    await prisma.produit.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        nom: p.nom,
        slug: p.slug,
        description: `Parfum ${p.nom}, notes: ${p.notes}`,
        notes: p.notes,
        prix: 45 + i * 5,
        prixAchat: 20 + i * 2,
        images: [],
        actif: true,
        featured: i < 3,
        categorieId: cat.id,
      },
    });
  }

  const products = await prisma.produit.findMany();
  const TAILLE_ML: Record<string, number> = {
    "5ml": 5,
    "10ml": 10,
    "15ml": 15,
    "30ml": 30,
    "50ml": 50,
    "100ml": 100,
  };
  const tailles = ["30ml", "50ml", "100ml"];
  for (const prod of products) {
    for (const t of tailles) {
      const volumeMl = TAILLE_ML[t] ?? 30;
      await prisma.stock.upsert({
        where: { produitId_taille: { produitId: prod.id, taille: t } },
        update: { volumeMl },
        create: {
          produitId: prod.id,
          taille: t,
          volumeMl,
          quantite: 10 + Math.floor(Math.random() * 30),
          seuilAlerte: 5,
        },
      });
    }
    await prisma.stockKilo.upsert({
      where: { produitId: prod.id },
      update: {},
      create: {
        produitId: prod.id,
        stockKgTotal: 1.5 + Math.random() * 2,
        stockMlTotal: 1500 + Math.floor(Math.random() * 2000),
      },
    });
  }

  for (let i = 1; i <= 30; i++) {
    await prisma.client.upsert({
      where: { telephone: `2000000${String(i).padStart(2, "0")}` },
      update: {},
      create: {
        nom: `Client ${i}`,
        telephone: `2000000${String(i).padStart(2, "0")}`,
        email: `client${i}@test.tn`,
        ville: ["Nabeul", "Tunis", "Sousse", "Sfax", "Nabeul"][i % 5],
        adresse: `Adresse ${i}`,
        source: (["INSTAGRAM", "WHATSAPP", "BOUTIQUE", "SITE_WEB"] as const)[i % 4] as "INSTAGRAM" | "WHATSAPP" | "BOUTIQUE" | "SITE_WEB",
      },
    });
  }

  const clients = await prisma.client.findMany({ take: 30 });
  for (let i = 1; i <= 50; i++) {
    const client = clients[i % clients.length];
    const numero = await genNumero();
    const montant = 30 + Math.floor(Math.random() * 100);
    const statuts = (["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE", "LIVREE", "LIVREE", "ANNULEE"] as const);
    const statut = statuts[i % statuts.length] as "EN_ATTENTE" | "CONFIRMEE" | "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE";
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (50 - i));

    const commande = await prisma.commande.create({
      data: {
        numero,
        clientId: client.id,
        statut,
        modePaiement: "PAIEMENT_LIVRAISON",
        statutPaiement: (statut === "LIVREE" ? "PAYE" : "EN_ATTENTE") as "PAYE" | "EN_ATTENTE",
        montantTotal: montant,
        fraisLivraison: 0,
        adresseLivraison: client.adresse || "Adresse",
        villeLivraison: client.ville || "Nabeul",
        notes: null,
      },
    });

    const prod = products[i % products.length];
    const stock = await prisma.stock.findFirst({ where: { produitId: prod.id } });
    if (stock) {
      const qte = 1 + (i % 3);
      const volumeMl = TAILLE_ML[stock.taille] ?? 30;
      await prisma.ligneCommande.create({
        data: {
          commandeId: commande.id,
          produitId: prod.id,
          taille: stock.taille,
          volumeMl,
          volumeMlTotal: volumeMl * qte,
          quantite: qte,
          prixUnitaire: Number(prod.prix),
        },
      });
    }

    await prisma.livraison.create({
      data: {
        commandeId: commande.id,
        adresse: client.adresse || "Adresse",
        ville: client.ville || "Nabeul",
        statut: (statut === "LIVREE" ? "LIVREE" : statut === "EXPEDIEE" ? "EN_COURS" : "EN_ATTENTE") as "LIVREE" | "EN_COURS" | "EN_ATTENTE",
      },
    });

    if (statut === "LIVREE" && i % 2 === 0) {
      const mt = Number(commande.montantTotal);
      const facNum = (i / 2).toString().padStart(4, "0");
      const annee = new Date().getFullYear();
      await prisma.facture.create({
        data: {
          numero: `FAC-${annee}-${facNum}`,
          commandeId: commande.id,
          montantHT: mt / 1.19,
          tva: mt - mt / 1.19,
          montantTTC: mt,
        },
      });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
