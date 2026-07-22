export type SettingsControls = {
  muteButton: HTMLButtonElement;
  restartButton: HTMLButtonElement;
};

export function updateMuteLabel(button: HTMLButtonElement, muted: boolean): void {
  button.textContent = muted ? 'Звук: выкл' : 'Звук: вкл';
}
