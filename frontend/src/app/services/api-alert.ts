type AlertKind = 'success' | 'error' | 'warning';

export function showSuccess(message: string): void {
  showModal({ title: 'Operación exitosa', message, kind: 'success' });
}

export function showError(message: string, error?: unknown): void {
  showModal({ title: 'No se pudo completar', message: `${message}${error ? `\n\n${formatApiError(error)}` : ''}`, kind: 'error' });
}

export function invalidFormAlert(fields: string[] = []): void {
  const details = fields.length ? `\n\nCampos por revisar:\n${fields.map(field => `- ${field}`).join('\n')}` : '';
  showModal({ title: 'Formulario incompleto', message: `Revisa el formulario. Hay campos obligatorios vacíos o con formato incorrecto.${details}`, kind: 'warning' });
}

export function showConfirm(message: string, onConfirm: () => void): void {
  showModal({
    title: 'Confirmar acción',
    message,
    kind: 'warning',
    confirmText: 'Sí, continuar',
    cancelText: 'Cancelar',
    onConfirm
  });
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

function showModal(options: {
  title: string;
  message: string;
  kind: AlertKind;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}): void {
  ensureStyles();
  const previous = document.querySelector('.app-alert-overlay');
  previous?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'app-alert-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'app-alert-dialog';

  const icon = document.createElement('div');
  icon.className = `app-alert-icon ${options.kind}`;
  icon.textContent = options.kind === 'success' ? '✓' : options.kind === 'warning' ? '!' : '×';

  const title = document.createElement('h3');
  title.textContent = options.title;

  const message = document.createElement('p');
  message.textContent = options.message;

  const actions = document.createElement('div');
  actions.className = 'app-alert-actions';

  const close = () => overlay.remove();

  if (options.onConfirm) {
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'app-alert-button secondary';
    cancelButton.textContent = options.cancelText || 'Cancelar';
    cancelButton.addEventListener('click', close);
    actions.appendChild(cancelButton);
  }

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = `app-alert-button primary ${options.kind}`;
  confirmButton.textContent = options.confirmText || 'Entendido';
  confirmButton.addEventListener('click', () => {
    close();
    options.onConfirm?.();
  });
  actions.appendChild(confirmButton);

  dialog.appendChild(icon);
  dialog.appendChild(title);
  dialog.appendChild(message);
  dialog.appendChild(actions);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  confirmButton.focus();
}

function ensureStyles(): void {
  if (document.getElementById('app-alert-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'app-alert-styles';
  style.textContent = `
    .app-alert-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: grid;
      place-items: center;
      padding: 20px;
      background: rgba(15, 23, 42, 0.48);
      backdrop-filter: blur(5px);
      animation: appAlertFade 160ms ease-out;
    }

    .app-alert-dialog {
      width: min(100%, 430px);
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 22px;
      padding: 30px;
      background: #ffffff;
      box-shadow: 0 28px 70px -28px rgba(15, 23, 42, 0.45);
      text-align: center;
      animation: appAlertSlide 190ms ease-out;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .app-alert-icon {
      display: grid;
      width: 66px;
      height: 66px;
      place-items: center;
      margin: 0 auto 18px;
      border-radius: 9999px;
      font-size: 2rem;
      font-weight: 800;
    }

    .app-alert-icon.success {
      background: #dcfce7;
      color: #166534;
      box-shadow: inset 0 0 0 1px rgba(22, 101, 52, 0.16);
    }

    .app-alert-icon.error {
      background: #fee2e2;
      color: #991b1b;
      box-shadow: inset 0 0 0 1px rgba(153, 27, 27, 0.16);
    }

    .app-alert-icon.warning {
      background: #fef3c7;
      color: #92400e;
      box-shadow: inset 0 0 0 1px rgba(146, 64, 14, 0.16);
    }

    .app-alert-dialog h3 {
      margin: 0 0 10px;
      color: #0f172a;
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: -0.03em;
    }

    .app-alert-dialog p {
      margin: 0;
      color: #475569;
      white-space: pre-line;
      line-height: 1.55;
      font-size: 0.98rem;
    }

    .app-alert-actions {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 24px;
    }

    .app-alert-button {
      border: none;
      border-radius: 10px;
      padding: 11px 18px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease;
    }

    .app-alert-button:hover {
      transform: translateY(-1px);
    }

    .app-alert-button.primary {
      color: #ffffff;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.14);
    }

    .app-alert-button.primary.success,
    .app-alert-button.primary.warning {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    }

    .app-alert-button.primary.error {
      background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    }

    .app-alert-button.secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .app-alert-button.secondary:hover {
      background: #e2e8f0;
    }

    @keyframes appAlertFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes appAlertSlide {
      from { transform: translateY(12px) scale(0.98); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
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
