import { computed, Injectable, signal } from '@angular/core';
import { EVENTO } from '../config/evento';
import { INSCRICOES_INICIAIS } from '../data/inscricoes-iniciais';
import { CadastroInscricao, EdicaoInscricao, Inscricao, Resultado } from '../models/inscricao';
import { hojeCalendario, normalizarEmail, validarInscricao } from '../rules/inscricao.rules';

@Injectable({ providedIn: 'root' })
export class InscricoesService {
  private readonly registros = signal<readonly Inscricao[]>(
    Object.freeze(INSCRICOES_INICIAIS.map((item) => Object.freeze({ ...item }))),
  );
  readonly inscricoes = this.registros.asReadonly();
  readonly contadores = computed(() => ({
    cinco: this.registros().filter((item) => item.percurso === 5).length,
    dez: this.registros().filter((item) => item.percurso === 10).length,
    total: this.registros().length,
  }));

  buscar(email: string): Inscricao | undefined {
    return this.registros().find((item) => item.email === normalizarEmail(email));
  }

  cadastrar(entrada: CadastroInscricao): Resultado<Inscricao> {
    const resultado = validarInscricao(entrada, hojeCalendario(), EVENTO.data);
    if (!resultado.sucesso) return resultado;
    if (this.buscar(resultado.valor.email)) {
      return { sucesso: false, erros: { email: 'Já existe uma inscrição com este e-mail.' } };
    }
    const registro = Object.freeze(resultado.valor);
    this.registros.update((lista) => Object.freeze([...lista, registro]));
    return { sucesso: true, valor: registro };
  }

  editar(emailOriginal: string, entrada: EdicaoInscricao): Resultado<Inscricao> {
    const original = this.buscar(emailOriginal);
    if (!original) return this.naoEncontrada();
    // Seleção explícita: propriedades extras recebidas nunca substituem o identificador.
    const resultado = validarInscricao(
      {
        email: original.email,
        nome: entrada.nome,
        dataNascimento: entrada.dataNascimento,
        percurso: entrada.percurso,
      },
      hojeCalendario(),
      EVENTO.data,
    );
    if (!resultado.sucesso) return resultado;
    const registro = Object.freeze(resultado.valor);
    this.registros.update((lista) =>
      Object.freeze(lista.map((item) => (item.email === original.email ? registro : item))),
    );
    return { sucesso: true, valor: registro };
  }

  cancelar(email: string): Resultado<Inscricao> {
    const registro = this.buscar(email);
    if (!registro) return this.naoEncontrada();
    this.registros.update((lista) =>
      Object.freeze(lista.filter((item) => item.email !== registro.email)),
    );
    return { sucesso: true, valor: registro };
  }

  private naoEncontrada(): Resultado<Inscricao> {
    return { sucesso: false, erros: {}, geral: 'A inscrição não foi encontrada.' };
  }
}
