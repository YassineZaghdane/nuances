/**
 * @module Chatbot
 * @description Conseiller parfum IA via Claude API
 */
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MODEL =
  process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Service conseiller indisponible (clé API manquante)." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { messages } = body as {
      messages?: Array<{ role: string; content: string }>;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages requis" }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const produits = await prisma.produit.findMany({
      where: { actif: true },
      select: {
        nom: true,
        notes: true,
        description: true,
        prix: true,
        exclusif: true,
        nouveaute: true,
        categorie: { select: { nom: true } },
        stocks: {
          where: { quantite: { gt: 0 } },
          select: { taille: true, quantite: true },
        },
      },
      orderBy: { featured: "desc" },
    });

    const catalogueTexte = produits
      .map((p) => {
        const tailles = p.stocks.map((s) => s.taille).join(", ");
        return `- ${p.nom} (${p.categorie?.nom || "Parfum"}): ${p.notes || ""} ${p.description || ""} | Prix: dès ${Number(p.prix).toFixed(0)} DT | Formats: ${tailles || "Non disponible"}${p.exclusif ? " | EXCLUSIF" : ""}${p.nouveaute ? " | NOUVEAUTÉ" : ""}`;
      })
      .join("\n");

    const systemPrompt = `Tu es Nour, la conseillère parfum virtuelle de Nuances Parfums, une parfumerie de luxe basée à Nabeul, Tunisie.

TON RÔLE :
Tu aides les clients à trouver leur parfum idéal en leur posant des questions intelligentes sur leurs préférences olfactives, leur style de vie et leurs habitudes.

TON STYLE :
- Chaleureux, expert, élégant
- Tu parles en français
- Tu poses UNE question à la fois pour ne pas submerger le client
- Tu es enthousiaste à propos des parfums
- Tu utilises des métaphores poétiques pour décrire les senteurs

CATALOGUE ACTUEL (stock disponible) :
${catalogueTexte}

PROCESSUS DE CONSEIL :
1. Accueille chaleureusement le client
2. Demande s'il cherche un parfum pour lui/elle ou un cadeau
3. Demande ses préférences (frais/oriental/floral/boisé/épicé)
4. Demande l'occasion (quotidien/soirée/bureau/sport)
5. Demande sa sensibilité au prix (budget)
6. Recommande 2-3 parfums maximum avec une explication poétique
7. Propose de commander ou de demander des échantillons

RÈGLES IMPORTANTES :
- Ne recommande QUE des produits du catalogue ci-dessus
- Si un parfum est en rupture (pas de stocks), ne le recommande pas
- Reste focalisé sur le conseil parfum
- Si le client veut commander, dis-lui de se rendre sur /boutique
- Tu peux mentionner les prix mais reste élégant
- Maximum 3 phrases par réponse pour rester concis`;

    const claudeMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    if (claudeMessages.length === 0) {
      return NextResponse.json({ error: "Aucun message valide" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const first = response.content[0];
    const assistantMessage =
      first && first.type === "text" ? first.text : "";

    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
    });
  } catch (error: unknown) {
    console.error("[POST /api/chatbot]", error);
    return NextResponse.json(
      { error: "Erreur du conseiller. Réessayez." },
      { status: 500 }
    );
  }
}
