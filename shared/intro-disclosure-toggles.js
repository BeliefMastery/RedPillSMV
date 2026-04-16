/**
 * Shared disclosure toggle wiring for intro explainers/disclaimers/instructions.
 * Requires controls with data-disclosure-target="<panelId>".
 */
(function () {
  function setDisclosureState(control, panel, expanded) {
    control.classList.toggle('expanded', expanded);
    panel.classList.toggle('expanded', expanded);
    control.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  function bindDisclosureToggle(control) {
    if (!(control instanceof Element)) return;
    const panelId = control.getAttribute('data-disclosure-target');
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    if (!control.hasAttribute('aria-controls')) {
      control.setAttribute('aria-controls', panelId);
    }

    const initialExpanded =
      control.classList.contains('expanded') || panel.classList.contains('expanded');
    setDisclosureState(control, panel, initialExpanded);

    control.addEventListener('click', () => {
      const next = control.getAttribute('aria-expanded') !== 'true';
      setDisclosureState(control, panel, next);
    });
  }

  function initDisclosureToggles() {
    document
      .querySelectorAll('[data-disclosure-target]')
      .forEach((control) => bindDisclosureToggle(control));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDisclosureToggles);
  } else {
    initDisclosureToggles();
  }
})();
