'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Printer, Upload, Loader2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { uploadContratoArquivo } from '@/services/upload.service'
import { adminSalvarContrato } from '@/services/reservas.service'
import { NIVEL_COMBUSTIVEL_LABELS, type ReservaDetalhe } from '@/lib/atendimento-types'
import SignaturePad from './signature-pad'

function gerarHtmlContrato(d: ReservaDetalhe): string {
  const r = d.reserva
  const saida = d.vistorias.find((v) => v.tipo === 'SAIDA')
  const nivel = saida?.nivelCombustivel ? NIVEL_COMBUSTIVEL_LABELS[saida.nivelCombustivel] : '—'
  const km = saida?.kmRegistrado ?? '—'
  const local = (l: ReservaDetalhe['reserva']['localRetirada']) =>
    l ? `${l.nome} — ${l.cidade}/${l.estado}` : '—'

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Contrato de Locação — ${r.id.slice(0, 8)}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#111;max-width:720px;margin:32px auto;padding:0 24px;line-height:1.5}
    h1{font-size:20px;text-align:center}
    h2{font-size:14px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:24px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    td{padding:4px 0;vertical-align:top}
    td.l{width:38%;color:#555}
    .sign{margin-top:64px;display:flex;justify-content:space-between;gap:32px}
    .sign div{flex:1;border-top:1px solid #111;padding-top:6px;text-align:center;font-size:12px}
    @media print{body{margin:0}}
  </style></head><body>
  <h1>Contrato de Locação de Motocicleta</h1>
  <h2>Locatário</h2>
  <table>
    <tr><td class="l">Nome</td><td>${d.cliente.nomeCompleto ?? '—'}</td></tr>
    <tr><td class="l">CPF</td><td>${d.cliente.cpf ?? '—'}</td></tr>
    <tr><td class="l">CNH</td><td>${d.cnh?.numeroCnh ?? d.cliente.numeroCnh ?? '—'} (validade ${
      d.cnh?.dataValidade ? formatDate(d.cnh.dataValidade) : '—'
    })</td></tr>
    <tr><td class="l">Telefone</td><td>${d.cliente.telefone ?? '—'}</td></tr>
  </table>
  <h2>Veículo e Período</h2>
  <table>
    <tr><td class="l">Moto</td><td>${r.moto.nome}</td></tr>
    <tr><td class="l">Retirada</td><td>${formatDate(r.dataRetirada)} ${r.horaRetirada ?? ''} — ${local(
      r.localRetirada,
    )}</td></tr>
    <tr><td class="l">Devolução</td><td>${formatDate(r.dataDevolucao)} ${r.horaDevolucao ?? ''} — ${local(
      r.localDevolucao,
    )}</td></tr>
    <tr><td class="l">Diárias</td><td>${r.totalDias}</td></tr>
    <tr><td class="l">KM na saída</td><td>${km}</td></tr>
    <tr><td class="l">Combustível na saída</td><td>${nivel}</td></tr>
  </table>
  <h2>Valores</h2>
  <table>
    <tr><td class="l">Aluguel</td><td>${formatCurrency(r.totalAluguel)}</td></tr>
    <tr><td class="l">Seguro</td><td>${formatCurrency(r.totalSeguro)}</td></tr>
    <tr><td class="l">Acessórios</td><td>${formatCurrency(r.totalAcessorios)}</td></tr>
    <tr><td class="l">Lavagem</td><td>${formatCurrency(r.totalLavagem)}</td></tr>
    <tr><td class="l"><b>Total</b></td><td><b>${formatCurrency(r.total)}</b></td></tr>
    <tr><td class="l">Caução (pré-autorizada)</td><td>${formatCurrency(r.caucao)}</td></tr>
  </table>
  <p style="font-size:11px;color:#555;margin-top:24px">O locatário declara ter recebido a motocicleta nas condições descritas
  acima e se responsabiliza por sua devolução no mesmo estado, ressalvado o desgaste natural de uso.</p>
  <div class="sign"><div>Locatário</div><div>Locadora</div></div>
  </body></html>`
}

interface ContratoSectionProps {
  detalhe: ReservaDetalhe
  onDone: (d: ReservaDetalhe) => void
}

export default function ContratoSection({ detalhe, onDone }: ContratoSectionProps) {
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const imprimir = () => {
    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) {
      setErro('Pop-up bloqueado. Permita pop-ups para imprimir.')
      return
    }
    win.document.write(gerarHtmlContrato(detalhe))
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 300)
  }

  const enviarManual = async (file: File | undefined) => {
    if (!file) return
    setErro(null)
    setBusy(true)
    try {
      const up = await uploadContratoArquivo(file, detalhe.reserva.id)
      const d = await adminSalvarContrato(detalhe.reserva.id, {
        tipoAssinatura: 'MANUAL',
        urlDocumento: up.url,
      })
      onDone(d)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao enviar contrato')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const enviarDigital = async (blob: Blob) => {
    setErro(null)
    setBusy(true)
    try {
      const file = new File([blob], 'assinatura.png', { type: 'image/png' })
      const up = await uploadContratoArquivo(file, detalhe.reserva.id)
      const d = await adminSalvarContrato(detalhe.reserva.id, {
        tipoAssinatura: 'DIGITAL',
        assinaturaUrl: up.url,
      })
      onDone(d)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar assinatura')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" onClick={imprimir}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir contrato
      </Button>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Assinatura manual</TabsTrigger>
          <TabsTrigger value="digital">Assinatura digital</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-2 pt-3">
          <Label>Enviar contrato assinado (escaneado/foto/PDF)</Label>
          <div>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Enviar arquivo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => enviarManual(e.target.files?.[0])}
            />
          </div>
        </TabsContent>

        <TabsContent value="digital" className="space-y-2 pt-3">
          <Label>Cliente assina abaixo (tablet/touch)</Label>
          <SignaturePad onSave={enviarDigital} saving={busy} />
        </TabsContent>
      </Tabs>

      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  )
}
