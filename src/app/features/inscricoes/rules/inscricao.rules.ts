import {
  CadastroInscricao,
  Categoria,
  ErrosInscricao,
  Inscricao,
  Resultado,
} from '../models/inscricao';

export const normalizarNome = (nome: string): string => nome.trim().replace(/\s+/gu, ' ');
export const normalizarEmail = (email: string): string => email.trim().toLowerCase();

export function dataCalendario(iso: string): { ano: number; mes: number; dia: number } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [ano, mes, dia] = iso.split('-').map(Number);
  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const dias = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return ano >= 1 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= dias[mes - 1]
    ? { ano, mes, dia }
    : null;
}

export function nascimentoParaIso(texto: string): string | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) return null;
  const [dia, mes, ano] = texto.split('/');
  const iso = `${ano}-${mes}-${dia}`;
  return dataCalendario(iso) ? iso : null;
}

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function hojeCalendario(data = new Date()): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

export function calcularIdade(nascimento: string, referencia: string): number {
  const n = dataCalendario(nascimento);
  const r = dataCalendario(referencia);
  if (!n || !r) return NaN;
  // Em anos comuns, 29/02 completa idade em 01/03.
  const antesDoAniversario = r.mes < n.mes || (r.mes === n.mes && r.dia < n.dia);
  return r.ano - n.ano - Number(antesDoAniversario);
}

export function categoriaPorIdade(idade: number): Categoria {
  if (idade < 18) return 'Juvenil';
  if (idade < 40) return 'Adulto';
  if (idade < 60) return 'Master';
  return 'Senhor';
}

export function validarNome(nome: string): string | undefined {
  const valor = normalizarNome(nome);
  if (!valor) return 'Informe o nome completo.';
  if (valor.length < 3 || valor.length > 100)
    return 'O nome deve ter entre 3 e 100 caracteres após ajustar os espaços.';
  return undefined;
}

export function validarEmail(email: string): string | undefined {
  const valor = normalizarEmail(email);
  // Valida o endereço completo sem remover espaços internos nem alterar o identificador.
  const formato =
    /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
  return formato.test(valor) ? undefined : 'Informe um e-mail válido.';
}

export function validarNascimento(texto: string, hoje: string, evento: string): string | undefined {
  const iso = nascimentoParaIso(texto);
  if (!iso) return 'Informe uma data válida no formato dd/mm/aaaa.';
  if (iso > hoje) return 'A data de nascimento não pode estar no futuro.';
  if (calcularIdade(iso, evento) < 14)
    return 'O participante deve ter pelo menos 14 anos na data do evento.';
  return undefined;
}

export function validarPercurso(
  percurso: number | null,
  nascimento: string,
  evento: string,
): string | undefined {
  if (percurso !== 5 && percurso !== 10) return 'Selecione um percurso.';
  const iso = nascimentoParaIso(nascimento);
  if (iso && calcularIdade(iso, evento) < 18 && percurso === 10) {
    return 'Participantes menores de 18 anos na data do evento podem correr somente 5 km.';
  }
  return undefined;
}

export function validarInscricao(
  entrada: CadastroInscricao,
  hoje: string,
  evento: string,
): Resultado<Inscricao> {
  const erros: ErrosInscricao = {};
  const mensagens = {
    nome: validarNome(entrada.nome),
    email: validarEmail(entrada.email),
    dataNascimento: validarNascimento(entrada.dataNascimento, hoje, evento),
    percurso: validarPercurso(entrada.percurso, entrada.dataNascimento, evento),
  };
  for (const campo of Object.keys(mensagens) as (keyof ErrosInscricao)[]) {
    if (mensagens[campo]) erros[campo] = mensagens[campo];
  }
  if (Object.keys(erros).length) return { sucesso: false, erros };
  return {
    sucesso: true,
    valor: {
      nome: normalizarNome(entrada.nome),
      email: normalizarEmail(entrada.email),
      dataNascimento: nascimentoParaIso(entrada.dataNascimento)!,
      percurso: entrada.percurso as 5 | 10,
    },
  };
}
