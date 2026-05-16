import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Search,
  CalendarCheck,
  MapPin,
  CheckCircle,
  FileText,
  Shield,
  CreditCard,
  Phone,
} from 'lucide-react'
import { FaqAccordion } from './_components/faq-accordion'

const steps = [
  {
    icon: Search,
    title: 'Escolha sua moto',
    description:
      'Navegue pelo nosso catálogo, filtre por categoria, preço ou disponibilidade e encontre a moto ideal para você.',
  },
  {
    icon: CalendarCheck,
    title: 'Faça sua reserva',
    description:
      'Selecione as datas, adicione acessórios opcionais e escolha um plano de seguro. Processo 100% digital, sem filas.',
  },
  {
    icon: MapPin,
    title: 'Retire a moto',
    description:
      'Apresente seu documento e CNH na nossa loja no dia combinado. Nosso time faz a vistoria junto com você.',
  },
  {
    icon: CheckCircle,
    title: 'Devolva e pronto',
    description:
      'Devolva a moto no prazo acordado. Após a vistoria sem ocorrências, seu caução é devolvido integralmente.',
  },
]

const requirements = [
  { icon: FileText, text: 'CNH categoria A válida' },
  { icon: Shield, text: 'Documento de identidade (RG ou CNH)' },
  { icon: CreditCard, text: 'Cartão de crédito para caução' },
  { icon: Phone, text: 'Cadastro completo na plataforma' },
]

