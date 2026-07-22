import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Story } from 'inkjs';

const root = resolve(import.meta.dirname, '..');
const sources = [
  'story/chapters/opening-bar.ink',
  'story/chapters/chapter-02-fight.ink',
];
const errors = [];
const lineIds = new Map();
const supportedStoryEffects = new Set([
  'smoke-inhale',
  'smoke-exhale',
  'door',
  'shuttle',
  'impact_early',
  'body_impact',
  'impact_distant',
  'can_roll',
  'can-crush',
  'can-toe-contact',
  'edward_wrong_direction',
  'glass_impact',
  'glass_fall',
  'fight-end-flash',
  'aftermath-drop',
  'memory-realign',
  'visitor-step-01',
  'visitor-step-02',
  'stand-up',
  'chair-scrape',
  'body-hit-heavy',
  'body-fall',
  'body-fall-heavy',
  'knee-fall',
  'knee-contact',
  'shoulder-contact',
  'strike-swipe',
  'shoe-slip',
  'pain-pulse',
  'memory-whoosh-short',
  'memory-whoosh-sharp',
  'memory-whoosh-deep',
  'hollow',
  'glass-knee-fall',
]);
const supportedMarkKinds = new Set(['conflict', 'anchor', 'uncertain']);
const supportedVisualEffects = new Set([
  'impact_blackout',
  'motion_repeat',
  'double_position',
  'object_double',
  'edward_split',
  'pain-slip',
  'pain-jolt',
  'pain-throb',
  'brief_shake',
  'clock_focus',
  'hard_double_exposure',
  'fight_aftermath_flash',
  'all_versions',
  'temple_pain_flash',
  'unnatural_stillness',
  'causal_gap',
  'bluespace_correction',
]);
const supportedMemoryCues = new Set([
  'flicker',
  'anchor_created',
  'match',
  'contradiction',
  'force_anchor',
  'spatial_contradiction',
  'pain_anchor',
  'perfect_sequence',
  'partial_stability',
]);
const supportedSceneEffects = new Set([
  'memory-drift',
  'memory-drift-end',
  'memory-lock',
  'probability-pull',
]);
const supportedBackgrounds = new Set(['bar-soft', 'city-archive']);

function isInkContentLine(line) {
  const value = line.trim();
  return Boolean(value) &&
    !value.startsWith('#') &&
    !value.startsWith('//') &&
    !value.startsWith('VAR ') &&
    !value.startsWith('===') &&
    !value.startsWith('->') &&
    !value.startsWith('~') &&
    !value.startsWith('{') &&
    !value.startsWith('}') &&
    !/^[-+*]\s/.test(value);
}

function findWholeTextSpans(text, target) {
  const spans = [];
  let offset = 0;
  while (offset <= text.length - target.length) {
    const index = text.indexOf(target, offset);
    if (index < 0) break;
    const before = text[index - 1] ?? '';
    const after = text[index + target.length] ?? '';
    const startsWithWord = /^[\p{L}\p{N}]/u.test(target);
    const endsWithWord = /[\p{L}\p{N}]$/u.test(target);
    const cutsWordAtStart = startsWithWord && /[\p{L}\p{N}]/u.test(before);
    const cutsWordAtEnd = endsWithWord && /[\p{L}\p{N}]/u.test(after);
    if (!cutsWordAtStart && !cutsWordAtEnd) {
      spans.push({ start: index, end: index + target.length });
    }
    offset = index + 1;
  }
  return spans;
}

