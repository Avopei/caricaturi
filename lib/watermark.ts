export function createWatermarkedPreview(dataUrl: string) {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#ffffff"/>
  <image href="${dataUrl}" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid meet"/>

  <rect x="0" y="0" width="1024" height="1024" fill="rgba(0,0,0,0.03)"/>

  <g transform="rotate(-25 512 512)">
    <text
      x="512"
      y="485"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="88"
      font-weight="900"
      fill="rgba(255,255,255,0.78)"
      stroke="rgba(0,0,0,0.45)"
      stroke-width="3"
      letter-spacing="8"
    >
      PREVIEW
    </text>

    <text
      x="512"
      y="565"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="34"
      font-weight="700"
      fill="rgba(255,255,255,0.72)"
      stroke="rgba(0,0,0,0.35)"
      stroke-width="1"
      letter-spacing="4"
    >
      CARICATURI AI
    </text>
  </g>
</svg>
`;

    const base64Svg = Buffer.from(svg).toString("base64");

    return `data:image/svg+xml;base64,${base64Svg}`;
}