export function hexToHsl(hex: string): string {
  let r = 0, g = 0, b = 0;
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  r = parseInt(hex.substring(0, 2), 16) / 255;
  g = parseInt(hex.substring(2, 4), 16) / 255;
  b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyStoreTheme(store: { color_primary: string; color_secondary: string; color_background: string; color_text: string }) {
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToHsl(store.color_primary));
  root.style.setProperty("--background", hexToHsl(store.color_background));
  root.style.setProperty("--foreground", hexToHsl(store.color_text));
  root.style.setProperty("--card", hexToHsl(store.color_background));
  root.style.setProperty("--secondary", hexToHsl(store.color_secondary));
  root.style.setProperty("--sidebar", hexToHsl(store.color_secondary));
  root.style.setProperty("--sidebar-accent", hexToHsl(store.color_primary));
  const primaryL = parseInt(hexToHsl(store.color_primary).split(" ")[2]);
  root.style.setProperty("--primary-foreground", primaryL > 50 ? "0 0% 5%" : "0 0% 98%");
  const bgL = parseInt(hexToHsl(store.color_background).split(" ")[2]);
  const textHue = hexToHsl(store.color_text).split(" ")[0];
  root.style.setProperty("--border", bgL < 30 ? `${textHue} 10% 20%` : `${textHue} 10% 85%`);
  root.style.setProperty("--muted-foreground", bgL < 30 ? `${textHue} 10% 55%` : `${textHue} 10% 45%`);
  root.style.setProperty("--muted", bgL < 30 ? `${textHue} 10% 18%` : `${textHue} 10% 96%`);
  root.style.setProperty("--sidebar-foreground", hexToHsl(store.color_text));
  root.style.setProperty("--sidebar-border", bgL < 30 ? `${textHue} 10% 20%` : `${textHue} 10% 85%`);
}

export function removeStoreTheme() {
  const root = document.documentElement;
  ["--primary","--background","--foreground","--card","--secondary","--sidebar","--sidebar-accent","--primary-foreground","--border","--muted-foreground","--muted","--sidebar-foreground","--sidebar-border"].forEach(p => root.style.removeProperty(p));
}
