export interface Seguro {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  precoPorDia: number;
  basico: boolean;
  coberturas: string[];
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

export interface Reservation {
  id: string
  status: 'PENDENTE' | 'CONFIRMADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'
  dataRetirada: string
  dataDevolucao: string
  totalDias: number
  moto: {
    id: string
    nome: string
    imagens: string[]
  }
  precoPorDia: number
  caucao: number
  totalAluguel: number
  totalSeguro: number
  totalAcessorios: number
  total: number
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
  fotos: MotoFoto[];
  categoria: Categoria;
}