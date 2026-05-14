import { Acessorio, Categoria, Moto, MotoFoto, Seguro } from "./types";


// DTOs para tipagem do parâmetro de entrada
export interface CategoriaDTO {
  id: string;
  nome: string;
  descricao: string;
  slug: string;
  imageUrl: string;
}

export interface MotoFotoDTO {
  id: string;
  url: string;
  ordem: number;
  principal: boolean;
}

export interface MotoDTO {
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
  itens: string;
  disponivel: boolean;
  fotos: MotoFotoDTO[];
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

// Mapeamento de MotoFoto
export function mapMotoFoto(dto: MotoFotoDTO): MotoFoto {
  return {
    id: dto.id,
    url: dto.url,
    ordem: dto.ordem,
    principal: dto.principal,
  };
}

// Mapeamento de Moto
export function mapMoto(dto: MotoDTO): Moto {
  return {
    id: dto.id,
    nome: dto.nome,
    slug: dto.slug,
    marca: dto.marca,
    modelo: dto.modelo,
    ano: dto.ano,
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
    fotos: dto.fotos.map(mapMotoFoto),
    categoria: mapCategoria(dto.categoria),
  };
}

export function mapMotos(dtos: MotoDTO[]): Moto[] {
  return dtos.map(mapMoto);
}

// DTOs de Seguro
export interface SeguroDTO {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  precoPorDia: number;
  basico: boolean;
  coberturas: string[];
}

export function mapSeguro(dto: SeguroDTO): Seguro {
  return {
    id: dto.id,
    nome: dto.nome,
    slug: dto.slug,
    descricao: dto.descricao,
    precoPorDia: dto.precoPorDia,
    basico: dto.basico,
    coberturas: dto.coberturas,
  };
}

export function mapSeguros(dtos: SeguroDTO[]): Seguro[] {
  return dtos.map(mapSeguro);
}

// DTOs de Acessorio
export interface AcessorioDTO {
  id: string;
  nome: string;
  descricao: string;
  precoPorDia: number;
  quantidadeMaxima: number;
}

export function mapAcessorio(dto: AcessorioDTO): Acessorio {
  return {
    id: dto.id,
    nome: dto.nome,
    descricao: dto.descricao,
    precoPorDia: dto.precoPorDia,
    quantidadeMaxima: dto.quantidadeMaxima,
  };
}

export function mapAcessorios(dtos: AcessorioDTO[]): Acessorio[] {
  return dtos.map(mapAcessorio);
}