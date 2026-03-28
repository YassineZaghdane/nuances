/**
 * @module Email
 * @description Service d'envoi d'emails via Resend
 */
import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.FROM_EMAIL || "commandes@nuancesparfums.tn";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nuances.tn";

export async function envoyerConfirmationCommande(data: {
  clientEmail: string;
  clientNom: string;
  numero: string;
  lignes: Array<{
    nom: string;
    taille: string;
    quantite: number;
    prixUnitaire: number;
  }>;
  montantTotal: number;
  fraisLivraison: number;
  adresseLivraison?: string;
  villeLivraison?: string;
  modePaiement?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email] RESEND_API_KEY manquant — email non envoyé");
    return { success: false as const, reason: "no_api_key" };
  }

  if (!data.clientEmail) {
    console.log("[Email] Pas d'email client — email non envoyé");
    return { success: false as const, reason: "no_email" };
  }

  const resend = getResend();
  if (!resend) {
    return { success: false as const, reason: "no_api_key" };
  }

  const lignesHTML = data.lignes
    .map(
      (l) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;font-size:14px;color:#1A1208">${l.nom}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;font-size:14px;color:#C4960A;font-weight:600">${l.taille}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;font-size:14px;text-align:center">${l.quantite}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;font-size:14px;text-align:right;color:#C4960A">${(l.prixUnitaire * l.quantite).toFixed(0)} DT</td>
    </tr>
  `
    )
    .join("");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP || "21612345678";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:'Georgia',serif">
  <div style="max-width:600px;margin:40px auto;background:white;border:1px solid #EDE5D4">
    <div style="background:#1A1208;padding:40px;text-align:center">
      <div style="font-size:28px;letter-spacing:8px;color:white;text-transform:uppercase">✿ NUANCES</div>
      <div style="font-size:11px;letter-spacing:4px;color:#C4960A;margin-top:4px;text-transform:uppercase">— PARFUMS —</div>
    </div>
    <div style="padding:40px">
      <h1 style="font-size:24px;font-weight:300;color:#1A1208;margin-bottom:8px">Commande confirmée ✓</h1>
      <p style="font-size:14px;color:#8A7B68;margin-bottom:30px">Bonjour ${data.clientNom}, votre commande a bien été reçue.</p>
      <div style="background:#FFF8E6;border:1px solid rgba(196,150,10,0.2);padding:16px 20px;margin-bottom:30px;display:inline-block">
        <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8A7B68;margin-bottom:4px">Numéro de commande</div>
        <div style="font-size:22px;color:#C4960A;font-weight:bold">${data.numero}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="background:#FAF7F2">
            <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A7B68;font-weight:500">Produit</th>
            <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A7B68;font-weight:500">Format</th>
            <th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A7B68;font-weight:500">Qté</th>
            <th style="padding:10px 14px;text-align:right;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A7B68;font-weight:500">Total</th>
          </tr>
        </thead>
        <tbody>${lignesHTML}</tbody>
      </table>
      <div style="border-top:2px solid #EDE5D4;padding-top:16px;margin-bottom:30px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:#8A7B68">
          <span>Sous-total</span>
          <span>${(data.montantTotal - Number(data.fraisLivraison)).toFixed(0)} DT</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:13px;color:#8A7B68">
          <span>Livraison</span>
          <span>${Number(data.fraisLivraison).toFixed(0)} DT</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:18px;color:#1A1208;font-weight:bold">
          <span>Total</span>
          <span style="color:#C4960A">${data.montantTotal.toFixed(0)} DT</span>
        </div>
      </div>
      ${
        data.adresseLivraison
          ? `
      <div style="background:#FAF7F2;padding:16px 20px;margin-bottom:24px">
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A7B68;margin-bottom:8px">Livraison</div>
        <div style="font-size:13px;color:#1A1208;line-height:1.6">
          ${data.adresseLivraison}<br/>
          ${data.villeLivraison || ""}<br/>
          Paiement : ${(data.modePaiement || "PAIEMENT_LIVRAISON").replace(/_/g, " ")}
        </div>
      </div>
      `
          : ""
      }
      <p style="font-size:13px;color:#8A7B68;line-height:1.8;margin-bottom:24px">
        Notre équipe vous contactera sous 24h pour organiser la livraison.
        Vous pouvez suivre votre commande sur notre site avec le numéro
        <strong style="color:#C4960A">${data.numero}</strong>.
      </p>
      <div style="text-align:center;margin-bottom:30px">
        <a href="${baseUrl}/commande/confirmation?numero=${encodeURIComponent(data.numero)}"
           style="display:inline-block;background:#1A1208;color:white;padding:14px 32px;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none">
          Suivre ma commande
        </a>
      </div>
      <div style="text-align:center;padding-top:20px;border-top:1px solid #EDE5D4">
        <a href="https://wa.me/${wa}?text=${encodeURIComponent(`Bonjour, ma commande est ${data.numero}`)}"
           style="font-size:12px;color:#25D366;text-decoration:none">
          💬 Nous contacter sur WhatsApp
        </a>
      </div>
    </div>
    <div style="background:#FAF7F2;padding:24px;text-align:center;border-top:1px solid #EDE5D4">
      <div style="font-size:11px;color:#C4B090;line-height:2">
        Nuances Parfums · Nabeul 8000, Tunisie<br/>
        @nuancesparfums
      </div>
      <div style="font-size:11px;color:#D4B896;margin-top:8px;font-style:italic">
        ✦ Excellence · Authenticité · Raffinement ✦
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: data.clientEmail,
      subject: `✓ Commande ${data.numero} confirmée — Nuances Parfums`,
      html,
    });
    console.log("[Email] Confirmation envoyée:", result);
    return { success: true as const, id: result.data?.id };
  } catch (error) {
    console.error("[Email] Erreur envoi confirmation:", error);
    return { success: false as const, error };
  }
}

export async function envoyerAlerteStock(
  alertes: Array<{
    produitNom: string;
    taille: string;
    quantite: number;
    seuilAlerte: number;
  }>
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email] RESEND_API_KEY manquant — alerte non envoyée");
    return { success: false as const, reason: "no_api_key" };
  }

  const resend = getResend();
  if (!resend) {
    return { success: false as const, reason: "no_api_key" };
  }

  const lignesHTML = alertes
    .map(
      (a) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;font-size:14px;color:#1A1208">${a.produitNom}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;font-size:14px;color:#C4960A;font-weight:600">${a.taille}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;font-size:14px;text-align:center;color:#8B3A3A;font-weight:bold">${a.quantite}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;font-size:14px;text-align:center;color:#8A7B68">${a.seuilAlerte}</td>
    </tr>
  `
    )
    .join("");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:Arial,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:white;border:1px solid #EDE5D4">
    <div style="background:#8B3A3A;padding:30px 40px;display:flex;align-items:center;gap:16px">
      <div style="font-size:32px">⚠️</div>
      <div>
        <div style="font-size:18px;color:white;font-weight:bold">Alerte Stock — Nuances Parfums</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px">
          ${alertes.length} produit${alertes.length > 1 ? "s" : ""} en rupture imminente
        </div>
      </div>
    </div>
    <div style="padding:40px">
      <p style="font-size:14px;color:#8A7B68;margin-bottom:24px">
        Les produits suivants ont atteint ou dépassé leur seuil d'alerte.
        Pensez à réapprovisionner rapidement.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:30px">
        <thead>
          <tr style="background:#FAEAEA">
            <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B3A3A">Produit</th>
            <th style="padding:10px 14px;text-align:left;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B3A3A">Format</th>
            <th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B3A3A">Stock actuel</th>
            <th style="padding:10px 14px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B3A3A">Seuil</th>
          </tr>
        </thead>
        <tbody>${lignesHTML}</tbody>
      </table>
      <div style="text-align:center">
        <a href="${baseUrl}/erp/stock"
           style="display:inline-block;background:#8B3A3A;color:white;padding:14px 32px;font-size:12px;letter-spacing:3px;text-transform:uppercase;text-decoration:none">
          Gérer le stock
        </a>
      </div>
    </div>
    <div style="background:#FAF7F2;padding:20px;text-align:center;border-top:1px solid #EDE5D4">
      <div style="font-size:11px;color:#C4B090">
        Nuances Parfums · ERP interne · ${new Date().toLocaleDateString("fr-FR")}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `⚠️ Alerte stock — ${alertes.length} produit${alertes.length > 1 ? "s" : ""} à réapprovisionner`,
      html,
    });
    console.log("[Email] Alerte stock envoyée:", result);
    return { success: true as const, id: result.data?.id };
  } catch (error) {
    console.error("[Email] Erreur alerte stock:", error);
    return { success: false as const, error };
  }
}
