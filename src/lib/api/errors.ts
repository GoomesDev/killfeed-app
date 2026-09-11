import { isAxiosError } from 'axios';
import { z } from 'zod';

const errorBody = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

const statusMessages: Record<number, string> = {
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Você não tem acesso a estes dados.',
  404: 'Dados não encontrados.',
  422: 'Confira os dados enviados.',
  500: 'Não foi possível carregar os dados. Tente novamente.',
};

export function getApiErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Algo deu errado. Tente novamente.';
  }
  const parsed = errorBody.safeParse(error.response?.data);
  if (parsed.success) {
    const { message, error: detail, errors } = parsed.data;
    const validation = Object.values(errors ?? {}).flat().join('\n');
    const summary = message || detail;
    if (summary || validation) return [summary, validation].filter(Boolean).join('\n');
  }
  if (!error.response) return 'Sem conexão com o servidor. Tente novamente.';
  return statusMessages[error.response.status] ?? `Falha na requisição (${error.response.status}).`;
}
