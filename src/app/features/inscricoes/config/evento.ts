const data = '2027-03-14';
const diaDaSemana = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  timeZone: 'UTC',
}).format(new Date(`${data}T00:00:00Z`));

export const EVENTO = Object.freeze({
  nome: '5ª Corrida Solidária',
  nomeCurto: 'Corrida Solidária',
  comunidade: 'Vila Esperança',
  local: 'Praça da Matriz',
  data,
  dataExibicao: data.split('-').reverse().join('/'),
  diaDaSemana: diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1),
});
