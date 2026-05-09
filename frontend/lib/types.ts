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

export interface Moto {
  id: string;
  nome: string;
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