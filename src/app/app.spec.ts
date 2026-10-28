import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { InscricoesService } from './features/inscricoes/services/inscricoes.service';

describe('Aplicação e navegação', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] }),
  );

  it('apresenta o evento e o contador total no cabeçalho', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('5ª Corrida Solidária');
    expect(fixture.nativeElement.querySelector('.total').textContent).toContain('5');
    expect(fixture.nativeElement.querySelector('.brand').getAttribute('aria-label')).toBe(
      'Corrida Solidária — inscrições',
    );
    expect(TestBed.inject(Title).getTitle()).toBe('Corrida Solidária');
  });

  it('redireciona raiz e rotas desconhecidas para a lista', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(TestBed.inject(Router).url).toBe('/inscricoes');
    expect(harness.routeNativeElement?.querySelectorAll('article')).toHaveLength(5);
    expect(harness.routeNativeElement?.querySelector('.event-date')?.textContent).toContain(
      'Domingo, 14/03/2027 · Praça da Matriz',
    );
    expect(TestBed.inject(Title).getTitle()).toBe('Inscrições · Corrida Solidária');
    await harness.navigateByUrl('/rota-desconhecida');
    expect(TestBed.inject(Router).url).toBe('/inscricoes');
  });

  it('navega com + e % no email sem codificação dupla, preservando a mesma service', async () => {
    const dados = TestBed.inject(InscricoesService);
    const email = 'ana+prova%teste@example.com';
    dados.cadastrar({ nome: 'Ana da Prova', email, dataNascimento: '01/01/1990', percurso: 5 });
    const harness = await RouterTestingHarness.create('/inscricoes');
    const link = harness.routeNativeElement!.querySelector<HTMLAnchorElement>(
      'a[aria-label="Detalhes de Ana da Prova"]',
    )!;
    expect(link.getAttribute('href')).toContain('ana%2Bprova%25teste@example.com');
    await harness.navigateByUrl(link.getAttribute('href')!);
    expect(harness.routeNativeElement?.textContent).toContain('Ana da Prova');
    expect(harness.routeNativeElement?.textContent).toContain(email);
    expect(TestBed.inject(Title).getTitle()).toBe('Detalhes da inscrição · Corrida Solidária');
    expect(harness.routeNativeElement?.querySelectorAll('article')).toHaveLength(1);
    await harness.navigateByUrl('/inscricoes');
    expect(harness.routeNativeElement?.querySelectorAll('article')).toHaveLength(6);
  });

  it('atualiza detalhes quando o parâmetro de email muda', async () => {
    const harness = await RouterTestingHarness.create('/inscricoes/ana.clara@example.com');
    await harness.navigateByUrl('/inscricoes/helena.costa@example.com');
    expect(harness.routeNativeElement?.querySelector('article')?.textContent).toContain(
      'Helena Costa',
    );
  });

  it('mostra inscrição inexistente e convite de cadastro quando a lista esvazia', async () => {
    const harness = await RouterTestingHarness.create('/inscricoes/inexistente@example.com');
    expect(harness.routeNativeElement?.textContent).toContain('Inscrição não encontrada');
    const dados = TestBed.inject(InscricoesService);
    dados.inscricoes().forEach((item) => dados.cancelar(item.email));
    await harness.navigateByUrl('/inscricoes');
    expect(harness.routeNativeElement?.querySelectorAll('article')).toHaveLength(0);
    expect(harness.routeNativeElement?.textContent).toContain('Cadastre um corredor');
  });
});
