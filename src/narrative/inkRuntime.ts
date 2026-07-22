import { Story } from 'inkjs';
import { parseInkTags } from './inkTags';
import type { NarrativeLine, StoryChoice, StoryTurn } from './narrativeTypes';

function parseStoryChoiceText(text: string): string {
  return text.trim();
}

function detectChoiceKind(text: string): StoryChoice['kind'] {
  return /^[-\u2014]\s/.test(text) ? 'dialogue' : 'action';
}

export class InkRuntime {
  private story: Story | null = null;
  private bufferedLine: NarrativeLine | null = null;

  public async init(
    sourceUrl: string,
    savedStateJson?: string,
    bufferedLine?: NarrativeLine,
  ): Promise<void> {
    const requestUrl = new URL(sourceUrl, window.location.href);
    requestUrl.searchParams.set('story-revision', String(Date.now()));
    const response = await fetch(requestUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load Ink story: ${response.status} ${response.statusText}`);
    }

    const raw = (await response.text()).trim();
    this.story = new Story(raw);

    if (savedStateJson) {
      this.story.state.LoadJson(savedStateJson);
    }

    this.bufferedLine = bufferedLine ?? null;
  }

  public exportState(): string {
    const story = this.getStory();
    return story.state.ToJson();
  }

  public exportBufferedLine(): NarrativeLine | undefined {
    return this.bufferedLine ?? undefined;
  }

  public exportVariables(names: readonly string[]): Record<string, string | number | boolean | null> {
    const story = this.getStory();
    const exported: Record<string, string | number | boolean | null> = {};

    for (const name of names) {
      const value = story.variablesState.$(name);
      if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
        exported[name] = value as string | number | boolean | null;
      }
    }

    return exported;
  }

  public importVariables(values: Record<string, string | number | boolean | null>): void {
    const story = this.getStory();
    for (const [name, value] of Object.entries(values)) {
      if (value !== null) {
        story.variablesState.$(name, value);
      }
    }
  }

  public choose(index: number): void {
    const story = this.getStory();
    story.ChooseChoiceIndex(index);
  }

  public chooseDebugDefault(index: number): boolean {
    if (this.isCurrentChoiceSignificant()) return false;
    this.getStory().ChooseChoiceIndex(index);
    return true;
  }

  public jumpToPath(path: string): void {
    const story = this.getStory();
    story.ChoosePathString(path, true);
    this.bufferedLine = null;
  }

  public continueToNextChoice(): StoryTurn {
    const story = this.getStory();

    const lines: NarrativeLine[] = [];
    let scene: string | undefined;
    let palette: string | undefined;
    let background: string | undefined;
    let fx: string | undefined;
    let visual: string | undefined;
    let memory: string | undefined;
    let music: string[] | undefined;
    let beatEnded = false;
    let debugChoiceSignificant = false;
    let choiceRewrite: string | undefined;

    const applyTurnTags = (tags: NarrativeLine['tags']): void => {
      if (tags.scene) {
        scene = tags.scene;
      }
      if (tags.palette) {
        palette = tags.palette;
      }
      if (tags.background) {
        background = tags.background;
      }
      if (tags.fx) {
        fx = tags.fx;
      }
      if (tags.visual) {
        visual = tags.visual;
      }
      if (tags.memory) {
        memory = tags.memory;
      }
      if (tags.music) {
        music = [...(music ?? []), ...tags.music];
      }
      if (tags.debugChoiceSignificant) {
        debugChoiceSignificant = true;
      }
      if (tags.choiceRewrite) {
        choiceRewrite = tags.choiceRewrite;
      }
    };

    if (this.bufferedLine) {
      const buffered = this.bufferedLine;
      this.bufferedLine = null;
      applyTurnTags(buffered.tags);
      lines.push(buffered);
    }

    while (story.canContinue) {
      const continued = story.Continue();
      if (continued === null) {
        continue;
      }

      const text = continued.trim();
      const tags = parseInkTags(story.currentTags ?? []);

      if (text.length > 0) {
        const line: NarrativeLine = {
          text,
          layer: tags.layer ?? 'narration',
          speaker: tags.speaker,
          lineId: tags.lineId,
          tags,
        };

        // Standalone Ink tags are attached to the following content line.
        // Treat beat:end as the boundary before that line and retain it for
        // the next turn, matching the author-facing placement in the .ink file.
        if (tags.beatEnd && lines.length > 0) {
          this.bufferedLine = line;
          beatEnded = true;
          break;
        }

        applyTurnTags(line.tags);
        lines.push(line);
      } else {
        // Effect/background tags may deliberately sit directly before a
        // choice and therefore have no text line to carry them.
        applyTurnTags(tags);
      }

      if (story.currentChoices.length > 0) {
        break;
      }

      if (tags.beatEnd && text.length === 0) {
        beatEnded = true;
        break;
      }
    }

    return {
      lines,
      choices: this.bufferedLine ? [] : this.getChoices(),
      scene,
      palette,
      background,
      fx,
      visual,
      memory,
      music,
      beatEnded,
      debugChoiceSignificant,
      choiceRewrite,
    };
  }

  public getChoices(): StoryChoice[] {
    const story = this.getStory();

    return story.currentChoices.map((choice: { text: string }, index: number) => {
      const text = parseStoryChoiceText(choice.text);
      return {
        index,
        text,
        kind: detectChoiceKind(text),
      };
    });
  }

  public hasEnded(): boolean {
    const story = this.getStory();
    return story.currentChoices.length === 0 && !story.canContinue;
  }

  public getCurrentPath(): string {
    return this.getStory().state.currentPathString ?? '';
  }

  public isCurrentChoiceSignificant(): boolean {
    const story = this.getStory();
    return story.currentChoices.length > 0 &&
      parseInkTags(story.currentTags ?? []).debugChoiceSignificant === true;
  }

  public getCurrentChoiceRewrite(): string | undefined {
    const story = this.getStory();
    if (story.currentChoices.length === 0) return undefined;
    return parseInkTags(story.currentTags ?? []).choiceRewrite;
  }

  private getStory(): Story {
    if (this.story === null) {
      throw new Error('Ink story is not initialized.');
    }

    return this.story;
  }
}
