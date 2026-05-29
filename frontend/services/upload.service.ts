import { API_URL } from "@/lib/config";
import { authHeaders } from "@/lib/auth";

export interface UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

// Não usa apiFetch: multipart precisa que o browser defina o boundary do Content-Type.
export async function uploadMotoFoto(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/api/uploads/motos`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.message === "string") message = body.message;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new Error(message);
  }

  return res.json();
}

export async function deleteUpload(key: string): Promise<void> {
  await fetch(`${API_URL}/api/uploads?key=${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}
