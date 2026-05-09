import { apiFetch } from "./api";

export interface Moto {
  id: string;
  nome: string;
  precoPorDia: number;
}

export function getMotos() {
  return apiFetch<Moto[]>("/motos");
}