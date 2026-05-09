import { Categoria, Moto } from "./types";


// DTOs para tipagem do parâmetro de entrada
export interface CategoriaDTO {
  id: string;
  nome: string;
  descricao: string;
  slug: string;
  imageUrl: string;
}

export interface MotoDTO {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  ano: number;
  imagemUrl: string;
  precoPorDia: number;
  caucao: number;
  motor: string;
  potencia: string;
  transmissao: string;
  capacidadeTanque: string;
  alturaAssento: string;
  peso: string;
  itens: string;
  disponivel: boolean;
  categoria: CategoriaDTO;
}

// Mapeamento de Categoria
export function mapCategoria(dto: CategoriaDTO): Categoria {
  return {
    id: dto.id,
    nome: dto.nome,
    descricao: dto.descricao,
    slug: dto.slug,
    imageUrl: dto.imageUrl,
  };
}

export function mapCategorias(dtos: CategoriaDTO[]): Categoria[] {
  return dtos.map(mapCategoria);
}

// Mapeamento de Moto
export function mapMoto(dto: MotoDTO): Moto {
  return {
    id: dto.id,
    nome: dto.nome,
    marca: dto.marca,
    modelo: dto.modelo,
    ano: dto.ano,
    imagemUrl: dto.imagemUrl,
    precoPorDia: dto.precoPorDia,
    caucao: dto.caucao,
    motor: dto.motor,
    potencia: dto.potencia,
    transmissao: dto.transmissao,
    capacidadeTanque: dto.capacidadeTanque,
    alturaAssento: dto.alturaAssento,
    peso: dto.peso,
    // Converte a string separada por vírgula em array
    itens: dto.itens ? dto.itens.split(",").map((i) => i.trim()) : [],
    disponivel: dto.disponivel,
    categoria: mapCategoria(dto.categoria),
  };
}

export function mapMotos(dtos: MotoDTO[]): Moto[] {
  return dtos.map(mapMoto);
}