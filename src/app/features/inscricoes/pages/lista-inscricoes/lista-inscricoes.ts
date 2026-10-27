import { Component, inject } from '@angular/core';
import { InscricaoCard } from '../../components/inscricao-card/inscricao-card';
import { InscricoesLayout } from '../../components/inscricoes-layout/inscricoes-layout';
import { InscricoesService } from '../../services/inscricoes.service';

@Component({
  selector: 'app-lista-inscricoes',
  imports: [InscricaoCard, InscricoesLayout],
  templateUrl: './lista-inscricoes.html',
  styleUrl: './lista-inscricoes.scss',
})
export class ListaInscricoes {
  protected readonly dados = inject(InscricoesService);
}
