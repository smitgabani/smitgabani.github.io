// Canvas-drawn textures for the morphing card.
// Everything is drawn in pixels at TEX_SCALE pixels per world unit, and each
// texture records its size in world units (texture.userData.size) so the plane
// that shows it can be sized to match exactly.
import * as THREE from "three";
import { ICON_PATHS } from "../Icon";

export const TEX_SCALE = 256;

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

const COLORS = {
  heading: "#f9fafb",
  text: "#e5e7eb",
  muted: "#9ca3af",
  faint: "#4b5563",
  purple: "#8b5cf6",
  purpleSoft: "#ddd6fe",
  cyan: "#22d3ee",
  cyanSoft: "#a5f3fc",
  green: "#34d399",
  border: "#374151",
};

const CODE_COLORS = {
  keyword: "#c084fc",
  string: "#67e8f9",
  number: "#fcd34d",
  fn: "#f9fafb",
  comment: "#6b7280",
  punct: "#9ca3af",
  text: "#d1d5db",
};

const CODE_KEYWORDS = new Set([
  "const", "let", "var", "async", "await", "function", "return", "new",
  "for", "of", "if", "else", "import", "from", "export", "try", "catch",
]);

export function fontSpec(size, { weight = 400, mono = false } = {}) {
  return `${weight} ${Math.round(size * TEX_SCALE)}px ${mono ? MONO : SANS}`;
}

let measureContext;

// Width of `text` in world units
export function measure(text, font) {
  measureContext ??= document.createElement("canvas").getContext("2d");
  measureContext.font = font;
  return measureContext.measureText(text).width / TEX_SCALE;
}

// Draw into a canvas sized in world units; `u` converts world units to pixels.
function createTexture(width, height, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(width * TEX_SCALE));
  canvas.height = Math.max(1, Math.ceil(height * TEX_SCALE));
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "middle";
  draw(ctx, (units) => units * TEX_SCALE);

  const texture = new THREE.CanvasTexture(canvas);
  // The text shader writes these colors straight to the screen, so no
  // color-space conversion: what is drawn on the canvas is what you see.
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.userData.size = [width, height];
  return texture;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawIcon(ctx, name, x, y, size, color) {
  const paths = [].concat(ICON_PATHS[name] || []);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  paths.forEach((d) => ctx.stroke(new Path2D(d)));
  ctx.restore();
}

function drawCheck(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.18;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.32, cy + size * 0.02);
  ctx.lineTo(cx - size * 0.08, cy + size * 0.26);
  ctx.lineTo(cx + size * 0.34, cy - size * 0.24);
  ctx.stroke();
  ctx.restore();
}

// Small "R1"-style tag linking a requirement to the code that satisfies it
const TAG_FONT = fontSpec(0.075, { weight: 700 });
const TAG_PAD = 0.045;
const TAG_HEIGHT = 0.16;

function tagWidth(index) {
  return measure(`R${index + 1}`, TAG_FONT) + TAG_PAD * 2;
}

function drawTag(ctx, u, index, x, cy) {
  const w = tagWidth(index);
  ctx.fillStyle = "rgba(139, 92, 246, 0.3)";
  roundRect(ctx, u(x), u(cy - TAG_HEIGHT / 2), u(w), u(TAG_HEIGHT), u(0.04));
  ctx.fill();
  ctx.font = TAG_FONT;
  ctx.fillStyle = COLORS.purpleSoft;
  ctx.fillText(`R${index + 1}`, u(x + TAG_PAD), u(cy));
  return w;
}

// ---------------------------------------------------------------------------
// Card header (one per stage)
// ---------------------------------------------------------------------------

const HEADER_HEIGHT = 0.36;

