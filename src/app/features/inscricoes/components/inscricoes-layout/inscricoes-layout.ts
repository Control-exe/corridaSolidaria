import { Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { EVENTO } from '../../config/evento';
import { Inscricao } from '../../models/inscricao';
import { InscricoesService } from '../../services/inscricoes.service';
import { InscricaoFormModal } from '../inscricao-form-modal/inscricao-form-modal';
import { CancelarInscricaoModal } from '../cancelar-inscricao-modal/cancelar-inscricao-modal';

@Component({
  selector: 'app-inscricoes-layout',
  imports: [InscricaoFormModal, CancelarInscricaoModal],
  templateUrl: './inscricoes-layout.html',
  styleUrl: './inscricoes-layout.scss',
})
export class InscricoesLayout {
  readonly titulo = input.required<string>();
  readonly removida = output<string>();
  private readonly formulario = viewChild.required(InscricaoFormModal);
  private readonly confirmacao = viewChild.required(CancelarInscricaoModal);
  private readonly cadastro = viewChild.required<ElementRef<HTMLButtonElement>>('cadastro');
  protected readonly dados = inject(InscricoesService);
  protected readonly evento = EVENTO;

  abrir(inscricao?: Inscricao): void {
    this.formulario().abrir(inscricao, this.cadastro().nativeElement);
  }
  cancelar(inscricao: Inscricao): void {
    this.confirmacao().abrir(inscricao, this.cadastro().nativeElement);
  }
  protected cancelada(email: string): void {
    this.removida.emit(email);
  }
}
