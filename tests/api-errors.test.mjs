import assert from 'node:assert/strict';
import test from 'node:test';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from '../src/lib/api/errors.ts';

function responseError(status, data) {
  return new AxiosError('Request failed', undefined, undefined, undefined, {
    status, data, statusText: '', headers: {}, config: { headers: {} },
  });
}

test('preserves Laravel validation details and summary', () => {
  assert.equal(getApiErrorMessage(responseError(422, {
    message: 'Dados inválidos', errors: { date: ['Data inválida.'] },
  })), 'Dados inválidos\nData inválida.');
});

test('preserves the error envelope used by the existing controllers', () => {
  assert.equal(getApiErrorMessage(responseError(404, {
    error: 'Usuário não encontrado',
  })), 'Usuário não encontrado');
});

test('handles non-JSON server errors and network failures', () => {
  assert.equal(getApiErrorMessage(responseError(500, '<html>error</html>')),
    'Não foi possível carregar os dados. Tente novamente.');
  assert.equal(getApiErrorMessage(new AxiosError('Network Error')),
    'Sem conexão com o servidor. Tente novamente.');
});

test('keeps configuration failures actionable', () => {
  assert.equal(getApiErrorMessage(new Error('Configure a URL')), 'Configure a URL');
});
