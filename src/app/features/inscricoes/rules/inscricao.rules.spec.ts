import { EVENTO } from '../config/evento';
import {
  calcularIdade,
  categoriaPorIdade,
  formatarData,
  nascimentoParaIso,
  normalizarEmail,
  normalizarNome,
  validarEmail,
  validarInscricao,
  validarNascimento,
  validarNome,
  validarPercurso,
} from './inscricao.rules';

const hoje = '2026-10-27';

describe('Regras da inscrição', () => {
  it('normaliza espaços do nome e preserva acentos, hífens e apóstrofos', () => {
    expect(normalizarNome('  Maria   da Conceição D’Ávila-Souza  ')).toBe(
      'Maria da Conceição D’Ávila-Souza',
    );
  });

  it.each(['', '   ', 'ab', 'a'.repeat(101)])('recusa nome inválido %j', (nome) => {
    expect(validarNome(nome)).toBeTruthy();
  });
  it.each(['Ana', 'a'.repeat(100), '  Ana    Maria  ', 'Á-i'])('aceita nome válido %j', (nome) => {
    expect(validarNome(nome)).toBeUndefined();
  });
  it('aplica os limites ao nome normalizado', () => {
    expect(validarNome(`  ${'a'.repeat(100)}  `)).toBeUndefined();
    expect(validarNome('  ab  ')).toBeTruthy();
  });
  it.each([
    '',
    '   ',
    'maria',
    '@example.com',
    'a b@example.com',
    'a@exa mple.com',
    'a..b@example.com',
  ])('recusa e-mail inválido %j', (email) => {
    expect(validarEmail(email)).toBeTruthy();
  });
  it('normaliza e-mail sem apagar espaços internos e aceita +', () => {
    expect(normalizarEmail(' ANA+CORRIDA@EXAMPLE.COM ')).toBe('ana+corrida@example.com');
    expect(validarEmail(' ANA+CORRIDA@EXAMPLE.COM ')).toBeUndefined();
    expect(normalizarEmail('a b@example.com')).toBe('a b@example.com');
  });
  it.each([
    '1/01/2000',
    '01/01/00',
    '31/04/2000',
    '29/02/1900',
    '29/02/2023',
    '00/01/2000',
    '01/13/2000',
    '',
    '01/01/0000',
  ])('recusa nascimento impossível ou incompleto %j', (texto) => {
    expect(nascimentoParaIso(texto)).toBeNull();
  });
  it.each(['29/02/2000', '29/02/2024', '31/12/1990'])(
    'converte e apresenta a data de calendário %s sem fuso horário',
    (texto) => {
      expect(formatarData(nascimentoParaIso(texto)!)).toBe(texto);
    },
  );
  it('recusa futuro usando o dia de referência recebido', () => {
    expect(validarNascimento('28/10/2026', hoje, EVENTO.data)).toContain('futuro');
  });
  it.each([
    ['2009-03-13', 18],
    ['2009-03-14', 18],
    ['2009-03-15', 17],
    ['2013-03-14', 14],
    ['2013-03-15', 13],
  ])('calcula anos completos de %s: %i', (nascimento, idade) => {
    expect(calcularIdade(nascimento, EVENTO.data)).toBe(idade);
  });
  it('considera 01/03 como aniversário de 29/02 em ano comum', () => {
    expect(calcularIdade('2000-02-29', '2027-02-28')).toBe(26);
    expect(calcularIdade('2000-02-29', '2027-03-01')).toBe(27);
    expect(calcularIdade('2000-02-29', '2024-02-29')).toBe(24);
  });
  it('aceita 14 anos exatos e recusa um dia abaixo do mínimo', () => {
    expect(validarNascimento('14/03/2013', hoje, EVENTO.data)).toBeUndefined();
    expect(validarNascimento('15/03/2013', hoje, EVENTO.data)).toContain('14 anos');
  });
  it.each([
    [14, 'Juvenil'],
    [17, 'Juvenil'],
    [18, 'Adulto'],
    [39, 'Adulto'],
    [40, 'Master'],
    [59, 'Master'],
    [60, 'Senhor'],
  ])('determina a categoria aos %i anos', (idade, categoria) => {
    expect(categoriaPorIdade(idade as number)).toBe(categoria);
  });
  it.each([null, 0, 6, '5', '10'])(
    'recusa percurso ausente ou não numérico permitido: %j',
    (percurso) => {
      expect(validarPercurso(percurso as number | null, '14/03/2000', EVENTO.data)).toBeTruthy();
    },
  );
  it('restringe menor a 5 km e aceita 18 anos exatos em 10 km', () => {
    expect(validarPercurso(10, '15/03/2009', EVENTO.data)).toContain('somente 5 km');
    expect(validarPercurso(5, '15/03/2009', EVENTO.data)).toBeUndefined();
    expect(validarPercurso(10, '14/03/2009', EVENTO.data)).toBeUndefined();
  });
  it('retorna todos os erros por campo e normaliza a proposta válida', () => {
    const invalida = validarInscricao(
      { nome: '', email: '', dataNascimento: '', percurso: null },
      hoje,
      EVENTO.data,
    );
    expect(invalida.sucesso).toBe(false);
    if (!invalida.sucesso) expect(Object.keys(invalida.erros)).toHaveLength(4);
    expect(
      validarInscricao(
        {
          nome: '  Ana   Souza ',
          email: ' ANA@EXAMPLE.COM ',
          dataNascimento: '14/03/2009',
          percurso: 10,
        },
        hoje,
        EVENTO.data,
      ),
    ).toEqual({
      sucesso: true,
      valor: {
        nome: 'Ana Souza',
        email: 'ana@example.com',
        dataNascimento: '2009-03-14',
        percurso: 10,
      },
    });
  });
});
