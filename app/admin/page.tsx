import { getTheme, mergeTheme } from '@/lib/themes';
import { readThemeOverrides } from '@/lib/theme-storage';
import AdminPage from '@/app/admin/AdminPage';

interface PageProps {
  searchParams: Promise<{ theme?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const base = getTheme(params.theme ?? '');
  const overrides = await readThemeOverrides(base.id);
  const theme = mergeTheme(base, overrides);
  return <AdminPage theme={theme} initialOverrides={overrides} />;
}