function validateStaticDecorations(relativePath, source) {
  let pending = [];
  const lines = source.split('\n');

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const mark = line.match(/^\s*#\s*mark:([^=\s]+)=(.+)$/);
    if (mark) {
      pending.push({ kind: `mark:${mark[1]}`, target: mark[2].trim(), line: index + 1 });
      continue;
    }
    const mutation = line.match(/^\s*#\s*(rewrite|alternate|split-word):([^=]+)=(.+)$/);
    if (mutation) {
      pending.push({ kind: mutation[1], target: mutation[2].trim(), line: index + 1 });
      continue;
    }
    if (!isInkContentLine(line)) continue;

    const text = line.trim().replace(/^[-\u2014]\s*/, '');
    const occupied = [];
    for (const decoration of pending) {
      const spans = findWholeTextSpans(text, decoration.target);
      if (spans.length === 0) {
        errors.push(
          `${relativePath}:${decoration.line}: ${decoration.kind} target “${decoration.target}” ` +
          `is missing, has different casing, or cuts through a word in “${text}”`,
        );
        continue;
      }
      if (spans.length > 1) {
        errors.push(
          `${relativePath}:${decoration.line}: ${decoration.kind} target “${decoration.target}” ` +
          `is ambiguous because it occurs ${spans.length} times in “${text}”`,
        );
        continue;
      }

      const [span] = spans;
      const overlap = occupied.find((entry) => span.start < entry.end && span.end > entry.start);
      if (overlap) {
        errors.push(
          `${relativePath}:${decoration.line}: ${decoration.kind} target “${decoration.target}” ` +
          `overlaps ${overlap.kind} target “${overlap.target}” in “${text}”`,
        );
        continue;
      }
      occupied.push({ ...span, kind: decoration.kind, target: decoration.target });
    }
    pending = [];
  }

  for (const decoration of pending) {
    errors.push(`${relativePath}:${decoration.line}: ${decoration.kind} target “${decoration.target}” has no text line`);
  }
}

for (const relativePath of sources) {
  const source = await readFile(resolve(root, relativePath), 'utf8');
  validateStaticDecorations(relativePath, source);
  const blocks = source.split(/\n\s*\n/);
  for (const block of blocks) {
    if (/^\s*#\s*layer:dialogue\s*$/m.test(block) && !/^\s*#\s*speaker:\S+\s*$/m.test(block)) {
      const firstLine = block.split('\n').find((line) => line.trim() && !line.trim().startsWith('#'))?.trim();
      errors.push(`${relativePath}: dialogue without speaker near “${firstLine ?? 'unknown'}”`);
    }
  }

  for (const match of source.matchAll(/^\s*#\s*line:([^\s]+)\s*$/gm)) {
    const lineId = match[1];
    const previous = lineIds.get(lineId);
    if (previous) errors.push(`${relativePath}: duplicate line-id ${lineId} (first seen in ${previous})`);
    else lineIds.set(lineId, relativePath);
  }

  for (const match of source.matchAll(/^\s*#\s*sfx:([^\s]+)\s*$/gm)) {
    if (!supportedStoryEffects.has(match[1])) {
      errors.push(`${relativePath}: unsupported sfx ${match[1]}`);
    }
  }

  for (const match of source.matchAll(/^\s*#\s*visual:([^\s]+)\s*$/gm)) {
    if (!supportedVisualEffects.has(match[1])) {
      errors.push(`${relativePath}: unsupported visual effect ${match[1]}`);
    }
  }

  for (const match of source.matchAll(/^\s*#\s*memory:([^\s]+)\s*$/gm)) {
    if (!supportedMemoryCues.has(match[1])) {
      errors.push(`${relativePath}: unsupported memory cue ${match[1]}`);
    }
  }

  for (const match of source.matchAll(/^\s*#\s*fx:([^\s]+)\s*$/gm)) {
    if (!supportedSceneEffects.has(match[1])) {
      errors.push(`${relativePath}: unsupported scene effect ${match[1]}`);
    }
  }

  for (const match of source.matchAll(/^\s*#\s*background:([^\s]+)\s*$/gm)) {
    if (!supportedBackgrounds.has(match[1])) {
      errors.push(`${relativePath}: unsupported background ${match[1]}`);
    }
  }

  for (const match of source.matchAll(/^\s*#\s*mark:([^=\s]+)=(.+)$/gm)) {
    if (!supportedMarkKinds.has(match[1])) {
      errors.push(`${relativePath}: unsupported mark kind ${match[1]}`);
    }
    if (!match[2].trim()) {
      errors.push(`${relativePath}: empty mark target`);
    }
  }

  for (const match of source.matchAll(/^\s*#\s*(rewrite|alternate|split-word):([^=]+)=(.+)$/gm)) {
    if (!match[2].trim() || !match[3].trim()) {
      errors.push(`${relativePath}: incomplete ${match[1]} mutation`);
    }
  }
}

const compiledRaw = await readFile(resolve(root, 'public/story/main.json'), 'utf8');
const compiled = JSON.parse(compiledRaw.replace(/^\uFEFF/, ''));

function tagsToMap(rawTags) {
  const result = new Map();
  for (const rawTag of rawTags ?? []) {
    const separator = rawTag.indexOf(':');
    const key = (separator < 0 ? rawTag : rawTag.slice(0, separator)).trim().toLowerCase();
    const value = separator < 0 ? '' : rawTag.slice(separator + 1).trim();
    if (!result.has(key)) result.set(key, []);
    result.get(key).push(value);
  }
  return result;
}

function smokeTest(startPath, runCount) {
  for (let run = 0; run < runCount; run += 1) {
    const story = new Story(compiled);
    story.ChoosePathString(startPath, true);
    let choiceNumber = 0;
    let guard = 0;

    while (guard < 1800) {
      guard += 1;
      while (story.canContinue) {
        const text = story.Continue()?.trim() ?? '';
        if (!text) continue;
        const tags = tagsToMap(story.currentTags);
        const layer = tags.get('layer')?.at(-1);
        const speaker = tags.get('speaker')?.at(-1);
        if (layer === 'dialogue' && !speaker) {
          errors.push(`${startPath}, run ${run}: dialogue without speaker: “${text}”`);
        }
        if (speaker && layer !== 'dialogue' && layer !== 'unknown') {
          errors.push(`${startPath}, run ${run}: speaker ${speaker} attached to ${layer ?? 'no layer'}: “${text}”`);
        }
        for (const mark of tags.get('mark') ?? []) {
          const separator = mark.indexOf('=');
          const target = separator >= 0 ? mark.slice(separator + 1).trim() : '';
          if (!target || !text.replace(/^[-\u2014]\s*/, '').includes(target)) {
            errors.push(`${startPath}, run ${run}: mark target “${target || mark}” not found in “${text}”`);
          }
        }
        for (const mutationKind of ['rewrite', 'alternate', 'split-word']) {
          for (const mutation of tags.get(mutationKind) ?? []) {
            const separator = mutation.indexOf('=');
            const from = separator >= 0 ? mutation.slice(0, separator).trim() : '';
            const to = separator >= 0 ? mutation.slice(separator + 1).trim() : '';
            if (!from || !to || !text.replace(/^[-\u2014]\s*/, '').includes(from)) {
              errors.push(`${startPath}, run ${run}: ${mutationKind} source “${from || mutation}” not found in “${text}”`);
            }
          }
        }
      }

      if (story.currentChoices.length === 0) break;
      // Different coprime strides cover ordinary branches without making the
      // validator depend on a single canonical playthrough.
      const index = (run * 5 + choiceNumber * 3) % story.currentChoices.length;
      story.ChooseChoiceIndex(index);
      choiceNumber += 1;
      if (choiceNumber > 80) break;
    }

    if (guard >= 1800) errors.push(`${startPath}, run ${run}: traversal guard exhausted`);
  }
}

smokeTest('opening_bar', 36);
smokeTest('chapter_02_fight', 36);

function validateFightScenario(name, variables, choiceFragments, expectedLineIds) {
  const story = new Story(compiled);
  for (const [key, value] of Object.entries(variables)) {
    story.variablesState[key] = value;
  }
  story.ChoosePathString('chapter_02_fight', true);

  const seenLineIds = new Set();
  let choiceIndex = 0;
  let guard = 0;

  while (guard < 2600) {
    guard += 1;
    while (story.canContinue) {
      const text = story.Continue()?.trim() ?? '';
      const tags = tagsToMap(story.currentTags);
      const lineId = tags.get('line')?.at(-1);
      if (lineId) seenLineIds.add(lineId);
      for (const mark of tags.get('mark') ?? []) {
        const separator = mark.indexOf('=');
        const target = separator >= 0 ? mark.slice(separator + 1).trim() : '';
        if (!target || !text.replace(/^[-\u2014]\s*/, '').includes(target)) {
          errors.push(`${name}: mark target “${target || mark}” not found in “${text}”`);
        }
      }
      if (expectedLineIds.every((expected) => seenLineIds.has(expected))) return;
    }

    if (story.currentChoices.length === 0) break;
    const availableChoiceText = story.currentChoices.map((choice) => choice.text).join(' / ');
    const forcedCorrection = [
      ['Эдвард остался у двери', 'Эдвард оказался между ними.'],
      ['Банка осталась под столом', 'Банка была в руке Нилла.'],
      ['Из-за недостачи', 'Он пришёл за долгом.'],
    ].find(([choiceText]) => availableChoiceText.includes(choiceText));
    if (forcedCorrection) {
      const actualRewrite = tagsToMap(story.currentTags).get('choice-rewrite')?.at(-1);
      if (actualRewrite !== forcedCorrection[1]) {
        errors.push(`${name}: forced choice “${forcedCorrection[0]}” rewrites to “${actualRewrite ?? 'nothing'}”, expected “${forcedCorrection[1]}”`);
        return;
      }
    }
    const fragment = choiceFragments[choiceIndex];
    if (!fragment) {
      errors.push(`${name}: reached an unscripted choice: ${story.currentChoices.map((choice) => choice.text).join(' / ')}`);
      return;
    }
    const nextChoice = story.currentChoices.findIndex((choice) => choice.text.includes(fragment));
    if (nextChoice < 0) {
      errors.push(`${name}: choice containing “${fragment}” not found; available: ${story.currentChoices.map((choice) => choice.text).join(' / ')}`);
      return;
    }
    story.ChooseChoiceIndex(nextChoice);
    choiceIndex += 1;
  }

  const missing = expectedLineIds.filter((expected) => !seenLineIds.has(expected));
  errors.push(`${name}: route did not reach ${missing.join(', ')}`);
}

const stableFightVariables = {
  cigarette_state: 'untouched',
  caught_can: true,
  smoked_edward: false,
  fight_answer: 'self',
};

validateFightScenario('fight logic - coherent account', stableFightVariables, [
  'Знак старой грузовой',
  'складская накладная',
  'Ударить первым',
  'Сжать банку',
  'Эдвард вмешался',
  'Отойти с линии',
  'Это происходит сейчас',
  'Я.',
], ['fight_final_response_match', 'fight_end_final']);

validateFightScenario('fight logic - revised but grounded account', {
  ...stableFightVariables,
  fight_answer: 'other',
}, [
  'Знак старой грузовой',
  'складская накладная',
  'Ударить первым',
  'Принять нынешнее начало',
  'Сжать банку',
  'Эдвард вмешался',
  'Отойти с линии',
  'Это происходит сейчас',
  'Я.',
], ['fight_final_response_current_basis', 'fight_end_final']);

validateFightScenario('fight logic - unsupported answer', {
  ...stableFightVariables,
  fight_answer: 'unknown',
}, [
  'Знак старой грузовой',
  'складская накладная',
  'Ударить первым',
  'Сжать банку',
  'Эдвард вмешался',
  'Отойти с линии',
  'Это происходит сейчас',
  'Он.',
], ['fight_unsupported_basis_answer', 'fight_unsupported_title']);

validateFightScenario('fight logic - forced perfect account', {
  cigarette_state: 'smoked',
  caught_can: false,
  smoked_edward: false,
  fight_answer: 'other',
}, [
  'Знак старой грузовой',
  'долговая расписка',
  'Ударить первым',
  'Удержать прежний ответ',
  'Удержать выбранную причину',
  'Сжать банку',
  'Поставить банку',
  'Эдвард вмешался',
  'Отойти с линии',
  'Не пытаться определить',
  'Это происходит сейчас',
  'Эдвард остался у двери',
  'Банка осталась под столом',
  'Из-за недостачи',
], ['fight_perfect_cause_01', 'fight_perfect_title']);

validateFightScenario('fight logic - probability collapse', {
  cigarette_state: 'smoked',
  caught_can: false,
  smoked_edward: false,
  fight_answer: 'other',
}, [
  'Знак старой грузовой',
  'складская накладная',
  'Ударить первым',
  'Сохранить оба начала',
  'Сжать банку',
  'Оставить банку в обоих',
  'Эдварда здесь не было',
  'Оставить Эдварда и в баре',
  'Отойти с линии',
  'Не пытаться определить',
  'Это происходит сейчас',
], ['fight_collapse_cause_01', 'fight_collapse_title']);

if (errors.length > 0) {
  console.error(`Story validation failed (${errors.length}):`);
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Story validation passed: chapters compile; dialogue speakers, line IDs, SFX, and visual cues are valid.');
}
