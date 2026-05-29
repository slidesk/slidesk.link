const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 256 256">
  <circle cx="149.95" cy="72.23" r="36.22" fill="none" stroke="#999" stroke-width="14"/>
  <ellipse cx="128" cy="163.51" fill="none" stroke="#999" stroke-width="14" rx="88.25" ry="56.48"/>
  <path fill="none" stroke="#ffffff" stroke-width="14" d="M128 107.03c48.74 0 88.25 25.29 88.25 56.48s-39.51 56.48-88.25 56.48c-33.72 0-63.02-12.1-77.88-29.89"/>
  <path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-width="14" d="M144.11 107.98c-41.53-4.76-66.08 8.98-68.24 18.96-3.77 17.45 18.76 23.4 37.85 30.11 26.5 9.31 28.48 26.57 20.95 39.79-11.45 20.11-65.69 20.6-87.92-11.22"/>
  <ellipse cx="155.7" cy="66.47" fill="#999" stroke="#999" stroke-miterlimit="10" rx="5.29" ry="5.76"/>
  <path fill="#999" stroke="#999" stroke-miterlimit="10" d="M186.17 69.62s15.38-1.47 17.28 1.35c1.35 6.92-12.66 13.48-18.25 13.48"/>
</svg>`;

const typeColors: Record<string, string> = {
  plugin: "#2dd4bf",
  component: "#06b6d4",
  theme: "#0d9488",
  template: "#5eead4",
};

const typeIcons: Record<string, string> = {
  plugin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/></svg>`,
  component: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="8" rx="1"/><path d="M10 8V5c0-.6-.4-1-1-1H6a1 1 0 0 0-1 1v3"/><path d="M19 8V5c0-.6-.4-1-1-1h-3a1 1 0 0 0-1 1v3"/></svg>`,
  theme: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></svg>`,
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
};

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}\u2026`;
}

export function ogSvg(
  type: string,
  addonName: string,
  userName: string,
  avatarUrl: string | null,
): string {
  const color = typeColors[type] ?? "#666";
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const typeIcon = typeIcons[type] ?? "";
  const displayName = truncate(addonName, 30);

  let fontSize = 64;
  if (displayName.length > 20) fontSize = 48;
  if (displayName.length > 28) fontSize = 36;

  const avatarCircle = avatarUrl
    ? `<image href="${avatarUrl.replace(/&/g, "&amp;")}" x="-120" y="-120" width="240" height="240" clip-path="url(#avatarClip)"/>`
    : `<circle cx="0" cy="0" r="120" fill="#333"/><text x="0" y="45" text-anchor="middle" fill="#ffffff" font-family="Noto Sans, sans-serif" font-size="90">${userName.charAt(0).toUpperCase()}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f0f1a"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="${color}cc"/>
    </linearGradient>
    <clipPath id="avatarClip">
      <circle cx="0" cy="0" r="120"/>
    </clipPath>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>

  <g transform="translate(60, 55)">
    ${logoSvg}
    <text x="62" y="38" fill="#ffffff" font-family="Noto Sans, sans-serif" font-size="28" font-weight="bold">SliDesk<text fill="#ffffff" font-weight="normal">.link</text></text>
  </g>

  <g transform="translate(60, 160)">
    <rect x="0" y="0" width="180" height="48" rx="24" fill="${color}"/>
    <g transform="translate(14, 12)">${typeIcon}</g>
    <text x="48" y="30" fill="#ffffff" font-family="Noto Sans, sans-serif" font-size="20" font-weight="bold">${typeLabel}</text>
  </g>

  <text x="80" y="340" fill="#ffffff" font-family="Noto Sans, sans-serif" font-size="${fontSize}" font-weight="bold">${displayName}</text>

  <line x1="80" y1="390" x2="300" y2="390" stroke="${color}" stroke-width="3" stroke-linecap="round"/>

  <text x="80" y="520" fill="#ffffff" font-family="Noto Sans, sans-serif" font-size="28">@${userName}</text>

  <g transform="translate(1020, 315)">
    ${avatarCircle}
  </g>

  <text x="1120" y="580" text-anchor="end" fill="#ffffff" font-family="Noto Sans, sans-serif" font-size="16">slidesk.link</text>
</svg>`;
}
