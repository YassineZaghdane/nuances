/**
 * @module Types
 * @description Types TypeScript centralisés
 */

export interface StockItem {
  taille: string
  quantite: number
  volumeMl?: number
  prixVente?: number
  seuilAlerte?: number
}

export interface Categorie {
  id: string
  nom: string
  slug: string
}

export interface Produit {
  id: string
  nom: string
  slug: string
  description?: string
  notes?: string
  prix: number
  prixAchat?: number
  images: string[]
  actif: boolean
  featured: boolean
  exclusif: boolean
  nouveaute: boolean
  offre: boolean
  offreLabel?: string
  categorieId?: string
  categorie?: Categorie
  stocks: StockItem[]
  createdAt?: string
  updatedAt?: string
}

export type Source =
  | 'INSTAGRAM'
  | 'WHATSAPP'
  | 'BOUCHE_A_OREILLE'
  | 'BOUTIQUE'
  | 'SITE_WEB'

export interface Client {
  id: string
  nom: string
  telephone: string
  email?: string
  adresse?: string
  ville?: string
  source?: Source
  notes?: string
  createdAt?: string
}

export type StatutCommande =
  | 'EN_ATTENTE'
  | 'CONFIRMEE'
  | 'EN_PREPARATION'
  | 'EXPEDIEE'
  | 'LIVREE'
  | 'ANNULEE'
  | 'RETOURNEE'

export interface LigneCommande {
  id: string
  produitId: string
  produit?: { nom: string }
  taille: string
  volumeMl?: number
  volumeMlTotal?: number
  quantite: number
  prixUnitaire: number
}

export interface Commande {
  id: string
  numero: string
  clientId: string
  client: Client
  statut: StatutCommande
  modePaiement?: string
  montantTotal: number
  fraisLivraison?: number
  adresseLivraison?: string
  villeLivraison?: string
  notes?: string
  source?: string
  lignes: LigneCommande[]
  createdAt: string
  updatedAt?: string
}

export interface CartItem {
  id: string
  produitId: string
  nom: string
  taille: string
  prix: number
  quantite: number
  image?: string
  notes?: string
}

export type Role = 'ADMIN' | 'GERANT' | 'EMPLOYE' | 'VENDEUR'

export interface User {
  id: string
  email: string
  nom: string
  role: Role
  actif: boolean
}

export interface StatutStyle {
  color: string
  bg: string
  label: string
}

export const STATUT_COMMANDE_STYLES: Record<StatutCommande, StatutStyle> = {
  EN_ATTENTE:     { color:'#B8860B', bg:'#FFF8E6', label:'En attente' },
  CONFIRMEE:      { color:'#4A7A9B', bg:'#EEF5FA', label:'Confirmée' },
  EN_PREPARATION: { color:'#7A5C9B', bg:'#F4EFF9', label:'En prépa.' },
  EXPEDIEE:       { color:'#2E7D52', bg:'#EBF6F0', label:'Expédiée' },
  LIVREE:         { color:'#1B5E3B', bg:'#E4F2EB', label:'Livrée' },
  ANNULEE:        { color:'#8B3A3A', bg:'#FAEAEA', label:'Annulée' },
  RETOURNEE:      { color:'#6B4C8B', bg:'#F0EBF9', label:'Retournée' },
}

// ml de parfum pur + ml d'alcool consommés par flacon vendu
export const CONSOMMATION_PARFUM: Record<string, { parfum: number; alcool: number }> = {
  '30ml':  { parfum: 11, alcool: 19 },
  '50ml':  { parfum: 18, alcool: 32 },
  '100ml': { parfum: 33, alcool: 67 },
}

export const TAILLE_ML: Record<string, number> = {
  '1ml': 1,
  '2ml': 2,
  '5ml': 5,
  '10ml': 10,
  '15ml': 15,
  '30ml': 30,
  '50ml': 50,
  '100ml': 100,
  '200ml': 200,
}
