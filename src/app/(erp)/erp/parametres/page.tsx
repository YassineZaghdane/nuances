"use client"
import { ErpPage } from '@/components/erp/ErpPage'
import Link from 'next/link'

export default function ParametresPage() {
  return (
    <ErpPage title="Paramètres" subtitle="Configuration du compte">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
        {[
          {
            titre: 'Compte admin',
            desc:  'Modifier le mot de passe et les informations du compte',
            icon:  '👤',
            lien:  null,
          },
          {
            titre: 'Comptes utilisateurs',
            desc:  'Gérer les accès vendeurs et employés',
            icon:  '👥',
            lien:  null,
          },
          {
            titre: 'Informations boutique',
            desc:  'Nom, adresse, WhatsApp, Instagram',
            icon:  '🏪',
            lien:  null,
          },
          {
            titre: 'Seuils stock',
            desc:  'Configurer les alertes de réapprovisionnement',
            icon:  '📦',
            lien:  '/erp/stock',
          },
          {
            titre: 'Emails & Notifications',
            desc:  'Configurer Resend et les alertes automatiques',
            icon:  '📧',
            lien:  null,
          },
          {
            titre: 'Chatbot Nour',
            desc:  'Configurer le conseiller IA (clé Anthropic)',
            icon:  '✿',
            lien:  null,
          },
        ].map(item => (
          <div key={item.titre} style={{
            background: '#FDFAF5', border: '1px solid #EDE5D4',
            borderRadius: '6px', padding: '1.5rem',
          }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.8rem' }}>{item.icon}</div>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.05rem', color: '#1A1208', marginBottom: '0.4rem' }}>
              {item.titre}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#8A7B68', lineHeight: 1.6, marginBottom: '1rem' }}>
              {item.desc}
            </div>
            {item.lien ? (
              <Link href={item.lien} style={{
                fontSize: '0.7rem', color: '#C4960A',
                textDecoration: 'none', letterSpacing: '0.08em',
              }}>Accéder →</Link>
            ) : (
              <span style={{
                fontSize: '0.68rem', color: '#C4B090',
                background: '#F0EBE0', padding: '0.2rem 0.6rem',
                borderRadius: '3px',
              }}>Bientôt disponible</span>
            )}
          </div>
        ))}
      </div>
    </ErpPage>
  )
}
