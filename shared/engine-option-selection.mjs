/**
 * Sync .selected class on engine option labels (legacy style.css contract).
 * CSS :has(:checked) is primary; this keeps .selected in sync for engines that omit it.
 */

const OPTION_SELECTOR =
  ".option-label, .likert-option, .narrative-option, .three-point-option, .binary-unsure-option, .frequency-option, .binary-option, .scenario-option, .multiselect-option, .need-chain-option, .category-card, .frequency-grid-option, .iq-btn, .gender-btn";

function escapeAttr(value) {
  return typeof CSS !== "undefined" && CSS.escape ? CSS.escape(value) : String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function ensureSelectedCheck(label) {
  if (!label || label.querySelector(".selected-check")) return;
  const mark = document.createElement("span");
  mark.className = "selected-check";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = "✓";
  label.appendChild(mark);
}

function removeSelectedCheck(label) {
  label?.querySelectorAll(".selected-check").forEach((el) => el.remove());
}

export function syncOptionSelectionIn(root) {
  if (!root) return;
  const inputs = root.querySelectorAll(
    'input[type="radio"], input[type="checkbox"]'
  );
  const groups = new Set();
  inputs.forEach((input) => {
    if (input.type === "radio" && input.name) {
      groups.add(input.name);
    }
  });

  groups.forEach((name) => {
    root.querySelectorAll(`input[type="radio"][name="${escapeAttr(name)}"]`).forEach((input) => {
      const label = input.closest(OPTION_SELECTOR);
      if (!label) return;
      const on = input.checked;
      label.classList.toggle("selected", on);
      if (on) ensureSelectedCheck(label);
      else removeSelectedCheck(label);
    });
  });

  root.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    const label = input.closest(OPTION_SELECTOR);
    if (!label) return;
    const on = input.checked;
    label.classList.toggle("selected", on);
    if (on) ensureSelectedCheck(label);
    else removeSelectedCheck(label);
  });
}

function onSelectionChange(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.type !== "radio" && input.type !== "checkbox") return;
  const label = input.closest(OPTION_SELECTOR);
  if (!label) return;

  if (input.type === "radio" && input.name) {
    const scope =
      label.closest(".question-card, .question-block, .phase-questions, form, #questionContainer") ||
      document.getElementById("questionContainer");
    if (scope) {
      scope.querySelectorAll(`input[type="radio"][name="${escapeAttr(input.name)}"]`).forEach((el) => {
        const lbl = el.closest(OPTION_SELECTOR);
        if (!lbl) return;
        const on = el.checked;
        lbl.classList.toggle("selected", on);
        if (on) ensureSelectedCheck(lbl);
        else removeSelectedCheck(lbl);
      });
      return;
    }
  }

  label.classList.toggle("selected", input.checked);
  if (input.checked) ensureSelectedCheck(label);
  else removeSelectedCheck(label);
}

/**
 * @param {ParentNode} root
 */
export function bindOptionSelectionUI(root = document) {
  const container =
    root instanceof Element
      ? root.querySelector("#questionContainer") || root
      : document.getElementById("questionContainer");
  if (!container || container.dataset.bmOptionSelectionBound === "1") return;
  container.dataset.bmOptionSelectionBound = "1";
  container.addEventListener("change", onSelectionChange);
  container.addEventListener("click", (e) => {
    const label = e.target.closest(OPTION_SELECTOR);
    if (!label) return;
    const input = label.querySelector('input[type="radio"], input[type="checkbox"]');
    if (input && !input.disabled) {
      queueMicrotask(() => syncOptionSelectionIn(container));
    }
  });
  syncOptionSelectionIn(container);
}
