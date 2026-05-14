import { apiFetch } from "./api";
import { Moto } from "@/lib/types";
import { mapMoto, mapMotos, type MotoDTO } from "@/lib/mappers";

export async function getMotos(): Promise<Moto[]> {
  const dtos = await apiFetch<MotoDTO[]>("/motos");
  return mapMotos(dtos);
}

export async function getMotoById(id: string): Promise<Moto> {
  const dto = await apiFetch<MotoDTO>(`/motos/${id}`);
  return mapMoto(dto);
}