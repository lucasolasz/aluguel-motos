"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsDialog } from "./terms-dialog";

interface TermsAcceptanceProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}

export function TermsAcceptance({ accepted, onChange }: TermsAcceptanceProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-border pt-6">
      <h3 className="mb-3 text-base font-semibold text-foreground">
        Termos de Uso
      </h3>
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <p>Política de cancelamento:</p>
        <p>
          Essa tarifa garante uma condição de preço reduzida mediante a
          apresentação de um cartão de crédito válido, e aceite das condições de
          cancelamento abaixo:
        </p>
        <p>
          a) Para reservas canceladas com antecedência inferior a 48 horas do
          horário previsto para a retirada, será cobrada uma taxa de 20% do
          valor total da reserva (diárias, taxas, opcionais e seguros), limitado
          ao valor de 2 diárias.
        </p>
        <p>
          b) Para reservas em que o cliente não compareça para retirada do
          veículo no dia agendado, será cobrada uma taxa de 30% do valor da
          reserva (diárias, taxas, opcionais e seguros), limitado ao valor de 2
          diárias.
        </p>
        <p>
          c) Caso realize o cancelamento da sua reserva em até 04 horas após a
          criação, não será cobrada taxa de cancelamento.
        </p>
        <p>
          d) Na retirada do carro, por segurança, vamos verificar o seu perfil.
          Caso a análise não seja aprovada, sua reserva vai ser cancelada, sem
          qualquer custo para você.
        </p>
      </div>
      <div className="mt-4 flex-col items-start">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => onChange(checked === true)}
            className="mt-0.5"
          />
          <label
            htmlFor="terms"
            className="text-foreground text-justify"
          >
            Aceito os Termos e Condições de Uso e declaro ter ciência de que a
            Rio Ride Rental, por meio de empresas parceiras, poderá consultar o Sistema
            de Informações de Crédito para fins de análise de crédito e risco,
            nos termos da Resolução CMN n° 5.037 de 29.9.2022.*
          </label>
        </div>
        <div className="mt-5 ml-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-primary underline"
          >
            Exibir termos e condições completos
          </button>
        </div>
      </div>

      <TermsDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
