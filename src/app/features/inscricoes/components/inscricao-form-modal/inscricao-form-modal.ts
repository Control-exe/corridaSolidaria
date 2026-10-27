import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { EVENTO } from '../../config/evento';
import { CampoInscricao, Inscricao } from '../../models/inscricao';
import {
  calcularIdade,
  formatarData,
  hojeCalendario,
  nascimentoParaIso,
  validarEmail,
  validarNascimento,
  validarNome,
  validarPercurso,
} from '../../rules/inscricao.rules';
import { InscricoesService } from '../../services/inscricoes.service';
import { manterFocoNaModal } from '../modal-focus';
import { ConfirmacaoSucesso } from '../confirmacao-sucesso/confirmacao-sucesso';

function adaptar(regra: (valor: string) => string | undefined): ValidatorFn {
  return (control) => {
    const mensagem = regra(control.value);
    return mensagem ? { mensagem } : null;
  };
}

@Component({
  selector: 'app-inscricao-form-modal',
  imports: [ReactiveFormsModule, ConfirmacaoSucesso],
  templateUrl: './inscricao-form-modal.html',
  styleUrl: './inscricao-form-modal.scss',
})
export class InscricaoFormModal {
  private readonly dados = inject(InscricoesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private origem: HTMLElement | null = null;
  private retorno: HTMLElement | null = null;
  private emailOriginal: string | null = null;
  readonly salvo = output<string>();
  protected readonly editando = signal(false);
  protected readonly sucesso = signal('');
  protected readonly mostrarAvisoEmail = signal(false);
  protected readonly avisoPercurso = signal('');
  protected readonly erroGeral = signal('');
  protected readonly menor = signal(false);
  protected readonly conterFoco = manterFocoNaModal;
  protected readonly form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: adaptar(validarNome) }),
    email: new FormControl('', { nonNullable: true, validators: adaptar(validarEmail) }),
    dataNascimento: new FormControl('', {
      nonNullable: true,
      validators: adaptar((valor) => validarNascimento(valor, hojeCalendario(), EVENTO.data)),
    }),
    percurso: new FormControl<number | null>(null),
  });

  constructor() {
    this.form.controls.percurso.addValidators((control) => {
      const mensagem = validarPercurso(
        control.value,
        this.form.controls.dataNascimento.value,
        EVENTO.data,
      );
      return mensagem ? { mensagem } : null;
    });
    this.form.controls.dataNascimento.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((valor) => {
        const iso = nascimentoParaIso(valor);
        const menor = !!iso && calcularIdade(iso, EVENTO.data) < 18;
        this.menor.set(menor);
        if (menor && this.form.controls.percurso.value === 10) {
          this.form.controls.percurso.setValue(null);
          this.avisoPercurso.set(
            'O percurso de 10 km foi desmarcado. Participantes menores de 18 anos na data do evento podem correr somente 5 km. Selecione o percurso permitido.',
          );
        } else if (!menor) {
          this.avisoPercurso.set('');
        }
        this.form.controls.percurso.updateValueAndValidity();
      });
  }

  protected formatarNascimento(event: Event): void {
    const input = event.target as HTMLInputElement;
    const apagando = (event as InputEvent).inputType?.startsWith('delete') ?? false;
    const antesDoCursor = input.value.slice(0, input.selectionStart ?? input.value.length);
    const quantidadeAntes = antesDoCursor.replace(/\D/g, '').length;
    const digitos = input.value.replace(/\D/g, '').slice(0, 8);
    let texto = digitos.slice(0, 2);
    if (digitos.length > 2 || (digitos.length === 2 && !apagando)) texto += '/';
    texto += digitos.slice(2, 4);
    if (digitos.length > 4 || (digitos.length === 4 && !apagando)) texto += '/';
    texto += digitos.slice(4);

    let cursor = 0;
    let encontrados = 0;
    while (cursor < texto.length && encontrados < quantidadeAntes) {
      if (/\d/.test(texto[cursor])) encontrados++;
      cursor++;
    }
    if (!apagando && texto[cursor] === '/') cursor++;
    input.value = texto;
    this.form.controls.dataNascimento.setValue(texto);
    input.setSelectionRange(cursor, cursor);
  }

  abrir(inscricao?: Inscricao, retorno?: HTMLElement): void {
    this.origem = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.retorno = retorno ?? null;
    this.emailOriginal = inscricao?.email ?? null;
    this.editando.set(!!inscricao);
    this.sucesso.set('');
    this.mostrarAvisoEmail.set(false);
    this.avisoPercurso.set('');
    this.erroGeral.set('');
    // Reinicia o rascunho sem emitir mudanças intermediárias entre os campos.
    this.form.reset(
      inscricao
        ? {
            nome: inscricao.nome,
            email: inscricao.email,
            dataNascimento: formatarData(inscricao.dataNascimento),
            percurso: inscricao.percurso,
          }
        : { nome: '', email: '', dataNascimento: '', percurso: null },
      { emitEvent: false },
    );
    this.menor.set(!!inscricao && calcularIdade(inscricao.dataNascimento, EVENTO.data) < 18);
    this.form.controls.percurso.updateValueAndValidity();
    this.dialog().nativeElement.showModal();
    this.dialog().nativeElement.querySelector<HTMLInputElement>('#nome')?.focus();
  }

  fechar(event?: Event): void {
    event?.preventDefault();
    this.sucesso.set('');
    this.dialog().nativeElement.close();
    this.origem?.focus();
  }

  protected erro(campo: CampoInscricao): string | null {
    const control = this.form.controls[campo];
    return control.touched ? (control.errors?.['mensagem'] ?? null) : null;
  }

  protected enviar(): void {
    if (this.sucesso()) return;
    this.erroGeral.set('');
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.focarErro();
      return;
    }
    const entrada = this.form.getRawValue();
    const resultado = this.emailOriginal
      ? this.dados.editar(this.emailOriginal, {
          nome: entrada.nome,
          dataNascimento: entrada.dataNascimento,
          percurso: entrada.percurso,
        })
      : this.dados.cadastrar(entrada);
    if (!resultado.sucesso) {
      for (const campo of Object.keys(resultado.erros) as CampoInscricao[]) {
        this.form.controls[campo].setErrors({ mensagem: resultado.erros[campo] });
      }
      this.erroGeral.set(resultado.geral ?? '');
      this.focarErro();
      return;
    }
    this.sucesso.set(
      this.editando() ? 'Alterações salvas com sucesso.' : 'Inscrição confirmada com sucesso.',
    );
  }

  protected concluir(): void {
    const mensagem = this.sucesso();
    this.fechar();
    if (!this.editando()) this.retorno?.focus();
    this.salvo.emit(mensagem);
  }

  private focarErro(): void {
    const primeiro = (Object.keys(this.form.controls) as CampoInscricao[]).find(
      (campo) => this.form.controls[campo].invalid,
    );
    if (primeiro)
      this.dialog()
        .nativeElement.querySelector<HTMLElement>(`[formControlName="${primeiro}"]`)
        ?.focus();
  }
}
