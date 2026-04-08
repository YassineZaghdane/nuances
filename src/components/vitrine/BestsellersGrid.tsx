"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ProductCard } from "./ProductCard"

type Product = {
  id: string
  nom: string
  slug: string
  notes?: string | null
  prix30ml?: number | null
  prix50ml?: number | null
  prix100ml?: number | null
  images: string[]
  featured?: boolean
  stockKilo?: { stockMlTotal: number } | null
}

export function BestsellersGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/produits?featured=true", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: "4rem 6%", textAlign: "center", color: "#8A7B68" }}>
        Chargement...
      </div>
    )
  }

  return (
    <section style={{ padding: "8% 6%", background: "#FDFAF5" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem" }}>
        <div>
          <span style={{
            fontSize: "0.65rem", letterSpacing: "0.35em",
            textTransform: "uppercase", color: "#C4960A",
            display: "block", marginBottom: "0.5rem",
            fontFamily: "Jost, sans-serif"
          }}>Nos Incontournables</span>
          <h2 style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(2rem, 3vw, 3rem)",
            fontWeight: 300, color: "#1A1208"
          }}>Bestsellers</h2>
        </div>
        <Link href="/boutique" style={{
          fontSize: "0.75rem", letterSpacing: "0.15em",
          textTransform: "uppercase", color: "#8A7B68",
          textDecoration: "none", fontFamily: "Jost, sans-serif"
        }}>Voir tout →</Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            nom={product.nom}
            slug={product.slug}
            notes={product.notes ?? undefined}
            prix30ml={product.prix30ml}
            prix50ml={product.prix50ml}
            prix100ml={product.prix100ml}
            stockMlTotal={product.stockKilo?.stockMlTotal}
            images={product.images}
            featured={product.featured}
          />
        ))}
      </div>
      {products.length === 0 && (
        <p style={{ textAlign: "center", color: "#8A7B68", padding: "2rem" }}>Aucun produit en vedette.</p>
      )}
    </section>
  )
}
