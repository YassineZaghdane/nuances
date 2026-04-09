/**
 * @module Email
 * @description Envoi d'emails via Resend (confirmation commande + alertes stock)
 */
import { Resend } from "resend";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "benzaghden.fahmi@gmail.com";

export async function envoyerConfirmationCommande(data: {
  clientEmail: string;
  clientNom: string;
  numero: string;
  commandeId?: string;
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
  if (!process.env.RESEND_API_KEY || !data.clientEmail) {
    return { success: false };
  }

  const lignesHTML = data.lignes
    .map(
      (l) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;
                 font-size:14px;color:#1A1208">${l.nom}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;
                 font-size:14px;color:#C4960A;font-weight:600">${l.taille}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;
                 font-size:14px;text-align:center">${l.quantite}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;
                 font-size:14px;text-align:right;color:#C4960A">
        ${(l.prixUnitaire * l.quantite).toFixed(0)} DT
      </td>
    </tr>
  `,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:Georgia,serif">
<div style="max-width:640px;margin:32px auto;background:white;border:1px solid #EDE5D4">

  <div style="background:linear-gradient(145deg,#120E08 0%,#1A1208 60%,#2B1D10 100%);padding:38px 28px;text-align:center">
    <div style="font-size:26px;letter-spacing:8px;color:white;text-transform:uppercase">
      ✿ NUANCES
    </div>
    <div style="font-size:11px;letter-spacing:4px;color:#C4960A;margin-top:4px;
                text-transform:uppercase">— PARFUMS —</div>
    <div style="margin-top:16px;font-size:12px;color:rgba(255,255,255,0.65);line-height:1.7">
      Votre commande est bien enregistrée.<br/>
      Merci pour votre confiance.
    </div>
  </div>

  <div style="padding:34px 34px 18px">
    <h1 style="font-size:24px;font-weight:300;color:#1A1208;margin:0 0 8px">
      Commande confirmée ✓
    </h1>
    <p style="font-size:14px;color:#8A7B68;margin:0 0 26px">
      Bonjour ${data.clientNom}, votre commande a bien été reçue.
    </p>

    <div style="background:#FFF8E6;border:1px solid rgba(196,150,10,0.2);
                padding:16px 20px;margin-bottom:24px;display:inline-block">
      <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;
                  color:#8A7B68;margin-bottom:4px">Numéro de commande</div>
      <div style="font-size:22px;color:#C4960A;font-weight:bold">${data.numero}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid #EFE7D7">
      <thead>
        <tr style="background:#FAF7F2">
          <th style="padding:10px 14px;text-align:left;font-size:10px;
                     letter-spacing:2px;text-transform:uppercase;color:#8A7B68">Produit</th>
          <th style="padding:10px 14px;text-align:left;font-size:10px;
                     letter-spacing:2px;text-transform:uppercase;color:#8A7B68">Format</th>
          <th style="padding:10px 14px;text-align:center;font-size:10px;
                     letter-spacing:2px;text-transform:uppercase;color:#8A7B68">Qté</th>
          <th style="padding:10px 14px;text-align:right;font-size:10px;
                     letter-spacing:2px;text-transform:uppercase;color:#8A7B68">Total</th>
        </tr>
      </thead>
      <tbody>${lignesHTML}</tbody>
    </table>

    <div style="border-top:2px solid #EDE5D4;padding-top:16px;margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;
                  margin-bottom:8px;font-size:13px;color:#8A7B68">
        <span>Sous-total</span>
        <span>${(data.montantTotal - Number(data.fraisLivraison)).toFixed(0)} DT</span>
      </div>
      <div style="display:flex;justify-content:space-between;
                  margin-bottom:12px;font-size:13px;color:#8A7B68">
        <span>Livraison</span>
        <span>${Number(data.fraisLivraison).toFixed(0)} DT</span>
      </div>
      <div style="display:flex;justify-content:space-between;
                  font-size:18px;color:#1A1208;font-weight:bold">
        <span>Total</span>
        <span style="color:#C4960A">${data.montantTotal.toFixed(0)} DT</span>
      </div>
    </div>

    ${
      data.adresseLivraison
        ? `
    <div style="background:#FAF7F2;padding:16px 20px;margin-bottom:20px;border:1px solid #EFE7D7">
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;
                  color:#8A7B68;margin-bottom:8px">Livraison</div>
      <div style="font-size:13px;color:#1A1208;line-height:1.6">
        ${data.adresseLivraison}<br/>
        ${data.villeLivraison || ""}
      </div>
    </div>`
        : ""
    }

    <p style="font-size:13px;color:#8A7B68;line-height:1.8;margin-bottom:20px">
      Notre équipe vous contactera sous 24h pour organiser la livraison.
      Suivez votre commande avec le numéro
      <strong style="color:#C4960A">${data.numero}</strong>.
    </p>

    <div style="text-align:center;margin-bottom:24px">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/commande/confirmation/${data.commandeId || data.numero}"
         style="display:inline-block;background:#1A1208;color:white;border:1px solid #1A1208;
                padding:14px 32px;font-size:12px;letter-spacing:3px;
                text-transform:uppercase;text-decoration:none;box-shadow:0 8px 22px rgba(26,18,8,0.2)">
        Suivre ma commande
      </a>
    </div>
    <p style="text-align:center;font-size:11px;color:#C4B090;margin-bottom:12px">
      Ou copiez ce lien : ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/commande/confirmation/${data.commandeId || data.numero}
    </p>

    <div style="background:#FAF7F2;border:1px solid #EDE5D4;padding:14px 16px;margin-bottom:8px">
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8A7B68;margin-bottom:6px">
        Contact Nuances Parfums
      </div>
      <div style="font-size:13px;color:#1A1208;line-height:1.8">
        📞 +216 96 557 557<br/>
        📸 Instagram : @nuances.parfums<br/>
        📘 Facebook : Nuances.Parfums
      </div>
    </div>
  </div>

  <div style="background:#FAF7F2;padding:24px;text-align:center;
              border-top:1px solid #EDE5D4">
    <div style="font-size:11px;color:#C4B090;line-height:2">
      Nuances Parfums · Nabeul 8000, Tunisie · @nuancesparfums
    </div>
    <div style="font-size:11px;color:#D4B896;margin-top:6px;font-style:italic">
      ✦ Excellence · Authenticité · Raffinement ✦
    </div>
  </div>
</div>
</body>
</html>`;

  const text = [
    `Commande confirmée - ${data.numero}`,
    ``,
    `Bonjour ${data.clientNom},`,
    `Votre commande a bien été reçue par Nuances Parfums.`,
    ``,
    `Produits:`,
    ...data.lignes.map(
      (l) =>
        `- ${l.nom} (${l.taille}) x${l.quantite} : ${(l.prixUnitaire * l.quantite).toFixed(0)} DT`,
    ),
    ``,
    `Total: ${data.montantTotal.toFixed(0)} DT`,
    `Livraison: ${Number(data.fraisLivraison).toFixed(0)} DT`,
    data.adresseLivraison
      ? `Adresse: ${data.adresseLivraison}${data.villeLivraison ? `, ${data.villeLivraison}` : ""}`
      : "",
    ``,
    `Suivi: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/commande/confirmation/${data.commandeId || data.numero}`,
    `Contact: +216 96 557 557`,
    `Instagram: https://www.instagram.com/nuances.parfums/`,
    `Facebook: https://www.facebook.com/profile.php?id=61584307961028`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = getResend();
    if (!resend) {
      return { success: false };
    }
    const recipients = [data.clientEmail];
    if (ADMIN_EMAIL && ADMIN_EMAIL !== data.clientEmail) {
      recipients.push(ADMIN_EMAIL);
    }
    console.log(recipients);
    console.log(FROM);

    const result = await resend.emails.send({
      from: FROM,
      to: recipients,
      subject: `✓ Commande ${data.numero} — Nuances Parfums`,
      html,
      text,
    });
    console.log(result);
    console.log(result.data?.id);
    console.log(result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Email] Erreur confirmation:", error);
    return { success: false, error };
  }
}

export async function envoyerAlerteStock(
  alertes: Array<{
    produitNom: string;
    taille: string;
    quantite: number;
    seuilAlerte: number;
  }>,
) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false };
  }

  const lignesHTML = alertes
    .map(
      (a) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;
                 font-size:14px;color:#1A1208">${a.produitNom}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;
                 font-size:14px;color:#C4960A;font-weight:600">${a.taille}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;
                 font-size:14px;text-align:center;color:#8B3A3A;font-weight:bold">
        ${a.quantite}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #F0EBE0;
                 font-size:14px;text-align:center;color:#8A7B68">${a.seuilAlerte}</td>
    </tr>
  `,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5EFE0;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:40px auto;background:white;border:1px solid #EDE5D4">

  <div style="background:#8B3A3A;padding:30px 40px;display:flex;
              align-items:center;gap:16px">
    <div style="font-size:28px">⚠️</div>
    <div>
      <div style="font-size:18px;color:white;font-weight:bold">
        Alerte Stock — Nuances Parfums
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:4px">
        ${alertes.length} produit${alertes.length > 1 ? "s" : ""} en rupture imminente
      </div>
    </div>
  </div>

  <div style="padding:40px">
    <p style="font-size:14px;color:#8A7B68;margin-bottom:24px">
      Les produits suivants ont atteint leur seuil d'alerte.
    </p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:28px">
      <thead>
        <tr style="background:#FAEAEA">
          <th style="padding:10px 14px;text-align:left;font-size:10px;
                     letter-spacing:2px;text-transform:uppercase;color:#8B3A3A">Produit</th>
          <th style="padding:10px 14px;text-align:left;font-size:10px;
                     letter-spacing:2px;text-transform:uppercase;color:#8B3A3A">Format</th>
          <th style="padding:10px 14px;text-align:center;font-size:10px;
                     letter-spacing:2px;text-transform:uppercase;color:#8B3A3A">Stock</th>
          <th style="padding:10px 14px;text-align:center;font-size:10px;
                     letter-spacing:2px;text-transform:uppercase;color:#8B3A3A">Seuil</th>
        </tr>
      </thead>
      <tbody>${lignesHTML}</tbody>
    </table>

    <div style="text-align:center">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/erp/stock"
         style="display:inline-block;background:#8B3A3A;color:white;
                padding:14px 32px;font-size:12px;letter-spacing:3px;
                text-transform:uppercase;text-decoration:none">
        Gérer le stock
      </a>
    </div>
  </div>

  <div style="background:#FAF7F2;padding:20px;text-align:center;
              border-top:1px solid #EDE5D4">
    <div style="font-size:11px;color:#C4B090">
      Nuances Parfums · ERP · ${new Date().toLocaleDateString("fr-FR")}
    </div>
  </div>
</div>
</body>
</html>`;

  try {
    const resend = getResend();
    if (!resend) {
      return { success: false };
    }
    const result = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `⚠️ ${alertes.length} alerte${alertes.length > 1 ? "s" : ""} stock — Nuances Parfums`,
      html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Email] Erreur alerte stock:", error);
    return { success: false, error };
  }
}
