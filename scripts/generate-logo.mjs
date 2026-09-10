import sharp from "sharp";
import fs from "fs";
import path from "path";

// High-resolution SVG master representation of the SmileCraft Dental Studio logo
// Designed with precision matching the reference:
// - Left: Modern stylized tooth icon with inner smile arc and top-right sparkle star
// - Right: 'Smile' in bold deep navy, 'Craft' in bold medical radiant teal
// - Subtitle: 'DENTAL STUDIO' tracked out in bold navy
// - Accent: Sleek horizontal bar underneath with navy-to-teal gradient
// Color grading:
// - Deep Navy: #0B2545 (rich, high-contrast, modern luxury)
// - Radiant Medical Teal: #1D8A99 / #2395A6 (clean, luminous, friendly)

const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 320" width="1050" height="320">
  <defs>
    <!-- Tooth gradient: Deep navy to vibrant cyan-teal -->
    <linearGradient id="toothGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#081D33" />
      <stop offset="35%" stop-color="#0B2545" />
      <stop offset="70%" stop-color="#14677A" />
      <stop offset="100%" stop-color="#1D8A99" />
    </linearGradient>

    <!-- Smile curve gradient -->
    <linearGradient id="smileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#14677A" />
      <stop offset="50%" stop-color="#1D8A99" />
      <stop offset="100%" stop-color="#24A1B3" />
    </linearGradient>

    <!-- Horizontal accent bar gradient -->
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0B2545" />
      <stop offset="45%" stop-color="#14677A" />
      <stop offset="85%" stop-color="#1D8A99" />
      <stop offset="100%" stop-color="#28B3C7" />
    </linearGradient>
  </defs>

  <!-- ==================== EMBLEM: TOOTH + SMILE + SPARKLE ==================== -->
  <g transform="translate(10, 20)">
    <!-- Main Tooth Outline -->
    <path
      d="M 125,28
         C 95,28 65,38 42,62
         C 18,88 12,126 18,162
         C 24,198 42,236 68,268
         C 78,280 92,274 98,258
         C 108,230 114,204 125,188
         C 136,204 142,230 152,258
         C 158,274 172,280 182,268
         C 208,236 226,198 232,162
         C 238,126 232,88 208,62
         C 185,38 155,28 125,28 Z"
      fill="none"
      stroke="url(#toothGrad)"
      stroke-width="24"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Left Root anatomical shadow accent -->
    <path
      d="M 98,258
         C 92,274 78,280 68,268
         C 46,240 32,206 25,172
         C 38,178 58,188 78,206
         C 90,217 96,238 98,258 Z"
      fill="#081D33"
    />

    <!-- Right Root anatomical shading accent -->
    <path
      d="M 152,258
         C 158,274 172,280 182,268
         C 204,240 218,206 225,172
         C 212,178 192,188 172,206
         C 160,217 154,238 152,258 Z"
      fill="#14677A"
    />

    <!-- Inner Smile Curve (crescent arc) -->
    <path
      d="M 62,118
         C 92,156 158,156 188,118
         C 168,142 82,142 62,118 Z"
      fill="url(#smileGrad)"
    />
    <path
      d="M 64,118
         C 94,152 156,152 186,118"
      fill="none"
      stroke="url(#smileGrad)"
      stroke-width="12"
      stroke-linecap="round"
    />

    <!-- 4-Point Sparkle Star on top-right cusp -->
    <path
      d="M 252,0
         Q 252,28 280,28
         Q 252,28 252,56
         Q 252,28 224,28
         Q 252,28 252,0 Z"
      fill="#1D8A99"
    />
  </g>

  <!-- ==================== TYPOGRAPHY: SMILECRAFT ==================== -->
  <g transform="translate(320, 165)">
    <!-- 'Smile' in Deep Navy -->
    <text
      x="0"
      y="0"
      font-family="'Liberation Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-size="116"
      font-weight="900"
      letter-spacing="-1.5"
      fill="#0B2545"
    >Smile</text>

    <!-- 'Craft' in Medical Radiant Teal -->
    <text
      x="310"
      y="0"
      font-family="'Liberation Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-size="116"
      font-weight="900"
      letter-spacing="-1.5"
      fill="#1D8A99"
    >Craft</text>
  </g>

  <!-- ==================== SUBTITLE: DENTAL STUDIO ==================== -->
  <g transform="translate(325, 226)">
    <text
      x="0"
      y="0"
      font-family="'Liberation Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      font-size="33"
      font-weight="800"
      letter-spacing="14.5"
      fill="#0B2545"
    >DENTAL STUDIO</text>
  </g>

  <!-- ==================== ACCENT UNDERLINE BAR ==================== -->
  <g transform="translate(325, 242)">
    <rect
      x="0"
      y="0"
      width="575"
      height="8.5"
      rx="4.25"
      fill="url(#barGrad)"
    />
    <rect
      x="200"
      y="0"
      width="375"
      height="3.5"
      rx="1.75"
      fill="#38C2D6"
      opacity="0.5"
    />
  </g>
