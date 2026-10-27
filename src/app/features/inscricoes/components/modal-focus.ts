// Reutilizado pelas duas modais para manter Tab/Shift+Tab nos controles do diálogo.
export function manterFocoNaModal(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !(event.currentTarget instanceof HTMLDialogElement)) return;
  const controles = event.currentTarget.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]',
  );
  const primeiro = controles[0];
  const ultimo = controles[controles.length - 1];
  if (event.shiftKey && document.activeElement === primeiro) {
    event.preventDefault();
    ultimo?.focus();
  } else if (!event.shiftKey && document.activeElement === ultimo) {
    event.preventDefault();
    primeiro?.focus();
  }
}
