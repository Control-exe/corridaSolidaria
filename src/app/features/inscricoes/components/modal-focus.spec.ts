import { manterFocoNaModal } from './modal-focus';

describe('Navegação de teclado nas modais', () => {
  let dialog: HTMLDialogElement;
  let primeiro: HTMLButtonElement;
  let ultimo: HTMLButtonElement;
  beforeEach(() => {
    dialog = document.createElement('dialog');
    dialog.setAttribute('open', '');
    primeiro = document.createElement('button');
    ultimo = document.createElement('button');
    dialog.append(primeiro, document.createElement('input'), ultimo);
    document.body.append(dialog);
    dialog.addEventListener('keydown', manterFocoNaModal);
  });
  afterEach(() => dialog.remove());

  it('retorna ao primeiro controle com Tab no último', () => {
    ultimo.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    ultimo.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(primeiro);
  });
  it('retorna ao último controle com Shift+Tab no primeiro', () => {
    primeiro.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    primeiro.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(ultimo);
  });
  it('preserva navegação intermediária e Escape nativo', () => {
    const input = dialog.querySelector('input')!;
    input.focus();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    input.dispatchEvent(tab);
    input.dispatchEvent(escape);
    expect(tab.defaultPrevented).toBe(false);
    expect(escape.defaultPrevented).toBe(false);
  });
});
