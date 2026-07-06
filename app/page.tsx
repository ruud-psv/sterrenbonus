import { getTheme } from '@/lib/themes';
import DrawPage from '@/app/components/DrawPage';

interface PageProps {
  searchParams: Promise<{ theme?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const theme = getTheme(params.theme ?? '');
  return <DrawPage theme={theme} />;
}
