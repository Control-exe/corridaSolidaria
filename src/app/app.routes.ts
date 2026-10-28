import { Routes } from '@angular/router';
import { EVENTO } from './features/inscricoes/config/evento';
import { ListaInscricoes } from './features/inscricoes/pages/lista-inscricoes/lista-inscricoes';
import { DetalheInscricao } from './features/inscricoes/pages/detalhe-inscricao/detalhe-inscricao';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inscricoes' },
  { path: 'inscricoes', component: ListaInscricoes, title: `Inscrições · ${EVENTO.nomeCurto}` },
  {
    path: 'inscricoes/:email',
    component: DetalheInscricao,
    title: `Detalhes da inscrição · ${EVENTO.nomeCurto}`,
  },
  { path: '**', redirectTo: 'inscricoes' },
];
