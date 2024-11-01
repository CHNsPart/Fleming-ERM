import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user || !user.id) {
    redirect('/api/auth/login');
  }

  if (user.email !== 'projectapplied02@gmail.com') {
    redirect('/unauthorized');
  }

  return <AdminDashboard />;
}