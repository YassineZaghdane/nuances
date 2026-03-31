import { formatPrix, formatDate, slugify, genererNumeroCommande } from '../utils'

describe('formatPrix', () => {
  it('formate un nombre entier', () => {
    expect(formatPrix(45)).toBe('45 DT')
  })
  it('arrondit un décimal', () => {
    expect(formatPrix(45.5)).toBe('46 DT')
  })
  it('accepte une string', () => {
    expect(formatPrix('100')).toBe('100 DT')
  })
  it('formate zéro', () => {
    expect(formatPrix(0)).toBe('0 DT')
  })
})

describe('slugify', () => {
  it('convertit en minuscules', () => {
    expect(slugify('Rose de Damas')).toBe('rose-de-damas')
  })
  it('supprime les accents', () => {
    expect(slugify('Élégance')).toBe('elegance')
  })
  it('remplace les espaces par des tirets', () => {
    expect(slugify('Oud Royal')).toBe('oud-royal')
  })
  it('supprime les tirets en début/fin', () => {
    expect(slugify(' Ambre ')).toBe('ambre')
  })
  it('remplace les caractères spéciaux', () => {
    expect(slugify('Rose & Oud')).toBe('rose-oud')
  })
})

describe('genererNumeroCommande', () => {
  it('génère le bon format', () => {
    const annee = new Date().getFullYear()
    expect(genererNumeroCommande(0)).toBe(`NP-${annee}-0001`)
    expect(genererNumeroCommande(52)).toBe(`NP-${annee}-0053`)
  })
  it('padde correctement les grands nombres', () => {
    const annee = new Date().getFullYear()
    expect(genererNumeroCommande(999)).toBe(`NP-${annee}-1000`)
  })
})

describe('formatDate', () => {
  it('formate une date correctement', () => {
    const result = formatDate('2026-01-15')
    expect(result).toContain('2026')
  })
  it('formate un objet Date', () => {
    const result = formatDate(new Date('2026-03-31'))
    expect(result).toContain('2026')
  })
})
