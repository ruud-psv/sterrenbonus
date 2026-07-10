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
  button: {
    bg: string;
    bgDark: string;
    text: string;
  };
  logo: string;
  logoSize: number;
  backgroundImage: string;
  backgroundPosition: string;
  showStars: boolean;
  showTitle: boolean;
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
    button: {
      bg: '#C8102E',
      bgDark: '#9B0020',
      text: '#ffffff',
    },
    logo: '/psv-logo-white.svg',
    logoSize: 68,
    backgroundImage:
      'https://www.psv.nl/upload_mm/c/c/8/32619638-ad88-4814-a0e1-670c92c85cf3_1c7daccd2b90c864d538e68f3b0f1fc5_1600x600.jpg',
    backgroundPosition: 'center 30%',
    showStars: true,
    showTitle: true,
    borderWidth: 15,
    prizesKey: 'prizes.json',
    appTitle: 'Sterrenbonus',
  },
  fanscan: {
    id: 'fanscan',
    label: 'Fanscan',
    colors: {
      primary: '#003DA5',
      primaryDark: '#002878',
      gold: '#F5A623',
      bg: '#050510',
      bgCard: '#060618',
    },
    button: {
      bg: '#003DA5',
      bgDark: '#002878',
      text: '#ffffff',
    },
    logo: '/logo-fanscan.svg',
    logoSize: 68,
    backgroundImage: '',
    backgroundPosition: 'center center',
    showStars: false,
    showTitle: true,
    borderWidth: 15,
    prizesKey: 'prizes-fanscan.json',
    appTitle: 'Bonus',
  },
};

// Fields editable via the admin UI — structural fields (id, prizesKey, etc.) are not overridable
export interface ThemeOverrides {
  colors?: {
    primary?: string;
    gold?: string;
    bg?: string;
  };
  buttonBg?: string;
  buttonText?: string;
  logo?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  showStars?: boolean;
  showTitle?: boolean;
  appTitle?: string;
}

export const DEFAULT_THEME_ID = 'psv';

export function getTheme(id: string): Theme {
  return themes[id] ?? themes[DEFAULT_THEME_ID];
}

function autoDarken(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const darken = (v: number) => Math.max(0, Math.round(v * 0.72)).toString(16).padStart(2, '0');
  return `#${darken(r)}${darken(g)}${darken(b)}`;
}

export function mergeTheme(base: Theme, overrides: ThemeOverrides): Theme {
  const primaryOverride = overrides.colors?.primary;
  const buttonBgOverride = overrides.buttonBg;
  return {
    ...base,
    appTitle: overrides.appTitle ?? base.appTitle,
    logo: overrides.logo ?? base.logo,
    backgroundImage: overrides.backgroundImage ?? base.backgroundImage,
    backgroundPosition: overrides.backgroundPosition ?? base.backgroundPosition,
    showStars: overrides.showStars ?? base.showStars,
    showTitle: overrides.showTitle ?? base.showTitle,
    colors: {
      ...base.colors,
      primary: primaryOverride ?? base.colors.primary,
      primaryDark: primaryOverride ? autoDarken(primaryOverride) : base.colors.primaryDark,
      gold: overrides.colors?.gold ?? base.colors.gold,
      bg: overrides.colors?.bg ?? base.colors.bg,
    },
    button: {
      bg: buttonBgOverride ?? base.button.bg,
      bgDark: buttonBgOverride ? autoDarken(buttonBgOverride) : base.button.bgDark,
      text: overrides.buttonText ?? base.button.text,
    },
  };
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
