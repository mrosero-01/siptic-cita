export function showSuccess(message: string): void {
  alert(message);
}

export function showError(message: string, error?: unknown): void {
  alert(`${message}${error ? `\n\n${formatApiError(error)}` : ''}`);
}

export function invalidFormAlert(fields: string[] = []): void {
  const details = fields.length ? `\n\nCampos por revisar:\n${fields.map(field => `- ${field}`).join('\n')}` : '';
  alert(`Revisa el formulario. Hay campos obligatorios vacíos o con formato incorrecto.${details}`);
}

export function formatApiError(error: unknown): string {
  const payload = getPayload(error);

  if (!payload) {
    return 'No se pudo completar la operación. Inténtalo nuevamente.';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(item => String(item)).join('\n');
  }

  if (typeof payload === 'object') {
    const entries = Object.entries(payload as Record<string, unknown>);

    if (entries.length === 0) {
      return 'No se pudo completar la operación. Inténtalo nuevamente.';
    }

    return entries.map(([field, value]) => {
      const label = field === 'detail' ? 'Detalle' : field;
      return `${label}: ${formatValue(value)}`;
    }).join('\n');
  }

  return String(payload);
}

function getPayload(error: unknown): unknown {
  if (error && typeof error === 'object' && 'error' in error) {
    return (error as { error?: unknown }).error;
  }

  return error;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).join(', ');
  }

  if (value && typeof value === 'object') {
    return formatApiError(value);
  }

  return String(value);
}
