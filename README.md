# Corrida Solidária

Aplicação Angular 21 para gerenciar as inscrições da **5ª Corrida Solidária · Vila Esperança**, em **14/03/2027**, na Praça da Matriz. Interface em português, com lista responsiva, detalhes, cadastro, edição e confirmação de cancelamento.

## Executar

Requisitos: Node.js compatível com Angular 21 (20.19+, 22.12+ ou 24+) e npm.

```bash
npm ci
npm start
```

Abra `http://localhost:4200`. Se a porta estiver ocupada, execute `npm start -- --port 4201`.

```bash
npm test -- --watch=false
npm run build
```

O build de produção fica em `dist/corridaSolidaria/browser`. Em hospedagem estática, configure fallback para `index.html` para permitir acesso direto às rotas.

## Uso e regras

- `/` redireciona para `/inscricoes`. Detalhes em `/inscricoes/:email`, com o segmento codificado pelo Angular Router. Rotas desconhecidas retornam para a lista.
- “Cadastrar corredor” abre um formulário vazio. Todos os campos são obrigatórios e o nascimento deve ser digitado integralmente em `dd/mm/aaaa`.
- A idade é calculada em **14/03/2027**: Juvenil (14–17), Adulto (18–39), Master (40–59), Senhor (60+). A idade mínima é 14 anos completos. Menores de 18 anos só podem escolher 5 km.
- Datas impossíveis, incompletas ou futuras em relação ao dia local atual são recusadas. Para quem nasceu em 29/02, o aniversário em anos comuns é considerado em 01/03.
- O nome tem espaços ajustados e deve conter entre 3 e 100 caracteres. Acentos, hífens e apóstrofos são aceitos.
- O e-mail é normalizado com `trim` e minúsculas, deve ter formato válido e é o identificador único. Pode conter `+`. Na edição, é somente leitura e a service também preserva o identificador.
- A edição mantém um rascunho separado e a posição do card. Se o nascimento passar a representar um menor de idade, 10 km é desmarcado e o formulário exige uma nova escolha.
- Cancelar exige confirmação, remove o cadastro e libera o mesmo e-mail imediatamente. “Manter inscrição”, fechar ou Escape preservam o registro.
- Lista e contadores atualizam sem recarregar. Os cinco exemplos iniciais somam **3 em 5 km, 2 em 10 km e 5 no total**.

## Dados e estrutura

**Os dados ficam apenas em memória. Recarregar a página restaura os cinco exemplos e descarta qualquer alteração.** Um link para um cadastro descartado mostra “Inscrição não encontrada”. Não há backend, autenticação, pagamentos ou armazenamento local.

O domínio fica em `src/app/features/inscricoes`: regras puras, configuração do evento, dados iniciais, service com `signal` privado e contadores `computed`, páginas e componentes standalone. A lista pública e os registros são somente leitura e congelados. Formulário e service compartilham as funções de validação; recusas retornam erros por campo sem alterar os dados.

As modais usam `dialog.showModal()`, com título acessível, foco inicial, Escape e retorno ao acionador. A navegação por Tab/Shift+Tab fica a cargo do navegador, sem controle manual do ciclo de foco. Após remover um card, o foco volta ao botão estável de cadastro. Os erros aparecem após toque ou envio; sucesso é anunciado em região acessível. O layout usa três, duas ou uma coluna conforme o espaço, sem bibliotecas adicionais.

## Verificação

Vitest cobre limites de nome/e-mail/datas/idade/categoria/percurso, operações atômicas da service, unicidade, reutilização de e-mail, proteção do identificador, formulário, rotas e navegação com `+`/`%` no e-mail. Testes de componentes em jsdom usam substitutos para abertura/fechamento do `dialog`; não comprovam foco nativo, responsividade ou acessibilidade manual. Esses comportamentos devem ser conferidos em navegador real, incluindo 320 px e teclado.

Validação desta implementação (27/10/2026): **80 testes passaram em 6 arquivos** com `npm test -- --watch=false`; `npm run build` concluiu sem erros. No navegador Chromium, foram conferidos cadastro, edição com restrição de percurso, detalhes com `+` no e-mail, cancelamento/desistência, descarte ao recarregar, foco inicial/retorno, Escape e ciclo de Tab/Shift+Tab. O layout foi inspecionado em desktop, 800 px e 320 px, incluindo nome/e-mail extensos sem rolagem horizontal. Não foi realizada uma auditoria com leitor de tela nem uma matriz de navegadores/dispositivos físicos.
