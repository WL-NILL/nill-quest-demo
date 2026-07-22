import './styles/base.css';
import './styles/layout.css';
import './styles/typography.css';
import './styles/narrative-layers.css';
import './styles/choices.css';
import './styles/backgrounds.css';
import './styles/effects.css';
import './styles/accessibility.css';
import './styles/chapter-pages.css';
import './styles/chapter-transitions.css';
import './styles/chapter-debug.css';

import { AUDIO_CONFIG } from './config/audioConfig';
import { STORY_CONFIG } from './config/storyConfig';
import { AudioManager } from './audio/audioManager';
import { MusicManager } from './audio/MusicManager';
import { InkRuntime } from './narrative/inkRuntime';
import type { NarrativeLine, StoryChoice } from './narrative/narrativeTypes';
import {
  loadStoryTextCatalog,
  refreshSavedLine,
  refreshSavedLines,
} from './narrative/storyTextCatalog';
import {
  applyUnreliableVariant,
  createInitialUnreliableState,
  nextRunState,
  type UnreliableState,
} from './narrative/unreliableText';
import { SaveManager } from './persistence/saveManager';
import {
  ChapterProgressManager,
  createInitialChapterProgress,
  type ChapterProgress,
} from './persistence/chapterProgress';
import {
  SAVE_SCHEMA_VERSION,
  type AppSave,
  type ChoiceCheckpoint,
} from './persistence/saveTypes';
import { Renderer } from './ui/renderer';
import {
  CHAPTER_TRANSITION,
  resolveTransitionVisual,
  shouldPlayMemoryRealign,
  type ScreenState as ChapterScreenState,
} from './ui/chapterTransitions';
import { BackgroundManager } from './visuals/backgroundManager';
import { MotionManager } from './visuals/motionManager';
import { PaletteManager } from './visuals/paletteManager';
import {
  StoryStateStore,
  createDefaultDebugState,
  type ChapterState,
  type StoryDebugPreset,
  type StoryDebugState,
} from './debug/storyStateStore';

type AppElements = {
  chapterMenu: HTMLElement;
  chapterOneButton: HTMLButtonElement;
  chapterTwoButton: HTMLButtonElement;
  chapterOneIncomplete: HTMLElement;
  chapterOneProgressNotes: HTMLElement;
  chapterOneProgressNotePrimary: HTMLElement;
  chapterOneProgressNoteSecondary: HTMLElement;
  chapterOneProgressNoteTertiary: HTMLElement;
  chapterOneSummary: HTMLElement;
  chapterOneLoreNotes: HTMLElement;
  chapterOneLorePrimary: HTMLElement;
  chapterOneLoreSecondary: HTMLElement;
  chapterOneLoreTertiary: HTMLElement;
  chapterOneAction: HTMLElement;
  chapterTwoOpenNote: HTMLElement;
  chapterTwoIncomplete: HTMLElement;
  chapterTwoSummary: HTMLElement;
  chapterTwoAction: HTMLElement;
  futureChapters: HTMLElement;
  replayDialog: HTMLDialogElement;
  replayDialogTitle: HTMLElement;
  replayDialogMessage: HTMLElement;
  replayDialogCancel: HTMLButtonElement;
  replayDialogConfirm: HTMLButtonElement;
  chapterTwoVideos: HTMLVideoElement[];
  sceneHeading: HTMLElement;
  storyDebug: HTMLElement;
  storyDebugToggle: HTMLButtonElement;
  storyDebugPanel: HTMLElement;
  storyDebugNotice: HTMLElement;
  storyDebugActiveBanner: HTMLElement;
  storyDebugStateOutput: HTMLElement;
  storyDebugLog: HTMLElement;
  storyDebugResetConfirm: HTMLElement;
  storyDebugImportText: HTMLTextAreaElement;
  storyDebugImportFile: HTMLInputElement;
  storyDebugMusic: HTMLElement;
  debugNextSignificant: HTMLButtonElement;
  storyMenuButton: HTMLButtonElement;
  screenTransition: HTMLElement;
  shell: HTMLElement;
  prose: HTMLElement;
  choices: HTMLElement;
  continueCue: HTMLElement;
  muteButton: HTMLButtonElement;
  replayButton: HTMLButtonElement;
  musicToggle: HTMLButtonElement;
  musicVolume: HTMLInputElement;
};

type ExperienceState = 'intro' | 'waiting' | 'revealing' | 'choosing';
type ScreenState = 'chapter_menu' | 'opening_bar' | 'chapter_02_fight';
type DebugNotebookMode = StoryDebugState['notebookView']['mode'];

const CHAPTER_ONE_VARIABLES = [
  'cigarette_state',
  'caught_can',
  'boasted_catch',
  'job_answer',
  'theft_answer',
  'smoked_edward',
  'fight_answer',
  'city_attitude',
] as const;

const CHAPTER_TWO_VARIABLES = [
  'visitor_identity',
  'visitor_motive',
  'identity_conflict',
  'motive_conflict',
  'edward_conflict',
  'memory_strain',
  'doubt',
  'delusion',
  'fracture',
  'selected_first',
  'selected_can',
  'selected_edward',
  'selected_response',
  'final_fight_answer',
  'first_memory_match',
  'can_memory_match',
] as const;

const LINE_REVEAL_DURATION_MS = 880;

const DEBUG_JUMP_POINTS = [
  ['opening_bar', 'Начало'],
  ['bar_edward_arrives', 'Появление Эдварда'],
  ['bar_work_comment', 'Разговор о работе'],
  ['edward_gets_wine', 'Банка вина'],
  ['firing_reason', 'Причина увольнения'],
  ['why_bothering', 'Почему пристал'],
  ['bar_story', 'История Эдварда'],
  ['rich_visitors', 'Богатые гости'],
  ['city_memory', 'Город - начало'],
  ['city_migration', 'Трудовая миграция'],
  ['city_fracture', 'Холодный металл'],
  ['industrialization_original', 'Индустриализация'],
  ['memory_question', 'Кто полез первым'],
  ['memory_break', 'Разрыв памяти'],
] as const;

const appRoot = queryOrThrow<HTMLElement>('#app');
const debugInitiallyAvailable =
  import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1';
const storyDebugMarkup = `
  <aside class="story-debug" id="story-debug" ${debugInitiallyAvailable ? '' : 'hidden'}>
    <button class="story-debug__tab" id="story-debug-toggle" type="button" aria-expanded="false">DEBUG</button>
    <div class="story-debug__panel" id="story-debug-panel" aria-hidden="true">
      <header class="story-debug__header">
        <div><strong>Debug</strong><span>Shift + D</span></div>
        <button type="button" data-debug-command="close" aria-label="Закрыть debug">×</button>
      </header>
      <div class="story-debug__active" id="story-debug-active" hidden>DEBUG-СОСТОЯНИЕ АКТИВНО</div>
      <div class="story-debug__notice" id="story-debug-notice" aria-live="polite">Готово.</div>

      <section class="story-debug__tool">
        <h3>Инструменты</h3>
        <p>Дебаг событий быстро доводит сцену до следующего значимого выбора.</p>
        <div class="story-debug__essentials">
          <button id="story-debug-fast-mode" type="button" data-debug-command="toggle-event-debug" aria-pressed="false">Дебаг событий: выкл</button>
          <button class="story-debug__danger" type="button" data-debug-command="simple-reset">Удалить прогресс и значения</button>
          <button class="story-debug__restart" type="button" data-debug-command="restart-current-chapter">Начать главу сначала</button>
        </div>
      </section>

      <section class="story-debug__quick" id="story-debug-quick" hidden>
        <header>
          <strong id="story-debug-quick-title">Быстрые ответы</strong>
          <button type="button" data-debug-command="close-quick" aria-label="Закрыть">×</button>
        </header>
        <p id="story-debug-quick-question">Выберите главу.</p>
        <div class="story-debug__quick-memory" id="story-debug-quick-memory"></div>
        <div class="story-debug__quick-options" id="story-debug-quick-options"></div>
      </section>

      <details class="story-debug__advanced" hidden>
        <summary>Дополнительно</summary>
        <div class="story-debug__advanced-body">

      <details open>
        <summary>Состояние истории</summary>
        <div class="story-debug__grid">
          <button type="button" data-debug-preset="empty">Пустая страница</button>
          <button type="button" data-debug-preset="chapter01-started">Первая начата</button>
          <button type="button" data-debug-preset="chapter01-random">Законченная первая - случайно</button>
          <button type="button" data-debug-preset="chapter01-custom">Законченная первая - настроить</button>
          <button type="button" data-debug-preset="chapter02-open">Вторая открыта</button>
          <button type="button" data-debug-preset="chapter02-started">Вторая начата</button>
          <button type="button" data-debug-preset="both-complete">Обе завершены - случайно</button>
          <button type="button" data-debug-preset="full">Полный вид</button>
        </div>
        <div class="story-debug__seed">
          <label>Seed <input id="story-debug-seed" data-debug-field="seed" type="text"></label>
          <button type="button" data-debug-command="new-seed">Новый</button>
          <button type="button" data-debug-command="copy-seed">Копировать</button>
        </div>
        <button class="story-debug__danger" type="button" data-debug-command="ask-reset">Сбросить всё</button>
        <div class="story-debug__confirm" id="story-debug-reset-confirm" hidden>
          <span>Точно очистить весь прогресс?</span>
          <button type="button" data-debug-command="confirm-reset">Очистить</button>
          <button type="button" data-debug-command="cancel-reset">Отмена</button>
        </div>
      </details>

      <details>
        <summary>Главы</summary>
        ${[1, 2].map((chapter) => `
          <fieldset class="story-debug__chapter">
            <legend>Глава ${chapter === 1 ? 'I - 02:43' : 'II - Кто первым полез?'}</legend>
            <label><input type="checkbox" data-debug-chapter="${chapter}" data-debug-chapter-field="unlocked"> Открыта</label>
            <label><input type="checkbox" data-debug-chapter="${chapter}" data-debug-chapter-field="started"> Начата</label>
            <label><input type="checkbox" data-debug-chapter="${chapter}" data-debug-chapter-field="completed"> Завершена</label>
            <div class="story-debug__row">
              <button type="button" data-debug-open-chapter="${chapter}">Открыть</button>
              <button type="button" data-debug-restart-chapter="${chapter}">Перезапустить</button>
              <button type="button" data-debug-clear-chapter="${chapter}">Очистить</button>
            </div>
          </fieldset>`).join('')}
        <label><input type="checkbox" id="story-debug-ignore-deps" data-debug-field="ignoreChapterDependencies"> Игнорировать зависимости глав</label>
      </details>

      <details id="story-debug-chapter01-choices">
        <summary>Глава I - выборы</summary>
        <div class="story-debug__form">
          <label>Сигарета<select data-debug-choice="chapter01.cigarette_state"><option value="untouched">Не тронута</option><option value="smoked">Выкурена</option><option value="ashed">Пепел стряхнут</option></select></label>
          <label>Банка<select data-debug-choice="chapter01.caught_can"><option value="true">Нилл поймал</option><option value="false">Банка упала</option></select></label>
          <label><input type="checkbox" data-debug-choice="chapter01.boasted_catch"> Нилл похвастался</label>
          <label>Работа<select data-debug-choice="chapter01.job_answer"><option value="downsized">«Сократили»</option><option value="fired">Уволили</option><option value="deflected">Ушёл от ответа</option></select></label>
          <label>Кража<select data-debug-choice="chapter01.theft_answer"><option value="honest">Кража</option><option value="almost">Почти кража</option><option value="euphemism">Разногласия об инвентаре</option></select></label>
          <label><input type="checkbox" data-debug-choice="chapter01.smoked_edward"> Эдвард кашлял из-за Нилла</label>
          <label>Кто полез<select data-debug-choice="chapter01.fight_answer"><option value="self">Нилл</option><option value="other">Посетитель</option><option value="unknown">Не помнит</option></select></label>
          <label>Город<select data-debug-choice="chapter01.city_attitude"><option value="home">Почти дом</option><option value="hole">Отвратительная дыра</option><option value="escape">Можно выбраться</option></select></label>
        </div>
        <label><input type="checkbox" id="story-debug-live-update" checked> Обновлять сразу</label>
        <div class="story-debug__row">
          <button type="button" data-debug-command="randomize-chapter01">Рандомизировать</button>
          <button type="button" data-debug-command="apply-choices">Применить</button>
          <button type="button" data-debug-command="restore-choices">Вернуть сохранённые</button>
          <button type="button" data-debug-command="reset-chapter01-choices">Сбросить ответы</button>
        </div>
      </details>

      <details>
        <summary>Глава II - выборы</summary>
        <div class="story-debug__form">
          <label>Первое движение<select data-debug-choice="chapter02.selected_first"><option value="self">Нилл первым</option><option value="other">Посетитель первым</option><option value="unknown">Никто</option></select></label>
          <label>Банка<select data-debug-choice="chapter02.selected_can"><option value="hand">В руке</option><option value="floor">На полу</option><option value="kick">Отброшена ботинком</option></select></label>
          <label>Эдвард<select data-debug-choice="chapter02.selected_edward"><option value="intervened">Вмешался</option><option value="door">У двери</option><option value="absent">Его не было</option></select></label>
          <label>Ответ в драке<select data-debug-choice="chapter02.selected_response"><option value="bottle">Бутылка</option><option value="hold">Захват</option><option value="evade">Уклонение</option></select></label>
          <label>Финальный ответ<select data-debug-choice="chapter02.final_fight_answer"><option value="self">Я</option><option value="other">Он</option><option value="unknown">Не помню</option><option value="repeated">Ты уже спрашивал</option></select></label>
          ${['doubt', 'delusion', 'fracture'].map((name) => `<label>${name}<input type="number" min="0" max="5" step="1" data-debug-memory="${name}"></label>`).join('')}
          <output id="story-debug-outcome"></output>
        </div>
        <div class="story-debug__row">
          <button type="button" data-debug-command="randomize-chapter02">Рандомизировать</button>
          <button type="button" data-debug-outcome="normal">Обычное</button>
          <button type="button" data-debug-outcome="collapse">Распад</button>
          <button type="button" data-debug-outcome="perfect">Подогнанная</button>
          <button type="button" data-debug-outcome="unsupported">Без причины</button>
        </div>
      </details>

      <details>
        <summary>Отображение меню</summary>
        <div class="story-debug__row">
          <button type="button" data-debug-view="clean">Чистый</button><button type="button" data-debug-view="normal">Обычный</button><button type="button" data-debug-view="full">Полный</button><button type="button" data-debug-view="structure">Структура</button><button type="button" data-debug-view="summaries">Пересказы</button><button type="button" data-debug-view="lore">Лор</button>
        </div>
        <label><input type="checkbox" data-debug-view-option="disableAnimations"> Отключить анимации</label>
        <label><input type="checkbox" data-debug-view-option="revealAllText"> Мгновенно проявить текст</label>
      </details>

      <details>
        <summary>Навигация</summary>
        <div class="story-debug__grid">
          <button type="button" data-debug-nav="menu">Открыть меню</button>
          <button type="button" data-debug-nav="chapter01">Глава I с начала</button>
          <button type="button" data-debug-nav="chapter02">Глава II с начала</button>
          ${DEBUG_JUMP_POINTS.map(([path, label]) => `<button type="button" data-debug-path="${path}">${label}</button>`).join('')}
          ${[['check_first_memory','Первый конфликт памяти'],['can_memory','Банка - глава II'],['edward_memory','Выбор Эдварда'],['fight_end','Финальный вопрос'],['probability_collapse','Распад воспоминания'],['perfect_version','Подогнанная память']].map(([path,label]) => `<button type="button" data-debug-path="${path}" data-debug-path-chapter="2">${label}</button>`).join('')}
        </div>
      </details>

      <details>
        <summary>Текущее состояние</summary>
        <pre class="story-debug__state" id="story-debug-state"></pre>
        <textarea id="story-debug-import-text" rows="8" placeholder="Вставить JSON"></textarea>
        <input id="story-debug-import-file" type="file" accept="application/json,.json" hidden>
        <div class="story-debug__row">
          <button type="button" data-debug-command="copy-json">Копировать JSON</button>
          <button type="button" data-debug-command="import-json">Импортировать текст</button>
          <button type="button" data-debug-command="export-file">Скачать</button>
          <button type="button" data-debug-command="choose-file">Загрузить файл</button>
        </div>
      </details>

      <details>
        <summary>Debug override</summary>
        <div class="story-debug__row">
          <button type="button" data-debug-command="restore-backup">Вернуться к состоянию до debug</button>
          <button type="button" data-debug-command="commit-debug">Сохранить debug как основной</button>
          <button type="button" data-debug-command="remove-override">Удалить override</button>
        </div>
      </details>

      <details>
        <summary>Music</summary>
        <pre class="story-debug__state" id="story-debug-music"></pre>
        <div class="story-debug__row">
          <button type="button" data-debug-music="start fight_memory">Play</button>
          <button type="button" data-debug-music="pause fight_memory">Pause</button>
          <button type="button" data-debug-music="stop fight_memory">Stop</button>
          <button type="button" data-debug-music="restart">Restart</button>
          <button type="button" data-debug-music="seek-relative -10">Seek −10s</button>
          <button type="button" data-debug-music="seek-relative 10">Seek +10s</button>
          <button type="button" data-debug-music="duck 0.16">Duck</button>
          <button type="button" data-debug-music="restore">Restore</button>
          <button type="button" data-debug-music="desync">Desync</button>
          <button type="button" data-debug-music="resync">Resync</button>
          <button type="button" data-debug-music="cut">Cut</button>
        </div>
      </details>

      <details>
        <summary>Журнал</summary>
        <ol class="story-debug__log" id="story-debug-log"></ol>
        <button type="button" data-debug-command="clear-log">Очистить журнал</button>
      </details>
        </div>
      </details>
    </div>
  </aside>`;
