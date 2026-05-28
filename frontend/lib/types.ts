export type TipoCobertura = 'INCLUSO' | 'PARCIAL' | 'NAO_INCLUSO'

export interface SeguroCobertura {
  nome: string;
  tipo: TipoCobertura;
}

export interface Seguro {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  precoPorDia: number;
  basico: boolean;
  percentualDesconto: number;
  coberturas: SeguroCobertura[];
}

export interface SeguroCoberturaAdmin {
  id: string;
  nome: string;
  tipo: TipoCobertura;
}

export interface SeguroAdmin {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  valorOriginal: number;
  valorComDesconto: number;
  percentualDesconto: number;
  valorTotalPacote: number;
  maxParcelasSemJuros: number;
  recomendado: boolean;
  ativo: boolean;
  coberturas: SeguroCoberturaAdmin[];
}

export interface SeguroRequest {
  nome: string;
  descricao: string;
  valorOriginal: number;
  valorComDesconto: number;
  percentualDesconto: number;
  valorTotalPacote: number;
  maxParcelasSemJuros: number;
  recomendado: boolean;
  ativo: boolean;
  coberturas: { nome: string; tipo: string }[];
}

export interface Acessorio {
  id: string;
  nome: string;
  descricao: string;
  precoPorDia: number;
  quantidadeMaxima: number;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  slug: string;
  imageUrl: string;
}

export interface MotoFoto {
  id: string;
  url: string;
  ordem: number;
  principal: boolean;
}

export interface UserProfile {
  id: string
  username: string  // é o e-mail do usuário
  nomeCompleto: string | null
  telefone: string | null
  cpf: string | null
  numeroCnh: string | null
  fotoPerfil: string | null
  createdAt: string
}

export interface LocalResumo {
  id: string
  nome: string
  cep: string
  logradouro: string
  numero: string
  complemento: string | null
  bairro: string
  cidade: string
  estado: string
}

export interface Local {
  id: string
  nome: string
  cep: string
  logradouro: string
  numero: string
  complemento: string | null
  bairro: string
  cidade: string
  estado: string
  ativo: boolean
}

export interface Reservation {
  id: string
  status: 'PENDENTE' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'
  dataRetirada: string
  dataDevolucao: string
  horaRetirada: string | null
  horaDevolucao: string | null
  localRetirada: LocalResumo | null
  localDevolucao: LocalResumo | null
  totalDias: number
  moto: {
    id: string
    nome: string
    imagens: string[]
  }
  seguro: {
    id: string
    nome: string
    precoPorDia: number
  } | null
  acessorios: {
    id: string
    nome: string
    quantidade: number
    precoPorDia: number
    subtotal: number
  }[]
  precoPorDia: number
  caucao: number
  totalAluguel: number
  totalSeguro: number
  totalAcessorios: number
  total: number
  cartaoNumeroMascarado: string | null
  createdAt: string
}

export type DocumentoTipo = 'CNH_FRENTE' | 'CNH_VERSO' | 'SELFIE_COM_DOCUMENTO'
export type DocumentoStatus = 'PENDENTE' | 'VERIFICADO' | 'RECUSADO'

export interface Documento {
  id: string
  tipo: DocumentoTipo
  url: string
  status: DocumentoStatus
  createdAt: string
}

export interface Cnh {
  id: string
  rg: string
  dataNascimento: string
  numeroRegistro: string
  numeroCnh: string
  dataValidade: string
  estado: string
  createdAt: string
}

export interface CreateCnh {
  rg: string
  dataNascimento: string
  numeroRegistro: string
  numeroCnh: string
  dataValidade: string
  estado: string
}

export interface Cartao {
  id: string
  nome: string
  numeroMascarado: string
  validade: string
  cpf: string
  enderecoCobranca: EnderecoCobranca | null
  createdAt: string
}

export interface CreateCartao {
  nome: string
  numero: string
  validade: string
  cpf: string
}

export interface EnderecoCobranca {
  id: string
  cep: string
  logradouro: string
  numero: string | null
  semNumero: boolean
  complemento: string | null
  estado: string
  cidade: string
  bairro: string
  createdAt: string
}

export interface CreateEnderecoCobranca {
  cep: string
  logradouro: string
  numero: string
  semNumero: boolean
  complemento: string
  estado: string
  cidade: string
  bairro: string
}

export interface Moto {
  id: string;
  nome: string;
  slug: string;
  marca: string;
  modelo: string;
  ano: number;
  precoPorDia: number;
  caucao: number;
  motor: string;
  potencia: string;
  transmissao: string;
  capacidadeTanque: string;
  alturaAssento: string;
  peso: string;
  itens: string[]; // No front tratamos como array para facilitar exibição
  disponivel: boolean;
  destaque?: boolean;
  fotos: MotoFoto[];
  categoria: Categoria;
}