import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/erp/Sidebar'

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as { role?: string })?.role || 'EMPLOYE'

  return (
    <div className="erp-shell" style={{ display:'flex', minHeight:'100vh', background:'#F8F5F0' }}>
      <Sidebar role={role} />
      <div className="erp-content" style={{ marginLeft:'220px', flex:1, minHeight:'100vh' }}>
        {children}
      </div>
      <style>{`
        @media (max-width: 980px) {
          .erp-shell {
            display: block !important;
          }
          .erp-content {
            margin-left: 0 !important;
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
