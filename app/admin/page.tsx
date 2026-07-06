import { getTheme } from '@/lib/themes';
import AdminPage from '@/app/admin/AdminPage';

interface PageProps {
  searchParams: Promise<{ theme?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const theme = getTheme(params.theme ?? '');
  return <AdminPage theme={theme} />;
}
