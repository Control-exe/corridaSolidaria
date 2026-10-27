export type Percurso = 5 | 10;
export type Categoria = 'Juvenil' | 'Adulto' | 'Master' | 'Senhor';

export interface Inscricao {
  readonly email: string;
  readonly nome: string;
  readonly dataNascimento: string;
  readonly percurso: Percurso;
}

// A fronteira recebe valores ainda não validados; nascimento usa dd/mm/aaaa.
export interface EdicaoInscricao {
  nome: string;
  dataNascimento: string;
  percurso: number | null;
}
export interface CadastroInscricao extends EdicaoInscricao {
  email: string;
}
export type CampoInscricao = keyof CadastroInscricao;
export type ErrosInscricao = Partial<Record<CampoInscricao, string>>;
export type Resultado<T> =
  { sucesso: true; valor: T } | { sucesso: false; erros: ErrosInscricao; geral?: string };
