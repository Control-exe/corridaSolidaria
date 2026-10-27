import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InscricaoCard } from '../../components/inscricao-card/inscricao-card';
import { InscricoesLayout } from '../../components/inscricoes-layout/inscricoes-layout';
import { EVENTO } from '../../config/evento';
import { InscricoesService } from '../../services/inscricoes.service';

@Component({
  selector: 'app-detalhe-inscricao',
  imports: [RouterLink, InscricaoCard, InscricoesLayout],
  templateUrl: './detalhe-inscricao.html',
  styleUrl: './detalhe-inscricao.scss',
})
export class DetalheInscricao {
  private readonly route = inject(ActivatedRoute);
  private readonly parametros = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  private readonly dados = inject(InscricoesService);
  protected readonly evento = EVENTO;
  // O Router já decodifica o segmento. Não aplicar decodeURIComponent novamente.
  protected readonly inscricao = computed(() =>
    this.dados.buscar(this.parametros().get('email') ?? ''),
  );
}