export function headerTexture(kind, story) {
  const small = fontSpec(0.075, { weight: 700 });

  if (kind === "request") {
    const nameFont = fontSpec(0.12, { weight: 600 });
    const width = 0.42 + Math.max(measure("CLIENT REQUEST", small), measure(story.client, nameFont)) + 0.05;
    return createTexture(width, HEADER_HEIGHT, (ctx, u) => {
      const r = 0.15;
      const gradient = ctx.createLinearGradient(0, 0, u(r * 2), u(r * 2));
      gradient.addColorStop(0, COLORS.purple);
      gradient.addColorStop(1, COLORS.cyan);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(u(r), u(HEADER_HEIGHT / 2), u(r), 0, Math.PI * 2);
      ctx.fill();
      ctx.font = fontSpec(0.13, { weight: 700 });
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(story.client.charAt(0).toUpperCase(), u(r), u(HEADER_HEIGHT / 2 + 0.005));
      ctx.textAlign = "left";
      ctx.font = small;
      ctx.fillStyle = COLORS.muted;
      ctx.fillText("CLIENT REQUEST", u(0.42), u(0.11));
      ctx.font = nameFont;
      ctx.fillStyle = COLORS.heading;
      ctx.fillText(story.client, u(0.42), u(0.255));
    });
  }

  if (kind === "code") {
    const fileFont = fontSpec(0.1, { mono: true });
    const width = 0.46 + measure(story.file, fileFont) + 0.05;
    return createTexture(width, HEADER_HEIGHT, (ctx, u) => {
      ["#f87171", "#fbbf24", "#34d399"].forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(u(0.06 + i * 0.13), u(HEADER_HEIGHT / 2), u(0.045), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.font = fileFont;
      ctx.fillStyle = COLORS.muted;
      ctx.fillText(story.file, u(0.46), u(HEADER_HEIGHT / 2));
    });
  }

  if (kind === "system") {
    const pillFont = fontSpec(0.08, { weight: 600 });
    const labelW = measure("ARCHITECTURE", small);
    const pillW = 0.22 + measure("Deployed", pillFont) + 0.08;
    return createTexture(labelW + 0.16 + pillW, HEADER_HEIGHT, (ctx, u) => {
      ctx.font = small;
      ctx.fillStyle = COLORS.muted;
      ctx.fillText("ARCHITECTURE", 0, u(HEADER_HEIGHT / 2));
      const x = labelW + 0.16;
      ctx.fillStyle = "rgba(16, 185, 129, 0.16)";
      roundRect(ctx, u(x), u(0.08), u(pillW), u(0.2), u(0.1));
      ctx.fill();
      drawCheck(ctx, u(x + 0.12), u(HEADER_HEIGHT / 2), u(0.11), COLORS.green);
      ctx.font = pillFont;
      ctx.fillStyle = COLORS.green;
      ctx.fillText("Deployed", u(x + 0.22), u(HEADER_HEIGHT / 2));
    });
  }

  // kind === "users"
  const restFont = fontSpec(0.085);
  const width = 0.16 + measure("LIVE", small) + 0.1 + measure("serving real users", restFont) + 0.05;
  return createTexture(width, HEADER_HEIGHT, (ctx, u) => {
    ctx.fillStyle = "rgba(52, 211, 153, 0.25)";
    ctx.beginPath();
    ctx.arc(u(0.06), u(HEADER_HEIGHT / 2), u(0.06), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.green;
    ctx.beginPath();
    ctx.arc(u(0.06), u(HEADER_HEIGHT / 2), u(0.035), 0, Math.PI * 2);
    ctx.fill();
    ctx.font = small;
    ctx.fillText("LIVE", u(0.16), u(HEADER_HEIGHT / 2));
    ctx.font = restFont;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText("serving real users", u(0.16 + measure("LIVE", small) + 0.1), u(HEADER_HEIGHT / 2));
  });
}

// ---------------------------------------------------------------------------
// Stage 1: the client's request and requirement checklist
// ---------------------------------------------------------------------------

const QUOTE_SIZE = 0.15;
const QUOTE_FONT = fontSpec(QUOTE_SIZE, { weight: 500 });
const QUOTE_LINE = QUOTE_SIZE * 1.5;
const QUOTE_PAD = 0.03;

function wrap(text, font, maxWidth) {
  const lines = [];
  let line = "";
  text.split(/\s+/).forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && measure(candidate, font) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// Returns the texture plus where the keyword sits inside it (for the overlay)
export function quoteTexture(request, keyword, maxWidth) {
  const lines = wrap(`“${request}”`, QUOTE_FONT, maxWidth);
  const width = Math.max(...lines.map((line) => measure(line, QUOTE_FONT))) + 0.02;
  const height = lines.length * QUOTE_LINE + QUOTE_PAD * 2;

  let keywordInfo = null;
  const needle = keyword.toLowerCase();
  lines.some((line, i) => {
    const index = line.toLowerCase().indexOf(needle);
    if (index === -1) return false;
    keywordInfo = {
      text: line.substr(index, keyword.length),
      x: measure(line.slice(0, index), QUOTE_FONT),
      // vertical offset of this line's centre from the texture's centre
      y: height / 2 - (QUOTE_PAD + QUOTE_LINE * (i + 0.5)),
    };
    return true;
  });

  const texture = createTexture(width, height, (ctx, u) => {
    ctx.font = QUOTE_FONT;
    ctx.fillStyle = COLORS.text;
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, u(QUOTE_PAD + QUOTE_LINE * (i + 0.5)));
    });
  });

  return { texture, keyword: keywordInfo };
}

