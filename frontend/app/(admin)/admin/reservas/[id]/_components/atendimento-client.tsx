'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Check,
  CircleDashed,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  ClipboardCheck,
  FileSignature,
  KeyRound,
  Lock,
  Send,
  Loader2,
} from 'lucide-react'
import { IMaskInput } from 'react-imask'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  adminGetReservaDetalhe,
  adminVerificarCnh,
  adminCobrar,
  adminConcluirRetirada,
  adminConcluirDevolucao,
  adminAcertarCaucao,
} from '@/services/reservas.service'
import {
  NIVEL_COMBUSTIVEL_LABELS,
  type ReservaDetalhe,
} from '@/lib/atendimento-types'
import VistoriaForm from './vistoria-form'
import ContratoSection from './contrato-section'
import { ImageDialog } from './image-dialog'

function StepCard({
  icon: Icon,
  title,
  done,
  disabled,
  disabledMessage,
  children,
}: {
  icon: React.ElementType
  title: string
  done: boolean
  disabled?: boolean
  disabledMessage?: string
  children: React.ReactNode
}) {
  return (
    <Card className={disabled && !done ? 'opacity-50 pointer-events-none' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
        {done ? (
          <Badge className="gap-1">
            <Check className="h-3 w-3" /> Concluído
          </Badge>
        ) : disabled ? (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Lock className="h-3 w-3" /> Bloqueado
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <CircleDashed className="h-3 w-3" /> Pendente
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {disabled && !done && disabledMessage ? (
          <p className="text-sm text-muted-foreground">{disabledMessage}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}

export default function AtendimentoClient({ id }: { id: string }) {
  const router = useRouter()
  const [d, setD] = useState<ReservaDetalhe | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [cobrarOpen, setCobrarOpen] = useState(false)
  const [cvv, setCvv] = useState('')
  const [cobrarFase, setCobrarFase] = useState<'idle' | 'aluguel' | 'caucao'>('idle')
  const [acao, setAcao] = useState(false)
  const [desconto, setDesconto] = useState('0,00')
  const [caucaoSimOpen, setCaucaoSimOpen] = useState(false)
  const [caucaoSimStatus, setCaucaoSimStatus] = useState<'loading' | 'success'>('loading')
  const [vistoriaPendingCount, setVistoriaPendingCount] = useState(0)
  const [contratoPending, setContratoPending] = useState(false)
  const [voltarDialogOpen, setVoltarDialogOpen] = useState(false)

  const hasUnsavedChanges = vistoriaPendingCount > 0 || contratoPending

  const onVistoriaPendingChange = useCallback((count: number) => {
    setVistoriaPendingCount(count)
  }, [])

  const onContratoPendingChange = useCallback((hasPending: boolean) => {
    setContratoPending(hasPending)
  }, [])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      setD(await adminGetReservaDetalhe(id))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao carregar reserva')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  const run = async (fn: () => Promise<ReservaDetalhe>) => {
    setErro(null)
    setAcao(true)
    try {
      setD(await fn())
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha na operação')
    } finally {
      setAcao(false)
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Carregando atendimento...</p>
  }
  if (!d) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">{erro ?? 'Reserva não encontrada.'}</p>
        <Button asChild variant="outline">
          <Link href="/admin/reservas">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
    )
  }

  const r = d.reserva
  const status = r.status

  const cnhOk = d.cnhVerificada
  const pagoAluguel = d.pagamentos.some((p) => p.tipo === 'ALUGUEL' && p.status === 'PAGO')
  const pagoCaucao = d.pagamentos.some((p) => p.tipo === 'CAUCAO' && p.status === 'AUTORIZADO')
  const pagoOk = pagoAluguel && pagoCaucao
  const vistoriaSaida = d.vistorias.find((v) => v.tipo === 'SAIDA')
  const contratoOk = !!d.contrato?.assinadoEm
  const retiradaOk = cnhOk && pagoOk && !!vistoriaSaida && contratoOk

  const vistoriaRetorno = d.vistorias.find((v) => v.tipo === 'RETORNO')
  const caucaoAcertada = d.pagamentos.some(
    (p) => p.tipo === 'CAUCAO' && (p.status === 'CAPTURADO' || p.status === 'LIBERADO'),
  )

  const isRetirada = status === 'PENDENTE' || status === 'CONFIRMADA'
  const isDevolucao = status === 'EM_ANDAMENTO'

  const parseDesconto = (): number => {
    const raw = String(desconto).replace(/[^\d,]/g, '').replace(',', '.')
    const val = parseFloat(raw)
    return isNaN(val) ? 0 : val
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-1"
            onClick={() => {
              if (hasUnsavedChanges) {
                setVoltarDialogOpen(true)
              } else {
                router.push('/admin/reservas')
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {isRetirada ? 'Retirada' : isDevolucao ? 'Devolução' : 'Reserva'} ·{' '}
            <span className="font-mono text-lg">{r.id.slice(0, 8)}</span>
          </h1>
        </div>
        <Badge variant="secondary">{status}</Badge>
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium">{d.cliente.nomeCompleto ?? 'Cliente'}</p>
            <p className="text-muted-foreground">{d.cliente.email}</p>
            <p className="text-muted-foreground">CPF: {d.cliente.cpf ?? '—'}</p>
            <p className="text-muted-foreground">Tel: {[d.cliente.ddi, d.cliente.ddd, d.cliente.numero].filter(Boolean).join(' ') || '—'}</p>
          </div>
          <div>
            <p className="font-medium">{r.moto.nome}</p>
            <p className="text-muted-foreground">
              {formatDate(r.dataRetirada)} {r.horaRetirada ?? ''} → {formatDate(r.dataDevolucao)}{' '}
              {r.horaDevolucao ?? ''}
            </p>
            <p className="text-muted-foreground">Total: {formatCurrency(r.total)}</p>
            <p className="text-muted-foreground">Caução: {formatCurrency(r.caucao)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ─────────── RETIRADA ─────────── */}
      {isRetirada && (
        <div className="space-y-4">
          <StepCard icon={ShieldCheck} title="1. Validação da CNH" done={cnhOk}>
            {d.cnh ? (
              <div className="space-y-2 text-sm">
                <p>CNH: {d.cnh.numeroCnh} · Registro: {d.cnh.numeroRegistro}</p>
                <p>
                  Validade: {formatDate(d.cnh.dataValidade)} ({d.cnh.estado})
                  {d.cnh.vencida && (
                    <span className="ml-2 inline-flex items-center gap-1 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> VENCIDA
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Cliente não cadastrou CNH no sistema. Confira o documento físico no app VIO.
              </p>
            )}
            <div className="mt-3">
              {cnhOk ? (
                <p className="text-sm text-muted-foreground">
                  Verificada por {d.cnhVerificadaPor}{' '}
                  {d.cnhVerificadaEm ? `em ${formatDate(d.cnhVerificadaEm)}` : ''}
                </p>
              ) : (
                <Button disabled={acao} onClick={() => run(() => adminVerificarCnh(id))}>
                  Confirmar CNH verificada (VIO)
                </Button>
              )}
            </div>
          </StepCard>

          <StepCard
            icon={ClipboardCheck}
            title="2. Vistoria de saída"
            done={!!vistoriaSaida}
            disabled={!cnhOk}
            disabledMessage="Complete a validação da CNH para liberar esta etapa."
          >
            {vistoriaSaida ? (
              <div className="text-sm text-muted-foreground">
                <p>
                  KM: {vistoriaSaida.kmRegistrado ?? '—'} · Combustível:{' '}
                  {vistoriaSaida.nivelCombustivel
                    ? NIVEL_COMBUSTIVEL_LABELS[vistoriaSaida.nivelCombustivel]
                    : '—'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {vistoriaSaida.fotos.map((f) => (
                    <div key={f.id} className="relative h-16 w-16 overflow-hidden rounded border">
                      <ImageDialog src={f.url} alt="foto saída">
                        <Image src={f.url} alt="foto saída" fill className="object-cover" sizes="64px" />
                      </ImageDialog>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <VistoriaForm reservaId={id} tipo="SAIDA" onDone={setD} onPendingChange={onVistoriaPendingChange} />
            )}
          </StepCard>

          <StepCard
            icon={FileSignature}
            title="3. Contrato"
            done={contratoOk}
            disabled={!cnhOk || !vistoriaSaida}
            disabledMessage="Complete a CNH e a vistoria de saída para liberar esta etapa."
          >
            {contratoOk ? (
              <p className="text-sm text-muted-foreground">
                Contrato assinado ({d.contrato?.tipoAssinatura}) em{' '}
                {d.contrato?.assinadoEm ? formatDate(d.contrato.assinadoEm) : ''}.
              </p>
            ) : (
              <ContratoSection detalhe={d} onDone={setD} onPendingChange={onContratoPendingChange} />
            )}
          </StepCard>

          <StepCard
            icon={CreditCard}
            title="4. Pagamento"
            done={pagoOk}
            disabled={!cnhOk || !vistoriaSaida || !contratoOk}
            disabledMessage="Complete CNH, vistoria e contrato para liberar o pagamento."
          >
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Aluguel</span>
                <span>{pagoAluguel ? `${formatCurrency(r.total)} · PAGO` : formatCurrency(r.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Caução (hold)</span>
                <span>
                  {pagoCaucao ? `${formatCurrency(r.caucao)} · AUTORIZADO` : formatCurrency(r.caucao)}
                </span>
              </div>
            </div>
            <div className="mt-3">
              {pagoOk ? (
                <p className="text-sm text-muted-foreground">Pagamento concluído.</p>
              ) : (
                <Button disabled={acao} onClick={() => setCobrarOpen(true)}>
                  Cobrar
                </Button>
              )}
            </div>
          </StepCard>

          <Card>
            <CardContent className="flex items-center justify-between pt-6">
              <p className="text-sm text-muted-foreground">
                {retiradaOk
                  ? 'Tudo pronto. Conclua a retirada e entregue a chave.'
                  : 'Complete as etapas acima para liberar a entrega.'}
              </p>
              <Button
                size="lg"
                disabled={!retiradaOk || acao}
                onClick={async () => {
                  await run(() => adminConcluirRetirada(id))
                  router.push('/admin/reservas')
                }}
              >
                <KeyRound className="mr-2 h-4 w-4" /> Concluir retirada
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────── DEVOLUÇÃO ─────────── */}
      {isDevolucao && (
        <div className="space-y-4">
          {/* Referência: fotos da vistoria de saída */}
          {vistoriaSaida && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Vistoria de saída (referência)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm text-muted-foreground">
                  KM: {vistoriaSaida.kmRegistrado ?? '—'} · Combustível:{' '}
                  {vistoriaSaida.nivelCombustivel
                    ? NIVEL_COMBUSTIVEL_LABELS[vistoriaSaida.nivelCombustivel]
                    : '—'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {vistoriaSaida.fotos.map((f) => (
                    <div key={f.id} className="relative h-20 w-20 overflow-hidden rounded border">
                      <ImageDialog src={f.url} alt="foto saída referência">
                        <Image src={f.url} alt="foto saída" fill className="object-cover" sizes="80px" />
                      </ImageDialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <StepCard icon={ClipboardCheck} title="1. Vistoria de retorno" done={!!vistoriaRetorno}>
            {vistoriaRetorno ? (
              <div className="text-sm text-muted-foreground">
                <p>
                  KM: {vistoriaRetorno.kmRegistrado ?? '—'} · Combustível:{' '}
                  {vistoriaRetorno.nivelCombustivel
                    ? NIVEL_COMBUSTIVEL_LABELS[vistoriaRetorno.nivelCombustivel]
                    : '—'}
                </p>
                {vistoriaRetorno.fotos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {vistoriaRetorno.fotos.map((f) => (
                      <div key={f.id} className="relative h-20 w-20 overflow-hidden rounded border">
                        <ImageDialog src={f.url} alt="foto retorno">
                          <Image src={f.url} alt="foto retorno" fill className="object-cover" sizes="80px" />
                        </ImageDialog>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <VistoriaForm reservaId={id} tipo="RETORNO" onDone={setD} />
            )}
          </StepCard>

          {vistoriaSaida && vistoriaRetorno && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. Comparação saída × retorno</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium">Saída (KM {vistoriaSaida.kmRegistrado ?? '—'})</p>
                  <div className="flex flex-wrap gap-2">
                    {vistoriaSaida.fotos.map((f) => (
                      <div key={f.id} className="relative h-20 w-20 overflow-hidden rounded border">
                        <ImageDialog src={f.url} alt="saida">
                          <Image src={f.url} alt="saida" fill className="object-cover" sizes="80px" />
                        </ImageDialog>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Retorno (KM {vistoriaRetorno.kmRegistrado ?? '—'})</p>
                  <div className="flex flex-wrap gap-2">
                    {vistoriaRetorno.fotos.map((f) => (
                      <div key={f.id} className="relative h-20 w-20 overflow-hidden rounded border">
                        <ImageDialog src={f.url} alt="retorno">
                          <Image src={f.url} alt="retorno" fill className="object-cover" sizes="80px" />
                        </ImageDialog>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <StepCard icon={CreditCard} title="3. Acerto da caução" done={caucaoAcertada}>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Caução pré-autorizada: <b>{formatCurrency(r.caucao)}</b>. Informe o valor a reter por
                avarias, combustível faltante, km excedente ou atraso. Deixe <b>R$ 0,00</b> para liberar
                integralmente.
              </p>
              {caucaoAcertada ? (
                <p className="text-sm text-muted-foreground">
                  Caução já acertada.{' '}
                  {d.pagamentos.find((p) => p.tipo === 'CAUCAO')?.status === 'CAPTURADO'
                    ? `Retido: ${formatCurrency(d.pagamentos.find((p) => p.tipo === 'CAUCAO')?.valor ?? 0)}`
                    : 'Caução liberada integralmente.'}
                </p>
              ) : (
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="desconto">Valor a reter da caução</Label>
                  <div className="relative">
                    <IMaskInput
                      id="desconto"
                      mask={Number}
                      radix=","
                      thousandsSeparator="."
                      prefix="R$ "
                      scale={2}
                      padFractionalZeros
                      normalizeZeros
                      value={desconto}
                      onAccept={(value: string) => setDesconto(value)}
                      disabled={acao}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="R$ 0,00"
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={acao}
                    onClick={async () => {
                      setCaucaoSimStatus('loading')
                      setCaucaoSimOpen(true)
                      try {
                        await run(() => adminAcertarCaucao(id, parseDesconto()))
                        setCaucaoSimStatus('success')
                      } catch {
                        setCaucaoSimOpen(false)
                      }
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Processar acerto
                  </Button>
                </div>
              )}
            </div>
          </StepCard>

          <Card>
            <CardContent className="flex items-center justify-between pt-6">
              <p className="text-sm text-muted-foreground">
                {vistoriaRetorno && caucaoAcertada
                  ? 'Tudo pronto. Conclua a devolução.'
                  : !vistoriaRetorno
                    ? 'Registre a vistoria de retorno para concluir.'
                    : 'Acerte a caução para concluir.'}
              </p>
              <Button
                size="lg"
                disabled={!vistoriaRetorno || !caucaoAcertada || acao}
                onClick={() =>
                  run(() =>
                    adminConcluirDevolucao(id, {
                      valorDescontoCaucao: parseDesconto() || 0,
                    }),
                  )
                }
              >
                Concluir devolução
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────────── CONCLUÍDA / CANCELADA ─────────── */}
      {!isRetirada && !isDevolucao && (
        <Card>
          <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
            <p>Status: {status}.</p>
            {d.retiradaConcluidaEm && <p>Retirada: {formatDate(d.retiradaConcluidaEm)}</p>}
            {d.devolucaoConcluidaEm && <p>Devolução: {formatDate(d.devolucaoConcluidaEm)}</p>}
            <Separator className="my-2" />
            <p>
              Pagamentos:{' '}
              {d.pagamentos.map((p) => `${p.tipo} ${p.status} ${formatCurrency(p.valor)}`).join(' · ') ||
                '—'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmação ao sair com dados pendentes */}
      <Dialog open={voltarDialogOpen} onOpenChange={setVoltarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sair da página?</DialogTitle>
            <DialogDescription>
              Há dados preenchidos que ainda não foram salvos (fotos, assinatura ou contrato).
              Se sair agora, essas informações serão perdidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoltarDialogOpen(false)}>
              Continuar na página
            </Button>
            <Button variant="destructive" onClick={() => router.push('/admin/reservas')}>
              Sim, sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de simulação do acerto da caução */}
      <Dialog open={caucaoSimOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Acerto da caução</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {caucaoSimStatus === 'loading' && (
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            )}
            {caucaoSimStatus === 'success' && (
              <>
                <Check className="h-12 w-12 text-green-500" />
                <p className="text-sm font-medium">Caução acertado com sucesso</p>
                <Button onClick={() => setCaucaoSimOpen(false)} className="w-full">
                  OK
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de cobrança */}
      <Dialog open={cobrarOpen} onOpenChange={(open) => { setCobrarOpen(open); if (!open) setCvv('') }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cobrança</DialogTitle>
            <DialogDescription>Revise os valores e informe o CVV do cartão do cliente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Aluguel (cobrança)</span>
              <span>{formatCurrency(r.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Caução (pré-autorização/hold)</span>
              <span>{formatCurrency(r.caucao)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total no cartão</span>
              <span>{formatCurrency(r.total + r.caucao)}</span>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Label htmlFor="cvv">CVV do cartão</Label>
            <IMaskInput
              id="cvv"
              mask="0000"
              maxLength={4}
              value={cvv}
              onAccept={(value: string) => setCvv(value)}
              placeholder="CVV"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">
              Peça ao cliente para informar o CVV do cartão cadastrado na reserva.
            </p>
          </div>
          {cobrarFase !== 'idle' && (
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {cobrarFase === 'aluguel'
                  ? 'Realizando pagamento do aluguel...'
                  : 'Realizando cobrança da caução...'}
              </span>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={acao}
              onClick={() => { setCobrarOpen(false); setCvv('') }}
            >
              Cancelar
            </Button>
            <Button
              disabled={acao || cvv.replace(/\D/g, '').length < 3}
              onClick={async () => {
                setCobrarFase('aluguel')
                const faseTimer = setTimeout(() => setCobrarFase('caucao'), 1500)
                try {
                  await run(() => adminCobrar(id, cvv.replace(/\D/g, '')))
                  setCobrarOpen(false)
                  setCvv('')
                } finally {
                  clearTimeout(faseTimer)
                  setCobrarFase('idle')
                }
              }}
            >
              {acao ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar e cobrar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}