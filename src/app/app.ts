import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { EVENTO } from './features/inscricoes/config/evento';
import { InscricoesService } from './features/inscricoes/services/inscricoes.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly evento = EVENTO;
  protected readonly dados = inject(InscricoesService);

  constructor() {
    inject(Title).setTitle(EVENTO.nomeCurto);
  }
}
