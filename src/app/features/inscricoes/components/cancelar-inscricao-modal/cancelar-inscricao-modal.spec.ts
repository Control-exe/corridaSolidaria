import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscricoesService } from '../../services/inscricoes.service';
import { CancelarInscricaoModal } from './cancelar-inscricao-modal';

describe('Confirmação de cancelamento', () => {
  let fixture: ComponentFixture<CancelarInscricaoModal>;
  let root: HTMLElement;
  let dados: InscricoesService;
  beforeEach(async () => {
    fixture = TestBed.createComponent(CancelarInscricaoModal);
    dados = TestBed.inject(InscricoesService);
    await fixture.whenStable();
    root = fixture.nativeElement;
    const dialog = root.querySelector('dialog')!;
    dialog.showModal = () => dialog.setAttribute('open', '');
    dialog.close = () => dialog.removeAttribute('open');
    fixture.componentInstance.abrir(dados.inscricoes()[0], document.createElement('button'));
    await fixture.whenStable();
  });

  it('identifica o inscrito e desistir preserva o registro', () => {
    expect(root.textContent).toContain('Ana Clara Souza');
    expect(root.textContent).toContain('ana.clara@example.com');
    root.querySelector<HTMLButtonElement>('.keep-button')!.click();
    expect(dados.inscricoes()).toHaveLength(5);
    expect(root.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  });

  it('confirmar remove uma única inscrição e fecha a modal sem confere', async () => {
    root.querySelector<HTMLButtonElement>('.danger')!.click();
    await fixture.whenStable();
    expect(dados.inscricoes()).toHaveLength(4);
    expect(dados.buscar('ana.clara@example.com')).toBeUndefined();
    expect(root.querySelector('app-confirmacao-sucesso')).toBeNull();
    expect(root.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  });

  it('registro removido anteriormente informa recusa e mantém confirmação aberta', async () => {
    dados.cancelar('ana.clara@example.com');
    const antes = dados.inscricoes();
    root.querySelector<HTMLButtonElement>('.danger')!.click();
    await fixture.whenStable();
    expect(root.textContent).toContain('A inscrição não foi encontrada.');
    expect(root.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    expect(dados.inscricoes()).toBe(antes);
  });
});
