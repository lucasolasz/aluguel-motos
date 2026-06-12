'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Printer, Upload, Loader2, X, FileText } from 'lucide-react'
import { formatBucketTimestamp, formatCurrency, formatDate } from '@/lib/utils'
import { uploadContratoArquivo, deleteUploads } from '@/services/upload.service'
import { adminSalvarContrato } from '@/services/reservas.service'
import { NIVEL_COMBUSTIVEL_LABELS, type ReservaDetalhe } from '@/lib/atendimento-types'
import { ImageDialog } from './image-dialog'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function gerarHtmlContrato(d: ReservaDetalhe): string {
  const r = d.reserva
  const saida = d.vistorias.find((v) => v.tipo === 'SAIDA')
  const nivel = saida?.nivelCombustivel ? NIVEL_COMBUSTIVEL_LABELS[saida.nivelCombustivel] : '—'
  const km = saida?.kmRegistrado ?? '—'
  const local = (l: ReservaDetalhe['reserva']['localRetirada']) =>
    l ? `${escapeHtml(l.nome)} — ${escapeHtml(l.cidade)}/${escapeHtml(l.estado)}` : '—'
  const esc = (v: string | null | undefined) => v ? escapeHtml(v) : '—'

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Contrato de Locação — ${escapeHtml(r.id.slice(0, 8))}</title>
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
    <tr><td class="l">Nome</td><td>${esc(d.cliente.nomeCompleto)}</td></tr>
    <tr><td class="l">CPF</td><td>${esc(d.cliente.cpf)}</td></tr>
    <tr><td class="l">CNH</td><td>${esc(d.cnh?.numeroCnh ?? '—')} (validade ${
      d.cnh?.dataValidade ? formatDate(d.cnh.dataValidade) : '—'
    })</td></tr>
    <tr><td class="l">Telefone</td><td>${esc([d.cliente.ddi, d.cliente.ddd, d.cliente.numero].filter(Boolean).join(' '))}</td></tr>
  </table>
  <h2>Veículo e Período</h2>
  <table>
    <tr><td class="l">Moto</td><td>${esc(r.moto.nome)}</td></tr>
    <tr><td class="l">Retirada</td><td>${formatDate(r.dataRetirada)} ${r.horaRetirada ?? ''} — ${local(
      r.localRetirada,
    )}</td></tr>
    <tr><td class="l">Devolução</td><td>${formatDate(r.dataDevolucao)} ${r.horaDevolucao ?? ''} — ${local(
      r.localDevolucao,
    )}</td></tr>
    <tr><td class="l">Diárias</td><td>${r.totalDias}</td></tr>
    <tr><td class="l">KM na saída</td><td>${escapeHtml(String(km))}</td></tr>
    <tr><td class="l">Combustível na saída</td><td>${escapeHtml(nivel)}</td></tr>
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

export interface ContratoCollectResult {
  url: string
  uploadedKey: string
}

export interface ContratoSectionHandle {
  /** Faz upload do contrato selecionado (sem persistir) e devolve a URL pública e a key.
   *  Retorna null se nenhum arquivo foi selecionado (erro inline). O pai persiste via adminSalvarContrato. */
  collect: (timestamp: string) => Promise<ContratoCollectResult | null>
}

interface ContratoSectionProps {
  detalhe: ReservaDetalhe
  onDone: (d: ReservaDetalhe) => void
  /** 'persist' (default): sobe e salva sozinho via botão. 'deferred': o pai sobe via ref.collect(). */
  mode?: 'persist' | 'deferred'
  onPendingChange?: (hasPending: boolean) => void
  onCompleteChange?: (hasFile: boolean) => void
  onPrint?: () => void
}

const ContratoSection = forwardRef<ContratoSectionHandle, ContratoSectionProps>(function ContratoSection(
  { detalhe, onDone, mode = 'persist', onPendingChange, onCompleteChange, onPrint },
  ref,
) {
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<{ file: File; previewUrl: string } | null>(null)

  useEffect(() => {
    onPendingChange?.(!!pendingFile)
  }, [pendingFile, onPendingChange])

  useEffect(() => {
    onCompleteChange?.(!!pendingFile)
  }, [pendingFile, onCompleteChange])

  const handleFileSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (pendingFile) {
      URL.revokeObjectURL(pendingFile.previewUrl)
    }
    setPendingFile({ file, previewUrl: URL.createObjectURL(file) })
    setErro(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePendingFile = () => {
    if (pendingFile) {
      URL.revokeObjectURL(pendingFile.previewUrl)
      setPendingFile(null)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const enviarManual = async () => {
    if (!pendingFile) return
    setErro(null)
    setBusy(true)
    let uploadedKey: string | null = null
    try {
      const up = await uploadContratoArquivo(pendingFile.file, detalhe.reserva.id, formatBucketTimestamp())
      uploadedKey = up.key
      const d = await adminSalvarContrato(detalhe.reserva.id, {
        tipoAssinatura: 'MANUAL',
        urlDocumento: up.url,
      })
      URL.revokeObjectURL(pendingFile.previewUrl)
      setPendingFile(null)
      onDone(d)
    } catch (e) {
      // Rollback: remove do storage o arquivo enviado se a persistencia falhou (evita orfaos)
      if (uploadedKey) await deleteUploads([uploadedKey])
      setErro(e instanceof Error ? e.message : 'Falha ao enviar contrato')
    } finally {
      setBusy(false)
    }
  }

  // Modo deferred: só faz upload e devolve url+key. Quem persiste (adminSalvarContrato) e
  // faz rollback em falha posterior é o pai (atendimento-client), no "Concluir retirada".
  const collect = async (timestamp: string): Promise<ContratoCollectResult | null> => {
    if (!pendingFile) {
      setErro('Selecione o contrato assinado antes de concluir.')
      return null
    }
    setErro(null)
    setBusy(true)
    try {
      const up = await uploadContratoArquivo(pendingFile.file, detalhe.reserva.id, timestamp)
      return { url: up.url, uploadedKey: up.key }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao enviar contrato')
      return null
    } finally {
      setBusy(false)
    }
  }

  useImperativeHandle(ref, () => ({ collect }))

  const isImage = pendingFile?.file.type.startsWith('image/')

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" onClick={() => {
        const win = window.open('', '_blank', 'width=800,height=900')
        if (!win) {
          setErro('Pop-up bloqueado. Permita pop-ups para imprimir.')
          return
        }
        win.document.write(gerarHtmlContrato(detalhe))
        win.document.close()
        win.focus()
        onPrint?.()
        setTimeout(() => win.print(), 300)
      }}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir contrato
      </Button>

      <div className="space-y-2">
        <Label>Enviar contrato assinado (escaneado/foto/PDF)</Label>

        {!pendingFile ? (
          <div>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Selecionar arquivo
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files)}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-md border p-3">
              {isImage ? (
                <div className="h-16 w-16 overflow-hidden rounded border">
                  <ImageDialog src={pendingFile.previewUrl} alt="Preview contrato">
                    <img
                      src={pendingFile.previewUrl}
                      alt="Preview contrato"
                      className="h-16 w-16 object-cover"
                    />
                  </ImageDialog>
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded border bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{pendingFile.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(pendingFile.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={removePendingFile}
                className="rounded-full bg-muted p-1 hover:bg-muted-foreground/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2">
              {mode === 'persist' && (
                <Button
                  type="button"
                  disabled={busy}
                  onClick={enviarManual}
                >
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salvar contrato
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={removePendingFile}
                disabled={busy}
              >
                Trocar arquivo
              </Button>
            </div>
          </div>
        )}
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}
    </div>
  )
})

export default ContratoSection
