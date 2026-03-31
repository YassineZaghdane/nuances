/**
 * @module Utils
 * @description Fonctions utilitaires partagées
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TAILLE_ML } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrix(montant: number | string): string {
  return `${Number(montant).toFixed(0)} DT`
}

/** Format monétaire TND (ERP, tableaux) */
export function formatPrice(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(n);
}

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(date).toLocaleDateString('fr-FR', options ?? {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max) + '…'
}

export function getVolumeMl(taille: string): number {
  return TAILLE_ML[taille] ?? 0
}

export function genererNumeroCommande(count: number): string {
  return `NP-${new Date().getFullYear()}-${String(count + 1).padStart(4,'0')}`
}
