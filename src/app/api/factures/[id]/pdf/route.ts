/**
 * @module FacturePDF
 * @description Génère et retourne la facture PDF d'une commande
 */
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { id } = await params

  const commande = await prisma.commande.findUnique({
    where: { id },
    include: {
      client: true,
      lignes: {
        include: {
          produit: { select: { nom: true } }
        }
      },
      facture: true,
    }
  })

  if (!commande) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Facture ${commande.numero}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Georgia', serif;
      color: #1A1208;
      padding: 60px;
      background: white;
    }
    .header { display:flex; justify-content:space-between; margin-bottom:50px; border-bottom:2px solid #C4960A; padding-bottom:30px; }
    .brand { font-size:28px; letter-spacing:6px; text-transform:uppercase; color:#1A1208; }
    .brand-sub { font-size:11px; letter-spacing:4px; color:#C4960A; margin-top:4px; text-transform:uppercase; }
    .facture-info { text-align:right; }
    .facture-num { font-size:22px; color:#C4960A; font-weight:bold; }
    .facture-date { font-size:12px; color:#8A7B68; margin-top:4px; }
    .section { margin-bottom:35px; }
    .section-title { font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#C4960A; margin-bottom:12px; border-bottom:1px solid #EDE5D4; padding-bottom:6px; }
    .client-info { font-size:14px; line-height:1.8; color:#1A1208; }
    table { width:100%; border-collapse:collapse; margin-bottom:30px; }
    th { padding:10px 14px; text-align:left; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#8A7B68; background:#FAF7F2; border-bottom:1px solid #EDE5D4; font-weight:500; }
    td { padding:12px 14px; font-size:13px; border-bottom:1px solid #F0EBE0; color:#1A1208; }
    .total-row { display:flex; justify-content:flex-end; }
    .total-box { width:260px; }
    .total-line { display:flex; justify-content:space-between; padding:7px 0; font-size:13px; color:#8A7B68; border-bottom:1px solid #F0EBE0; }
    .total-final { display:flex; justify-content:space-between; padding:12px 0 0; font-size:18px; color:#1A1208; font-weight:bold; }
    .total-final span:last-child { color:#C4960A; }
    .footer { margin-top:60px; padding-top:20px; border-top:1px solid #EDE5D4; text-align:center; font-size:11px; color:#C4B090; line-height:2; }
    .badge { display:inline-block; background:#E4F2EB; color:#2E7D52; padding:3px 10px; font-size:11px; border-radius:3px; font-weight:600; }
    @media print {
      body { padding:40px; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="brand">✿ Nuances</div>
      <div class="brand-sub">— Parfums —</div>
      <div style="margin-top:12px;font-size:12px;color:#8A7B68;line-height:1.7">
        Nabeul 8000, Tunisie<br/>
        @nuancesparfums
      </div>
    </div>
    <div class="facture-info">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8A7B68;margin-bottom:6px">Facture</div>
      <div class="facture-num">${commande.numero}</div>
      <div class="facture-date">
        ${new Date(commande.createdAt).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric'
        })}
      </div>
      <div style="margin-top:8px">
        <span class="badge">
          ${commande.statut.replace('_', ' ')}
        </span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Client</div>
    <div class="client-info">
      <strong>${commande.client.nom}</strong><br/>
      ${commande.client.telephone}<br/>
      ${commande.client.email ? commande.client.email + '<br/>' : ''}
      ${commande.adresseLivraison ? commande.adresseLivraison + '<br/>' : ''}
      ${commande.villeLivraison || ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Détail de la commande</div>
    <table>
      <thead>
        <tr>
          <th>Produit</th>
          <th>Format</th>
          <th>Qté</th>
          <th>Prix unitaire</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${commande.lignes.map(l => `
          <tr>
            <td>${l.produit?.nom || '—'}</td>
            <td><span style="background:#FFF8E6;color:#C4960A;padding:2px 8px;font-size:11px;font-weight:600">${l.taille}</span></td>
            <td>${l.quantite}</td>
            <td>${Number(l.prixUnitaire).toFixed(0)} DT</td>
            <td style="font-weight:600;color:#C4960A">${(Number(l.prixUnitaire) * l.quantite).toFixed(0)} DT</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="total-row">
      <div class="total-box">
        <div class="total-line">
          <span>Sous-total</span>
          <span>${commande.lignes.reduce((s, l) => s + Number(l.prixUnitaire) * l.quantite, 0).toFixed(0)} DT</span>
        </div>
        <div class="total-line">
          <span>Livraison</span>
          <span>${Number(commande.fraisLivraison || 0).toFixed(0)} DT</span>
        </div>
        <div class="total-final">
          <span>Total</span>
          <span>${Number(commande.montantTotal).toFixed(0)} DT</span>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Paiement</div>
    <div style="font-size:13px;color:#8A7B68">
      Mode : ${commande.modePaiement?.replace('_', ' ') || '—'}
    </div>
  </div>

  <div class="footer">
    <div>Nuances Parfums · Nabeul 8000, Tunisie · @nuancesparfums</div>
    <div style="margin-top:4px;font-style:italic;color:#D4B896">✦ Excellence · Authenticité · Raffinement ✦</div>
    <div style="margin-top:12px" class="no-print">
      <button onclick="window.print()" style="padding:8px 24px;background:#1A1208;color:white;border:none;cursor:pointer;font-size:12px;letter-spacing:2px">IMPRIMER</button>
    </div>
  </div>

</body>
</html>
  `.trim()

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    }
  })
}
