import { renderChoices, rewriteChoice } from './choices';
import { finishTextEffects, playTextEffects, settleTextEffects } from './textEffects';
import type {
  NarrativeLine,
  NarrativeMark,
  NarrativeMutation,
  StoryChoice,
} from '../narrative/narrativeTypes';

type TextDecoration =
  | ({ type: 'mark'; start: number } & NarrativeMark)
  | ({ type: 'mutation'; start: number } & NarrativeMutation);

export type RendererElements = {
  prose: HTMLElement;
  choices: HTMLElement;
};

export class Renderer {
  private readingEdgeSettleTimer: number | undefined;

  public constructor(private readonly elements: RendererElements) {}

  public renderTranscript(lines: NarrativeLine[]): void {
    this.elements.prose.replaceChildren();
    for (const line of lines) {
      const node = this.createLineNode(line);
      this.elements.prose.appendChild(node);
      settleTextEffects(node);
    }
    this.scrollToReadingEdge();
  }

  public appendLine(line: NarrativeLine): void {
    const node = this.createLineNode(line);
    this.elements.prose.appendChild(node);
    playTextEffects(node);
    this.scrollToReadingEdge();
  }

  public appendLines(lines: readonly NarrativeLine[]): void {
    if (lines.length === 0) return;
    const fragment = document.createDocumentFragment();
    const nodes = lines.map((line) => this.createLineNode(line));
    for (const node of nodes) fragment.appendChild(node);
    this.elements.prose.appendChild(fragment);
    for (const node of nodes) playTextEffects(node);
    this.scrollToReadingEdge();
  }

  public finishLineAnimations(): void {
    for (const line of this.elements.prose.querySelectorAll<HTMLElement>('.line')) {
      finishTextEffects(line);
      for (const animation of line.getAnimations({ subtree: true })) {
        const endTime = animation.effect?.getComputedTiming().endTime;
        if (typeof endTime !== 'number' || !Number.isFinite(endTime)) continue;
        animation.finish();
      }
    }
  }

  public insertChoiceRecord(
    choices: StoryChoice[],
    selectedIndex: number,
    afterLineCount: number,
  ): void {
    const record = document.createElement('div');
    record.className = 'choices choices--recorded';
    renderChoices(record, choices, () => undefined, selectedIndex);

    for (const button of record.querySelectorAll<HTMLButtonElement>('.choice-button')) {
      button.disabled = true;
    }

    // Choice records are children of the prose container too, so indexing all
    // children shifts every later choice upward. Narrative positions must be
    // resolved against narrative lines only.
    const narrativeLines = this.elements.prose.querySelectorAll<HTMLElement>(':scope > .line');
    const nextLine = narrativeLines.item(afterLineCount);
    this.elements.prose.insertBefore(record, nextLine);
  }

  public renderChoices(
    choices: StoryChoice[],
    onSelect: (index: number) => void,
    lockedIndex?: number,
  ): void {
    renderChoices(this.elements.choices, choices, onSelect, lockedIndex);
    this.pinChoicesToReadingEdge();
  }

  public clearChoices(): void {
    this.elements.choices.replaceChildren();
    this.elements.choices.classList.remove(
      'choices--reality-correcting',
      'choices--reality-merged',
    );
  }

  public rewriteChoice(choiceIndex: number, rewrittenText: string): Promise<void> {
    return rewriteChoice(this.elements.choices, choiceIndex, rewrittenText);
  }

  public pinToReadingEdgeNow(): void {
    window.clearTimeout(this.readingEdgeSettleTimer);
    this.pinToReadingEdge('auto');
  }

