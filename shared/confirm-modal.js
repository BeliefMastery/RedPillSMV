/**
 * Custom confirm/alert modal — avoids native browser dialogs that show domain (e.g. beliefmastery.github.io).
 * Provides Promise-based showConfirm and showAlert with site-styled modals.
 */

const MODAL_STYLES = `
.confirm-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: confirm-fade-in 0.2s ease;
}
@keyframes confirm-fade-in { from { opacity: 0; } to { opacity: 1; } }
.confirm-modal-box {
  background: linear-gradient(135deg, rgba(15, 25, 45, 0.98), rgba(20, 35, 55, 0.95));
  border: 1px solid rgba(255, 215, 0, 0.35);
  border-radius: 12px;
  padding: 1.75rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.1);
}
.confirm-modal-box h4 {
  color: #e8f0f8;
  margin: 0 0 1rem;
  font-size: 1.1rem;
}
.confirm-modal-box p {
  color: rgba(200, 220, 240, 0.9);
  line-height: 1.6;
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
}
.confirm-modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
.confirm-modal-btn {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.95rem;
}
.confirm-modal-btn-primary {
  background: linear-gradient(135deg, #ffd700, #ffb700);
  color: #050a15;
}
.confirm-modal-btn-primary:hover {
  background: linear-gradient(135deg, #ffc820, #ffd700);
}
.confirm-modal-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: #bcdcff;
}
.confirm-modal-btn-secondary:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.6);
}
`;

function injectStyles() {
  if (document.getElementById('confirm-modal-styles')) return;
  const style = document.createElement('style');
  style.id = 'confirm-modal-styles';
  style.textContent = MODAL_STYLES;
  document.head.appendChild(style);
}

function createModal(options) {
  injectStyles();
  const { message, title = 'Confirm', confirmLabel = 'OK', cancelLabel = 'Cancel', isAlert = false } = options;
  const backdrop = document.createElement('div');
  backdrop.className = 'confirm-modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-labelledby', 'confirm-modal-title');

  const box = document.createElement('div');
  box.className = 'confirm-modal-box';

  const titleEl = document.createElement('h4');
  titleEl.id = 'confirm-modal-title';
  titleEl.textContent = title;

  const msgEl = document.createElement('p');
  msgEl.textContent = message;

  const actions = document.createElement('div');
  actions.className = 'confirm-modal-actions';

  return new Promise((resolve) => {
    const close = (value) => {
      backdrop.remove();
      resolve(value);
    };

    const okBtn = document.createElement('button');
    okBtn.className = 'confirm-modal-btn confirm-modal-btn-primary';
    okBtn.textContent = confirmLabel;
    okBtn.addEventListener('click', () => close(true));

    if (isAlert) {
      actions.appendChild(okBtn);
    } else {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'confirm-modal-btn confirm-modal-btn-secondary';
      cancelBtn.textContent = cancelLabel;
      cancelBtn.addEventListener('click', () => close(false));
      actions.appendChild(cancelBtn);
      actions.appendChild(okBtn);
    }

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(false);
    });

    box.appendChild(titleEl);
    box.appendChild(msgEl);
    box.appendChild(actions);
    backdrop.appendChild(box);
    document.body.appendChild(backdrop);
    okBtn.focus();
  });
}

/**
 * @param {string} message
 * @returns {Promise<boolean>} true if OK, false if Cancel
 */
export function showConfirm(message) {
  return createModal({ message, title: 'Confirm', confirmLabel: 'OK', cancelLabel: 'Cancel', isAlert: false });
}

/**
 * @param {string} message
 * @returns {Promise<void>}
 */
export function showAlert(message) {
  return createModal({ message, title: 'Notice', confirmLabel: 'OK', isAlert: true });
}
