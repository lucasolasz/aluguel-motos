"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Genero } from "@/lib/types";
import {
  checkCpfAvailable,
  checkEmailAvailable,
} from "@/services/auth.service";
import { useState } from "react";
import { IoMdInformationCircle } from "react-icons/io";
import { validarDados, type DadosPessoais } from "./dados-form";
import { MaskedInput } from "./masked-input";
import { PasswordChecklist } from "./password-checklist";

interface Step1Props {
  dados: DadosPessoais;
  onChange: (patch: Partial<DadosPessoais>) => void;
  onNext: () => void;
  error: string;
  setError: (e: string) => void;
}

export function Step1Dados({
  dados,
  onChange,
  onNext,
  error,
  setError,
}: Step1Props) {
  const [checking, setChecking] = useState(false);

  async function handleNext() {
    const err = validarDados(dados);
    if (err) {
      setError(err);
      return;
    }
    setChecking(true);
    setError("");
    try {
      const [emailOk, cpfOk] = await Promise.all([
        checkEmailAvailable(dados.email),
        checkCpfAvailable(dados.cpf),
      ]);
      if (!emailOk) {
        setError("E-mail já cadastrado.");
        setChecking(false);
        return;
      }
      if (!cpfOk) {
        setError("CPF já cadastrado.");
        setChecking(false);
        return;
      }
      setChecking(false);
      onNext();
    } catch {
      setError("Erro ao verificar dados. Tente novamente.");
      setChecking(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Dados pessoais */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Dados Pessoais
        </h2>

        <div className="space-y-2">
          <Label htmlFor="nomeCompleto">Nome completo*</Label>
          <Input
            id="nomeCompleto"
            value={dados.nomeCompleto}
            onChange={(e) =>
              onChange({
                nomeCompleto: e.target.value
                  .replace(/[^A-ZÀ-Ú\s]/gi, "")
                  .toUpperCase(),
              })
            }
            placeholder="SEU NOME COMPLETO"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cpf">Número do CPF*</Label>
            <MaskedInput
              id="cpf"
              mask="000.000.000-00"
              value={dados.cpf}
              onAccept={(v) => onChange({ cpf: v })}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <Label>Gênero*</Label>
            <RadioGroup
              className="flex gap-6 pt-1"
              value={dados.genero}
              onValueChange={(v) => onChange({ genero: v as Genero })}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="FEMININO" id="genero-f" />
                <Label htmlFor="genero-f" className="font-normal">
                  Feminino
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="MASCULINO" id="genero-m" />
                <Label htmlFor="genero-m" className="font-normal">
                  Masculino
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="OUTRO" id="genero-o" />
                <Label htmlFor="genero-o" className="font-normal">
                  Outro
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Contato</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="ddi">DDI*</Label>
            <MaskedInput
              id="ddi"
              mask="+00"
              value={dados.ddi}
              onAccept={(v) => onChange({ ddi: v })}
              placeholder="55"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ddd">DDD*</Label>
            <MaskedInput
              id="ddd"
              mask="00"
              value={dados.ddd}
              onAccept={(v) => onChange({ ddd: v })}
              placeholder="11"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="celular">Número do celular*</Label>
            <MaskedInput
              id="celular"
              mask="00000-0000"
              value={dados.celular}
              onAccept={(v) => onChange({ celular: v })}
              placeholder="99999-9999"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="confirmarDdi">DDI*</Label>
            <MaskedInput
              id="confirmarDdi"
              mask="+00"
              value={dados.confirmarDdi}
              onAccept={(v) => onChange({ confirmarDdi: v })}
              placeholder="55"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarDdd">DDD*</Label>
            <MaskedInput
              id="confirmarDdd"
              mask="00"
              value={dados.confirmarDdd}
              onAccept={(v) => onChange({ confirmarDdd: v })}
              placeholder="11"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarCelular">Confirmação do celular*</Label>
            <MaskedInput
              id="confirmarCelular"
              mask="00000-0000"
              value={dados.confirmarCelular}
              onAccept={(v) => onChange({ confirmarCelular: v })}
              placeholder="99999-9999"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail*</Label>
            <Input
              id="email"
              type="email"
              value={dados.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="voce@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarEmail">Confirmação do e-mail*</Label>
            <Input
              id="confirmarEmail"
              type="email"
              value={dados.confirmarEmail}
              onChange={(e) => onChange({ confirmarEmail: e.target.value })}
              placeholder="voce@email.com"
              onPaste={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </section>

      {/* Senha */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Senha</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="senha">Senha*</Label>
            <Input
              id="senha"
              type="password"
              value={dados.senha}
              onChange={(e) => onChange({ senha: e.target.value })}
              placeholder="Crie uma senha forte"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarSenha">Confirmar senha*</Label>
            <Input
              id="confirmarSenha"
              type="password"
              value={dados.confirmarSenha}
              onChange={(e) => onChange({ confirmarSenha: e.target.value })}
              placeholder="Repita a senha"
            />
          </div>
        </div>
        <PasswordChecklist senha={dados.senha} />
      </section>

      <section>
        <p className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-300 rounded-xl p-2">
          <IoMdInformationCircle size={100} />
          Todos os dados coletados no cadastro do cliente serão utilizadas para
          identificação das reservas e execução de contrato entre o titular e a
          Localiza. Para mais informações sobre o tratamento de dados pessoais,
          acesse nosso Aviso de Privacidade.
        </p>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={checking}>
          {checking ? "Verificando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