export function requirementTexture(index, text) {
  const font = fontSpec(0.135, { weight: 500 });
  const height = 0.3;
  const textX = 0.26 + tagWidth(index) + 0.1;
  return createTexture(textX + measure(text, font) + 0.04, height, (ctx, u) => {
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = u(0.016);
    roundRect(ctx, u(0.01), u(height / 2 - 0.08), u(0.16), u(0.16), u(0.035));
    ctx.stroke();
    drawTag(ctx, u, index, 0.26, height / 2);
    ctx.font = font;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(text, u(textX), u(height / 2));
  });
}

export function requirementDoneTexture(text) {
  const font = fontSpec(0.1, { weight: 500 });
  const height = 0.24;
  return createTexture(0.22 + measure(text, font) + 0.04, height, (ctx, u) => {
    ctx.fillStyle = "#059669";
    ctx.beginPath();
    ctx.arc(u(0.08), u(height / 2), u(0.075), 0, Math.PI * 2);
    ctx.fill();
    drawCheck(ctx, u(0.08), u(height / 2), u(0.1), "#ffffff");
    ctx.font = font;
    ctx.fillStyle = "#d1d5db";
    ctx.fillText(text, u(0.22), u(height / 2));
  });
}

// ---------------------------------------------------------------------------
// Stage 2: code
// ---------------------------------------------------------------------------

const GUTTER = 0.34;

function tokenize(line) {
  const tokens = [];
  const pattern =
    /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d'"`]+)/g;
  let match;
  while ((match = pattern.exec(line))) {
    const [text, comment, string, number, word, , punct] = match;
    let color = CODE_COLORS.text;
    if (comment) color = CODE_COLORS.comment;
    else if (string) color = CODE_COLORS.string;
    else if (number) color = CODE_COLORS.number;
    else if (word) {
      if (CODE_KEYWORDS.has(word)) color = CODE_COLORS.keyword;
      else if (line[pattern.lastIndex] === "(") color = CODE_COLORS.fn;
    } else if (punct) color = CODE_COLORS.punct;
    tokens.push({ text, color });
  }
  return tokens;
}

export function codeLineWidth(line, req, size) {
  const font = fontSpec(size, { mono: true });
  return GUTTER + measure(line, font) + (req != null ? 0.12 + tagWidth(req) : 0) + 0.06;
}

// `req` is the 0-based requirement this line satisfies (or null). Linked lines
// stretch to `fullWidth` so their highlight bars line up, tag on the right.
export function codeLineTexture(line, number, req, size, keyword, fullWidth) {
  const font = fontSpec(size, { mono: true });
  const height = size * 2.1;
  const contentWidth = codeLineWidth(line, req, size);
  const width = req != null ? Math.max(contentWidth, fullWidth) : contentWidth;

  let keywordInfo = null;
  const index = keyword ? line.toLowerCase().indexOf(keyword.toLowerCase()) : -1;
  if (index !== -1) {
    keywordInfo = {
      text: line.substr(index, keyword.length),
      x: GUTTER + measure(line.slice(0, index), font),
    };
  }

  const texture = createTexture(width, height, (ctx, u) => {
    if (req != null) {
      ctx.fillStyle = "rgba(139, 92, 246, 0.12)";
      ctx.fillRect(0, 0, u(width), u(height));
      ctx.fillStyle = COLORS.purple;
      ctx.fillRect(0, 0, u(0.022), u(height));
    }
    ctx.font = fontSpec(size * 0.85, { mono: true });
    ctx.fillStyle = COLORS.faint;
    ctx.textAlign = "right";
    ctx.fillText(String(number), u(GUTTER - 0.1), u(height / 2));
    ctx.textAlign = "left";

    ctx.font = font;
    let x = GUTTER;
    tokenize(line).forEach(({ text, color }) => {
      ctx.fillStyle = color;
      ctx.fillText(text, u(x), u(height / 2));
      x += measure(text, font);
    });
    if (req != null) drawTag(ctx, u, req, width - tagWidth(req) - 0.06, height / 2);
  });

  return { texture, keyword: keywordInfo };
}

// ---------------------------------------------------------------------------
// The travelling keyword: one texture per stage
// ---------------------------------------------------------------------------

