'use client'

interface TermsAcceptanceProps {
  accepted: boolean
  onChange: (accepted: boolean) => void
}

export function TermsAcceptance({ accepted, onChange }: TermsAcceptanceProps) {
  return (
    <div className="border-t border-border pt-6">
      <h3 className="mb-3 text-base font-semibold text-foreground">Termos de Uso</h3>
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <p>
          Ao prosseguir, você concorda com os Termos e Condições de uso do serviço de aluguel de motos.
          O locatário é responsável por devolver o veículo nas condições originais.
          Em caso de danos, a caução poderá ser utilizada para cobertura dos custos.
          Os termos completos serão fornecidos em breve.
        </p>
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-border"
          checked={accepted}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm text-foreground">
          Li e aceito os Termos e Condições de uso
        </span>
      </label>
    </div>
  )
}
