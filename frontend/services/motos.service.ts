import { apiFetch } from "./api";
import { Moto } from "@/lib/types";
import { mapMotos, type MotoDTO } from "@/lib/mappers";

export async function getMotos(): Promise<Moto[]> {
  const dtos = await apiFetch<MotoDTO[]>("/motos");
  return mapMotos(dtos);
}