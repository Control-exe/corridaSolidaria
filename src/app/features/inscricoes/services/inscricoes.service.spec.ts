import { TestBed } from '@angular/core/testing';
import { EVENTO } from '../config/evento';
import { EdicaoInscricao } from '../models/inscricao';
import {
  calcularIdade,
  categoriaPorIdade,
  formatarData,
  validarInscricao,
} from '../rules/inscricao.rules';
import { InscricoesService } from './inscricoes.service';

const entrada = {
  nome: '  José   D’Ávila-Souza ',
  email: ' JOSE+CORRIDA@EXAMPLE.COM ',
  dataNascimento: '14/03/2009',
  percurso: 10,
};

describe('InscricoesService', () => {
  let service: InscricoesService;
  beforeEach(() => {
    service = TestBed.inject(InscricoesService);
  });

  it('inicia com os cinco exemplos válidos e contadores 3/2/5', () => {
    expect(service.inscricoes()).toHaveLength(5);
    expect(service.contadores()).toEqual({ cinco: 3, dez: 2, total: 5 });
    for (const item of service.inscricoes()) {
      expect(
        validarInscricao(
          { ...item, dataNascimento: formatarData(item.dataNascimento) },
          '2026-10-27',
          EVENTO.data,
        ).sucesso,
      ).toBe(true);
    }
  });
  it('cadastra no final, normaliza e atualiza contadores', () => {
    const resultado = service.cadastrar(entrada);
    expect(resultado.sucesso).toBe(true);
    expect(service.inscricoes().at(-1)?.email).toBe('jose+corrida@example.com');
    expect(service.inscricoes().at(-1)?.nome).toBe('José D’Ávila-Souza');
    expect(service.contadores()).toEqual({ cinco: 3, dez: 3, total: 6 });
  });
  it('recusa duplicidade normalizada sem alteração parcial', () => {
    const antes = service.inscricoes();
    const resultado = service.cadastrar({ ...entrada, email: ' ANA.CLARA@EXAMPLE.COM ' });
    expect(resultado).toEqual({
      sucesso: false,
      erros: { email: 'Já existe uma inscrição com este e-mail.' },
    });
    expect(service.inscricoes()).toBe(antes);
  });
  it('busca por e-mail normalizado', () => {
    expect(service.buscar(' ANA.CLARA@EXAMPLE.COM ')?.nome).toBe('Ana Clara Souza');
  });
  it('mantém todos os dados e contadores intactos em edição recusada', () => {
    const antes = service.inscricoes();
    const contadores = service.contadores();
    expect(
      service.editar('bruno.oliveira@example.com', {
        nome: 'Tentativa',
        dataNascimento: '15/03/2009',
        percurso: 10,
      }).sucesso,
    ).toBe(false);
    expect(service.inscricoes()).toBe(antes);
    expect(service.contadores()).toBe(contadores);
    expect(service.buscar('bruno.oliveira@example.com')?.nome).toBe('Bruno Oliveira');
  });
  it('edita sem colidir consigo, preserva posição/email e transfere percurso/categoria', () => {
    const original = service.inscricoes()[1];
    expect(
      service.editar(' BRUNO.OLIVEIRA@EXAMPLE.COM ', {
        nome: 'Bruno Editado',
        dataNascimento: '14/03/1967',
        percurso: 5,
      }).sucesso,
    ).toBe(true);
    const atualizado = service.inscricoes()[1];
    expect(atualizado.email).toBe(original.email);
    expect(atualizado.nome).toBe('Bruno Editado');
    expect(categoriaPorIdade(calcularIdade(atualizado.dataNascimento, EVENTO.data))).toBe('Senhor');
    expect(service.contadores()).toEqual({ cinco: 4, dez: 1, total: 5 });
    expect(original.nome).toBe('Bruno Oliveira');
  });
  it('ignora tentativa de alterar email por propriedade extra em tempo de execução', () => {
    const adulterada = {
      nome: 'Ana Atualizada',
      email: 'outro@example.com',
      dataNascimento: '10/03/2012',
      percurso: 5,
    };
    service.editar('ana.clara@example.com', adulterada as EdicaoInscricao);
    expect(service.buscar('ana.clara@example.com')?.nome).toBe('Ana Atualizada');
    expect(service.buscar('outro@example.com')).toBeUndefined();
  });
  it('revalida cadastro e edição na service', () => {
    const antes = service.inscricoes();
    expect(service.cadastrar({ ...entrada, percurso: 7 }).sucesso).toBe(false);
    expect(service.cadastrar({ ...entrada, email: 'a b@example.com' }).sucesso).toBe(false);
    expect(
      service.cadastrar({ ...entrada, dataNascimento: '15/03/2013', percurso: 5 }).sucesso,
    ).toBe(false);
    expect(
      service.editar('ana.clara@example.com', { ...entrada, dataNascimento: '31/02/2000' }).sucesso,
    ).toBe(false);
    expect(service.inscricoes()).toBe(antes);
  });
  it('cancela por email normalizado e libera reutilização imediatamente', () => {
    expect(service.cancelar(' ANA.CLARA@EXAMPLE.COM ').sucesso).toBe(true);
    expect(service.buscar('ana.clara@example.com')).toBeUndefined();
    expect(service.contadores()).toEqual({ cinco: 2, dez: 2, total: 4 });
    expect(service.cadastrar({ ...entrada, email: 'ana.clara@example.com' }).sucesso).toBe(true);
    expect(service.inscricoes().at(-1)?.email).toBe('ana.clara@example.com');
  });
  it('informa operações inexistentes e mantém o estado', () => {
    const antes = service.inscricoes();
    expect(service.buscar('inexistente@example.com')).toBeUndefined();
    expect(service.editar('inexistente@example.com', entrada)).toMatchObject({
      sucesso: false,
      geral: 'A inscrição não foi encontrada.',
    });
    expect(service.cancelar('inexistente@example.com')).toMatchObject({
      sucesso: false,
      geral: 'A inscrição não foi encontrada.',
    });
    expect(service.inscricoes()).toBe(antes);
  });
  it('chega ao estado vazio com contadores zero', () => {
    service.inscricoes().forEach((item) => service.cancelar(item.email));
    expect(service.inscricoes()).toEqual([]);
    expect(service.contadores()).toEqual({ cinco: 0, dez: 0, total: 0 });
  });
  it('não expõe lista ou registros mutáveis e nova execução restaura os exemplos', () => {
    expect(Object.isFrozen(service.inscricoes())).toBe(true);
    expect(Object.isFrozen(service.inscricoes()[0])).toBe(true);
    service.cancelar('ana.clara@example.com');
    const novaExecucao = new InscricoesService();
    expect(novaExecucao.contadores()).toEqual({ cinco: 3, dez: 2, total: 5 });
  });
});
