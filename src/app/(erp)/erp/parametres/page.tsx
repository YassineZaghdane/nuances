import { ErpPage } from '@/components/erp/ErpPage'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ParametresPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as { role?: string })?.role
  if (role !== 'ADMIN') redirect('/erp/dashboard')

  return (
    <ErpPage title="Paramètres" subtitle="Administration">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
        {[
          {
            titre: 'Compte admin',
            desc:  "Modifier l'email et le mot de passe du compte administrateur",
            icon:  '👤',
            lien:  '/erp/parametres/admin',
          },
          {
            titre: 'Comptes utilisateurs',
            desc:  'Créer, modifier et supprimer les vendeurs',
            icon:  '👥',
            lien:  '/erp/parametres/comptes',
          },
          {
            titre: 'Seuils stock',
            desc:  'Configurer les alertes de réapprovisionnement',
            icon:  '📦',
            lien:  '/erp/stock',
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
            <Link href={item.lien} style={{
              fontSize: '0.7rem', color: '#C4960A',
              textDecoration: 'none', letterSpacing: '0.08em',
            }}>Accéder →</Link>
          </div>
        ))}
      </div>
    </ErpPage>
  )
}
