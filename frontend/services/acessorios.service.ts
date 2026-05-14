import { apiFetch } from "./api";
import { Acessorio } from "@/lib/types";
import { mapAcessorio, mapAcessorios, type AcessorioDTO } from "@/lib/mappers";

export async function getAcessorios(): Promise<Acessorio[]> {
  const dtos = await apiFetch<AcessorioDTO[]>("/acessorios");
  return mapAcessorios(dtos);
}

export async function getAcessorioById(id: string): Promise<Acessorio> {
  const dto = await apiFetch<AcessorioDTO>(`/acessorios/${id}`);
  return mapAcessorio(dto);
}
