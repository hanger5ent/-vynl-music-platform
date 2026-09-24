import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import AdminPageClient from './AdminPageClient'

// Server-side gate: the client-only check this used to rely on compared
// the signed-in email against a public NEXT_PUBLIC_ADMIN_EMAILS env var,
// disconnected from the real User.isAdmin flag the rest of the app uses
// (and trivially bypassable since it never touched the server). This is
// the actual enforcement; AdminPageClient's own check is just for the
// loading/redirect UI.
export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin')
  }
  if (!session.user.isAdmin) {
    redirect('/dashboard')
  }

  return <AdminPageClient />
}
