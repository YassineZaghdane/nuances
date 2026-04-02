import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seed démarré...')

  // Nettoyer dans l'ordre des dépendances
  await prisma.mouvementStock.deleteMany()
  await prisma.ligneCommande.deleteMany()
  await prisma.facture.deleteMany()
  await prisma.livraison.deleteMany()
  await prisma.commande.deleteMany()
  await prisma.client.deleteMany()
  await prisma.stockKilo.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.produit.deleteMany()
  await prisma.categorie.deleteMany()
  await prisma.depense.deleteMany()
  await prisma.user.deleteMany()

  // ── USERS ──
  const adminHash   = await bcrypt.hash('admin123', 10)
  const vendeurHash = await bcrypt.hash('vendeur123', 10)

  await prisma.user.create({
    data: { email: 'admin@nuances.tn', password: adminHash, nom: 'Admin Nuances', role: 'ADMIN', actif: true }
  })
  console.log('✅ Admin créé')

  await prisma.user.create({
    data: { email: 'vendeur@nuances.tn', password: vendeurHash, nom: 'Vendeur Nuances', role: 'VENDEUR', actif: true }
  })
  console.log('✅ Vendeur créé')

  // ── CATÉGORIES ──
  const cats = await Promise.all([
    prisma.categorie.create({ data: { nom: 'Louis Vuitton', slug: 'louis-vuitton' } }),
    prisma.categorie.create({ data: { nom: 'Le Labo', slug: 'le-labo' } }),
    prisma.categorie.create({ data: { nom: 'Mancera', slug: 'mancera' } }),
    prisma.categorie.create({ data: { nom: 'Tom Ford', slug: 'tom-ford' } }),
    prisma.categorie.create({ data: { nom: 'Amouage', slug: 'amouage' } }),
  ])
  const [lvCat, lelaboCat, manceraCat, tomfordCat, amouageCat] = cats
  console.log('✅ Catégories créées')

  // ── PRODUITS ──
  const produits = [

    // ── LOUIS VUITTON ──
    {
      nom: 'Ombre Nomade',
      slug: 'ombre-nomade-lv',
      categorieId: lvCat.id,
      notesTete: 'Géranium · Safran · Framboise · Bouleau · Encens',
      notesCœur: 'Oud · Benzoin · Rose',
      notesFond: 'Encens · Amberwood · Bouleau',
      description: "Ombre Nomade de Louis Vuitton est un oud oriental intense et mystérieux. Il s'ouvre sur des notes fruitées de framboise et de safran, dévoile un cœur riche d'oud et de rose, et se fond sur un fond fumé et boisé d'encens et d'ambre.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: true, exclusif: true,
    },
    {
      nom: 'Contre Moi',
      slug: 'contre-moi-lv',
      categorieId: lvCat.id,
      notesTete: 'Citron · Bergamote · Notes herbacées',
      notesCœur: "Magnolia · Fleur d'oranger · Poire",
      notesFond: 'Vanille de Tahiti · Vanille de Madagascar · Cacao · Ambrette',
      description: "Contre Moi de Louis Vuitton est une fragrance féminine gourmande et envoûtante. Une ouverture agrumes lumineuse cède la place à un cœur floral délicat, avant de révéler un fond irrésistiblement doux de vanille de Tahiti et de cacao.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Pur Oud',
      slug: 'pur-oud-lv',
      categorieId: lvCat.id,
      notesTete: 'Oud',
      notesCœur: 'Ambrette',
      notesFond: 'Helvetolide',
      description: "Pur Oud de Louis Vuitton est une ode pure et magistrale à l'oud, la matière première la plus précieuse de la parfumerie orientale. Une fragrance d'une richesse absolue, boisée et envoûtante, portée à son essence la plus pure.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: true,
    },

    // ── LE LABO ──
    {
      nom: 'Rose 31',
      slug: 'rose-31-le-labo',
      categorieId: lelaboCat.id,
      notesTete: 'Rose · Cumin',
      notesCœur: 'Rose · Vétiver · Cèdre',
      notesFond: "Musc · Gaïac · Oud · Résine oliban · Ciste",
      description: "Rose 31 de Le Labo est une rose paradoxale — loin d'être féminine ou sucrée, elle est boisée, épicée et presque cuirée. Le cumin apporte un caractère sauvage, le vétiver une profondeur terreuse, et le musc une sensualité durable.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: true, exclusif: false,
    },
    {
      nom: 'Another 13',
      slug: 'another-13-le-labo',
      categorieId: lelaboCat.id,
      notesTete: 'Poire · Pomme · Agrumes',
      notesCœur: 'Ambrette · Amyle salicylate · Mousse · Jasmin',
      notesFond: 'Iso E Super · Cetalox · Helvitolide · Ambrettolide',
      description: "Another 13 de Le Labo est le parfum le plus addictif de la maison. Conçu en collaboration avec AnOther Magazine, il joue sur des molécules de synthèse qui s'accordent de manière unique avec chaque peau, créant une fragrance presque imperceptible mais inoubliable.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Santal 33',
      slug: 'santal-33-le-labo',
      categorieId: lelaboCat.id,
      notesTete: 'Bois de santal · Cuir · Papyrus',
      notesCœur: 'Cèdre · Cardamome',
      notesFond: 'Violette · Iris · Ambre',
      description: "Santal 33 de Le Labo est devenu un phénomène culturel mondial. Sa combinaison unique de bois de santal crémeux, de cuir fumé et d'iris poudré crée une fragrance à la fois chaleureuse et mystérieuse, qui évoque les grands espaces américains.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: true, exclusif: false,
    },

    // ── MANCERA ──
    {
      nom: 'Roses Vanille',
      slug: 'roses-vanille-mancera',
      categorieId: manceraCat.id,
      notesTete: "Citron d'Italie",
      notesCœur: 'Rose de Turquie',
      notesFond: 'Vanille · Musc blanc · Cèdre',
      description: "Roses Vanille de Mancera est une fragrance féminine d'une douceur irrésistible. La rose de Turquie s'unit à une vanille généreuse pour créer un sillage gourmand et floral, sublimé par un musc blanc aérien et un cèdre qui apporte une légère profondeur boisée.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },

    // ── TOM FORD ──
    {
      nom: 'Tobacco Vanille',
      slug: 'tobacco-vanille-tom-ford',
      categorieId: tomfordCat.id,
      notesTete: 'Feuille de tabac · Notes épicées',
      notesCœur: 'Vanille · Cacao · Fève de tonka · Fleur de tabac',
      notesFond: 'Fruits secs · Notes boisées',
      description: "Tobacco Vanille de Tom Ford est une icône de la parfumerie de niche. Riche, chaleureux et envoûtant, il marie le tabac épicé à une vanille crémeuse et une fève de tonka généreuse. Un parfum d'hiver par excellence, sophistiqué et réconfortant.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: true, exclusif: false,
    },

    // ── AMOUAGE ──
    {
      nom: 'Amber Sogara',
      slug: 'amber-sogara-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Aldéhydes',
      notesCœur: 'Rose',
      notesFond: 'Ambrette',
      description: "Amber Sogara d'Amouage est une interprétation moderne de l'ambre traditionnel. Les aldéhydes pétillants s'ouvrent sur une rose majestueuse, avant de laisser place à un fond d'ambrette chaleureux et sensuel.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Ashore',
      slug: 'ashore-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Cardamome · Curcuma · Poivre rose',
      notesCœur: 'Rose · Notes solaires · Jasmin Sambac',
      notesFond: "Ambre gris · Bois de santal · Résine oliban",
      description: "Ashore d'Amouage évoque une plage ensoleillée et exotique. Les épices chaleureuses de cardamome et de poivre rose s'harmonisent avec un cœur floral lumineux, avant de déposer un fond océanique d'ambre gris et de bois de santal.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Décision',
      slug: 'decision-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Cardamome · Bergamote · Poivre rose',
      notesCœur: 'Encens · Baies de genévrier · Myrrhe',
      notesFond: 'Vanille · Cèdre · Patchouli',
      description: "Décision d'Amouage est un parfum de caractère et d'autorité. Les épices vives de l'ouverture laissent place à un cœur sacré d'encens et de myrrhe, avant de révéler un fond boisé et vanillé d'une rare élégance.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Dia 40 Women',
      slug: 'dia-40-women-amouage',
      categorieId: amouageCat.id,
      notesTete: "Aldéhydes · Musc · Cyclamen · Feuille de violette · Cassis",
      notesCœur: "Ylang-Ylang · Ciste Incanus · Œillet · Rose · Fleur d'oranger · Feuille de laurier",
      notesFond: "Gaïac · Racine d'iris · Bois de santal · Amyris",
      description: "Dia 40 Women d'Amouage est une fragrance féminine d'une sophistication intemporelle. Les aldéhydes pétillants s'entremêlent à un bouquet floral d'une richesse incomparable — ylang-ylang, rose, œillet — avant de reposer sur un fond boisé précieux.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Epic 56 Women',
      slug: 'epic-56-women-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Poivre rose · Cumin · Cannelle',
      notesCœur: 'Rose de Damas · Thé au jasmin · Géranium',
      notesFond: "Résine oliban · Oud · Patchouli · Gaïac · Ambre · Bois de santal · Musc · Racine d'iris · Vanille",
      description: "Epic 56 Women d'Amouage est une fragrance d'une profondeur épique, inspirée des routes de la soie. Les épices chaudes ouvrent sur un cœur floral oriental magnifique, avant de révéler un fond d'une complexité remarquable, alliant oud, résine et bois précieux.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Existence',
      slug: 'existence-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Muguet · Rose · Aldéhydes',
      notesCœur: 'Encens · Mystikal · Ciste',
      notesFond: 'Musc blanc · Ambre gris · Benjoin',
      description: "Existence d'Amouage explore la frontière entre l'être et le néant. Une fragrance méditative et profonde, où les fleurs blanches et les aldéhydes cèdent la place à un cœur encensé mystérieux, avant de se fondre sur un fond ambré et musqué d'une sérénité absolue.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Guidance',
      slug: 'guidance-amouage',
      categorieId: amouageCat.id,
      notesTete: "Poire · Noisette · Résine oliban",
      notesCœur: 'Osmanthus · Rose · Safran · Jasmin Sambac',
      notesFond: "Bois de santal · Vanille · Bois d'akigala · Ambre gris · Ciste",
      description: "Guidance d'Amouage est un parfum élégant et enveloppant, au caractère doux et sophistiqué. Il s'ouvre sur des notes fruitées délicates de poire et de noisette, évolue vers un cœur riche mêlant osmanthus, rose et safran, puis se pose sur un fond chaleureux de bois de santal, de vanille et d'ambre gris.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: true, exclusif: true,
    },
    {
      nom: 'Guidance 46',
      slug: 'guidance-46-amouage',
      categorieId: amouageCat.id,
      notesTete: "Eau de rose · Poire · Noisette · Amande amère · Encens",
      notesCœur: 'Rose · Osmanthus · Safran · Jasmin Sambac',
      notesFond: "Bois de santal · Bois d'akigala · Vanille · Ambrette · Georgywood · Ambre gris · Ciste",
      description: "Guidance 46 d'Amouage est la version concentrée de Guidance, encore plus riche et enveloppante. L'amande amère et l'encens ajoutent une dimension mystérieuse à l'ouverture, tandis que le fond de Georgywood et d'ambre gris prolonge le sillage avec une sophistication incomparable.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: true,
    },
    {
      nom: 'Honour 43 Women',
      slug: 'honour-43-women-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Feuille de rhubarbe · Poivre · Coriandre',
      notesCœur: 'Tubéreuse · Muguet · Jasmin · Œillet',
      notesFond: "Bois de santal · Vétiver · Opoponax · Ciste · Résine oliban · Cuir",
      description: "Honour 43 Women d'Amouage est une fragrance d'une féminité affirmée et majestueuse. La fraîcheur végétale de la rhubarbe et de la coriandre ouvre sur un cœur floral monumental — tubéreuse, muguet, jasmin — avant de révéler un fond boisé cuiré d'une profondeur royale.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Interlude 53',
      slug: 'interlude-53-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Origan · Piment · Bergamote',
      notesCœur: 'Encens · Ambre · Opoponax · Ciste',
      notesFond: 'Fumée · Oud · Cuir · Patchouli · Bois de santal',
      description: "Interlude 53 d'Amouage est l'un des parfums masculins les plus complexes et admirés au monde. Une fragrance de contraste absolu — entre lumière et obscurité, entre le piment sauvage et le bois fumé — qui raconte une histoire sans fin.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: true, exclusif: false,
    },
    {
      nom: 'Interlude Black Iris',
      slug: 'interlude-black-iris-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Feuille de violette · Romarin · Bergamote',
      notesCœur: "Racine d'iris · Résine oliban · Myrrhe · Ambre · Ciste · Vanille",
      notesFond: 'Cuir · Oud · Bois de santal · Patchouli · Cèdre',
      description: "Interlude Black Iris d'Amouage est une version encore plus sombre et mystérieuse d'Interlude. L'iris noir apporte une dimension florale quasi gothique, tandis que la myrrhe et la vanille créent une tension entre le sacré et le sensuel. Un chef-d'œuvre olfactif.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: true,
    },
    {
      nom: 'Leather Sadah',
      slug: 'leather-sadah-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Cuir',
      notesCœur: 'Vanille',
      notesFond: 'Oud',
      description: "Leather Sadah d'Amouage est la quintessence du cuir olfactif. Direct et sans compromis, il marie le cuir brut à une vanille douce et un oud profond pour créer une fragrance d'une virilité élégante et d'une sensualité animale.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Love Delight',
      slug: 'love-delight-amouage',
      categorieId: amouageCat.id,
      notesTete: "Gingembre · Mandarine · Cannelle · Eau de rose",
      notesCœur: 'Héliotrope · Jasmin · Rose',
      notesFond: 'Vanille · Cacao · Rhum · Huile essentielle de cypriol',
      description: "Love Delight d'Amouage est une déclaration d'amour gourmande et épicée. Le gingembre et la cannelle réchauffent une mandarine pétillante, avant de révéler un cœur floral enivrant. Le fond de vanille, cacao et rhum crée une sensualité irrésistible et addictive.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Lustre',
      slug: 'lustre-amouage',
      categorieId: amouageCat.id,
      notesTete: "Cardamome · Racine d'iris",
      notesCœur: 'Bois de santal · Cèdre · Patchouli',
      notesFond: 'Myrrhe · Benjoin · Ambrarome · Vanille · Styrax · Ciste · Huile essentielle de cypriol',
      description: "Lustre d'Amouage brille comme un joyau olfactif. La cardamome et l'iris ouvrent sur un cœur boisé soyeux, avant de révéler un fond d'une richesse opulente — myrrhe, benjoin, styrax — créant une fragrance aussi précieuse et chatoyante qu'une gemme rare.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Outlands',
      slug: 'outlands-amouage',
      categorieId: amouageCat.id,
      notesTete: "Encens · Cardamome · Élémi · Citron · Bergamote · Poivre du Sichuan",
      notesCœur: "Patchouli · Anis · Coriandre · Cumin · Fleur d'oranger · Safran · Rose · Géranium",
      notesFond: 'Encens · Vanille · Ambre · Benjoin · Oud · Opoponax · Bouleau · Ambre gris · Maltol · Musc',
      description: "Outlands d'Amouage est une odyssée olfactive aux confins du monde. Épices, résines, fleurs et bois s'entremêlent dans une composition d'une complexité vertigineuse, évoquant les marchés épicés des grandes routes caravanières.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Reflection 46',
      slug: 'reflection-46-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Romarin · Poivre rose · Petit-grain',
      notesCœur: "Jasmin · Néroli · Racine d'iris · Ylang-ylang",
      notesFond: 'Bois de santal · Cèdre · Vétiver · Patchouli',
      description: "Reflection 46 d'Amouage est une fragrance masculine d'une fraîcheur aromatique remarquable. Le romarin et le poivre rose ouvrent sur un cœur floral masculin unique alliant jasmin et néroli, avant de se poser sur un fond boisé propre et élégant.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
    {
      nom: 'Reflection 45 Man',
      slug: 'reflection-45-man-amouage',
      categorieId: amouageCat.id,
      notesTete: 'Benjoin · Poivre rose · Lavande · Cardamome · Sauge sclarée',
      notesCœur: "Iris · Jasmin · Néroli · Angélique · Fève de tonka · Vanille",
      notesFond: "Résine oliban · Cèdre · Bois de santal · Vétiver · Patchouli · Myrrhe · Opoponax",
      description: "Reflection 45 Man d'Amouage est un parfum masculin d'une élégance absolue. La lavande et la sauge sclarée créent une ouverture aromatique envoûtante, le cœur d'iris et de jasmin apporte une noblesse florale, et le fond de résines précieuses confère une profondeur majestueuse.",
      prix: 50, prixAchat: 20,
      tailles: [
        { taille: '30ml', volumeMl: 30, prixVente: 20, quantite: 10 },
        { taille: '50ml', volumeMl: 50, prixVente: 30, quantite: 10 },
        { taille: '100ml', volumeMl: 100, prixVente: 50, quantite: 10 },
      ],
      featured: false, exclusif: false,
    },
  ]

  // Créer tous les produits avec leurs stocks
  for (const p of produits) {
    const notes = [p.notesTete, p.notesCœur, p.notesFond]
      .filter(Boolean)
      .join(' · ')

    const produit = await prisma.produit.create({
      data: {
        nom:         p.nom,
        slug:        p.slug,
        categorieId: p.categorieId,
        notes:       notes,
        description: p.description,
        prix:        p.prix,
        prixAchat:   p.prixAchat,
        actif:       true,
        featured:    p.featured,
        exclusif:    p.exclusif,
        nouveaute:   false,
        offre:       false,
        images:      [],
      }
    })

    // Créer les stocks par taille
    for (const t of p.tailles) {
      await prisma.stock.create({
        data: {
          produitId:   produit.id,
          taille:      t.taille,
          volumeMl:    t.volumeMl,
          quantite:    t.quantite,
          seuilAlerte: 3,
          prixVente:   t.prixVente,
        }
      })
    }

    // StockKilo
    await prisma.stockKilo.create({
      data: {
        produitId:    produit.id,
        stockKgTotal: 1.0,
        stockMlTotal: p.tailles.reduce((s, t) => s + t.volumeMl * t.quantite, 0),
      }
    })

    console.log(`✅ ${p.nom}`)
  }

  console.log(`\n🎉 Seed terminé — ${produits.length} parfums créés`)
  console.log('📊 Catégories : Louis Vuitton, Le Labo, Mancera, Tom Ford, Amouage')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
