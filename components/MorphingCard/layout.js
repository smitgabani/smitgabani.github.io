// Turns one project "story" into everything the scene animates.
//
// Each piece has one state per stage (0 Request, 1 Code, 2 System, 3 Users):
// where it sits on the card and which texture it shows. The scene eases every
// piece between its states, so the same objects visibly turn from requirement
// into code into system. Coordinates are card-local world units; x is the
// piece's left edge and y its vertical centre.
import * as THREE from "three";
import {
  headerTexture,
  quoteTexture,
  requirementTexture,
  requirementDoneTexture,
  codeLineTexture,
  codeLineWidth,
  keywordQuoteTexture,
  keywordCodeTexture,
  keywordActionTexture,
  keywordButtonTexture,
  nodeLabelTexture,
  nodeLabelWidth,
  userChipTexture,
  KEYWORD_QUOTE_PAD,
  KEYWORD_CODE_PAD,
} from "./textures";

export const STAGE_COUNT = 4;
export const CARD = { width: 4.4, height: 3.3, depth: 0.08, radius: 0.16 };
export const FACE_Z = CARD.depth / 2 + 0.01; // front face incl. bevel

const LEFT = -CARD.width / 2 + 0.25;
const RIGHT = CARD.width / 2 - 0.25;
const HEADER_Y = 1.34;

// Code view
const CODE_TOP = 0.98;
const CODE_GAP = 0.29;
const CODE_SIZE = 0.125;
const MIN_CODE_SIZE = 0.095;

// System view
const DIAGRAM_Y = -0.02;
const ENTRY_X = -0.1;
const SERVICE_X = 1.3;
const BLOCK = { height: 0.46, depth: 0.2, minWidth: 1.0 };

const codeY = (index) => CODE_TOP - index * CODE_GAP;

// Vertical offsets for 1–3 items in a column
function spread(count) {
  if (count <= 1) return [0];
  if (count === 2) return [0.36, -0.36];
  return [0.62, 0, -0.62];
}

// Same value for all four stages
const every = (state) => Array.from({ length: STAGE_COUNT }, () => ({ ...state }));

function polyline(points) {
  const vectors = points.map(([x, y]) => new THREE.Vector3(x, y, FACE_Z + 0.06));
  const lengths = [0];
  for (let i = 1; i < vectors.length; i++) {
    lengths.push(lengths[i - 1] + vectors[i].distanceTo(vectors[i - 1]));
  }
  return { points: vectors, lengths, total: lengths[lengths.length - 1] };
}

