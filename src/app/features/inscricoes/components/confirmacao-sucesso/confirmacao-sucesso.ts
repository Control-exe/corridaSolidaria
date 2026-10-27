import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-confirmacao-sucesso',
  templateUrl: './confirmacao-sucesso.html',
  styleUrl: './confirmacao-sucesso.scss',
})
export class ConfirmacaoSucesso implements OnInit {
  readonly mensagem = input.required<string>();
  readonly concluido = output<void>();
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const timer = setTimeout(() => this.concluido.emit(), 1200);
    this.destroyRef.onDestroy(() => clearTimeout(timer));
  }
}