appRoot.innerHTML = `
  <main class="chapter-page chapter-menu-page" id="chapter-menu">
    <div class="notebook-ambience notebook-ambience--chapter-one" aria-hidden="true"></div>
    <div class="notebook-ambience notebook-ambience--chapter-two" aria-hidden="true"></div>
    <div class="notebook-page">
      <header class="notebook-header notebook-reveal notebook-reveal--header">
        <h1>Записи Нилла</h1>
        <span class="notebook-page-number">стр. 1</span>
      </header>

      <div class="notebook-entries" aria-label="Записи воспоминаний">
        <button class="notebook-entry notebook-entry--one" id="chapter-one-button" type="button">
          <span class="notebook-entry__roman notebook-reveal notebook-reveal--title">Глава I</span>
          <span class="notebook-entry__title notebook-entry__title--time notebook-reveal notebook-reveal--title">02:43</span>
          <span class="notebook-incomplete notebook-reveal notebook-reveal--notes" id="chapter-one-incomplete" hidden>запись не закончена</span>
          <span class="notebook-progress-notes notebook-reveal notebook-reveal--notes" id="chapter-one-progress-notes" hidden>
            <span id="chapter-one-progress-note-primary"></span>
            <span id="chapter-one-progress-note-secondary"></span>
            <span id="chapter-one-progress-note-tertiary"></span>
          </span>
          <span class="notebook-summary notebook-reveal notebook-reveal--notes" id="chapter-one-summary" hidden>
            Нилл остаётся в баре с Эдвардом после потери работы. Он вспоминает драку, которая случилась позже.
          </span>
          <span class="notebook-lore-notes notebook-reveal notebook-reveal--memory" id="chapter-one-lore-notes" hidden>
            <span id="chapter-one-lore-primary"></span>
            <span id="chapter-one-lore-secondary"></span>
            <span id="chapter-one-lore-tertiary"></span>
          </span>
          <span class="notebook-action notebook-reveal notebook-reveal--action" id="chapter-one-action">начать</span>
        </button>

        <button class="notebook-entry notebook-entry--two" id="chapter-two-button" type="button" hidden>
          <span class="notebook-entry__roman notebook-reveal--chapter-two-label">Глава II</span>
          <span class="notebook-entry__title notebook-reveal--chapter-two-title">Кто первым полез?</span>
          <span class="notebook-entry__hint notebook-reveal--chapter-two-note" id="chapter-two-open-note">
            <span>Нилл помнит, чем всё закончилось.</span>
            <span>Начало каждый раз меняется.</span>
          </span>
          <span class="notebook-incomplete notebook-reveal--chapter-two-note" id="chapter-two-incomplete" hidden>запись не закончена</span>
          <span class="notebook-summary notebook-reveal--chapter-two-note" id="chapter-two-summary" hidden>
            Нилл возвращается к воспоминанию о драке и пытается восстановить, кто начал её первым.
          </span>
          <span class="notebook-action notebook-reveal--chapter-two-action" id="chapter-two-action">вспомнить</span>
        </button>

        <section class="notebook-future" id="notebook-future" aria-label="Будущие записи" hidden>
          <div class="notebook-future__entry">
            <span class="notebook-entry__roman">Глава III</span>
            <span class="notebook-future__title">Прямая дорога, движение</span>
            <span class="notebook-future__status">в разработке</span>
          </div>
          <div class="notebook-future__entry">
            <span class="notebook-entry__roman">Глава IV</span>
            <span class="notebook-future__title">Ничего нового не открыли</span>
            <span class="notebook-future__status">в разработке</span>
          </div>
          <div class="notebook-future__entry">
            <span class="notebook-entry__roman">Глава V</span>
            <span class="notebook-future__title">МАЯК-01</span>
            <span class="notebook-future__status">в разработке</span>
          </div>
        </section>
      </div>
    </div>
  </main>

  <dialog class="chapter-replay-dialog" id="chapter-replay-dialog" aria-labelledby="chapter-replay-title" aria-describedby="chapter-replay-message">
    <div class="chapter-replay-dialog__body">
      <span class="chapter-replay-dialog__eyebrow">Записи</span>
      <h2 id="chapter-replay-title">Переиграть главу?</h2>
      <p id="chapter-replay-message"></p>
      <div class="chapter-replay-dialog__actions">
        <button type="button" id="chapter-replay-cancel">Отмена</button>
        <button type="button" id="chapter-replay-confirm">Начать сначала</button>
      </div>
    </div>
  </dialog>

  <main class="app-shell palette-bar-warm" id="app-shell" hidden>
    <div class="atmosphere" id="atmosphere">
      <div class="bg-gradient"></div>
      <div class="bg-shape-a"></div>
      <div class="bg-shape-b"></div>
      <div class="bg-shape-c"></div>
      <div class="bg-grain"></div>
      <div class="archive-field" aria-hidden="true">
        <video class="archive-video" muted loop playsinline preload="none" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback nofullscreen" tabindex="-1">
          <source src="video/city-archive.mp4" type="video/mp4">
        </video>
        <video class="archive-neon-video" muted playsinline preload="none" aria-hidden="true" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback nofullscreen" tabindex="-1">
          <source src="video/city-neon-overlay.webm" type="video/webm">
          <source src="video/city-neon-overlay.mp4" type="video/mp4">
        </video>
        <div class="archive-spectrum"></div>
        <div class="archive-lattice"></div>
        <div class="archive-rift"></div>
        <div class="archive-threads"></div>
        <div class="archive-vignette"></div>
      </div>
    </div>

    <div class="chapter-fight-background" aria-hidden="true">
      <video class="chapter-fight-background__video" muted loop playsinline preload="none" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback nofullscreen" tabindex="-1">
        <source src="video/chapter-02-chaos.mp4" type="video/mp4">
      </video>
    </div>

    <button class="mute-button" id="mute-button" type="button" aria-label="Выключить музыку">
      <span aria-hidden="true">звук</span>
    </button>
    <button class="replay-button" id="replay-button" type="button" aria-label="Начать сцену заново">
      реплей
    </button>
    <button class="story-menu-button" id="story-menu-button" type="button" aria-label="Вернуться к записям">
      записи
    </button>
    <div class="music-settings" id="music-settings">
      <button id="music-toggle" type="button">музыка</button>
      <input id="music-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Громкость музыки">
    </div>

    <section class="narrative-panel" aria-live="polite" aria-atomic="false">
      <div class="scene-time" id="scene-heading">02:43</div>
      <div class="prose" id="prose"></div>
      <div class="choices" id="choices"></div>
      <div class="continue-cue" id="continue-cue" aria-hidden="true">
        <span></span>
      </div>
      <button class="debug-next-significant" id="debug-next-significant" type="button" hidden>
        к значимому выбору
      </button>
    </section>
  </main>
  ${storyDebugMarkup}
  <div class="screen-transition" id="screen-transition" aria-hidden="true">
    <div class="screen-transition__media screen-transition__media--fracture" aria-hidden="true">
      <video muted loop playsinline preload="none" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback nofullscreen" tabindex="-1" data-transition-media="fracture">
        <source src="video/chapter-02-hyperbolic.webm" type="video/webm">
        <source src="video/chapter-02-hyperbolic.mp4" type="video/mp4">
      </video>
    </div>
    <div class="screen-transition__veil" aria-hidden="true"></div>
  </div>
`;

const elements: AppElements = {
  chapterMenu: queryOrThrow<HTMLElement>('#chapter-menu'),
  chapterOneButton: queryOrThrow<HTMLButtonElement>('#chapter-one-button'),
  chapterTwoButton: queryOrThrow<HTMLButtonElement>('#chapter-two-button'),
  chapterOneIncomplete: queryOrThrow<HTMLElement>('#chapter-one-incomplete'),
  chapterOneProgressNotes: queryOrThrow<HTMLElement>('#chapter-one-progress-notes'),
  chapterOneProgressNotePrimary: queryOrThrow<HTMLElement>('#chapter-one-progress-note-primary'),
  chapterOneProgressNoteSecondary: queryOrThrow<HTMLElement>('#chapter-one-progress-note-secondary'),
  chapterOneProgressNoteTertiary: queryOrThrow<HTMLElement>('#chapter-one-progress-note-tertiary'),
  chapterOneSummary: queryOrThrow<HTMLElement>('#chapter-one-summary'),
  chapterOneLoreNotes: queryOrThrow<HTMLElement>('#chapter-one-lore-notes'),
  chapterOneLorePrimary: queryOrThrow<HTMLElement>('#chapter-one-lore-primary'),
  chapterOneLoreSecondary: queryOrThrow<HTMLElement>('#chapter-one-lore-secondary'),
  chapterOneLoreTertiary: queryOrThrow<HTMLElement>('#chapter-one-lore-tertiary'),
  chapterOneAction: queryOrThrow<HTMLElement>('#chapter-one-action'),
  chapterTwoOpenNote: queryOrThrow<HTMLElement>('#chapter-two-open-note'),
  chapterTwoIncomplete: queryOrThrow<HTMLElement>('#chapter-two-incomplete'),
  chapterTwoSummary: queryOrThrow<HTMLElement>('#chapter-two-summary'),
  chapterTwoAction: queryOrThrow<HTMLElement>('#chapter-two-action'),
  futureChapters: queryOrThrow<HTMLElement>('#notebook-future'),
  replayDialog: queryOrThrow<HTMLDialogElement>('#chapter-replay-dialog'),
  replayDialogTitle: queryOrThrow<HTMLElement>('#chapter-replay-title'),
  replayDialogMessage: queryOrThrow<HTMLElement>('#chapter-replay-message'),
  replayDialogCancel: queryOrThrow<HTMLButtonElement>('#chapter-replay-cancel'),
  replayDialogConfirm: queryOrThrow<HTMLButtonElement>('#chapter-replay-confirm'),
  sceneHeading: queryOrThrow<HTMLElement>('#scene-heading'),
  chapterTwoVideos: Array.from(
    document.querySelectorAll<HTMLVideoElement>('#app-shell .chapter-fight-background video'),
  ),
  storyDebug: queryOrThrow<HTMLElement>('#story-debug'),
  storyDebugToggle: queryOrThrow<HTMLButtonElement>('#story-debug-toggle'),
  storyDebugPanel: queryOrThrow<HTMLElement>('#story-debug-panel'),
  storyDebugNotice: queryOrThrow<HTMLElement>('#story-debug-notice'),
  storyDebugActiveBanner: queryOrThrow<HTMLElement>('#story-debug-active'),
  storyDebugStateOutput: queryOrThrow<HTMLElement>('#story-debug-state'),
  storyDebugLog: queryOrThrow<HTMLElement>('#story-debug-log'),
  storyDebugResetConfirm: queryOrThrow<HTMLElement>('#story-debug-reset-confirm'),
  storyDebugImportText: queryOrThrow<HTMLTextAreaElement>('#story-debug-import-text'),
  storyDebugImportFile: queryOrThrow<HTMLInputElement>('#story-debug-import-file'),
  storyDebugMusic: queryOrThrow<HTMLElement>('#story-debug-music'),
  debugNextSignificant: queryOrThrow<HTMLButtonElement>('#debug-next-significant'),
  storyMenuButton: queryOrThrow<HTMLButtonElement>('#story-menu-button'),
  screenTransition: queryOrThrow<HTMLElement>('#screen-transition'),
  shell: queryOrThrow<HTMLElement>('#app-shell'),
  prose: queryOrThrow<HTMLElement>('#prose'),
  choices: queryOrThrow<HTMLElement>('#choices'),
  continueCue: queryOrThrow<HTMLElement>('#continue-cue'),
  muteButton: queryOrThrow<HTMLButtonElement>('#mute-button'),
  replayButton: queryOrThrow<HTMLButtonElement>('#replay-button'),
  musicToggle: queryOrThrow<HTMLButtonElement>('#music-toggle'),
  musicVolume: queryOrThrow<HTMLInputElement>('#music-volume'),
};

const motionManager = new MotionManager();
const backgroundManager = new BackgroundManager(elements.shell, motionManager);
const paletteManager = new PaletteManager(elements.shell);
const renderer = new Renderer({
  prose: elements.prose,
  choices: elements.choices,
});
const saveManager = new SaveManager(STORY_CONFIG.saveKey);
const chapterProgressManager = new ChapterProgressManager(STORY_CONFIG.chapterProgressKey);
const audioManager = new AudioManager(AUDIO_CONFIG);
const musicManager = new MusicManager();

backgroundManager.start();
for (const video of document.querySelectorAll<HTMLVideoElement>(
  '.archive-field video, .chapter-fight-background video',
)) {
  video.controls = false;
  video.disablePictureInPicture = true;
  video.disableRemotePlayback = true;
  video.addEventListener('enterpictureinpicture', () => {
    if (document.pictureInPictureElement === video) {
      void document.exitPictureInPicture().catch(() => undefined);
    }
  });
}
void boot();