</svg>
`;

async function main() {
  console.log("Generating trimmed, high-resolution transparent PNG logos...");

  const svgBuffer = Buffer.from(logoSvg.trim());

  // Render base buffer with sharp
  const renderedBuffer = await sharp(svgBuffer, { density: 400 })
    .trim()
    .extend({
      top: 14,
      bottom: 14,
      left: 14,
      right: 14,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();

  const publicPath = path.resolve(process.cwd(), "public/smilecraft-logo.png");
  const assetsPath = path.resolve(process.cwd(), "src/assets/smilecraft-logo.png");
  const outputPath = path.resolve(process.cwd(), ".output/public/smilecraft-logo.png");

  fs.writeFileSync(publicPath, renderedBuffer);
  fs.writeFileSync(assetsPath, renderedBuffer);
  if (fs.existsSync(path.dirname(outputPath))) {
    fs.writeFileSync(outputPath, renderedBuffer);
  }

  console.log("Written crisp transparent PNG to public, assets, and .output");

  // Also generate 2x retina version
  const retinaBuffer = await sharp(svgBuffer, { density: 800 })
    .trim()
    .extend({
      top: 28,
      bottom: 28,
      left: 28,
      right: 28,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();

  const public2x = path.resolve(process.cwd(), "public/smilecraft-logo@2x.png");
  fs.writeFileSync(public2x, retinaBuffer);

  // Favicon
  const faviconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">
  <defs>
    <linearGradient id="favToothGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#081D33" />
      <stop offset="35%" stop-color="#0B2545" />
      <stop offset="70%" stop-color="#14677A" />
      <stop offset="100%" stop-color="#1D8A99" />
    </linearGradient>
    <linearGradient id="favSmileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#14677A" />
      <stop offset="50%" stop-color="#1D8A99" />
      <stop offset="100%" stop-color="#24A1B3" />
    </linearGradient>
  </defs>
  <g transform="translate(25, 20)">
    <path
      d="M 125,28
         C 95,28 65,38 42,62
         C 18,88 12,126 18,162
         C 24,198 42,236 68,268
         C 78,280 92,274 98,258
         C 108,230 114,204 125,188
         C 136,204 142,230 152,258
         C 158,274 172,280 182,268
         C 208,236 226,198 232,162
         C 238,126 232,88 208,62
         C 185,38 155,28 125,28 Z"
      fill="none"
      stroke="url(#favToothGrad)"
      stroke-width="26"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M 64,118
         C 94,152 156,152 186,118"
      fill="none"
      stroke="url(#favSmileGrad)"
      stroke-width="14"
      stroke-linecap="round"
    />
    <path
      d="M 252,0
         Q 252,28 280,28
         Q 252,28 252,56
         Q 252,28 224,28
         Q 252,28 252,0 Z"
      fill="#1D8A99"
    />
  </g>
</svg>`;

  const favBuffer = await sharp(Buffer.from(faviconSvg.trim()), { density: 400 })
    .trim()
    .extend({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, quality: 100 })
    .toBuffer();

  fs.writeFileSync(path.resolve(process.cwd(), "public/favicon.png"), favBuffer);
  const outFav = path.resolve(process.cwd(), ".output/public/favicon.png");
  if (fs.existsSync(path.dirname(outFav))) {
    fs.writeFileSync(outFav, favBuffer);
  }

  console.log("Favicon generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