export const KEYWORD_QUOTE_PAD = 0.04;
export const KEYWORD_CODE_PAD = 0.03;

export function keywordQuoteTexture(text) {
  const font = fontSpec(QUOTE_SIZE, { weight: 600 });
  const height = QUOTE_SIZE * 1.4;
  const width = measure(text, font) + KEYWORD_QUOTE_PAD * 2;
  return createTexture(width, height, (ctx, u) => {
    ctx.fillStyle = "rgba(139, 92, 246, 0.6)";
    roundRect(ctx, 0, 0, u(width), u(height), u(0.05));
    ctx.fill();
    ctx.font = font;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, u(KEYWORD_QUOTE_PAD), u(height / 2));
  });
}

export function keywordCodeTexture(text, size) {
  const font = fontSpec(size, { mono: true });
  const height = size * 1.6;
  const width = measure(text, font) + KEYWORD_CODE_PAD * 2;
  return createTexture(width, height, (ctx, u) => {
    ctx.fillStyle = "rgba(8, 47, 73, 0.95)";
    roundRect(ctx, 0, 0, u(width), u(height), u(0.035));
    ctx.fill();
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = u(0.012);
    roundRect(ctx, u(0.006), u(0.006), u(width - 0.012), u(height - 0.012), u(0.03));
    ctx.stroke();
    ctx.font = font;
    ctx.fillStyle = COLORS.cyanSoft;
    ctx.fillText(text, u(KEYWORD_CODE_PAD), u(height / 2));
  });
}

export function keywordActionTexture(text) {
  const font = fontSpec(0.095, { weight: 600, mono: true });
  const height = 0.24;
  const width = measure(text, font) + 0.18;
  return createTexture(width, height, (ctx, u) => {
    ctx.fillStyle = "#0b1220";
    roundRect(ctx, 0, 0, u(width), u(height), u(height / 2));
    ctx.fill();
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = u(0.014);
    roundRect(ctx, u(0.007), u(0.007), u(width - 0.014), u(height - 0.014), u(height / 2));
    ctx.stroke();
    ctx.font = font;
    ctx.fillStyle = COLORS.cyanSoft;
    ctx.fillText(text, u(0.09), u(height / 2));
  });
}

export function keywordButtonTexture(text) {
  const font = fontSpec(0.115, { weight: 700 });
  const height = 0.28;
  const width = measure(text, font) + 0.28;
  return createTexture(width, height, (ctx, u) => {
    const gradient = ctx.createLinearGradient(0, 0, u(width), 0);
    gradient.addColorStop(0, COLORS.purple);
    gradient.addColorStop(1, "#06b6d4");
    ctx.fillStyle = gradient;
    roundRect(ctx, 0, 0, u(width), u(height), u(height / 2));
    ctx.fill();
    ctx.font = font;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, u(0.14), u(height / 2));
  });
}

// ---------------------------------------------------------------------------
// Stages 3–4: system blocks and end users
// ---------------------------------------------------------------------------

const NODE_NAME_FONT = fontSpec(0.105, { weight: 700 });
const NODE_SUB_FONT = fontSpec(0.08);

export function nodeLabelWidth(node) {
  return Math.max(measure(node.label, NODE_NAME_FONT), measure(node.sub || "", NODE_SUB_FONT));
}

export function nodeLabelTexture(node, width) {
  const height = 0.34;
  return createTexture(width, height, (ctx, u) => {
    ctx.textAlign = "center";
    ctx.font = NODE_NAME_FONT;
    ctx.fillStyle = COLORS.heading;
    ctx.fillText(node.label, u(width / 2), u(node.sub ? 0.12 : height / 2));
    if (node.sub) {
      ctx.font = NODE_SUB_FONT;
      ctx.fillStyle = COLORS.muted;
      ctx.fillText(node.sub, u(width / 2), u(0.25));
    }
  });
}

export function userChipTexture(user) {
  const font = fontSpec(0.1, { weight: 500 });
  const height = 0.36;
  const width = 0.36 + measure(user.label, font) + 0.14;
  return createTexture(width, height, (ctx, u) => {
    ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
    roundRect(ctx, u(0.01), u(0.01), u(width - 0.02), u(height - 0.02), u(0.09));
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = u(0.012);
    ctx.stroke();
    drawIcon(ctx, user.icon, u(0.1), u(height / 2 - 0.09), u(0.18), COLORS.cyan);
    ctx.font = font;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(user.label, u(0.36), u(height / 2));
  });
}
