import type {
  NarrativeLayer,
  NarrativeMark,
  NarrativeMutation,
  ParsedInkTags,
} from './narrativeTypes';

const LAYERS = new Set<NarrativeLayer>([
  'narration',
  'dialogue',
  'thought',
  'archive',
  'unknown',
]);
const MARK_KINDS = new Set<NarrativeMark['kind']>(['conflict', 'anchor', 'uncertain']);

export function parseInkTags(rawTags: string[]): ParsedInkTags {
  const parsed: ParsedInkTags = {};

  for (const tag of rawTags) {
    const [rawKey, ...rawValueParts] = tag.split(':');
    const key = rawKey.trim().toLowerCase();
    const value = rawValueParts.join(':').trim();

    switch (key) {
      case 'scene':
        parsed.scene = value;
        break;
      case 'palette':
        parsed.palette = value;
        break;
      case 'background':
        parsed.background = value;
        break;
      case 'speaker':
        parsed.speaker = value;
        break;
      case 'layer':
        if (LAYERS.has(value as NarrativeLayer)) {
          parsed.layer = value as NarrativeLayer;
        }
        break;
      case 'line':
        parsed.lineId = value;
        break;
      case 'choice':
        parsed.choiceId = value;
        break;
      case 'choice-rewrite':
        if (value.length > 0) {
          parsed.choiceRewrite = value;
        }
        break;
      case 'tone':
        parsed.tone = value;
        break;
      case 'fx':
        parsed.fx = value;
        break;
      case 'visual':
        parsed.visual = value;
        break;
      case 'memory':
        parsed.memory = value;
        break;
      case 'pause':
        if (isValidPause(value)) {
          parsed.pause = Number(value);
        }
        break;
      case 'pause-before':
        if (isValidPause(value)) {
          parsed.pauseBefore = Number(value);
        }
        break;
      case 'music':
        parsed.music = [...(parsed.music ?? []), value];
        break;
      case 'sfx':
        parsed.sfx = value;
        break;
      case 'mark': {
        const separator = value.indexOf('=');
        const kind = value.slice(0, separator).trim().toLowerCase() as NarrativeMark['kind'];
        const text = value.slice(separator + 1).trim();
        if (separator > 0 && MARK_KINDS.has(kind) && text.length > 0) {
          parsed.marks = [...(parsed.marks ?? []), { kind, text }];
        }
        break;
      }
      case 'rewrite':
      case 'alternate':
      case 'split-word': {
        const mutation = parseMutation(key, value);
        if (mutation) parsed.mutations = [...(parsed.mutations ?? []), mutation];
        break;
      }
      case 'beat':
        if (value === 'end') {
          parsed.beatEnd = true;
        }
        break;
      case 'debug-choice':
        if (value === 'significant') {
          parsed.debugChoiceSignificant = true;
        }
        break;
      default:
        break;
    }
  }

  return parsed;
}

function parseMutation(kind: string, value: string): NarrativeMutation | null {
  const separator = value.indexOf('=');
  const from = value.slice(0, separator).trim();
  const to = value.slice(separator + 1).trim();
  if (separator <= 0 || !from || !to) return null;
  return { kind: kind as NarrativeMutation['kind'], from, to };
}

function isValidPause(value: string): boolean {
  if (!/^\d+$/.test(value)) {
    return false;
  }

  const milliseconds = Number(value);
  return Number.isSafeInteger(milliseconds) && milliseconds >= 0 && milliseconds <= 60_000;
}
