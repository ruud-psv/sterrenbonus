export interface Theme {
  id: string;
  label: string;
  colors: {
    primary: string;
    primaryDark: string;
    gold: string;
    bg: string;
    bgCard: string;
  };
  logo: string;
  logoSize: number;
  backgroundImage: string;
  backgroundPosition: string;
  showStars: boolean;
  borderWidth: number;
  prizesKey: string;
  appTitle: string;
}

export const themes: Record<string, Theme> = {
  psv: {
    id: 'psv',
    label: 'PSV Sterrenbonus',
    colors: {
      primary: '#C8102E',
      primaryDark: '#9B0020',
      gold: '#F5C400',
      bg: '#0D0D0D',
      bgCard: '#080814',
    },
    logo: '/psv-logo-white.svg',
    logoSize: 68,
    backgroundImage:
      'https://www.psv.nl/upload_mm/c/c/8/32619638-ad88-4814-a0e1-670c92c85cf3_1c7daccd2b90c864d538e68f3b0f1fc5_1600x600.jpg',
    backgroundPosition: 'center 30%',
    showStars: true,
    borderWidth: 15,
    prizesKey: 'prizes.json',
    appTitle: 'Sterrenbonus',
  },
  tweede: {
    id: 'tweede',
    label: 'Tweede Thema',
    colors: {
      primary: '#003DA5',
      primaryDark: '#002878',
      gold: '#F5A623',
      bg: '#050510',
      bgCard: '#060618',
    },
    logo: '/logo-tweede.svg',
    logoSize: 68,
    backgroundImage: '',
    backgroundPosition: 'center center',
    showStars: false,
    borderWidth: 15,
    prizesKey: 'prizes-tweede.json',
    appTitle: 'Bonus',
  },
};

export const DEFAULT_THEME_ID = 'psv';

export function getTheme(id: string): Theme {
  return themes[id] ?? themes[DEFAULT_THEME_ID];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 200, g: 16, b: 46 };
}
