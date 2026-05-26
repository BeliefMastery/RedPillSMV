// Engine UI Controller
// Unified state transitions: idle -> assessment -> results -> reset

export class EngineUIController {
  constructor(config = {}) {
    this.config = config;
    this.hiddenClass = config.hiddenClass || 'hidden';
    this.activeClass = config.activeClass || 'active';
  }

  transition(state) {
    const stateConfig = this.config[state];
    if (!stateConfig) return;
    this.applySelectors(stateConfig.show, true);
    this.applySelectors(stateConfig.hide, false);
  }

  applySelectors(selectors, show) {
    if (!selectors) return;
    const list = Array.isArray(selectors) ? selectors : [selectors];
    list.forEach(selector => {
      const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!element) return;
      if (show) {
        element.classList.remove(this.hiddenClass);
        element.classList.add(this.activeClass);
      } else {
        element.classList.add(this.hiddenClass);
        element.classList.remove(this.activeClass);
      }
    });
  }
}

