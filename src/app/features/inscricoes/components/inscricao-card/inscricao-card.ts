import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EVENTO } from '../../config/evento';
import { Inscricao } from '../../models/inscricao';
import { calcularIdade, categoriaPorIdade, formatarData } from '../../rules/inscricao.rules';

@Component({
  selector: 'app-inscricao-card',
  imports: [RouterLink],
  templateUrl: './inscricao-card.html',
  styleUrl: './inscricao-card.scss',
})
export class InscricaoCard {
  readonly inscricao = input.required<Inscricao>();
  readonly editar = output<Inscricao>();
  readonly cancelar = output<Inscricao>();
  protected readonly idade = computed(() =>
    calcularIdade(this.inscricao().dataNascimento, EVENTO.data),
  );
  protected readonly categoria = computed(() => categoriaPorIdade(this.idade()));
  protected readonly nascimento = computed(() => formatarData(this.inscricao().dataNascimento));
}
