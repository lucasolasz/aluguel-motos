import { apiFetch } from "./api";

export interface Categoria {
  id: string;
  nome: string;
}

export function getCategorias() {
  return apiFetch<Categoria[]>("/categorias");
}