async function boot(): Promise<void> {
  const loaded = saveManager.load();
  const storyTextCatalog = await loadStoryTextCatalog(STORY_CONFIG.lineTextCatalog);
  musicManager.restoreState(loaded?.musicState);
  let chapterProgress: ChapterProgress = chapterProgressManager.load();
  if (
    loaded?.activeChapter === 1 &&
    loaded.screenState === 'opening_bar' &&
    [loaded.bufferedLine, ...loaded.pendingLines, ...loaded.transcript].some(
      (line) => line?.lineId?.startsWith('bar_'),
    ) &&
    !chapterProgress.startedChapters.includes(1) &&
    !chapterProgress.completedChapters.includes(1)
  ) {
    chapterProgress.startedChapters = toggleChapter(chapterProgress.startedChapters, 1, true);
    chapterProgressManager.save(chapterProgress);
  }
  const initialDebugState = createDefaultDebugState();
  initialDebugState.chapters.chapter01 = {
    unlocked: true,
    started: chapterProgress.startedChapters.includes(1),
    completed: chapterProgress.completedChapters.includes(1),
  };
  initialDebugState.chapters.chapter02 = {
    unlocked: chapterProgress.unlockedChapters.includes(2),
    started: chapterProgress.startedChapters.includes(2),
    completed: chapterProgress.completedChapters.includes(2),
  };
  initialDebugState.choices.chapter01 = {
    ...initialDebugState.choices.chapter01,
    ...chapterProgress.chapter1Variables,
  } as StoryDebugState['choices']['chapter01'];
  initialDebugState.choices.chapter02 = {
    ...initialDebugState.choices.chapter02,
    ...chapterProgress.chapter2Variables,
  } as StoryDebugState['choices']['chapter02'];
  initialDebugState.memory = {
    ...initialDebugState.memory,
    ...chapterProgress.chapter2Variables,
  } as StoryDebugState['memory'];
  const debugStore = new StoryStateStore('nill-quest-debug-override', initialDebugState);
  let debugOverrideActive = localStorage.getItem('nill-quest-debug-override') !== null;
  let debugNotebookMode: DebugNotebookMode = debugStore.getState().notebookView.mode;
  let activeChapter: 1 | 2 = loaded?.activeChapter ?? 1;
  let unreliableState: UnreliableState = loaded?.unreliableState ?? createInitialUnreliableState();
  let transcript: NarrativeLine[] = refreshSavedLines(
    normalizeLegacyDialogue(loaded?.transcript ?? []),
    storyTextCatalog,
  );
  let pendingLines: NarrativeLine[] = refreshSavedLines(
    normalizeLegacyDialogue(loaded?.pendingLines ?? []),
    storyTextCatalog,
  );
  let pendingChoices: StoryChoice[] = loaded?.pendingChoices ?? [];
  let pendingChoiceSignificant = false;
  let pendingChoiceRewrite: string | undefined;
  let pendingEnd = loaded?.pendingEnd ?? false;
  let choiceCheckpoint: ChoiceCheckpoint | undefined = loaded?.choiceCheckpoint
    ? {
        ...loaded.choiceCheckpoint,
        transcript: refreshSavedLines(
          normalizeLegacyDialogue(loaded.choiceCheckpoint.transcript),
          storyTextCatalog,
        ),
      }
    : undefined;
  let fightMemoryCheckpoint: ChoiceCheckpoint | undefined = loaded?.fightMemoryCheckpoint?.checkpointId === 'fight-impact'
    ? {
        ...loaded.fightMemoryCheckpoint,
        transcript: refreshSavedLines(
          normalizeLegacyDialogue(loaded.fightMemoryCheckpoint.transcript),
          storyTextCatalog,
        ),
      }
    : undefined;
  let choiceIsLocked = loaded?.choiceIsLocked ?? false;
  let isAdvancing = false;
  let experienceState: ExperienceState = 'intro';
  let skipBeatRequested = false;
  let debugFastMode = localStorage.getItem('nill-debug-fast-mode') === '1';
  let debugFastForwarding = false;
  let suppressPersistence = false;
  let finishPendingDelay: (() => void) | null = null;
  const storyScrollTop: Record<1 | 2, number> = {
    1: Math.max(0, Number(loaded?.storyScrollTop?.chapter1) || 0),
    2: Math.max(0, Number(loaded?.storyScrollTop?.chapter2) || 0),
  };

  let runtime = new InkRuntime();
  await runtime.init(
    STORY_CONFIG.source,
    loaded?.storyStateJson,
    refreshSavedLine(loaded?.bufferedLine, storyTextCatalog),
  );
  if (pendingChoices.length > 0 && runtime.getChoices().length > 0) {
    pendingChoices = runtime.getChoices();
  }

  const inferRuntimeChapter = (): 1 | 2 | null => {
    const path = runtime.getCurrentPath();
    if (path.includes('chapter_02_fight')) return 2;
    if (path.includes('opening_bar')) return 1;

    // Ink may report an empty path at a choice or at END. Line ids remain a
    // reliable ownership marker and protect the menu from stale save metadata.
    const latestOwnedLine = [...pendingLines, ...transcript]
      .reverse()
      .find((line) => line.lineId?.startsWith('bar_') || line.lineId?.startsWith('fight_'));
    if (latestOwnedLine?.lineId?.startsWith('fight_')) return 2;
    if (latestOwnedLine?.lineId?.startsWith('bar_')) return 1;
    return null;
  };
  if (pendingChoices.length > 0) {
    pendingChoiceSignificant = runtime.isCurrentChoiceSignificant();
    pendingChoiceRewrite = runtime.getCurrentChoiceRewrite();
  }

  let syncChapterDebug = (): void => undefined;
  let syncRealProgressToDebug = (): void => undefined;

  const updateChapterMenu = (): void => {
    const remembered = chapterProgress.chapter1Variables;
    const chapterOneStarted = chapterProgress.startedChapters.includes(1);
    const chapterOneCompleted = chapterProgress.completedChapters.includes(1);
    const chapterTwoUnlocked = chapterProgress.unlockedChapters.includes(2);
    const chapterTwoStarted = chapterProgress.startedChapters.includes(2);
    const chapterTwoCompleted = chapterProgress.completedChapters.includes(2);

    elements.chapterOneButton.dataset.chapterState = chapterOneCompleted
      ? 'completed'
      : chapterOneStarted
        ? 'started'
        : 'new';
    elements.chapterOneButton.disabled = false;
    elements.chapterOneIncomplete.hidden = !chapterOneStarted || chapterOneCompleted;
    elements.chapterOneSummary.hidden = !chapterOneCompleted;
    elements.chapterOneAction.textContent = chapterOneCompleted
      ? 'переиграть'
      : chapterOneStarted
        ? 'продолжить'
        : 'начать';

    if (debugNotebookMode === 'normal') {
      delete elements.chapterMenu.dataset.notebookMode;
    } else {
      elements.chapterMenu.dataset.notebookMode = debugNotebookMode;
    }

    const fightNotes: Record<string, string> = {
      self: 'Нилл утверждает, что полез первым.',
      other: 'Нилл утверждает, что первым полез посетитель.',
      unknown: 'Нилл не назвал того, кто начал драку.',
    };
    const jobNotes: Record<string, string> = {
      fired: 'Нилла уволили.',
      downsized: 'Нилла «сократили».',
    };
    const fightNote =
      typeof remembered.fight_answer === 'string'
        ? (fightNotes[remembered.fight_answer] ?? '')
        : '';
    const canNote =
      remembered.caught_can === true
        ? 'Банка осталась у Нилла.'
        : remembered.caught_can === false
          ? 'Банка упала на пол.'
          : '';
    const jobNote =
      typeof remembered.job_answer === 'string' ? (jobNotes[remembered.job_answer] ?? '') : '';

    const hasReachedLine = (prefix: string): boolean =>
      transcript.some((line) => line.lineId?.startsWith(prefix));
    const progressNotes: string[] = [];
    if (hasReachedLine('bar_cigarette_smoked_')) {
      progressNotes.push('Сигарета стала короче.');
    } else if (hasReachedLine('bar_cigarette_ashed_')) {
      progressNotes.push('Пепел стряхнут.');
    } else if (hasReachedLine('bar_cigarette_untouched_')) {
      progressNotes.push('Сигарета осталась в руке.');
    }
    if (hasReachedLine('bar_nill_03a')) {
      progressNotes.push('Он сказал: «сократили».');
    } else if (hasReachedLine('bar_nill_03b')) {
      progressNotes.push('Работы больше нет.');
    } else if (hasReachedLine('bar_nill_03c')) {
      progressNotes.push('Об увольнении он говорить не стал.');
    }
    if (hasReachedLine('bar_can_caught_')) {
      progressNotes.push('Банка осталась у Нилла.');
    } else if (hasReachedLine('bar_can_dropped_')) {
      progressNotes.push('Банка упала на пол.');
    }
    if (hasReachedLine('bar_theft_honest_')) {
      progressNotes.push('Он назвал это кражей.');
    } else if (hasReachedLine('bar_theft_almost_')) {
      progressNotes.push('Он назвал это почти кражей.');
    } else if (hasReachedLine('bar_theft_euphemism_')) {
      progressNotes.push('Он назвал это разногласием.');
    }
    if (hasReachedLine('bar_smoke_edward_')) {
      progressNotes.push('Эдварду достался дым.');
    }
    if (hasReachedLine('bar_city_home_')) {
      progressNotes.push('Этот район - почти дом.');
    } else if (hasReachedLine('bar_city_hole_')) {
      progressNotes.push('Этот район - дыра.');
    } else if (hasReachedLine('bar_city_escape_')) {
      progressNotes.push('Отсюда ещё можно выбраться.');
    }
    if (hasReachedLine('bar_fight_self_')) {
      progressNotes.push('Первым полез Нилл.');
    } else if (hasReachedLine('bar_fight_other_')) {
      progressNotes.push('Первым полез посетитель.');
    } else if (hasReachedLine('bar_fight_unknown_')) {
      progressNotes.push('Кто полез первым - неясно.');
    }

    const visibleProgressNotes = progressNotes.slice(-3);
    const progressNoteElements = [
      elements.chapterOneProgressNotePrimary,
      elements.chapterOneProgressNoteSecondary,
      elements.chapterOneProgressNoteTertiary,
    ];
    progressNoteElements.forEach((element, index) => {
      element.textContent = visibleProgressNotes[index] ?? '';
      element.hidden = !visibleProgressNotes[index];
    });
    elements.chapterOneProgressNotes.hidden =
      !chapterOneStarted || chapterOneCompleted || visibleProgressNotes.length === 0;

    const loreLimit = debugNotebookMode === 'full' ? 3 : 2;
    const loreLines = [fightNote, canNote, jobNote].filter(Boolean).slice(0, loreLimit);
    const loreElements = [
      elements.chapterOneLorePrimary,
      elements.chapterOneLoreSecondary,
      elements.chapterOneLoreTertiary,
    ];
    loreElements.forEach((element, index) => {
      element.textContent = loreLines[index] ?? '';
      element.hidden = !loreLines[index];
    });
    const showLoreNotes =
      chapterOneCompleted && (debugNotebookMode === 'full' || loreLines.length > 0);
    elements.chapterOneLoreNotes.hidden = !showLoreNotes;

    elements.chapterTwoButton.hidden = !chapterTwoUnlocked;
    elements.chapterTwoButton.disabled = !chapterTwoUnlocked;
    elements.chapterTwoButton.dataset.chapterState = chapterTwoCompleted
      ? 'completed'
      : chapterTwoStarted
        ? 'started'
        : 'new';
    elements.chapterTwoOpenNote.hidden = chapterTwoStarted || chapterTwoCompleted;
    elements.chapterTwoIncomplete.hidden = !chapterTwoStarted || chapterTwoCompleted;
    elements.chapterTwoSummary.hidden = !chapterTwoCompleted;
    elements.chapterTwoAction.textContent = chapterTwoCompleted
      ? 'переиграть'
      : chapterTwoStarted
        ? 'продолжить'
        : 'вспомнить';
    elements.futureChapters.hidden = !chapterTwoCompleted;
    syncChapterDebug();
  };

  const setScreen = (screen: ScreenState, scrollTop = 0): void => {
    appRoot.dataset.screen = screen;
    elements.chapterMenu.hidden = screen !== 'chapter_menu';
    if (screen !== 'chapter_menu') {
      // Keep entrance animation class off while menu is hidden. Otherwise,
      // returning to menu can retrigger reveal on unhide and then again when
      // playChapterMenuEntrance() runs.
      elements.chapterMenu.classList.remove('is-entering');
    }
    elements.shell.hidden = screen !== 'opening_bar' && screen !== 'chapter_02_fight';
    elements.shell.dataset.chapter = String(activeChapter);
    elements.debugNextSignificant.hidden = !debugFastMode || screen === 'chapter_menu';
    const isChapterTwo = screen === 'chapter_02_fight';
    audioManager.setStoryEffectGain(isChapterTwo ? 1.45 : 1);
    elements.sceneHeading.textContent = isChapterTwo ? 'Кто первым полез?' : '02:43';
    elements.sceneHeading.classList.toggle('is-chapter-title', isChapterTwo);
    for (const video of elements.chapterTwoVideos) {
      if (screen === 'chapter_02_fight' && !motionManager.isReduced()) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }
    window.scrollTo({ top: scrollTop, behavior: 'auto' });
  };

  const playChapterMenuEntrance = (): void => {
    window.clearTimeout(chapterMenuEntranceTimer);
    elements.chapterMenu.classList.remove('is-entering');
    void elements.chapterMenu.offsetWidth;
    elements.chapterMenu.classList.add('is-entering');
    chapterMenuEntranceTimer = window.setTimeout(() => {
      elements.chapterMenu.classList.remove('is-entering');
    }, 2900);
  };

  let chapterMenuEntranceTimer: number | undefined;

  const waitMs = (durationMs: number): Promise<void> =>
    new Promise((resolve) => window.setTimeout(resolve, durationMs));

  const toChapterScreenState = (screen: ScreenState | string | undefined): ChapterScreenState => {
    if (screen === 'opening_bar' || screen === 'chapter_02_fight') {
      return screen;
    }
    return 'chapter_menu';
  };

  const waitForOpacityTransition = (element: HTMLElement, timeoutMs: number): Promise<void> =>
    new Promise((resolve) => {
      const finish = (): void => {
        element.removeEventListener('transitionend', onEnd);
        window.clearTimeout(timer);
        resolve();
      };
      const onEnd = (event: TransitionEvent): void => {
        if (event.target === element && event.propertyName === 'opacity') {
          finish();
        }
      };
      const timer = window.setTimeout(finish, timeoutMs);
      element.addEventListener('transitionend', onEnd);
    });

  const waitForPaint = (): Promise<void> =>
    new Promise((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });

  const preloadChapterTwoVisuals = async (timeoutMs = 6_000): Promise<void> => {
    await Promise.all(elements.chapterTwoVideos.map((video) => new Promise<void>((resolve) => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        resolve();
        return;
      }

      let settled = false;
      const finish = (): void => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        video.removeEventListener('loadeddata', finish);
        video.removeEventListener('error', finish);
        resolve();
      };
      const timer = window.setTimeout(finish, timeoutMs);
      video.addEventListener('loadeddata', finish, { once: true });
      video.addEventListener('error', finish, { once: true });
      video.preload = 'auto';
      video.load();
    })));
  };

  const setTransitionMediaActive = (_visual: 'to-menu' | 'to-bar' | 'to-fight' | 'fracture', _active: boolean): void => {
    const videos = overlay.querySelectorAll<HTMLVideoElement>('video[data-transition-media]');
    const enableVideos = false;

    for (const video of videos) {
      if (enableVideos) {
        video.playbackRate = 1.08;
        video.currentTime = 0;
        void video.play().catch(() => undefined);
      } else {
        video.pause();
        video.playbackRate = 1;
        video.currentTime = 0;
      }
    }
  };

  const syncContinueCueVisibility = (): void => {
    elements.continueCue.classList.toggle(
      'is-hidden',
      screenTransitioning || experienceState === 'choosing' || experienceState === 'revealing',
    );
  };

  let screenTransitioning = false;
  const overlay = elements.screenTransition;
  const transitionToScreen = async (
    screen: ScreenState,
    scrollTop = 0,
    whileCovered?: () => void | Promise<void>,
  ): Promise<void> => {
    if (screenTransitioning) return;
    if (motionManager.isReduced()) {
      await whileCovered?.();
      if (screen === 'chapter_menu') {
        playChapterMenuEntrance();
      }
      setScreen(screen, scrollTop);
      return;
    }

    screenTransitioning = true;
    syncContinueCueVisibility();
    const fromScreen = toChapterScreenState(appRoot.dataset.screen);
    const toScreen = toChapterScreenState(screen);
    const visual = resolveTransitionVisual(fromScreen, toScreen, activeChapter);

    overlay.dataset.transition = visual;
    overlay.style.setProperty('--screen-fade-in-ms', `${CHAPTER_TRANSITION.fadeInMs}ms`);
    overlay.style.setProperty('--screen-fade-out-ms', `${CHAPTER_TRANSITION.fadeOutMs}ms`);

    try {
      setTransitionMediaActive(visual, true);
      overlay.classList.remove('is-revealing', 'is-held');
      overlay.classList.add('is-active');
      if (shouldPlayMemoryRealign(visual)) {
        audioManager.playStoryEffect('memory-realign');
      }
      void overlay.offsetWidth;
      await waitForOpacityTransition(overlay, CHAPTER_TRANSITION.fadeInMs + 140);

      overlay.classList.add('is-held');
      await waitMs(CHAPTER_TRANSITION.holdMs);

      await whileCovered?.();
      if (screen === 'chapter_menu') {
        playChapterMenuEntrance();
      }
      setScreen(screen, scrollTop);
      await waitForPaint();

      overlay.classList.add('is-revealing');
      overlay.classList.remove('is-active', 'is-held');
      await waitForOpacityTransition(overlay, CHAPTER_TRANSITION.fadeOutMs + 140);
    } finally {
      setTransitionMediaActive(visual, false);
      overlay.classList.remove('is-active', 'is-held', 'is-revealing');
      screenTransitioning = false;
      syncContinueCueVisibility();
    }
  };

  const savedScreen = loaded?.screenState;
  const canResumeScreen =
    savedScreen === 'opening_bar' || savedScreen === 'chapter_02_fight';
  const hasReadingState =
    transcript.length > 0 ||
    pendingLines.length > 0 ||
    pendingChoices.length > 0 ||
    pendingEnd;
  const savedScreenChapter = savedScreen === 'chapter_02_fight'
    ? 2
    : savedScreen === 'opening_bar'
      ? 1
      : null;
  const runtimeChapter = inferRuntimeChapter();
  const resumeScreen: ScreenState | null =
    loaded &&
    canResumeScreen &&
    hasReadingState &&
    savedScreenChapter !== null &&
    (runtimeChapter === null || runtimeChapter === savedScreenChapter)
      ? savedScreen
      : null;

  updateChapterMenu();
  if (resumeScreen) {
    activeChapter = resumeScreen === 'chapter_02_fight' ? 2 : 1;
    setScreen(resumeScreen, storyScrollTop[activeChapter]);
    backgroundManager.resume();
  } else {
    playChapterMenuEntrance();
    setScreen('chapter_menu');
  }

  audioManager.setMuted(loaded?.musicMuted ?? false);
  musicManager.setMuted(loaded?.musicMuted ?? false);
  if (loaded?.musicStarted && activeChapter === 1) {
    audioManager.requestStart();
  }

  if (loaded?.palette) {
    paletteManager.setPalette(loaded.palette);
  }

  renderer.renderTranscript(transcript);
  if (
    choiceCheckpoint?.selectedIndex !== undefined &&
    transcript.length > choiceCheckpoint.transcript.length
  ) {
    renderer.insertChoiceRecord(
      choiceCheckpoint.choices,
      choiceCheckpoint.selectedIndex,
      choiceCheckpoint.transcript.length,
    );
  }

  const setExperienceState = (state: ExperienceState): void => {
    experienceState = state;
    elements.shell.dataset.state = state;
    syncContinueCueVisibility();
    elements.debugNextSignificant.disabled = debugFastForwarding;
  };

  const updateMuteControl = (): void => {
    const muted = audioManager.isMuted();
    elements.muteButton.classList.toggle('is-muted', muted);
    elements.muteButton.setAttribute('aria-label', muted ? 'Включить музыку' : 'Выключить музыку');
    elements.muteButton.querySelector('span')!.textContent = muted ? 'звук выкл' : 'звук';
  };

  updateMuteControl();

  const persist = (): void => {
    if (suppressPersistence) return;
    const screenState = appRoot.dataset.screen;
    if (screenState === 'opening_bar' || screenState === 'chapter_02_fight') {
      storyScrollTop[activeChapter] = Math.max(0, window.scrollY);
    }

    const nextSave: AppSave = {
      schemaVersion: SAVE_SCHEMA_VERSION,
      activeChapter,
      screenState:
        screenState === 'opening_bar' ||
        screenState === 'chapter_02_fight' ||
        screenState === 'chapter_menu'
          ? screenState
          : 'chapter_menu',
      storyScrollTop: {
        chapter1: storyScrollTop[1],
        chapter2: storyScrollTop[2],
      },
      storyStateJson: runtime.exportState(),
      bufferedLine: runtime.exportBufferedLine(),
      transcript,
      pendingLines,
      pendingChoices,
      pendingEnd,
      choiceCheckpoint,
      fightMemoryCheckpoint,
      choiceIsLocked,
      musicMuted: audioManager.isMuted(),
      musicStarted: audioManager.isStarted(),
      musicState: musicManager.snapshot(),
      palette: paletteManager.getPalette(),
      unreliableState,
    };

    saveManager.save(nextSave);
  };

  window.setInterval(() => {
    if (activeChapter === 2 && musicManager.snapshot().isPlaying) persist();
  }, 5000);
  const hasPersistedStoryState = (): boolean =>
    localStorage.getItem(STORY_CONFIG.saveKey) !== null ||
    localStorage.getItem(STORY_CONFIG.chapterProgressKey) !== null;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && hasPersistedStoryState()) persist();
  });
  window.addEventListener('pagehide', () => {
    if (hasPersistedStoryState()) persist();
  });

  const applyPresentationTags = (
    tags: Pick<NarrativeLine['tags'], 'palette' | 'background' | 'fx' | 'visual' | 'memory' | 'music' | 'sfx'>,
  ): void => {
    if (tags.palette) {
      paletteManager.setPalette(tags.palette);
    }
    if (tags.background) {
      backgroundManager.setBackground(tags.background);
    }
    if (tags.fx) {
      backgroundManager.setEffect(tags.fx);
    }
    if (tags.visual) {
      backgroundManager.setVisualEffect(tags.visual);
    }
    if (tags.memory) {
      backgroundManager.setMemoryCue(tags.memory);
    }
    if (tags.music) {
      const ambientCommands = tags.music.filter((command) => command.trim() === 'start');
      const fightCommands = tags.music.filter((command) => command.trim() !== 'start');
      if (ambientCommands.length > 0) audioManager.requestStart();
      if (fightCommands.length > 0) {
        if (fightCommands.some((command) => command.startsWith('start fight_memory'))) {
          audioManager.fadeOutAndPause();
        }
        musicManager.handleCommands(fightCommands);
      }
    }
    if (tags.sfx) {
      audioManager.playStoryEffect(tags.sfx);
    }
  };

  const syncFightMemoryErosion = (): void => {
    if (activeChapter !== 2) {
      backgroundManager.setMemoryErosion('none');
      return;
    }

    const values = runtime.exportVariables([
      'doubt',
      'delusion',
      'fracture',
      'memory_strain',
    ]);
    const proximity = Math.max(
      (Number(values.doubt) || 0) / 5,
      (Number(values.delusion) || 0) / 3,
      (Number(values.fracture) || 0) / 3,
      (Number(values.memory_strain) || 0) / 2,
    );

    backgroundManager.setMemoryErosion(
      proximity >= 1 ? 'critical' : proximity >= 0.6 ? 'mid' : proximity > 0 ? 'low' : 'none',
    );
  };

  const collectNextTurn = (): void => {
    pendingChoices = [];
    pendingChoiceSignificant = false;
    pendingEnd = false;
    let loops = 0;
    while (loops < 80) {
      loops += 1;
      const turn = runtime.continueToNextChoice();

      // A turn with text is prefetched before the user's next click. Applying
      // its visual tags here would make the next scene appear one beat early.
      // Tag-only turns (usually immediately before choices) still apply now.
      if (turn.lines.length === 0) {
        applyPresentationTags(turn);
      }

      for (const rawLine of turn.lines) {
        const line = applyUnreliableVariant(rawLine, unreliableState);
        pendingLines.push(line);
      }

      if (turn.choices.length > 0) {
        pendingChoices = turn.choices;
        pendingChoiceSignificant =
          turn.debugChoiceSignificant || runtime.isCurrentChoiceSignificant();
        pendingChoiceRewrite = turn.choiceRewrite ?? runtime.getCurrentChoiceRewrite();
        syncFightMemoryErosion();
        return;
      }

      if (runtime.hasEnded()) {
        pendingEnd = true;
        syncFightMemoryErosion();
        return;
      }

      if (pendingLines.length > 0) {
        syncFightMemoryErosion();
        return;
      }
    }
    syncFightMemoryErosion();
  };

  const showChoicesIfReady = (): void => {
    if (pendingLines.length > 0) {
      renderer.clearChoices();
      setExperienceState(experienceState === 'intro' ? 'intro' : 'waiting');
      return;
    }

    if (pendingChoices.length > 0) {
      const checkpointLabels = pendingChoices.map((choice) => choice.text);
      const isFightMemoryCheckpoint =
        activeChapter === 2 &&
        checkpointLabels.includes('Ударить первым.');
      if (isFightMemoryCheckpoint) {
        fightMemoryCheckpoint = {
          checkpointId: 'fight-impact',
          storyStateJson: runtime.exportState(),
          transcript: [...transcript],
          choices: [...pendingChoices],
          musicState: musicManager.checkpoint(),
        };
      }
      if (!choiceCheckpoint || choiceCheckpoint.selectedIndex !== undefined) {
        choiceCheckpoint = {
          storyStateJson: runtime.exportState(),
          transcript: [...transcript],
          choices: [...pendingChoices],
          musicState: musicManager.checkpoint(),
        };
        choiceIsLocked = false;
      }
      setExperienceState('choosing');
      renderer.renderChoices(
        pendingChoices,
        onChoice,
        choiceIsLocked ? choiceCheckpoint.selectedIndex : undefined,
      );
      return;
    }

    if (pendingEnd) {
      setExperienceState('choosing');
      renderer.renderChoices(
        [
          activeChapter === 1
            ? { index: -3, text: 'Вспомнить драку', kind: 'action' }
            : { index: -4, text: 'Вернуться к записям', kind: 'action' },
        ],
        onChoice,
      );
      return;
    }

    setExperienceState('waiting');
  };

  const waitForBeatDuration = async (durationMs: number): Promise<void> => {
    if (durationMs <= 0 || motionManager.isReduced() || skipBeatRequested) {
      return;
    }

    await new Promise<void>((resolve) => {
      let settled = false;
      const finish = (): void => {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        finishPendingDelay = null;
        resolve();
      };
      const timer = window.setTimeout(finish, durationMs);
      finishPendingDelay = finish;
    });
  };

  const skipCurrentBeatAnimation = (): void => {
    if (!isAdvancing) {
      return;
    }

    skipBeatRequested = true;
    elements.shell.classList.add('is-skipping-beat');
    renderer.finishLineAnimations();
    finishPendingDelay?.();
  };

  const advanceNarrative = async (): Promise<void> => {
    if (isAdvancing) {
      skipCurrentBeatAnimation();
      return;
    }

    if (experienceState === 'choosing') {
      return;
    }

    isAdvancing = true;
    skipBeatRequested = false;
    setExperienceState('revealing');

    if (pendingLines.length === 0) {
      collectNextTurn();
    }

    while (pendingLines.length > 0) {
      const nextLine = pendingLines.shift();
      if (!nextLine) {
        break;
      }

      if (nextLine.tags.pauseBefore !== undefined) {
        await waitForBeatDuration(nextLine.tags.pauseBefore);
      }

      const revealStartedAt = performance.now();
      applyPresentationTags(nextLine.tags);
      transcript = [...transcript, nextLine];
      backgroundManager.setLineContext(nextLine);
      renderer.appendLine(nextLine);
      persist();

      if (nextLine.tags.pause !== undefined) {
        await waitForBeatDuration(nextLine.tags.pause);
      }

      const followingLine = pendingLines[0];
      if (
        followingLine &&
        nextLine.tags.pause === undefined &&
        followingLine.tags.pauseBefore === undefined
      ) {
        await waitForBeatDuration(getFragmentDelayMs(nextLine));
      }

      if (!followingLine && !skipBeatRequested && !motionManager.isReduced()) {
        const animationRemaining = LINE_REVEAL_DURATION_MS - (performance.now() - revealStartedAt);
        await waitForBeatDuration(animationRemaining);
      }
    }

    collectNextTurn();

    isAdvancing = false;
    skipBeatRequested = false;
    elements.shell.classList.remove('is-skipping-beat');
    showChoicesIfReady();
  };

  const startChapterTwo = async (restart = false): Promise<void> => {
    // Start fetching immediately, but cover the current scene before waiting.
    // Slow audio/video decoding should lengthen the dark hold, never freeze a
    // fully visible chapter or expose a half-reset scene.
    const chapterPreload = Promise.all([
      audioManager.preloadChapter(2),
      musicManager.preloadTracks(['fight_ambient', 'fight_memory', 'fight_aftermath']),
      preloadChapterTwoVisuals(),
    ]);
    const canResume = inferRuntimeChapter() === 2 && !restart && transcript.length > 0;

    // Chapter II owns its score. Keep the opening-bar track out of the fight
    // memory; fight_memory enters later from its explicit Ink tag.
    audioManager.fadeOutAndPause(CHAPTER_TRANSITION.barFadeOutMs);
    musicManager.resumeFromMenu();
    await transitionToScreen('chapter_02_fight', storyScrollTop[2], async () => {
      await chapterPreload;
      activeChapter = 2;
      elements.shell.dataset.chapter = '2';

      if (!canResume) {
        musicManager.reset();
        musicManager.handleCommands([
          'start fight_ambient',
          `fade ${CHAPTER_TRANSITION.scoreFadeOutMs}`,
          'volume 0.26',
        ]);
        saveManager.clear();
        backgroundManager.reset();
        elements.shell.classList.remove('fx-memory-lock');
        transcript = [];
        pendingLines = [];
        pendingChoices = [];
        pendingChoiceSignificant = false;
        pendingEnd = false;
        isAdvancing = false;
        skipBeatRequested = false;
        choiceCheckpoint = undefined;
        fightMemoryCheckpoint = undefined;
        choiceIsLocked = false;
        renderer.renderTranscript([]);
        renderer.clearChoices();

        runtime = new InkRuntime();
        await runtime.init(STORY_CONFIG.source);
        if (debugOverrideActive) {
          const debugState = debugStore.getState();
          runtime.importVariables({
            ...debugState.choices.chapter01,
            ...debugState.choices.chapter02,
            ...debugState.memory,
          });
        } else {
          runtime.importVariables({
            ...chapterProgress.chapter1Variables,
            ...(!restart ? chapterProgress.chapter2Variables : {}),
          });
        }
        runtime.jumpToPath('chapter_02_fight');
        paletteManager.setPalette('interruption-cold');
        collectNextTurn();
        setExperienceState('intro');
        showChoicesIfReady();
        persist();
        storyScrollTop[2] = 0;
      }
    });
  };

  const completeChapterOne = (): void => {
    const chapterOneVariables = runtime.exportVariables(CHAPTER_ONE_VARIABLES);
    chapterProgress = {
      ...chapterProgress,
      startedChapters: [...new Set([...chapterProgress.startedChapters, 1])],
      completedChapters: [...new Set([...chapterProgress.completedChapters, 1])],
      unlockedChapters: [...new Set([...chapterProgress.unlockedChapters, 1, 2])],
      chapter1Variables: chapterOneVariables,
    };
    chapterProgressManager.save(chapterProgress);
    syncRealProgressToDebug();
    saveManager.clear();
    updateChapterMenu();
    // startChapterTwo resets the old scene while the transition overlay is
    // opaque. Resetting here made chapter I visibly disappear during preload.
    void startChapterTwo(true);
  };

  const completeChapterTwo = (): void => {
    const chapterTwoVariables = runtime.exportVariables(CHAPTER_TWO_VARIABLES);
    chapterProgress = {
      ...chapterProgress,
      startedChapters: [...new Set([...chapterProgress.startedChapters, 2])],
      completedChapters: [...new Set([...chapterProgress.completedChapters, 2])],
      unlockedChapters: [...new Set([...chapterProgress.unlockedChapters, 1, 2])],
      chapter2Variables: chapterTwoVariables,
    };
    chapterProgressManager.save(chapterProgress);
    syncRealProgressToDebug();
    updateChapterMenu();
    audioManager.fadeOutAndPause();
    musicManager.pauseForMenu();
    fightMemoryCheckpoint = undefined;
    void transitionToScreen('chapter_menu');
  };

  const restoreFightMemory = async (): Promise<void> => {
    const checkpoint = fightMemoryCheckpoint;
    if (!checkpoint) return;

    backgroundManager.setVisualEffect('memory_return_flash');
    audioManager.playStoryEffect('fight-end-flash');
    await new Promise<void>((resolve) => window.setTimeout(resolve, 180));

    transcript = [...checkpoint.transcript];
    pendingLines = [];
    pendingChoices = [...checkpoint.choices];
    pendingChoiceSignificant = true;
    pendingChoiceRewrite = undefined;
    pendingEnd = false;
    isAdvancing = false;
    skipBeatRequested = false;
    choiceIsLocked = false;
    choiceCheckpoint = {
      ...checkpoint,
      transcript: [...checkpoint.transcript],
      choices: [...checkpoint.choices],
      selectedIndex: undefined,
    };

    runtime = new InkRuntime();
    await runtime.init(STORY_CONFIG.source, checkpoint.storyStateJson);
    syncFightMemoryErosion();
    musicManager.restoreCheckpoint(checkpoint.musicState, true);
    renderer.renderTranscript(transcript);
    renderer.renderChoices(pendingChoices, onChoice);
    setExperienceState('choosing');
    persist();
    renderer.pinToReadingEdgeNow();
    window.setTimeout(() => backgroundManager.setVisualEffect('partial_stability'), 1220);
  };

  let choiceRewriteInProgress = false;
  let choiceInputAlreadyPlayed = false;

  const onChoice = (index: number): void => {
    if (index === -4) {
      audioManager.onUserInteraction();
      musicManager.unlock();
      audioManager.playChoiceSound();
      completeChapterTwo();
      return;
    }

    if (index === -3) {
      audioManager.onUserInteraction();
      musicManager.unlock();
      audioManager.playChoiceSound();
      completeChapterOne();
      return;
    }

    if (index === -2) {
      void goBackToChoice();
      return;
    }

    if (index < 0) {
      void restartStory();
      return;
    }

    if (choiceIsLocked && index !== choiceCheckpoint?.selectedIndex) {
      return;
    }

    const selectedChoice = pendingChoices.find((choice) => choice.index === index);
    if (index >= 0 && pendingChoiceRewrite && !choiceRewriteInProgress && selectedChoice) {
      const rewrittenText = pendingChoiceRewrite;
      choiceRewriteInProgress = true;
      audioManager.onUserInteraction();
      musicManager.unlock();
      audioManager.playChoiceSound();
      audioManager.playStoryEffect('memory-realign');
      backgroundManager.setVisualEffect('bluespace_correction');

      void renderer.rewriteChoice(index, rewrittenText).then(() => {
        const correctedChoice: StoryChoice = {
          ...selectedChoice,
          text: rewrittenText,
        };
        pendingChoices = [correctedChoice];
        if (choiceCheckpoint) {
          choiceCheckpoint.choices = [correctedChoice];
        }
        pendingChoiceRewrite = undefined;
        choiceRewriteInProgress = false;
        choiceInputAlreadyPlayed = true;
        onChoice(index);
      });
      return;
    }

    if (choiceRewriteInProgress) return;

    const restoresFightMemory =
      activeChapter === 2 &&
      (selectedChoice?.text === 'Вернуться к удару.' ||
        selectedChoice?.text === 'Нет. Сначала.');

    if (restoresFightMemory && fightMemoryCheckpoint) {
      audioManager.onUserInteraction();
      musicManager.unlock();
      audioManager.playChoiceSound();
      void restoreFightMemory();
      return;
    }

    if (!choiceInputAlreadyPlayed) {
      audioManager.onUserInteraction();
      musicManager.unlock();
      audioManager.playChoiceSound();
    }
    choiceInputAlreadyPlayed = false;
    if (choiceCheckpoint) {
      choiceCheckpoint.selectedIndex = index;
    }
    choiceIsLocked = false;
    runtime.choose(index);
    renderer.insertChoiceRecord(pendingChoices, index, transcript.length);
    renderer.clearChoices();
    pendingChoices = [];
    pendingChoiceSignificant = false;
    pendingChoiceRewrite = undefined;
    pendingEnd = false;
    collectNextTurn();
    setExperienceState('waiting');
    void advanceNarrative();
    renderer.pinToReadingEdgeNow();
  };

  const skipToNextSignificantChoice = async (): Promise<void> => {
    if (!debugFastMode || debugFastForwarding || appRoot.dataset.screen === 'chapter_menu') return;
    const isInkChoiceSignificant = (): boolean =>
      pendingChoiceSignificant ||
      (pendingChoices.length > 0 && runtime.isCurrentChoiceSignificant());

    if (pendingLines.length === 0 && pendingChoices.length > 0 && isInkChoiceSignificant()) {
      elements.debugNextSignificant.textContent = 'значимый выбор открыт';
      window.setTimeout(() => { elements.debugNextSignificant.textContent = 'к значимому выбору'; }, 1000);
      return;
    }

    debugFastForwarding = true;
    elements.debugNextSignificant.disabled = true;
    elements.debugNextSignificant.textContent = 'быстрый прогон…';
    renderer.clearChoices();
    elements.shell.classList.add('is-debug-fast-forwarding');

    try {
      if (isAdvancing) {
        skipCurrentBeatAnimation();
        while (isAdvancing) {
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
        }
      }

      for (let guard = 0; guard < 900; guard += 1) {
        if (pendingLines.length > 0) {
          const revealed = pendingLines.splice(0);
          for (const line of revealed) {
            applyPresentationTags({
              palette: line.tags.palette,
              background: line.tags.background,
              fx: line.tags.fx,
              music: line.tags.music,
            });
          }
          transcript = [...transcript, ...revealed];
          renderer.appendLines(revealed);
          if (guard % 7 === 0) {
            renderer.pinToReadingEdgeNow();
            await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
          }
          collectNextTurn();
          continue;
        }

        if (pendingChoices.length > 0) {
          if (isInkChoiceSignificant()) {
            showChoicesIfReady();
            renderer.pinToReadingEdgeNow();
            persist();
            notifyDebug(`Открыт значимый выбор: ${pendingChoices[0]?.text ?? '-'}.`);
            return;
          }

          // Decorative choices do not alter any value consumed later. The
          // first authored option is the deterministic route through them.
          if (runtime.isCurrentChoiceSignificant()) {
            pendingChoiceSignificant = true;
            showChoicesIfReady();
            renderer.pinToReadingEdgeNow();
            persist();
            notifyDebug('Автовыбор остановлен защитной проверкой Ink-тега.');
            return;
          }
          choiceCheckpoint = undefined;
          choiceIsLocked = false;
          const selected = pendingChoices[0];
          if (!runtime.chooseDebugDefault(selected.index)) {
            pendingChoiceSignificant = true;
            showChoicesIfReady();
            renderer.pinToReadingEdgeNow();
            persist();
            notifyDebug('Ink запретил автоматический ответ на значимый выбор.');
            return;
          }
          renderer.insertChoiceRecord(pendingChoices, selected.index, transcript.length);
          pendingChoices = [];
          pendingChoiceSignificant = false;
          collectNextTurn();
          continue;
        }

        if (pendingEnd || runtime.hasEnded()) {
          showChoicesIfReady();
          notifyDebug('Следующих значимых ответов в главе нет.');
          return;
        }

        collectNextTurn();
      }

      notifyDebug('Остановлено: превышен предел debug-перехода.');
    } finally {
      debugFastForwarding = false;
      elements.shell.classList.remove('is-debug-fast-forwarding');
      elements.debugNextSignificant.disabled = false;
      elements.debugNextSignificant.textContent = 'к значимому выбору';
      renderDebugPanel();
    }
  };

  elements.debugNextSignificant.addEventListener('click', () => {
    void skipToNextSignificantChoice();
  });

  const restartStory = async (resetMemory = false): Promise<void> => {
    await audioManager.preloadChapter(1);
    activeChapter = 1;
    elements.shell.dataset.chapter = '1';
    audioManager.fadeOutAndStop();
    musicManager.reset();
    elements.shell.classList.remove('fx-memory-lock');
    backgroundManager.reset();

    unreliableState = resetMemory
      ? createInitialUnreliableState()
      : nextRunState(unreliableState);
    transcript = [];
    renderer.renderTranscript([]);
    renderer.clearChoices();

    runtime = new InkRuntime();
    await runtime.init(STORY_CONFIG.source);
    runtime.jumpToPath('opening_bar');

    pendingLines = [];
    pendingChoices = [];
    pendingChoiceSignificant = false;
    pendingEnd = false;
    isAdvancing = false;
    choiceCheckpoint = undefined;
    fightMemoryCheckpoint = undefined;
    choiceIsLocked = false;

    paletteManager.setPalette('bar-warm');
    collectNextTurn();
    setExperienceState('intro');
    showChoicesIfReady();
    persist();
  };

  let replayChapterPending: 1 | 2 | null = null;

  const openReplayDialog = (chapter: 1 | 2): void => {
    replayChapterPending = chapter;
    elements.replayDialogTitle.textContent = `Переиграть главу ${chapter === 1 ? 'I' : 'II'}?`;
    elements.replayDialogMessage.textContent = chapter === 1
      ? 'Глава начнётся сначала. Прогресс главы II и сохранённые в ней ответы будут удалены.'
      : 'Глава начнётся сначала. Её текущая версия и прогресс следующих глав будут удалены.';
    if (!elements.replayDialog.open) {
      elements.replayDialog.showModal();
    }
    elements.replayDialogCancel.focus();
  };

  const replayChapterFromStart = async (chapter: 1 | 2): Promise<void> => {
    const keepEarlier = (value: number): boolean => value < chapter;
    chapterProgress = {
      ...chapterProgress,
      startedChapters: [...chapterProgress.startedChapters.filter(keepEarlier), chapter],
      completedChapters: chapterProgress.completedChapters.filter(keepEarlier),
      unlockedChapters: [...new Set([
        ...chapterProgress.unlockedChapters.filter((value) => value <= chapter),
        1,
        chapter,
      ])].sort((a, b) => a - b),
      chapter1Variables: chapter === 1 ? {} : chapterProgress.chapter1Variables,
      chapter2Variables: {},
    };
    storyScrollTop[chapter] = 0;
    if (chapter === 1) storyScrollTop[2] = 0;
    unreliableState = createInitialUnreliableState();
    saveManager.clear();
    chapterProgressManager.save(chapterProgress);
    syncRealProgressToDebug();
    updateChapterMenu();

    audioManager.onUserInteraction();
    musicManager.unlock();
    if (chapter === 1) {
      const chapterPreload = audioManager.preloadChapter(1);
      await transitionToScreen('opening_bar', 0, async () => {
        await chapterPreload;
        await restartStory(true);
        backgroundManager.resume();
      });
      return;
    }

    await startChapterTwo(true);
  };

  const goBackToChoice = async (): Promise<void> => {
    if (!choiceCheckpoint || choiceCheckpoint.selectedIndex === undefined) {
      return;
    }

    elements.shell.classList.remove('fx-memory-lock');
    backgroundManager.reset();
    paletteManager.setPalette('bar-warm');

    transcript = [...choiceCheckpoint.transcript];
    renderer.renderTranscript(transcript);
    renderer.clearChoices();

    runtime = new InkRuntime();
    await runtime.init(STORY_CONFIG.source, choiceCheckpoint.storyStateJson);
    musicManager.restoreCheckpoint(choiceCheckpoint.musicState);

    pendingLines = [];
    pendingChoices = runtime.getChoices();
    pendingEnd = false;
    choiceIsLocked = unreliableState.runCount < 2;

    setExperienceState('choosing');
    renderer.renderChoices(
      pendingChoices,
      onChoice,
      choiceIsLocked ? choiceCheckpoint.selectedIndex : undefined,
    );
    persist();
  };

  const handleContinue = (): void => {
    if (isAdvancing || experienceState === 'revealing') {
      skipCurrentBeatAnimation();
      return;
    }

    if (experienceState === 'choosing') {
      return;
    }

    audioManager.onUserInteraction();
    musicManager.unlock();
    if (activeChapter === 1) {
      audioManager.requestStart();
    }
    audioManager.playAdvanceSound();
    void advanceNarrative();
  };

  elements.shell.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (target.closest('button')) {
        return;
      }

      handleContinue();
    },
  );

  document.addEventListener('keydown', (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') {
      return;
    }

    if (experienceState === 'choosing' || event.target instanceof HTMLButtonElement) {
      return;
    }

    event.preventDefault();
    handleContinue();
  });

  elements.muteButton.addEventListener('click', () => {
    audioManager.onUserInteraction();
    musicManager.unlock();
    audioManager.setMuted(!audioManager.isMuted());
    musicManager.setMuted(audioManager.isMuted());
    updateMuteControl();
    persist();
  });

  const updateMusicControls = (): void => {
    const state = musicManager.snapshot();
    elements.musicToggle.textContent = state.enabled ? 'музыка' : 'музыка выкл';
    elements.musicToggle.classList.toggle('is-muted', !state.enabled);
    elements.musicVolume.value = String(state.masterVolume);
  };

  elements.musicToggle.addEventListener('click', () => {
    audioManager.onUserInteraction();
    musicManager.unlock();
    musicManager.setEnabled(!musicManager.snapshot().enabled);
    updateMusicControls();
    persist();
  });

  elements.musicVolume.addEventListener('input', () => {
    musicManager.setMasterVolume(Number(elements.musicVolume.value));
    persist();
  });
  updateMusicControls();

  elements.replayButton.addEventListener('click', () => {
    saveManager.clear();
    if (activeChapter === 2) {
      void startChapterTwo(true);
    } else {
      void restartStory(true);
    }
  });

  elements.replayDialogCancel.addEventListener('click', () => {
    replayChapterPending = null;
    elements.replayDialog.close();
  });

  elements.replayDialogConfirm.addEventListener('click', () => {
    const chapter = replayChapterPending;
    replayChapterPending = null;
    elements.replayDialog.close();
    if (chapter !== null) void replayChapterFromStart(chapter);
  });

  elements.replayDialog.addEventListener('click', (event) => {
    if (event.target !== elements.replayDialog) return;
    replayChapterPending = null;
    elements.replayDialog.close();
  });

  elements.chapterOneButton.addEventListener('click', () => {
    if (chapterProgress.completedChapters.includes(1)) {
      openReplayDialog(1);
      return;
    }
    const openChapter = async (): Promise<void> => {
      audioManager.onUserInteraction();
      musicManager.unlock();
      const chapterPreload = audioManager.preloadChapter(1);
      const chapterWasStarted = chapterProgress.startedChapters.includes(1);
      const chapterWasCompleted = chapterProgress.completedChapters.includes(1);
      // The runtime/transcript in memory may still belong to chapter II (for
      // example, after resuming a saved chapter-II session). Opening chapter
      // I must never show that leftover state, so force a reset whenever the
      // active chapter does not already match.
      const ownedChapter = inferRuntimeChapter();
      const runtimeBelongsToOtherChapter = ownedChapter === 2 ||
        (ownedChapter === null && activeChapter !== 1);
      const shouldRestart = chapterWasCompleted || runtimeBelongsToOtherChapter;
      await transitionToScreen(
        'opening_bar',
        chapterWasStarted && !chapterWasCompleted && !runtimeBelongsToOtherChapter ? storyScrollTop[1] : 0,
        async () => {
          await chapterPreload;
          if (shouldRestart) {
            await restartStory(chapterWasCompleted ? false : true);
            storyScrollTop[1] = 0;
          }
          if (!chapterWasStarted) {
            chapterProgress.startedChapters = toggleChapter(chapterProgress.startedChapters, 1, true);
            chapterProgressManager.save(chapterProgress);
            syncRealProgressToDebug();
          }
          activeChapter = 1;
          elements.shell.dataset.chapter = '1';
          audioManager.resumeRequestedMusic();
          backgroundManager.resume();
        },
      );
    };

    void openChapter();
  });

  elements.chapterTwoButton.addEventListener('click', () => {
    if (!chapterProgress.unlockedChapters.includes(2)) return;
    if (chapterProgress.completedChapters.includes(2)) {
      openReplayDialog(2);
      return;
    }
    audioManager.onUserInteraction();
    musicManager.unlock();
    if (!chapterProgress.startedChapters.includes(2)) {
      chapterProgress.startedChapters = toggleChapter(chapterProgress.startedChapters, 2, true);
      chapterProgressManager.save(chapterProgress);
      syncRealProgressToDebug();
    }
    void startChapterTwo(chapterProgress.completedChapters.includes(2));
  });

  elements.storyMenuButton.addEventListener('click', () => {
    const readingPosition = window.scrollY;
    const returnToNotebook = async (): Promise<void> => {
      if (isAdvancing) {
        skipCurrentBeatAnimation();
        while (isAdvancing) {
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
        }
      }
      storyScrollTop[activeChapter] = readingPosition;
      persist();
      if (activeChapter === 1) {
        chapterProgress = {
          ...chapterProgress,
          chapter1Variables: runtime.exportVariables(CHAPTER_ONE_VARIABLES),
        };
      } else {
        chapterProgress = {
          ...chapterProgress,
          chapter2Variables: runtime.exportVariables(CHAPTER_TWO_VARIABLES),
        };
      }
      chapterProgressManager.save(chapterProgress);
      syncRealProgressToDebug();
      updateChapterMenu();
      audioManager.fadeOutAndPause();
      musicManager.pauseForMenu();
      backgroundManager.suspend();
      await transitionToScreen('chapter_menu');
    };

    void returnToNotebook();
  });

  const DEBUG_BACKUP_KEY = 'nill-quest-debug-backup';
  const DEBUG_LOG_KEY = 'nill-quest-debug-log';
  let debugLogEntries: string[] = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(DEBUG_LOG_KEY) ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string').slice(-20) : [];
    } catch {
      return [];
    }
  })();

  const addDebugLog = (message: string): void => {
    const time = new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    debugLogEntries = [...debugLogEntries, `${time} - ${message}`].slice(-20);
    localStorage.setItem(DEBUG_LOG_KEY, JSON.stringify(debugLogEntries));
  };

  const notifyDebug = (message: string, log = true): void => {
    elements.storyDebugNotice.textContent = message;
    if (log) addDebugLog(message);
  };

  const summarizeChapterOneDebug = (): string => {
    const state = debugStore.getState();
    const choices = state.choices.chapter01;
    const can = choices.caught_can ? 'банка поймана' : 'банка упала';
    const fight = choices.fight_answer === 'self'
      ? 'Нилл назвал себя первым'
      : choices.fight_answer === 'other'
        ? 'Нилл назвал посетителя первым'
        : 'Нилл не назвал первого';
    const job = choices.job_answer === 'fired'
      ? 'Нилла уволили'
      : choices.job_answer === 'downsized'
        ? 'Нилла «сократили»'
        : 'Нилл ушёл от ответа';
    return `Seed ${state.seed}: ${can}; ${fight}; ${job}.`;
  };

  const ensureDebugBackup = (): void => {
    if (!localStorage.getItem(DEBUG_BACKUP_KEY)) {
      localStorage.setItem(
        DEBUG_BACKUP_KEY,
        JSON.stringify({
          chapterProgress: localStorage.getItem(STORY_CONFIG.chapterProgressKey),
          storySave: localStorage.getItem(STORY_CONFIG.saveKey),
        }),
      );
    }
    debugOverrideActive = true;
  };

  const applyDebugStateToApp = (state: StoryDebugState): void => {
    chapterProgress = {
      schemaVersion: chapterProgress.schemaVersion,
      startedChapters: [
        ...(state.chapters.chapter01.started ? [1] : []),
        ...(state.chapters.chapter02.started ? [2] : []),
      ],
      completedChapters: [
        ...(state.chapters.chapter01.completed ? [1] : []),
        ...(state.chapters.chapter02.completed ? [2] : []),
      ],
      unlockedChapters: [
        ...(state.chapters.chapter01.unlocked ? [1] : []),
        ...(state.chapters.chapter02.unlocked ? [2] : []),
      ],
      chapter1Variables: { ...state.choices.chapter01 },
      chapter2Variables: {
        ...state.choices.chapter02,
        ...state.memory,
      },
    };
    debugNotebookMode = state.notebookView.mode;
    elements.chapterMenu.dataset.debugDisableAnimations = String(state.notebookView.disableAnimations);
    elements.shell.dataset.debugRevealAll = String(state.notebookView.revealAllText);
    chapterProgressManager.save(chapterProgress);
    runtime.importVariables({
      ...state.choices.chapter01,
      ...state.choices.chapter02,
      ...state.memory,
    });
    updateChapterMenu();
  };

  const readDebugControls = (): StoryDebugState => {
    const state = debugStore.getState();
    for (const control of elements.storyDebugPanel.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-debug-choice]')) {
      const [chapter, field] = (control.dataset.debugChoice ?? '').split('.');
      if (!field) continue;
      const value = control instanceof HTMLInputElement && control.type === 'checkbox'
        ? control.checked
        : control.value === 'true'
          ? true
          : control.value === 'false'
            ? false
            : control.value;
      if (chapter === 'chapter01') {
        (state.choices.chapter01 as unknown as Record<string, unknown>)[field] = value;
      } else if (chapter === 'chapter02') {
        (state.choices.chapter02 as unknown as Record<string, unknown>)[field] = value;
      }
    }
    for (const input of elements.storyDebugPanel.querySelectorAll<HTMLInputElement>('[data-debug-memory]')) {
      (state.memory as unknown as Record<string, unknown>)[input.dataset.debugMemory ?? ''] = Number(input.value);
    }
    return state;
  };

  const renderDebugPanel = (): void => {
    const state = debugStore.getState();
    elements.storyDebugActiveBanner.hidden = !debugOverrideActive;
    for (const input of elements.storyDebugPanel.querySelectorAll<HTMLInputElement>('[data-debug-chapter]')) {
      const chapter = input.dataset.debugChapter === '2' ? state.chapters.chapter02 : state.chapters.chapter01;
      const field = input.dataset.debugChapterField as keyof ChapterState | undefined;
      if (field) input.checked = chapter[field];
    }
    for (const control of elements.storyDebugPanel.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-debug-choice]')) {
      const [chapter, field] = (control.dataset.debugChoice ?? '').split('.');
      const choices = chapter === 'chapter02' ? state.choices.chapter02 : state.choices.chapter01;
      const value = (choices as unknown as Record<string, unknown>)[field ?? ''];
      if (control instanceof HTMLInputElement && control.type === 'checkbox') control.checked = value === true;
      else control.value = String(value);
    }
    for (const input of elements.storyDebugPanel.querySelectorAll<HTMLInputElement>('[data-debug-memory]')) {
      input.value = String(state.memory[input.dataset.debugMemory as keyof typeof state.memory] ?? 0);
    }
    const seedInput = elements.storyDebugPanel.querySelector<HTMLInputElement>('#story-debug-seed');
    if (seedInput && document.activeElement !== seedInput) seedInput.value = state.seed;
    const ignoreDependencies = elements.storyDebugPanel.querySelector<HTMLInputElement>('#story-debug-ignore-deps');
    if (ignoreDependencies) ignoreDependencies.checked = state.ignoreChapterDependencies;
    for (const button of elements.storyDebugPanel.querySelectorAll<HTMLButtonElement>('[data-debug-view]')) {
      button.classList.toggle('is-active', button.dataset.debugView === state.notebookView.mode);
    }
    for (const input of elements.storyDebugPanel.querySelectorAll<HTMLInputElement>('[data-debug-view-option]')) {
      input.checked = state.notebookView[input.dataset.debugViewOption as 'disableAnimations' | 'revealAllText'];
    }
    const outcome = state.memory.fracture >= 3
      ? 'Распад воспоминания'
      : state.memory.delusion >= 3
        ? 'Память подогнана'
        : state.memory.memory_strain >= 2
          ? 'Ответ без причины'
          : 'Обычное завершение';
    const outcomeOutput = elements.storyDebugPanel.querySelector<HTMLOutputElement>('#story-debug-outcome');
    if (outcomeOutput) outcomeOutput.textContent = `Исход: ${outcome}`;
    const music = musicManager.getDebugState();
    const liveMemory = runtime.exportVariables(['doubt', 'delusion', 'fracture', 'memory_strain']);
    const diagnostics = elements.storyDebugPanel.querySelector<HTMLElement>('#story-debug-diagnostics');
    if (diagnostics) {
      const warnings: string[] = [];
      if (music.pendingMusicCommand) warnings.push(`ожидает музыка: ${music.pendingMusicCommand}`);
      if (music.primaryHowlId === null && music.isPlaying) warnings.push('потерян основной audio-id');
      if (pendingChoices.length > 0 && experienceState !== 'choosing') warnings.push('выборы есть, UI не в choosing');
      if (isAdvancing && experienceState !== 'revealing') warnings.push('раскрытие и UI рассинхронизированы');
      diagnostics.textContent = [
        `${appRoot.dataset.screen ?? 'chapter_menu'} · ${runtime.getCurrentPath() || '-'}`,
        `UI: ${experienceState}; строк: ${pendingLines.length}; выборов: ${pendingChoices.length}${pendingChoiceSignificant ? ' · значимый' : ''}`,
        `память: d${liveMemory.doubt ?? 0} / l${liveMemory.delusion ?? 0} / f${liveMemory.fracture ?? 0} / s${liveMemory.memory_strain ?? 0}`,
        `музыка: ${music.currentTrack ?? '-'} · ${music.isPlaying ? 'играет' : music.pendingMusicCommand ? 'ожидает' : 'пауза'} · ${music.currentSeek.toFixed(1)}s`,
        warnings.length > 0 ? `! ${warnings.join('\n! ')}` : 'ошибок состояния не видно',
      ].join('\n');
    }
    elements.storyDebugMusic.textContent = [
      `track: ${music.currentTrack ?? '-'}`,
      `state: ${music.isPlaying ? 'playing' : music.pendingMusicCommand ? 'pending' : 'paused'}`,
      `seek: ${music.currentSeek.toFixed(1)}s`,
      `base / effective: ${music.targetVolume.toFixed(2)} / ${music.effectiveVolume.toFixed(2)}`,
      `duck: ${music.isDucked ? 'yes' : 'no'}; filter: ${music.filter ?? '-'}`,
      `primary / fracture: ${music.primaryHowlId ?? '-'} / ${music.secondaryHowlId ?? '-'}`,
      `fracture offset: ${music.fractureOffsetMs}ms`,
      `autoplay: ${music.autoplayUnlocked ? 'unlocked' : 'locked'}`,
      `pending: ${music.pendingMusicCommand ?? '-'}`,
      '',
      ...music.recentCommands.map((command) => `· ${command}`),
    ].join('\n');
    elements.storyDebugStateOutput.textContent = [
      `Экран: ${appRoot.dataset.screen ?? 'chapter_menu'}`,
      `Глава: chapter_0${activeChapter}`,
      `Knot: ${runtime.getCurrentPath() || '-'}`,
      `Checkpoint: ${choiceCheckpoint ? 'сохранён' : '-'}`,
      `Прогресс: I - ${state.chapters.chapter01.completed ? 'завершена' : state.chapters.chapter01.started ? 'начата' : 'не начата'}; II - ${state.chapters.chapter02.completed ? 'завершена' : state.chapters.chapter02.started ? 'начата' : state.chapters.chapter02.unlocked ? 'открыта' : 'закрыта'}`,
      `doubt: ${state.memory.doubt}; delusion: ${state.memory.delusion}; fracture: ${state.memory.fracture}; strain: ${state.memory.memory_strain}`,
      '',
      debugStore.exportState(),
    ].join('\n');
    elements.storyDebugLog.replaceChildren(...debugLogEntries.map((entry) => {
      const item = document.createElement('li');
      item.textContent = entry;
      return item;
    }));
  };

  syncChapterDebug = renderDebugPanel;
  musicManager.subscribe(() => {
    if (!elements.storyDebug.hidden) renderDebugPanel();
  });
  debugStore.subscribe((state) => {
    applyDebugStateToApp(state);
    renderDebugPanel();
  });
  syncRealProgressToDebug = (): void => {
    if (debugOverrideActive) return;
    const state = debugStore.getState();
    state.chapters.chapter01 = {
      unlocked: true,
      started: chapterProgress.startedChapters.includes(1),
      completed: chapterProgress.completedChapters.includes(1),
    };
    state.chapters.chapter02 = {
      unlocked: chapterProgress.unlockedChapters.includes(2),
      started: chapterProgress.startedChapters.includes(2),
      completed: chapterProgress.completedChapters.includes(2),
    };
    state.choices.chapter01 = {
      ...state.choices.chapter01,
      ...chapterProgress.chapter1Variables,
    } as StoryDebugState['choices']['chapter01'];
    state.choices.chapter02 = {
      ...state.choices.chapter02,
      ...chapterProgress.chapter2Variables,
    } as StoryDebugState['choices']['chapter02'];
    state.memory = {
      ...state.memory,
      ...chapterProgress.chapter2Variables,
    } as StoryDebugState['memory'];
    debugStore.hydrateState(state);
  };
  if (debugOverrideActive) applyDebugStateToApp(debugStore.getState());

  const activateAndPatchDebug = (
    mutator: (draft: StoryDebugState) => void,
    message: string,
  ): void => {
    ensureDebugBackup();
    debugStore.patchState(mutator);
    notifyDebug(message);
  };

  const setDebugPanelOpen = (open: boolean): void => {
    if (open) elements.storyDebug.hidden = false;
    elements.storyDebug.classList.toggle('is-open', open);
    elements.storyDebugToggle.setAttribute('aria-expanded', String(open));
    elements.storyDebugPanel.setAttribute('aria-hidden', String(!open));
  };

  const debugFastModeToggle = elements.storyDebugPanel.querySelector<HTMLButtonElement>('#story-debug-fast-mode')!;
  const syncEventDebugButton = (): void => {
    debugFastModeToggle.setAttribute('aria-pressed', String(debugFastMode));
    debugFastModeToggle.classList.toggle('is-active', debugFastMode);
    debugFastModeToggle.textContent = `Дебаг событий: ${debugFastMode ? 'вкл' : 'выкл'}`;
  };
  syncEventDebugButton();

  elements.storyDebugToggle.addEventListener('click', () => {
    setDebugPanelOpen(!elements.storyDebug.classList.contains('is-open'));
  });
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isEditing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable);
    if (event.shiftKey && !event.ctrlKey && !event.altKey && event.key.toLowerCase() === 'd' && !isEditing) {
      event.preventDefault();
      setDebugPanelOpen(!elements.storyDebug.classList.contains('is-open'));
    }
  });

  type QuickChoiceStep = {
    key: string;
    question: string;
    options: Array<[string, string | boolean]>;
  };
  const quickChoiceSteps: Record<1 | 2, QuickChoiceStep[]> = {
    1: [
      { key: 'cigarette_state', question: 'Сигарета на краю чаши.', options: [['Затянуться.', 'smoked'], ['Стряхнуть пепел.', 'ashed'], ['Оставить как есть.', 'untouched']] },
      { key: 'caught_can', question: 'Эдвард бросил банку через стол.', options: [['Поймать.', true], ['Упустить.', false]] },
      { key: 'smoked_edward', question: 'Эдвард демонстративно втянул воздух.', options: [['Выдохнуть дым ему в лицо.', true], ['Не выдыхать дым ему в лицо.', false]] },
      { key: 'fight_answer', question: 'Эдвард: «И кто первым полез?»', options: [['- Я.', 'self'], ['- Он.', 'other'], ['- Не помню.', 'unknown']] },
    ],
    2: [
      { key: 'visitor_identity', question: 'Что Нилл увидел на куртке?', options: [['Знак старой грузовой компании.', 'worker'], ['Знак службы взыскания.', 'collector'], ['Обычная потёртость.', 'stranger']] },
      { key: 'visitor_motive', question: 'Что было на мокрой бумаге?', options: [['Это была складская накладная.', 'inventory'], ['Это была долговая расписка.', 'debt'], ['Это была салфетка.', 'nothing']] },
      { key: 'selected_first', question: 'Посетитель подошёл к столу.', options: [['Ударить первым.', 'self'], ['Перехватить его руку.', 'other'], ['Не двигаться.', 'unknown']] },
      { key: 'selected_can', question: 'Банка оказалась рядом.', options: [['Сжать банку в руке.', 'hand'], ['Поднять банку с пола.', 'floor'], ['Оттолкнуть её ботинком.', 'kick']] },
      { key: 'selected_edward', question: 'Где в этот момент был Эдвард?', options: [['Эдвард вмешался.', 'intervened'], ['Эдвард остался возле двери.', 'door'], ['Эдварда здесь не было.', 'absent']] },
      { key: 'final_fight_answer', question: 'Кто первым полез?', options: [['Я.', 'self'], ['Он.', 'other'], ['Не помню.', 'unknown'], ['Ты уже спрашивал.', 'repeated']] },
    ],
  };
  const quickChoicePanel = elements.storyDebugPanel.querySelector<HTMLElement>('#story-debug-quick')!;
  const quickChoiceTitle = elements.storyDebugPanel.querySelector<HTMLElement>('#story-debug-quick-title')!;
  const quickChoiceQuestion = elements.storyDebugPanel.querySelector<HTMLElement>('#story-debug-quick-question')!;
  const quickChoiceMemory = elements.storyDebugPanel.querySelector<HTMLElement>('#story-debug-quick-memory')!;
  const quickChoiceOptions = elements.storyDebugPanel.querySelector<HTMLElement>('#story-debug-quick-options')!;
  let quickChoiceChapter: 1 | 2 | null = null;
  let quickChoiceIndex = 0;
  let quickChoiceBaseline: Record<string, unknown> = {};
  let quickChoiceHistory: Array<{ label: string; changed: boolean }> = [];

  const renderQuickChoices = (): void => {
    quickChoiceOptions.replaceChildren();
    quickChoiceMemory.replaceChildren(...quickChoiceHistory.map((entry) => {
      const line = document.createElement('span');
      line.className = entry.changed ? 'is-changed' : 'is-confirmed';
      line.textContent = entry.label;
      return line;
    }));
    if (quickChoiceChapter === null) {
      quickChoiceTitle.textContent = 'Только выборы';
      quickChoiceQuestion.textContent = 'Какую главу пройти без текста?';
      for (const chapter of [1, 2] as const) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.debugQuickChapter = String(chapter);
        button.textContent = `Глава ${chapter === 1 ? 'I' : 'II'}`;
        quickChoiceOptions.appendChild(button);
      }
      return;
    }

    const steps = quickChoiceSteps[quickChoiceChapter];
    const step = steps[quickChoiceIndex];
    if (!step) {
      quickChoiceTitle.textContent = `Глава ${quickChoiceChapter === 1 ? 'I' : 'II'}`;
      const changedCount = quickChoiceHistory.filter((entry) => entry.changed).length;
      quickChoiceQuestion.textContent = changedCount > 0
        ? `Память собрана. Изменено значений: ${changedCount}.`
        : 'Память собрана без изменений.';
      const done = document.createElement('button');
      done.type = 'button';
      done.dataset.debugCommand = 'close-quick';
      done.textContent = 'Готово';
      quickChoiceOptions.appendChild(done);
      return;
    }

    quickChoiceTitle.textContent = `Глава ${quickChoiceChapter === 1 ? 'I' : 'II'} · ${quickChoiceIndex + 1}/${steps.length}`;
    quickChoiceQuestion.textContent = step.question;
    for (const [label, value] of step.options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.debugQuickAnswer = typeof value === 'boolean' ? String(value) : value;
      button.dataset.debugQuickValueType = typeof value;
      button.textContent = label;
      quickChoiceOptions.appendChild(button);
    }
  };

  const openQuickChoices = (): void => {
    quickChoiceChapter = null;
    quickChoiceIndex = 0;
    quickChoiceBaseline = {};
    quickChoiceHistory = [];
    quickChoicePanel.hidden = false;
    renderQuickChoices();
  };

  const resetAllProgress = (): void => {
    // A genuine local reset must also discard debug overrides and the live
    // Ink runtime held by this tab. Reloading after clearing origin storage
    // guarantees the next boot starts from a freshly constructed story.
    suppressPersistence = true;
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const resetChapterOneProgress = async (): Promise<void> => {
    if (isAdvancing) {
      skipCurrentBeatAnimation();
      while (isAdvancing) {
        await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      }
    }

    chapterProgress = createInitialChapterProgress();
    chapterProgressManager.save(chapterProgress);
    saveManager.clear();
    storyScrollTop[1] = 0;
    storyScrollTop[2] = 0;
    fightMemoryCheckpoint = undefined;

    if (debugOverrideActive) {
      debugStore.patchState((draft) => {
        const defaults = createDefaultDebugState(draft.seed);
        draft.chapters.chapter01 = { unlocked: true, started: false, completed: false };
        draft.chapters.chapter02 = { unlocked: false, started: false, completed: false };
        draft.choices.chapter01 = defaults.choices.chapter01;
        draft.choices.chapter02 = defaults.choices.chapter02;
        draft.memory = defaults.memory;
      });
    } else {
      const state = debugStore.getState();
      const defaults = createDefaultDebugState(state.seed);
      state.chapters.chapter01 = { unlocked: true, started: false, completed: false };
      state.chapters.chapter02 = { unlocked: false, started: false, completed: false };
      state.choices.chapter01 = defaults.choices.chapter01;
      state.choices.chapter02 = defaults.choices.chapter02;
      state.memory = defaults.memory;
      debugStore.hydrateState(state);
    }

    audioManager.fadeOutAndPause();
    musicManager.pauseForMenu();
    await transitionToScreen('chapter_menu', 0, async () => {
      transcript = [];
      pendingLines = [];
      pendingChoices = [];
      pendingChoiceSignificant = false;
      pendingEnd = false;
      isAdvancing = false;
      skipBeatRequested = false;
      choiceCheckpoint = undefined;
      fightMemoryCheckpoint = undefined;
      choiceIsLocked = false;
      unreliableState = createInitialUnreliableState();
      renderer.renderTranscript([]);
      renderer.clearChoices();
      backgroundManager.reset();
      backgroundManager.suspend();
      updateChapterMenu();
    });

    notifyDebug('Глава I сброшена. Зависимый прогресс главы II очищен.');
  };

  const resetChapterTwoProgress = async (): Promise<void> => {
    if (isAdvancing) {
      skipCurrentBeatAnimation();
      while (isAdvancing) {
        await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      }
    }

    const chapterTwoOwnsRuntime =
      appRoot.dataset.screen === 'chapter_02_fight' || inferRuntimeChapter() === 2;
    const chapterTwoStaysUnlocked =
      chapterProgress.unlockedChapters.includes(2) || chapterProgress.completedChapters.includes(1);

    chapterProgress = {
      ...chapterProgress,
      startedChapters: chapterProgress.startedChapters.filter((chapter) => chapter !== 2),
      completedChapters: chapterProgress.completedChapters.filter((chapter) => chapter !== 2),
      unlockedChapters: chapterTwoStaysUnlocked
        ? [...new Set([...chapterProgress.unlockedChapters, 2])]
        : chapterProgress.unlockedChapters.filter((chapter) => chapter !== 2),
      chapter2Variables: {},
    };
    chapterProgressManager.save(chapterProgress);
    storyScrollTop[2] = 0;
    fightMemoryCheckpoint = undefined;

    if (debugOverrideActive) {
      debugStore.patchState((draft) => {
        const defaults = createDefaultDebugState(draft.seed);
        draft.chapters.chapter02 = {
          unlocked: chapterTwoStaysUnlocked,
          started: false,
          completed: false,
        };
        draft.choices.chapter02 = defaults.choices.chapter02;
        draft.memory = defaults.memory;
      });
    } else {
      const state = debugStore.getState();
      const defaults = createDefaultDebugState(state.seed);
      state.chapters.chapter02 = {
        unlocked: chapterTwoStaysUnlocked,
        started: false,
        completed: false,
      };
      state.choices.chapter02 = defaults.choices.chapter02;
      state.memory = defaults.memory;
      debugStore.hydrateState(state);
    }

    if (chapterTwoOwnsRuntime) {
      saveManager.clear();
      audioManager.fadeOutAndPause();
      musicManager.pauseForMenu();
      await transitionToScreen('chapter_menu', 0, async () => {
        transcript = [];
        pendingLines = [];
        pendingChoices = [];
        pendingChoiceSignificant = false;
        pendingEnd = false;
        isAdvancing = false;
        skipBeatRequested = false;
        choiceCheckpoint = undefined;
        fightMemoryCheckpoint = undefined;
        choiceIsLocked = false;
        unreliableState = createInitialUnreliableState();
        renderer.renderTranscript([]);
        renderer.clearChoices();
        backgroundManager.reset();
        backgroundManager.suspend();
        updateChapterMenu();
      });
    } else {
      updateChapterMenu();
      persist();
    }

    notifyDebug('Глава II сброшена. Прогресс главы I сохранён.');
  };
  let simpleResetArmed = false;
  let simpleResetTimer: number | undefined;

  let debugJumpInProgress = false;
  const jumpToDebugPath = async (path: string, chapter: 1 | 2): Promise<void> => {
    if (debugJumpInProgress) return;
    debugJumpInProgress = true;
    notifyDebug(`Переход: ${path}`, false);
    try {
      if (isAdvancing) {
        skipCurrentBeatAnimation();
        while (isAdvancing) await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      }
      await transitionToScreen(chapter === 2 ? 'chapter_02_fight' : 'opening_bar', 0, async () => {
        activeChapter = chapter;
        elements.shell.dataset.chapter = String(chapter);
        saveManager.clear();
        backgroundManager.reset();
        elements.shell.classList.remove('fx-memory-lock');
        unreliableState = createInitialUnreliableState();
        transcript = [];
        pendingLines = [];
        pendingChoices = [];
        pendingChoiceSignificant = false;
        pendingEnd = false;
        isAdvancing = false;
        skipBeatRequested = false;
        choiceCheckpoint = undefined;
        fightMemoryCheckpoint = undefined;
        choiceIsLocked = false;
        renderer.renderTranscript([]);
        renderer.clearChoices();
        runtime = new InkRuntime();
        await runtime.init(STORY_CONFIG.source);
        const debugState = debugStore.getState();
        runtime.importVariables({ ...debugState.choices.chapter01, ...debugState.choices.chapter02, ...debugState.memory });
        runtime.jumpToPath(path);
        paletteManager.setPalette(chapter === 2 ? 'interruption-cold' : 'bar-warm');
        collectNextTurn();
        setExperienceState('waiting');
      });
      if (pendingLines.length > 0) await advanceNarrative();
      else showChoicesIfReady();
      persist();
      notifyDebug(`Открыт knot: ${path}`);
    } catch (error) {
      notifyDebug(`Ошибка перехода к ${path}.`);
      console.error(`Debug jump failed for ${path}`, error);
    } finally {
      debugJumpInProgress = false;
      renderDebugPanel();
    }
  };

  elements.storyDebugPanel.addEventListener('change', (event) => {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    if (control.dataset.debugChapter && control.dataset.debugChapterField) {
      const chapterKey = control.dataset.debugChapter === '2' ? 'chapter02' : 'chapter01';
      const field = control.dataset.debugChapterField as keyof ChapterState;
      const checked = control instanceof HTMLInputElement && control.checked;
      activateAndPatchDebug((draft) => { draft.chapters[chapterKey][field] = checked; }, `Изменено состояние главы ${control.dataset.debugChapter}.`);
      return;
    }
    if (control.dataset.debugField === 'ignoreChapterDependencies') {
      const checked = control instanceof HTMLInputElement && control.checked;
      activateAndPatchDebug((draft) => { draft.ignoreChapterDependencies = checked; }, 'Изменены зависимости глав.');
      return;
    }
    if (control.dataset.debugField === 'seed') {
      activateAndPatchDebug((draft) => { draft.seed = control.value; }, `Seed: ${control.value}`);
      return;
    }
    if (control.dataset.debugViewOption) {
      const field = control.dataset.debugViewOption as 'disableAnimations' | 'revealAllText';
      const checked = control instanceof HTMLInputElement && control.checked;
      activateAndPatchDebug((draft) => { draft.notebookView[field] = checked; }, 'Изменено отображение меню.');
      return;
    }
    if (control.dataset.debugChoice || control.dataset.debugMemory) {
      const live = elements.storyDebugPanel.querySelector<HTMLInputElement>('#story-debug-live-update')?.checked ?? true;
      if (live) {
        ensureDebugBackup();
        debugStore.setState(readDebugControls());
        notifyDebug('Выборы обновлены.');
      }
    }
  });

  elements.storyDebugPanel.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest<HTMLButtonElement>('button');
    if (!button) return;
    const quickChapter = Number(button.dataset.debugQuickChapter);
    if (quickChapter === 1 || quickChapter === 2) {
      quickChoiceChapter = quickChapter;
      quickChoiceIndex = 0;
      const currentState = debugStore.getState();
      quickChoiceBaseline = {
        ...(quickChapter === 1 ? currentState.choices.chapter01 : currentState.choices.chapter02),
      };
      quickChoiceHistory = [];
      ensureDebugBackup();
      debugStore.patchState((draft) => {
        const defaults = createDefaultDebugState(draft.seed);
        if (quickChapter === 1) {
          draft.choices.chapter01 = defaults.choices.chapter01;
        } else {
          draft.choices.chapter02 = defaults.choices.chapter02;
          draft.memory = defaults.memory;
        }
      });
      quickChoicePanel.hidden = false;
      renderQuickChoices();
      return;
    }
    if (button.dataset.debugQuickAnswer !== undefined && quickChoiceChapter !== null) {
      const steps = quickChoiceSteps[quickChoiceChapter];
      const step = steps[quickChoiceIndex];
      if (!step) return;
      const value = button.dataset.debugQuickValueType === 'boolean'
        ? button.dataset.debugQuickAnswer === 'true'
        : button.dataset.debugQuickAnswer;
      const chapter = quickChoiceChapter;
      const isLast = quickChoiceIndex === steps.length - 1;
      quickChoiceHistory.push({
        label: button.textContent?.trim() || step.question,
        changed: quickChoiceBaseline[step.key] !== value,
      });
      activateAndPatchDebug((draft) => {
        const choices = chapter === 1 ? draft.choices.chapter01 : draft.choices.chapter02;
        (choices as unknown as Record<string, string | boolean>)[step.key] = value;
        if (isLast && chapter === 1) {
          draft.chapters.chapter01 = { unlocked: true, started: true, completed: true };
          draft.chapters.chapter02.unlocked = true;
        } else if (isLast) {
          draft.chapters.chapter02 = { unlocked: true, started: true, completed: true };
        }
      }, isLast ? 'Быстрый прогон завершён.' : `Ответ сохранён: ${button.textContent?.trim()}.`);
      quickChoiceIndex += 1;
      renderQuickChoices();
      return;
    }
    const musicCommand = button.dataset.debugMusic;
    if (musicCommand) {
      musicManager.unlock();
      if (musicCommand.startsWith('seek-relative ')) {
        const delta = Number(musicCommand.split(' ')[1]) || 0;
        const seek = musicManager.getDebugState().currentSeek + delta;
        musicManager.handleCommands([`seek ${Math.max(0, seek)}`]);
      } else {
        musicManager.handleCommands([musicCommand]);
      }
      renderDebugPanel();
      persist();
      return;
    }
    const preset = button.dataset.debugPreset as StoryDebugPreset | undefined;
    if (preset) {
      ensureDebugBackup();
      const needsChapterOneChoices =
        preset === 'chapter02-open' && Object.keys(chapterProgress.chapter1Variables).length === 0;
      debugStore.applyPreset(preset);
      if (needsChapterOneChoices) debugStore.randomizeChapter(1);
      if (preset === 'chapter01-custom') elements.storyDebugPanel.querySelector<HTMLDetailsElement>('#story-debug-chapter01-choices')!.open = true;
      notifyDebug(
        preset === 'chapter01-random'
          ? `Состояние первой главы рандомизировано. ${summarizeChapterOneDebug()}`
          : `Применён пресет «${button.textContent?.trim()}».`,
      );
      return;
    }
    const view = button.dataset.debugView as StoryDebugState['notebookView']['mode'] | undefined;
    if (view) {
      activateAndPatchDebug((draft) => { draft.notebookView.mode = view; }, `Вид меню: ${button.textContent?.trim()}.`);
      return;
    }
    const outcome = button.dataset.debugOutcome;
    if (outcome) {
      activateAndPatchDebug((draft) => {
        if (outcome === 'collapse') draft.memory = { ...draft.memory, doubt: 1, delusion: 1, fracture: 3, memory_strain: 0 };
        else if (outcome === 'perfect') draft.memory = { ...draft.memory, doubt: 1, delusion: 3, fracture: 1, memory_strain: 0 };
        else if (outcome === 'unsupported') draft.memory = { ...draft.memory, doubt: 1, delusion: 1, fracture: 1, memory_strain: 2 };
        else draft.memory = { ...draft.memory, doubt: 1, delusion: 1, fracture: 1, memory_strain: 0 };
      }, `Собран исход: ${button.textContent?.trim()}.`);
      return;
    }
    const openChapter = Number(button.dataset.debugOpenChapter || button.dataset.debugRestartChapter);
    if (openChapter === 1) {
      void transitionToScreen('opening_bar', 0, async () => {
        await restartStory(true);
      });
      notifyDebug('Открыта глава I.');
      return;
    }
    if (openChapter === 2) {
      void startChapterTwo(true);
      notifyDebug('Открыта глава II.');
      return;
    }
    const clearChapter = Number(button.dataset.debugClearChapter);
    if (clearChapter === 1 || clearChapter === 2) {
      if (clearChapter === 1) {
        void resetChapterOneProgress();
        return;
      }
      if (clearChapter === 2) {
        void resetChapterTwoProgress();
        return;
      }
    }
    const path = button.dataset.debugPath;
    if (path) {
      void jumpToDebugPath(path, button.dataset.debugPathChapter === '2' ? 2 : 1);
      return;
    }
    const navigation = button.dataset.debugNav;
    if (navigation === 'menu') {
      updateChapterMenu();
      void transitionToScreen('chapter_menu');
      notifyDebug('Открыт экран меню.');
      return;
    }
    if (navigation === 'chapter01') {
      void transitionToScreen('opening_bar', 0, async () => {
        await restartStory(true);
      });
      return;
    }
    if (navigation === 'chapter02') {
      void startChapterTwo(true);
      return;
    }
    const command = button.dataset.debugCommand;
    if (!command) return;
    if (command === 'close') setDebugPanelOpen(false);
    else if (command === 'toggle-event-debug') {
      debugFastMode = !debugFastMode;
      localStorage.setItem('nill-debug-fast-mode', debugFastMode ? '1' : '0');
      elements.debugNextSignificant.hidden =
        !debugFastMode || appRoot.dataset.screen === 'chapter_menu';
      syncEventDebugButton();
      notifyDebug(debugFastMode ? 'Дебаг событий включён.' : 'Дебаг событий выключен.');
    }
    else if (command === 'restart-current-chapter') {
      const currentScreen = appRoot.dataset.screen;
      if (currentScreen === 'opening_bar') {
        void transitionToScreen('opening_bar', 0, async () => {
          storyScrollTop[1] = 0;
          await restartStory(true);
        });
        notifyDebug('Глава I начата сначала. Сохранённый прогресс не удалён.');
      } else if (currentScreen === 'chapter_02_fight') {
        storyScrollTop[2] = 0;
        void startChapterTwo(true);
        notifyDebug('Глава II начата сначала. Сохранённый прогресс не удалён.');
      } else {
        notifyDebug('Сначала откройте главу, которую нужно начать заново.');
      }
    }
    else if (command === 'quick-choices') openQuickChoices();
    else if (command === 'close-quick') {
      quickChoicePanel.hidden = true;
      quickChoiceChapter = null;
      quickChoiceIndex = 0;
      quickChoiceBaseline = {};
      quickChoiceHistory = [];
    }
    else if (command === 'jump-selected') {
      const select = elements.storyDebugPanel.querySelector<HTMLSelectElement>('#story-debug-jump-select');
      const [chapterValue, path] = (select?.value ?? '').split(':');
      if (path) void jumpToDebugPath(path, chapterValue === '2' ? 2 : 1);
    }
    else if (command === 'simple-reset') {
      if (!simpleResetArmed) {
        simpleResetArmed = true;
        button.textContent = 'Нажмите ещё раз для сброса';
        window.clearTimeout(simpleResetTimer);
        simpleResetTimer = window.setTimeout(() => {
          simpleResetArmed = false;
          button.textContent = 'Удалить прогресс и значения';
        }, 3500);
      } else {
        window.clearTimeout(simpleResetTimer);
        simpleResetArmed = false;
        resetAllProgress();
        button.textContent = 'Удалить прогресс и значения';
      }
    }
    else if (command === 'new-seed') activateAndPatchDebug((draft) => { draft.seed = StoryStateStore.createSeed(); }, 'Создан новый seed.');
    else if (command === 'copy-seed') void navigator.clipboard.writeText(debugStore.getState().seed).then(() => notifyDebug('Seed скопирован.'));
    else if (command === 'randomize-chapter01') { ensureDebugBackup(); debugStore.randomizeChapter(1); notifyDebug(`Выборы главы I рандомизированы. ${summarizeChapterOneDebug()}`); }
    else if (command === 'randomize-chapter02') { ensureDebugBackup(); debugStore.randomizeChapter(2); notifyDebug('Выборы главы II рандомизированы.'); }
    else if (command === 'apply-choices') { ensureDebugBackup(); debugStore.setState(readDebugControls()); notifyDebug('Выбранное состояние применено.'); }
    else if (command === 'restore-choices') renderDebugPanel();
    else if (command === 'reset-chapter01-choices') activateAndPatchDebug((draft) => { draft.choices.chapter01 = createDefaultDebugState(draft.seed).choices.chapter01; }, 'Выборы главы I сброшены.');
    else if (command === 'ask-reset') elements.storyDebugResetConfirm.hidden = false;
    else if (command === 'cancel-reset') elements.storyDebugResetConfirm.hidden = true;
    else if (command === 'confirm-reset') {
      elements.storyDebugResetConfirm.hidden = true;
      resetAllProgress();
    } else if (command === 'copy-json') void navigator.clipboard.writeText(debugStore.exportState()).then(() => notifyDebug('JSON скопирован.'));
    else if (command === 'import-json') {
      try { ensureDebugBackup(); const result = debugStore.importState(elements.storyDebugImportText.value); notifyDebug(result.corrections.length ? `Импортировано. Исправления: ${result.corrections.join(' ')}` : 'Состояние импортировано.'); }
      catch (error) { notifyDebug(error instanceof Error ? error.message : 'Ошибка импорта.'); }
    } else if (command === 'export-file') {
      const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([debugStore.exportState()], { type: 'application/json' })); link.download = `nill-debug-${debugStore.getState().seed}.json`; link.click(); URL.revokeObjectURL(link.href);
    } else if (command === 'choose-file') elements.storyDebugImportFile.click();
    else if (command === 'restore-backup') {
      const raw = localStorage.getItem(DEBUG_BACKUP_KEY); if (!raw) { notifyDebug('Резервной копии нет.'); return; }
      const backup = JSON.parse(raw) as { chapterProgress: string | null; storySave: string | null };
      if (backup.chapterProgress) localStorage.setItem(STORY_CONFIG.chapterProgressKey, backup.chapterProgress); else localStorage.removeItem(STORY_CONFIG.chapterProgressKey);
      if (backup.storySave) localStorage.setItem(STORY_CONFIG.saveKey, backup.storySave); else localStorage.removeItem(STORY_CONFIG.saveKey);
      localStorage.removeItem('nill-quest-debug-override'); localStorage.removeItem(DEBUG_BACKUP_KEY); window.location.reload();
    } else if (command === 'commit-debug') { localStorage.removeItem('nill-quest-debug-override'); localStorage.removeItem(DEBUG_BACKUP_KEY); debugOverrideActive = false; renderDebugPanel(); notifyDebug('Debug сохранён как основной прогресс.'); }
    else if (command === 'remove-override') { localStorage.removeItem('nill-quest-debug-override'); debugOverrideActive = false; renderDebugPanel(); notifyDebug('Debug override удалён.'); }
    else if (command === 'clear-log') { debugLogEntries = []; localStorage.removeItem(DEBUG_LOG_KEY); renderDebugPanel(); }
  });

  elements.storyDebugImportFile.addEventListener('change', () => {
    const file = elements.storyDebugImportFile.files?.[0]; if (!file) return;
    void file.text().then((raw) => { elements.storyDebugImportText.value = raw; ensureDebugBackup(); const result = debugStore.importState(raw); notifyDebug(result.corrections.length ? `Файл импортирован с исправлениями: ${result.corrections.join(' ')}` : 'Файл импортирован.'); }).catch(() => notifyDebug('Не удалось загрузить файл.'));
  });

  renderDebugPanel();

  const currentChoices: StoryChoice[] = runtime.getChoices();
  if (currentChoices.length > 0 && pendingLines.length === 0) {
    pendingChoices = currentChoices;
    setExperienceState('choosing');
    renderer.renderChoices(
      currentChoices,
      onChoice,
      choiceIsLocked ? choiceCheckpoint?.selectedIndex : undefined,
    );
    if (resumeScreen) {
      renderer.pinToReadingEdgeNow();
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: storyScrollTop[activeChapter], behavior: 'auto' });
      });
    }
    persist();
    return;
  }

  if (pendingLines.length === 0) {
    collectNextTurn();
  }
  setExperienceState(transcript.length === 0 ? 'intro' : 'waiting');
  showChoicesIfReady();
  if (resumeScreen) {
    renderer.pinToReadingEdgeNow();
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: storyScrollTop[activeChapter], behavior: 'auto' });
    });
  }
}

function queryOrThrow<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  return element;
}

function getFragmentDelayMs(line: NarrativeLine): number {
  const layerDelay: Record<NarrativeLine['layer'], number> = {
    narration: 430,
    dialogue: 480,
    thought: 540,
    archive: 620,
    unknown: 1000,
  };

  return layerDelay[line.layer];
}

function toggleChapter(chapters: number[], chapter: number, enabled: boolean): number[] {
  if (enabled) {
    return [...new Set([...chapters, chapter])].sort((a, b) => a - b);
  }
  return chapters.filter((value) => value !== chapter);
}

function normalizeLegacyDialogue(lines: NarrativeLine[]): NarrativeLine[] {
  const speakers: Record<string, string> = {
    ЭДВАРД: 'edward',
    НИЛЛ: 'nill',
    ПОСЕТИТЕЛЬ: 'visitor',
  };
  const normalized: NarrativeLine[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const next = lines[index + 1];
    const speaker = line.layer === 'dialogue' ? speakers[line.text.trim()] : undefined;
    if (speaker && next?.layer === 'dialogue' && !next.speaker) {
      normalized.push({ ...next, speaker, tags: { ...next.tags, speaker } });
      index += 1;
      continue;
    }
    normalized.push(line);
  }

  return normalized;
}
