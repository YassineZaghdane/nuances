import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/erp/Sidebar'

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const role = (session.user as { role?: string })?.role || 'EMPLOYE'

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#F8F5F0' }}>
      <Sidebar role={role} />
      <div style={{ marginLeft:'220px', flex:1, minHeight:'100vh' }}>
        {children}
      </div>
    </div>
  )
}