const faqCategories = [
  {
    title: 'Reserva e Aluguel',
    items: [
      {
        question: 'Como faço para alugar uma moto?',
        answer:
          'Escolha a moto desejada no catálogo, selecione as datas de retirada e devolução, adicione acessórios ou seguro se quiser, e finalize a reserva. Você precisa estar cadastrado e ter seus documentos enviados para aprovação.',
      },
      {
        question: 'Qual é o prazo mínimo e máximo de aluguel?',
        answer:
          'O prazo mínimo é de 1 dia. Não há prazo máximo definido — entre em contato com a gente se precisar de um período muito longo para negociarmos as melhores condições.',
      },
      {
        question: 'Posso alterar as datas após fazer a reserva?',
        answer:
          'Reservas com status PENDENTE ou CONFIRMADA podem ser canceladas e refeitas com novas datas. Ainda não oferecemos edição direta de datas em uma reserva existente.',
      },
      {
        question: 'Posso reservar para outra pessoa?',
        answer:
          'Não. O condutor deve ser o mesmo titular da reserva. A CNH apresentada na retirada deve ser a mesma do cadastro.',
      },
      {
        question: 'Como acompanho minha reserva?',
        answer:
          'Acesse a área "Minhas Reservas" na sua conta. Lá você vê o status atual (Pendente, Confirmada, Em Andamento, Concluída ou Cancelada) e todos os detalhes da reserva.',
      },
    ],
  },
  {
    title: 'Documentos e Requisitos',
    items: [
      {
        question: 'Quais documentos preciso para alugar?',
        answer:
          'CNH categoria A válida, documento de identidade (RG ou CNH) e um cartão de crédito para a caução. Você também precisa enviar a foto da frente e verso da sua CNH e uma selfie com o documento pela plataforma antes da retirada.',
      },
      {
        question: 'Por que precisam verificar meus documentos?',
        answer:
          'A verificação de identidade (KYC) é necessária por questões de segurança e conformidade. Garante que o condutor está habilitado e que a moto está protegida adequadamente.',
      },
      {
        question: 'Quanto tempo leva a aprovação dos documentos?',
        answer:
          'Em dias úteis a análise é feita em até 24 horas. Envie seus documentos com antecedência para não atrasar sua retirada.',
      },
      {
        question: 'A CNH digital é aceita?',
        answer:
          'Sim, a CNH digital (pelo app Carteira Digital de Trânsito) é aceita para envio na plataforma e apresentação na retirada.',
      },
    ],
  },
  {
    title: 'Pagamento e Caução',
    items: [
      {
        question: 'Como funciona a caução?',
        answer:
          'A caução é um valor bloqueado no seu cartão de crédito como garantia pelo período do aluguel. Após a devolução sem ocorrências, o bloqueio é liberado integralmente. O valor varia conforme a moto escolhida.',
      },
      {
        question: 'Quais formas de pagamento são aceitas?',
        answer:
          'Cartão de crédito para a caução. O valor do aluguel pode ser pago no momento da retirada. Consulte as condições ao fazer a reserva.',
      },
      {
        question: 'O valor do aluguel inclui seguro?',
        answer:
          'Não por padrão. Você pode adicionar um plano de seguro durante a reserva. Recomendamos fortemente contratar o seguro para sua proteção.',
      },
      {
        question: 'O que acontece se eu devolver a moto com avaria?',
        answer:
          'Avarias são documentadas na vistoria de devolução. O custo do reparo é descontado da caução. Se o valor superar a caução, você será cobrado pela diferença.',
      },
    ],
  },
  {
    title: 'Cancelamento',
    items: [
      {
        question: 'Como cancelo minha reserva?',
        answer:
          'Acesse "Minhas Reservas" na sua conta e clique em "Cancelar" na reserva desejada. O cancelamento só é permitido para reservas com status PENDENTE ou CONFIRMADA.',
      },
      {
        question: 'Qual a política de cancelamento?',
        answer:
          'Reservas canceladas com mais de 48 horas de antecedência têm reembolso integral. Para cancelamentos com menos de 48 horas, pode haver cobrança de taxa. Consulte os Termos de Uso para detalhes.',
      },
      {
        question: 'O que acontece se eu não retirar a moto?',
        answer:
          'A reserva entra em status de não comparecimento após o horário de retirada sem contato. Isso pode resultar em cobrança de taxa e restrição para futuras locações.',
      },
    ],
  },
  {
    title: 'Seguros e Coberturas',
    items: [
      {
        question: 'Quais planos de seguro estão disponíveis?',
        answer:
          'Oferecemos diferentes planos de cobertura durante o processo de reserva, desde proteção básica até cobertura completa contra colisão, roubo e danos a terceiros. Os valores e coberturas aparecem na etapa de reserva.',
      },
      {
        question: 'O seguro cobre roubo?',
        answer:
          'Depende do plano contratado. Planos mais completos incluem cobertura para roubo e furto. Verifique as coberturas de cada plano no momento da reserva.',
      },
      {
        question: 'Sou obrigado a contratar seguro?',
        answer:
          'Não é obrigatório, mas é fortemente recomendado. Sem seguro, você é responsável integralmente por qualquer dano ou perda durante o período de locação.',
      },
    ],
  },
  {
    title: 'Uso da Moto',
    items: [
      {
        question: 'Posso viajar para outro estado com a moto?',
        answer:
          'Consulte as condições específicas da sua locação. Em geral, é permitido o uso no estado de origem. Viagens interestaduais podem requerer autorização prévia — entre em contato antes.',
      },
      {
        question: 'Há limite de quilometragem?',
        answer:
          'Algumas motos possuem franquia de quilometragem. Verifique as condições na página da moto antes de reservar. Quilômetros excedentes são cobrados à parte.',
      },
      {
        question: 'O que faço em caso de acidente ou pane?',
        answer:
          'Entre em contato imediatamente com nosso suporte pelo telefone informado no contrato. Em caso de acidente com terceiros, acione também o seguro (se contratado) e preserve as evidências.',
      },
      {
        question: 'Posso abastecer com qualquer combustível?',
        answer:
          'Use apenas o combustível recomendado para cada modelo. A informação está na ficha técnica da moto e no manual que fica no compartimento da moto. Dano por combustível errado não é coberto pelo seguro.',
      },
    ],
  },
]

export default function ComoFuncionaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
              Como Funciona
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              Alugar uma moto na MotoRent é simples e rápido. Do cadastro à retirada, tudo digital.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                4 passos para você na estrada
              </h2>
              <p className="mt-3 text-muted-foreground">
                Do cadastro à retirada em minutos
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="absolute left-1/2 top-6 hidden h-0.5 w-full translate-x-6 bg-border lg:block" />
                  )}
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="border-y border-border bg-muted/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                O que você precisa para alugar
              </h2>
              <p className="mt-3 text-muted-foreground">
                Tenha esses itens em mãos antes de iniciar sua reserva
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {requirements.map((req) => (
                  <div
                    key={req.text}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <req.icon className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium text-foreground">{req.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Perguntas Frequentes
              </h2>
              <p className="mt-3 text-muted-foreground">
                Tire suas dúvidas sobre o processo de aluguel
              </p>
            </div>
            <FaqAccordion categories={faqCategories} />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-primary py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
              Pronto para rodar?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Escolha sua moto e faça sua reserva agora mesmo
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/motos">Ver motos disponíveis</Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="border-primary-foreground/30"
                asChild
              >
                <Link href="/login">Criar conta grátis</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
