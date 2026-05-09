import { Category, Motorcycle } from "./types";

// Backend DTOs (from API)
export interface CategoriaDTO {
  id: string;
  descricao: string;
  nome: string;
}

export interface MotoDTO {
  id: string;
  nome: string;
  precoPorDia: number;
}

// Mappers: Backend DTO → Frontend Types

export function mapCategoria(dto: CategoriaDTO): Category {
  return {
    id: dto.id,
    name: dto.nome,
    slug: dto.nome.toLowerCase().replace(/\s+/g, "-"),
    description: "", // TODO: adicionar ao backend
    image: "", // TODO: adicionar ao backend
    examples: [], // TODO: adicionar ao backend
  };
}

export function mapCategorias(dtos: CategoriaDTO[]): Category[] {
  return dtos.map(mapCategoria);
}

export function mapMoto(dto: MotoDTO): Motorcycle {
  return {
    id: dto.id,
    name: dto.nome,
    brand: "", // TODO: adicionar ao backend
    model: "", // TODO: adicionar ao backend
    year: new Date().getFullYear(), // TODO: adicionar ao backend
    categoryId: "", // TODO: adicionar ao backend
    category: {
      id: "",
      name: "",
      slug: "",
      description: "",
      image: "",
      examples: [],
    }, // TODO: adicionar ao backend
    images: [], // TODO: adicionar ao backend
    pricePerDay: dto.precoPorDia,
    securityDeposit: 0, // TODO: adicionar ao backend
    specifications: {
      engine: "",
      power: "",
      transmission: "",
      fuelCapacity: "",
      seatHeight: "",
      weight: "",
    },
    features: [],
    available: true,
  };
}

export function mapMotos(dtos: MotoDTO[]): Motorcycle[] {
  return dtos.map(mapMoto);
}