export function buildLayout(story) {
  const textures = [];
  const track = (texture) => {
    textures.push(texture);
    return texture;
  };
  const size = (texture) => texture.userData.size;

  const pieces = [];
  const requirements = story.requirements.slice(0, 3);
  const code = story.code.slice(0, 7).map((entry) => ({
    line: entry.line,
    req: typeof entry.req === "number" ? entry.req - 1 : null, // content uses R1-based numbers
  }));

  // ---- Header: a different label for each stage --------------------------
  pieces.push({
    id: "header",
    delay: 0,
    states: ["request", "code", "system", "users"].map((kind) => ({
      tex: track(headerTexture(kind, story)),
      x: LEFT,
      y: HEADER_Y,
      visible: true,
    })),
  });

  // ---- Stage 1: the client's words ---------------------------------------
  const quote = quoteTexture(story.request, story.keyword, RIGHT - LEFT);
  track(quote.texture);
  const quoteY = 1.06 - size(quote.texture)[1] / 2;
  pieces.push({
    id: "quote",
    delay: 0.05,
    states: every({ tex: quote.texture, x: LEFT, y: quoteY, visible: false }).map((state, stage) => ({
      ...state,
      visible: stage === 0,
    })),
  });

  // ---- Stage 2: code (shrunk to fit the card if a line is long) -----------
  const widest = Math.max(...code.map((entry) => codeLineWidth(entry.line, entry.req, CODE_SIZE)));
  const codeSize = Math.max(MIN_CODE_SIZE, CODE_SIZE * Math.min(1, (RIGHT - LEFT) / widest));
  const codeLines = code.map((entry, index) => {
    const line = codeLineTexture(entry.line, index + 1, entry.req, codeSize, story.keyword, RIGHT - LEFT);
    track(line.texture);
    return { ...entry, ...line, y: codeY(index) };
  });

  // ---- Requirements: checklist -> the code that satisfies them -> ticked --
  const doneTextures = requirements.map((text) => track(requirementDoneTexture(text)));
  const doneSlots = layoutRow(doneTextures.map((texture) => size(texture)[0]));
  const linesShownByRequirements = new Set();

  requirements.forEach((text, i) => {
    const open = track(requirementTexture(i, text));
    const line = codeLines.find((entry) => entry.req === i);
    if (line) linesShownByRequirements.add(line);
    const listY = -0.16 - i * 0.36;
    const codeState = line
      ? { tex: line.texture, x: LEFT, y: line.y, visible: true }
      : { tex: open, x: LEFT, y: listY, visible: false };
    pieces.push({
      id: `req-${i}`,
      delay: 0.12 + i * 0.09,
      states: [
        { tex: open, x: LEFT, y: listY, visible: true },
        codeState,
        { ...codeState, visible: false },
        { tex: doneTextures[i], ...doneSlots[i], visible: true },
      ],
    });
  });

  // Every other code line only exists in the code view
  codeLines.forEach((line, index) => {
    if (linesShownByRequirements.has(line)) return;
    pieces.push({
      id: `code-${index}`,
      delay: 0.18 + index * 0.04,
      states: every({ tex: line.texture, x: LEFT, y: line.y, visible: false }).map((state, stage) => ({
        ...state,
        visible: stage === 1,
      })),
    });
  });

  // ---- System: blocks grow out of the code lines --------------------------
  const nodes = story.nodes.slice(0, 4);
  const services = nodes.slice(1);
  const serviceYs = spread(services.length).map((offset) => DIAGRAM_Y + offset);

  const blocks = nodes.map((node, index) => {
    const labelWidth = nodeLabelWidth(node);
    const width = Math.max(BLOCK.minWidth, labelWidth + 0.18);
    const isEntry = index === 0;
    const x = isEntry ? ENTRY_X : SERVICE_X;
    const y = isEntry ? DIAGRAM_Y : serviceYs[index - 1];
    const source = codeLines[index % codeLines.length];
    const hidden = { x: LEFT + width / 2 + 0.3, y: source.y, visible: false };
    return {
      id: `node-${index}`,
      entry: isEntry,
      width,
      height: BLOCK.height,
      depth: BLOCK.depth,
      label: track(nodeLabelTexture(node, width - 0.06)),
      delay: 0.1 + index * 0.12,
      states: [hidden, hidden, { x, y, visible: true }, { x, y, visible: true }],
    };
  });

  const entry = blocks[0];
  const entryLeft = ENTRY_X - entry.width / 2;
  const entryRight = ENTRY_X + entry.width / 2;
  const serviceLefts = blocks.slice(1).map((block) => SERVICE_X - block.width / 2);
  const inboundStart = -CARD.width / 2 + 0.06;

  // ---- Users: who ends up using it -----------------------------------------
  const users = story.users.slice(0, 3);
  const userYs = spread(users.length).map((offset) => DIAGRAM_Y + offset);
  const userChips = users.map((user, i) => {
    const texture = track(userChipTexture(user));
    const y = userYs[i];
    pieces.push({
      id: `user-${i}`,
      delay: 0.15 + i * 0.1,
      states: [
        { tex: texture, x: LEFT - 0.35, y, visible: false },
        { tex: texture, x: LEFT - 0.35, y, visible: false },
        { tex: texture, x: LEFT - 0.35, y, visible: false },
        { tex: texture, x: LEFT, y, visible: true },
      ],
    });
    return { y, right: LEFT + size(texture)[0] };
  });

  // ---- The travelling keyword ---------------------------------------------
  const keywordStates = [];
  if (quote.keyword) {
    const tex = track(keywordQuoteTexture(quote.keyword.text));
    keywordStates.push({ tex, x: LEFT + quote.keyword.x - KEYWORD_QUOTE_PAD, y: quoteY + quote.keyword.y, visible: true });
  }
  const keywordLine = codeLines.find((line) => line.keyword);
  if (keywordLine) {
    const tex = track(keywordCodeTexture(keywordLine.keyword.text, codeSize));
    keywordStates[1] = { tex, x: LEFT + keywordLine.keyword.x - KEYWORD_CODE_PAD, y: keywordLine.y, visible: true };
  }
  const actionTex = track(keywordActionTexture(story.action));
  const inboundMid = (inboundStart + entryLeft) / 2;
  keywordStates[2] = { tex: actionTex, x: inboundMid - size(actionTex)[0] / 2, y: DIAGRAM_Y + 0.22, visible: true };
  const buttonTex = track(keywordButtonTexture(story.button));
  const firstUser = userChips[0];
  keywordStates[3] = {
    tex: buttonTex,
    x: LEFT + (firstUser.right - LEFT) / 2 - size(buttonTex)[0] / 2,
    y: firstUser.y + 0.37,
    visible: true,
  };
  // Fill gaps (e.g. keyword missing from the quote) with a hidden state
  for (let stage = 0; stage < STAGE_COUNT; stage++) {
    keywordStates[stage] ??= { ...keywordStates.find(Boolean), visible: false };
  }
  pieces.push({ id: "keyword", delay: 0.3, renderOrder: 4, states: keywordStates });

  // ---- Edges and request routes -------------------------------------------
  const edges = [
    { id: "inbound", points: [[inboundStart, DIAGRAM_Y], [entryLeft, DIAGRAM_Y]], stages: [false, false, true, false] },
    ...serviceLefts.map((left, k) => ({
      id: `svc-${k}`,
      points: [[entryRight, DIAGRAM_Y], [left, serviceYs[k]]],
      stages: [false, false, true, true],
    })),
    ...userChips.map((chip, i) => ({
      id: `user-${i}`,
      points: [[chip.right, chip.y], [entryLeft, DIAGRAM_Y]],
      stages: [false, false, false, true],
    })),
  ];

  const toService = (k) => [[entryLeft, DIAGRAM_Y], [entryRight, DIAGRAM_Y], [serviceLefts[k], serviceYs[k]]];
  const routes = {
    2: serviceLefts.map((_, k) => polyline([[inboundStart, DIAGRAM_Y], ...toService(k)])),
    3: userChips.flatMap((chip) =>
      serviceLefts.map((_, k) => polyline([[chip.right, chip.y], ...toService(k)]))
    ),
  };

  return {
    pieces,
    blocks,
    edges,
    routes,
    dispose: () => textures.forEach((texture) => texture.dispose()),
  };
}

// Lay ticked requirements out left to right along the bottom, wrapping to a
// second row if they don't fit.
function layoutRow(widths) {
  const gap = 0.16;
  const rows = [[]];
  let x = LEFT;
  widths.forEach((width, i) => {
    if (x + width > RIGHT && rows[rows.length - 1].length) {
      rows.push([]);
      x = LEFT;
    }
    rows[rows.length - 1].push(i);
    x += width + gap;
  });

  const slots = [];
  const firstRowY = rows.length > 1 ? -1.2 : -1.32;
  rows.forEach((row, r) => {
    let cursor = LEFT;
    row.forEach((i) => {
      slots[i] = { x: cursor, y: firstRowY - r * 0.24 };
      cursor += widths[i] + gap;
    });
  });
  return slots;
}
