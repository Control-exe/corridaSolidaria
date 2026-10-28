import { Component, ElementRef, inject, output, signal, viewChild } from '@angular/core';
import { Inscricao } from '../../models/inscricao';
import { EVENTO } from '../../config/evento';
import { InscricoesService } from '../../services/inscricoes.service';

@Component({
  selector: 'app-cancelar-inscricao-modal',
  templateUrl: './cancelar-inscricao-modal.html',
  styleUrl: './cancelar-inscricao-modal.scss',
})
export class CancelarInscricaoModal {
  protected readonly evento = EVENTO;
  private readonly dados = inject(InscricoesService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private origem: HTMLElement | null = null;
  private retorno: HTMLElement | null = null;
  protected readonly inscricao = signal<Inscricao | null>(null);
  protected readonly erro = signal('');
  readonly removida = output<string>();

  abrir(inscricao: Inscricao, retorno: HTMLElement): void {
    this.origem = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.retorno = retorno;
    this.inscricao.set(inscricao);
    this.erro.set('');
    this.dialog().nativeElement.showModal();
    this.dialog().nativeElement.querySelector<HTMLElement>('.keep-button')?.focus();
  }

  fechar(event?: Event): void {
    event?.preventDefault();
    this.dialog().nativeElement.close();
    this.origem?.focus();
  }

  protected confirmar(): void {
    const inscricao = this.inscricao();
    if (!inscricao) return;
    const resultado = this.dados.cancelar(inscricao.email);
    if (!resultado.sucesso) {
      this.erro.set(resultado.geral ?? 'Não foi possível cancelar a inscrição.');
      return;
    }
    this.dialog().nativeElement.close();
    // O botão do card será removido; o cadastro é um destino estável de foco.
    this.retorno?.focus();
    this.removida.emit(inscricao.email);
  }
}
