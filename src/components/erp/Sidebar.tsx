/**
 * @module Sidebar
 * @description Menu latéral ERP filtré par rôle utilisateur
 * @author Nuances Parfums
 */
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type MenuItem = { href: string; label: string; icon: string; alert?: boolean };
type MenuSection = { section: string; items: MenuItem[] };

const MENU_COMPLET: MenuSection[] = [
  {
    section: "Principal",
    items: [
      { href: "/erp/dashboard", label: "Dashboard", icon: "▪" },
      { href: "/erp/commandes", label: "Commandes", icon: "▪", alert: true },
      { href: "/erp/vente-place", label: "Vente sur place", icon: "▪" },
      { href: "/erp/clients", label: "Clients", icon: "▪" },
      { href: "/erp/parametres", label: "Paramètres", icon: "▪" },
    ],
  },
  {
    section: "Inventaire",
    items: [
      { href: "/erp/produits", label: "Produits", icon: "▪" },
      { href: "/erp/stock", label: "Stock", icon: "▪" },
      { href: "/erp/exclusivites", label: "Exclusivités & Offres", icon: "▪" },
      { href: "/erp/livraisons", label: "Livraisons", icon: "▪" },
    ],
  },
  {
    section: "Catalogue",
    items: [
      { href: "/erp/categories", label: "Catégories", icon: "▪" },
      { href: "/erp/marques", label: "Marques", icon: "▪" },
    ],
  },
  {
    section: "Finance",
    items: [
      // { href: '/erp/finances',          label: 'Finances',    icon: '▪' },
      { href: "/erp/finances/factures", label: "Factures", icon: "▪" },
    ],
  },
];

const MENU_VENDEUR: MenuSection[] = [
  {
    section: "Vente",
    items: [
      { href: "/erp/commandes", label: "Commandes", icon: "▪", alert: true },
      { href: "/erp/vente-place", label: "Vente sur place", icon: "▪" },
    ],
  },
];

export function Sidebar({ role = "ADMIN" }: { role?: string }) {
  const path = usePathname();
  const menu =
    role === "VENDEUR" || role === "EMPLOYE"
      ? MENU_VENDEUR
      : MENU_COMPLET.map((group) => {
          if (group.section !== "Principal") return group;
          return {
            ...group,
            items: group.items.filter((item) =>
              item.href === "/erp/parametres" ? role === "ADMIN" : true
            ),
          };
        });

  return (
    <aside
      className="erp-sidebar"
      style={{
        width: "220px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: "#FDFAF5",
        borderRight: "1px solid #EDE5D4",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        fontFamily: "Jost, sans-serif",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.2rem 1.4rem 1rem",
          borderBottom: "1px solid #EDE5D4",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0.2rem",
        }}
      >
        <Image
          src="/images/brand/logo.png"
          alt="Nuances Parfums"
          width={130}
          height={48}
          priority
          style={{ objectFit: "contain", display: "block" }}
        />
        <div
          style={{
            fontSize: "0.5rem",
            letterSpacing: "0.22em",
            color: "#C4960A",
            textTransform: "uppercase",
            fontFamily: "Jost, sans-serif",
          }}
        >
          — Gestion —
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1.2rem 0", overflowY: "auto" }}>
        {menu.map((group) => (
          <div key={group.section} style={{ marginBottom: "1.4rem" }}>
            <div
              style={{
                fontSize: "0.58rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#C4B090",
                padding: "0 1.6rem",
                marginBottom: "0.3rem",
                fontWeight: 500,
              }}
            >
              {group.section}
            </div>

            {group.items.map((item) => {
              const active =
                path === item.href || path.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 1.6rem",
                    fontSize: "0.8rem",
                    color: active ? "#1A1208" : "#8A7B68",
                    textDecoration: "none",
                    background: active ? "#F0E8D8" : "transparent",
                    borderLeft: active
                      ? "2px solid #C4960A"
                      : "2px solid transparent",
                    fontWeight: active ? 500 : 400,
                    transition: "all 0.18s",
                    letterSpacing: "0.01em",
                  }}
                >
                  <span>{item.label}</span>
                  {"alert" in item && item.alert && (
                    <span
                      style={{
                        background: "#C4960A",
                        color: "white",
                        fontSize: "0.55rem",
                        padding: "0.1rem 0.45rem",
                        borderRadius: "10px",
                        fontWeight: 600,
                      }}
                    >
                      !
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "1rem 1.6rem",
          borderTop: "1px solid #EDE5D4",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "0.72rem",
            color: "#C4B090",
            textDecoration: "none",
            transition: "color 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span>←</span> Site vitrine
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            fontSize: "0.72rem",
            color: "#C09070",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "Jost, sans-serif",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            transition: "color 0.2s",
          }}
        >
          <span>→</span> Déconnexion
        </button>
      </div>
      <style>{`
        @media (max-width: 980px) {
          .erp-sidebar {
            width: 100% !important;
            height: auto !important;
            position: static !important;
            border-right: none !important;
            border-bottom: 1px solid #EDE5D4;
          }
        }
      `}</style>
    </aside>
  );
}
