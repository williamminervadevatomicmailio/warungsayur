import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import AdminLayout from '@/components/admin/AdminLayout'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  if (!session) {
    redirect('/admin/login')
  }

  return <AdminLayout>{children}</AdminLayout>
}
