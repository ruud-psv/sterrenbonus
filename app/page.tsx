import { getTheme, mergeTheme } from '@/lib/themes';
import type { ThemeOverrides } from '@/lib/themes';
import DrawPage from '@/app/components/DrawPage';

interface PageProps {
  searchParams: Promise<{ theme?: string }>;
}

async function fetchOverrides(themeId: string): Promise<ThemeOverrides> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const res = await fetch(`${base}/api/theme?theme=${themeId}`, { cache: 'no-store' });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const base = getTheme(params.theme ?? '');
  const overrides = await fetchOverrides(base.id);
  const theme = mergeTheme(base, overrides);
  return <DrawPage theme={theme} />;
}
