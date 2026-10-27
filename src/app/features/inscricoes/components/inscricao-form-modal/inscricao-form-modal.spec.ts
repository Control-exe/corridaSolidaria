import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscricoesService } from '../../services/inscricoes.service';
import { InscricaoFormModal } from './inscricao-form-modal';

describe('Formulário de inscrição', () => {
  let fixture: ComponentFixture<InscricaoFormModal>;
  let root: HTMLElement;
  let dados: InscricoesService;

  beforeEach(async () => {
    fixture = TestBed.createComponent(InscricaoFormModal);
    dados = TestBed.inject(InscricoesService);
    await fixture.whenStable();
    root = fixture.nativeElement;
    // jsdom não implementa a modalidade/foco nativos; esses pontos exigem navegador.
    const dialog = root.querySelector('dialog')!;
    dialog.showModal = () => dialog.setAttribute('open', '');
    dialog.close = () => dialog.removeAttribute('open');
  });

  function preencher(campo: string, valor: string): void {
    const input = root.querySelector<HTMLInputElement>(`[formControlName="${campo}"]`)!;
    input.value = valor;
    input.dispatchEvent(new Event('input'));
  }
  function percurso(texto: string): void {
    const select = root.querySelector('select')!;
    select.value = Array.from(select.options).find(
      (option) => option.textContent?.trim() === texto,
    )!.value;
    select.dispatchEvent(new Event('change'));
  }
  async function enviar(): Promise<void> {
    root
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    if (root.querySelector('app-confirmacao-sucesso')) {
      expect(root.querySelector('app-confirmacao-sucesso svg')).toBeTruthy();
      expect(root.querySelector('dialog')?.hasAttribute('open')).toBe(true);
      expect(root.querySelector<HTMLButtonElement>('[type="submit"]')?.disabled).toBe(true);
      await new Promise((resolve) => setTimeout(resolve, 1300));
      await fixture.whenStable();
    }
  }

  it('insere barras durante a digitação e aceita colar a data sem separadores', () => {
    fixture.componentInstance.abrir();
    const input = root.querySelector<HTMLInputElement>('#dataNascimento')!;
    for (const [digitado, esperado] of [
      ['1', '1'],
      ['14', '14/'],
      ['14/03', '14/03/'],
      ['14032009', '14/03/2009'],
    ]) {
      preencher('dataNascimento', digitado);
      expect(input.value).toBe(esperado);
    }
    input.value = '14/03';
    input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward' }));
    expect(input.value).toBe('14/03');
  });

  it('revela erros no envio e mantém a modal e o preenchimento', async () => {
    fixture.componentInstance.abrir();
    preencher('nome', 'Ab');
    await enviar();
    expect(root.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    expect(root.querySelectorAll('.error')).toHaveLength(4);
    expect(root.querySelector<HTMLInputElement>('#nome')?.value).toBe('Ab');
    expect(dados.inscricoes()).toHaveLength(5);
  });

  it('cadastra exatamente uma inscrição e fecha a modal', async () => {
    fixture.componentInstance.abrir();
    preencher('nome', 'Ana Nova');
    preencher('email', 'ana+nova@example.com');
    preencher('dataNascimento', '14/03/2009');
    percurso('10 km');
    await enviar();
    expect(dados.inscricoes()).toHaveLength(6);
    expect(root.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  });

  it('mostra duplicidade no email sem perder o rascunho', async () => {
    fixture.componentInstance.abrir();
    preencher('nome', 'Outra Ana');
    preencher('email', ' ANA.CLARA@EXAMPLE.COM ');
    preencher('dataNascimento', '14/03/2009');
    percurso('5 km');
    await enviar();
    expect(root.textContent).toContain('Já existe uma inscrição com este e-mail.');
    expect(root.querySelector<HTMLInputElement>('#nome')?.value).toBe('Outra Ana');
    expect(root.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    preencher('email', 'ana+outra@example.com');
    await enviar();
    expect(dados.inscricoes()).toHaveLength(6);
  });

  it('desmarca 10 km ao tornar menor, exige escolha e só altera registro após salvar', async () => {
    const original = dados.buscar('bruno.oliveira@example.com')!;
    fixture.componentInstance.abrir(original);
    preencher('dataNascimento', '15/03/2009');
    await fixture.whenStable();
    expect(root.querySelector('select')?.selectedOptions[0].textContent).toContain('Selecione');
    expect(root.textContent).toContain('O percurso de 10 km foi desmarcado');
    expect(dados.buscar(original.email)).toBe(original);
    await enviar();
    expect(dados.buscar(original.email)).toBe(original);
    percurso('5 km');
    await enviar();
    expect(dados.buscar(original.email)?.percurso).toBe(5);
    expect(dados.buscar(original.email)?.dataNascimento).toBe('2009-03-15');
  });

  it('bloqueia email na edição, descarta rascunho ao desistir e reabre limpo', async () => {
    const original = dados.inscricoes()[0];
    fixture.componentInstance.abrir(original);
    await fixture.whenStable();
    expect(root.querySelector<HTMLInputElement>('#email')?.readOnly).toBe(true);
    preencher('nome', 'Rascunho');
    fixture.componentInstance.fechar();
    expect(dados.inscricoes()[0]).toBe(original);
    fixture.componentInstance.abrir();
    await fixture.whenStable();
    expect(root.querySelector<HTMLInputElement>('#nome')?.value).toBe('');
    expect(root.querySelector<HTMLInputElement>('#email')?.readOnly).toBe(false);
    expect(root.querySelector('select')?.selectedOptions[0].textContent).toContain('Selecione');
  });
});