  private scrollToReadingEdge(): void {
    window.clearTimeout(this.readingEdgeSettleTimer);
    const immediate = this.shouldUseImmediateScroll();

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        this.pinToReadingEdge(immediate ? 'auto' : 'smooth');
      });
    });
  }

  private pinChoicesToReadingEdge(): void {
    window.clearTimeout(this.readingEdgeSettleTimer);

    // Choices occupy their final layout size immediately; only their opacity
    // and horizontal offset animate. Start the smooth movement in this same
    // turn, without waiting two frames before the camera begins to follow.
    this.pinToReadingEdge('smooth');
    window.requestAnimationFrame(() => {
      this.pinToReadingEdge('smooth');
    });

    this.readingEdgeSettleTimer = window.setTimeout(() => {
      this.pinToReadingEdge('auto');
    }, 560);
  }

  private pinToReadingEdge(behavior: ScrollBehavior): void {
    const page = document.documentElement;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maximumScrollTop = Math.max(0, page.scrollHeight - viewportHeight);
    window.scrollTo({ top: maximumScrollTop, behavior });
  }

  private shouldUseImmediateScroll(): boolean {
    return document.querySelector('#app-shell')?.classList.contains('fx-memory-drift-exit') ?? false;
  }

  private createLineNode(line: NarrativeLine): HTMLElement {
    if ((line.layer === 'dialogue' || line.layer === 'unknown') && line.speaker) {
      const dialogue = document.createElement('div');
      const speakerId = line.speaker.toLowerCase();
      dialogue.className = `line layer-${line.layer} dialogue dialogue--${speakerId}`;
      if (line.layer === 'unknown') {
        dialogue.classList.add('dialogue--unknown');
      }
      if (line.lineId) {
        dialogue.dataset.lineId = line.lineId;
      }

      const speaker = document.createElement('span');
      speaker.className = 'dialogue__speaker';
      speaker.textContent = getSpeakerName(line.speaker);
      dialogue.appendChild(speaker);

      const text = document.createElement('p');
      text.className = 'dialogue__text';
      const dialogueText = line.text.replace(/^[-\u2014]\s*/, '');
      this.renderDecoratedText(text, dialogueText, line.tags.marks, line.tags.mutations);
      this.applyMemoryMetadata(dialogue, text, line, dialogueText);
      dialogue.appendChild(text);

      return dialogue;
    }

    const block = document.createElement('p');
    block.className = `line layer-${line.layer}`;
    if (line.lineId) {
      block.dataset.lineId = line.lineId;
    }
    const text = document.createElement('span');
    text.className = 'line__text';
    this.renderDecoratedText(text, line.text, line.tags.marks, line.tags.mutations);
    this.applyMemoryMetadata(block, text, line, line.text);
    block.appendChild(text);

    return block;
  }

  private applyMemoryMetadata(
    lineNode: HTMLElement,
    textNode: HTMLElement,
    line: NarrativeLine,
    accessibleText: string,
  ): void {
    if (line.tags.memory) lineNode.dataset.memoryCue = line.tags.memory;
    if (line.tags.visual) lineNode.dataset.visualEffect = line.tags.visual;

    // CSS uses two decorative copies to show a recollection converging on its
    // chosen wording. The real text remains the sole accessible DOM content.
    if (line.tags.memory || line.tags.visual) {
      textNode.dataset.echo = accessibleText;
    }
  }

  private renderDecoratedText(
    container: HTMLElement,
    text: string,
    marks: NarrativeMark[] | undefined,
    mutations: NarrativeMutation[] | undefined,
  ): void {
    if (!marks?.length && !mutations?.length) {
      container.textContent = text;
      return;
    }

    const ranges: TextDecoration[] = [
      ...(marks ?? []).map((mark): TextDecoration => ({
        type: 'mark',
        ...mark,
        start: text.indexOf(mark.text),
      })),
      ...(mutations ?? []).map((mutation): TextDecoration => ({
        type: 'mutation',
        ...mutation,
        start: text.indexOf(mutation.from),
      })),
    ]
      .filter((decoration) => decoration.start >= 0)
      .sort((left, right) => left.start - right.start);

    let cursor = 0;
    for (const decoration of ranges) {
      if (decoration.start < cursor) continue;
      container.append(document.createTextNode(text.slice(cursor, decoration.start)));
      if (decoration.type === 'mark') {
        const marked = document.createElement('span');
        marked.className = `memory-mark memory-mark--${decoration.kind}`;
        marked.textContent = decoration.text;
        container.append(marked);
        cursor = decoration.start + decoration.text.length;
        continue;
      }

      const mutation = document.createElement('span');
      mutation.className = `memory-mutation memory-mutation--${decoration.kind}`;
      mutation.setAttribute(
        'aria-label',
        decoration.kind === 'rewrite'
          ? decoration.to
          : `${decoration.from} / ${decoration.to}`,
      );
      const original = document.createElement('span');
      original.className = 'memory-mutation__original';
      original.textContent = decoration.from;
      original.setAttribute('aria-hidden', 'true');
      const replacement = document.createElement('span');
      replacement.className = 'memory-mutation__replacement';
      replacement.textContent = decoration.to;
      replacement.setAttribute('aria-hidden', 'true');
      mutation.append(original, replacement);
      container.append(mutation);
      cursor = decoration.start + decoration.from.length;
    }
    container.append(document.createTextNode(text.slice(cursor)));
  }
}

function getSpeakerName(value: string): string {
  const names: Record<string, string> = {
    edward: 'Эдвард',
    nill: 'Нилл',
    woman: 'Женщина',
    man: 'Мужчина',
    human_worker: 'Рабочий',
    unathi_worker: 'Унатх',
    arachnid: 'Арахнид',
    visitor: 'Посетитель',
    unknown_voice: 'Голос',
  };

  return names[value.toLowerCase()] ?? value;
}
