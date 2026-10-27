import { Routes } from '@angular/router';
import { ListaInscricoes } from './features/inscricoes/pages/lista-inscricoes/lista-inscricoes';
import { DetalheInscricao } from './features/inscricoes/pages/detalhe-inscricao/detalhe-inscricao';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inscricoes' },
  { path: 'inscricoes', component: ListaInscricoes, title: 'Inscrições · Corrida Solidária' },
  {
    path: 'inscricoes/:email',
    component: DetalheInscricao,
    title: 'Detalhes da inscrição · Corrida Solidária',
  },
  { path: '**', redirectTo: 'inscricoes' },
];
