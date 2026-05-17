"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto md:max-w-200">
        <DialogHeader>
          <DialogTitle>Termos e condições</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-4">
          <p>
            As cláusulas e condições do contrato de aluguel de carros e seguro estão à sua disposição nas agências Rio Ride Rental ou clicando aqui.
          </p>
          <p>
            O CLIENTE declara e reconhece que a Rio Ride Rental Rent a Car S.A. e demais empresas do grupo, por meio da QI Sociedade de Crédito Direto S.A., instituição financeira inscrita no CNPJ sob o nº 32.402.502/0001-35, poderá, para fins de análise de crédito, realizar a consulta de suas informações constantes no Sistema de Informações de Crédito do Banco Central do Brasil (&ldquo;SCR&rdquo;) e nos Órgãos de Proteção ao Crédito e revelar a terceiros. Mais informações sobre o SCR podem ser obtidas em consulta ao ambiente virtual do Banco Central (www.bcb.gov.br).
          </p>
          <p>
            Para retirar o veículo você precisa ter idade mínima de 18 anos, CNH válida (provisória ou definitiva), ter cartão crédito em seu nome (com limite disponível para pré-autorização) e ser aprovado na análise cadastral da Rio Ride Rental. Caso você tenha entre 18 e 20 anos será necessário adicionar o Condutor Jovem em sua reserva.
          </p>
          <p>
            Para todas as locações diárias, será necessário realizar pagamento antecipado do aluguel, que pode ser acrescido de uma pré-autorização, a depender do histórico de locações nos últimos 14 meses.
          </p>
          <p>
            Para a modalidade Aluguel Mensal, é necessário realizar o Depósito de Segurança, que deve ser pago na abertura do contrato com valor equivalente a UMA mensalidade. Este valor serve como garantia do aluguel e quaisquer encargos envolvidos na locação, podendo ser utilizado para compensar débitos com a Rio Ride Rental. No fechamento do contrato, caso não haja débitos pendentes, a Rio Ride Rental realizará o estorno no cartão de crédito ou o reembolso em conta bancária nacional cadastrada.
          </p>
          <p>
            Para a modalidade de Aluguel Mensal, a locação tem um prazo mínimo de 30 (trinta) dias. Ao final de cada período de 30 dias, o contrato é prorrogado e faturado automaticamente pelo mesmo período até o encerramento da locação. Caso o carro seja devolvido antes do prazo mínimo, a tarifa será recalculada para aluguel diário.
          </p>
          <p>
            A diária das proteções do carro e coberturas de risco para terceiros é de 24 horas, com 3 horas de tolerância. A partir da 27ª hora, incidirá cobrança de mais 1 diária das proteções e coberturas de risco. Consulte todas as regras de uso e coberturas das proteções e seguro no Contrato de Aluguel clicando aqui.
          </p>
          <p>Desconto e promoções não são cumulativos.</p>
          <p>
            Garantimos a sua reserva por até 1 hora depois do horário agendado, desde que a agência esteja aberta.
          </p>
          <p>
            O carro deve ser devolvido limpo. Se estiver com poeira, respingos de terra ou sujeira nas partes inferiores, cobramos uma lavagem simples. Para sujeiras internas, lama, areia, pelos de animais, odores fortes, minério, piche ou plotagem, cobramos uma lavagem especial.
          </p>
          <p>
            O carro precisa ser devolvido com tanque cheio. Se você não conseguir abastecer, podemos fazer isso por você com base nos valores praticados na cidade de devolução do veículo.
          </p>
          <p>
            Na falta do grupo reservado, você poderá ser atendido com carro de categoria superior ou inferior até que a Rio Ride Rental disponibilize o modelo reservado inicialmente, para que você realize a substituição.
          </p>
          <p>
            A diária do carro é de 24 horas e você tem 3h de tolerância para devolver o carro, contadas a partir do horário que o retirou (dentro do horário de atendimento da agência). Portanto, sua última diária pode ter duração de até 27 horas. Se passar desse limite de tolerância ou não devolver dentro do horário de atendimento, essas horas vão ser cobradas conforme regras de horas extras.
          </p>
          <p>
            Hora extra: entre 3 e 5 horas extras será cobrado o valor de 4/5 (quatro quintos) da diária, além do valor integral das proteções do carro e cobertura a terceiros, caso tenha contratado. Após 5 horas extras será cobrado o valor de mais uma diária, além do valor integral das proteções do carro e cobertura a terceiros, caso tenha contratado.
          </p>
          <p>
            O carro alugado pode ser devolvido em qualquer agência Rio Ride Rental, mediante cobrança da taxa de retorno. A cobrança varia conforme cidade, grupo de carro reservado e distância entre a agência de retirada e de devolução (valores disponíveis nas agências Rio Ride Rental).
          </p>
          <p>
            A modalidade de Aluguel Mensal inclui quilometragem controlada. Caso a franquia contratada seja excedida, será cobrado um valor adicional por quilômetro extra.
          </p>
          <p>
            Para alteração ou consulta, informe o número de confirmação de sua reserva em nosso site clicando aqui.
          </p>
          <p>
            Reservas canceladas com menos de 4 horas da criação, não será cobrada taxa por cancelamento. Haverá cobrança de taxa de cancelamento se a reserva for cancelada com menos de 48 horas da retirada do veículo. Caso você não retire o carro e não cancele a reserva com antecedência mínima de 48 horas do horário de retirada, haverá cobrança de taxa no show.
          </p>
          <p>
            Em caso de furto, roubo, incêndio e colisão, é obrigatória a apresentação do Boletim de Ocorrência e o preenchimento do Relatório de Avarias/Aviso de Sinistro, na Rio Ride Rental.
          </p>
          <p>
            Poderão ser enviadas mensagens via canal de atendimento &ldquo;WhatsApp®&rdquo; aos clientes que efetuarem reservas por esse meio para fins de atendimento e em relação à reserva efetuada.
          </p>
          <p>
            Os valores de contratação de motorista e aluguel de adicionais não farão parte do valor total estimado da reserva, sendo seus valores somados no momento da devolução do veículo. Na contratação de motorista, o cliente arcará com as despesas de pedágio e pernoite, caso haja.
          </p>
          <p>
            A TAXA DE ALUGUEL de 15% refere-se ao percentual aplicado sobre o valor total do contrato, inclusive sobre o CUSTO PREFIXADO DE LIMITE DE DANOS. Ela incidirá sobre o valor total de cada fatura emitida pela Rio Ride Rental.
          </p>
          <p>
            Pré-autorização: reserva de valor feita no seu cartão de crédito no dia da retirada do carro, para fins de cobrir imprevistos. Na devolução do carro, não havendo débitos, solicitamos a liberação deste bloqueio em seu limite ao seu banco. O prazo de desbloqueio dependerá do banco emissor.
          </p>
          <p className="font-semibold">OBRIGADO POR ESCOLHER A Rio Ride Rental!</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
