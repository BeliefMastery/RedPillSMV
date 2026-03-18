/**
 * Style overlay switcher — applies optional theme overlay after style.css.
 * Theme selector UI only on index.html; choice persists in localStorage and applies to all pages.
 */
(function() {
  var STORAGE_KEY = 'redpill-style-overlay';

  var THEMES = [
    { id: 'signal', label: 'Signal' },
    { id: 'obsidian', label: 'Obsidian Oracle' },
    { id: 'forge', label: 'Forge' },
    { id: 'predatory-luxury', label: 'Predatory Luxury' },
    { id: 'clinical-dominance', label: 'Clinical Dominance' },
    { id: 'sovereign-gold', label: 'Sovereign Gold' },
    { id: 'brutal-neomorphism', label: 'Brutal Neomorphism' },
    { id: 'clinical-obsidian', label: 'Clinical Obsidian' },
    { id: 'style-sovereign-vault', label: 'Sovereign Vault' },
    { id: 'style-matrix-forge', label: 'Matrix Forge' }
  ];

  function getOverlayLink() {
    return document.getElementById('style-overlay');
  }

  function getParamId() {
    var m = /[?&]style=([^&]+)/.exec(window.location.search);
    return m ? m[1].trim() : null;
  }

  function applyOverlay(id) {
    var link = getOverlayLink();
    if (!link) return;
    if (!id || id === 'default') {
      link.href = '';
      return;
    }
    link.href = './style/' + id + '.css';
  }

  function saveAndApply(id) {
    try {
      if (id && id !== 'default') {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
    applyOverlay(id || '');
  }

  function injectSwitcher(container) {
    var label = document.createElement('label');
    label.htmlFor = 'style-overlay-select';
    label.textContent = 'Theme: ';
    label.className = 'style-switcher-label';

    var select = document.createElement('select');
    select.id = 'style-overlay-select';
    select.setAttribute('aria-label', 'Theme overlay');
    select.className = 'style-overlay-select';

    var defaultOpt = document.createElement('option');
    defaultOpt.value = 'default';
    defaultOpt.textContent = 'Default';
    select.appendChild(defaultOpt);

    THEMES.forEach(function(t) {
      var opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.label;
      select.appendChild(opt);
    });

    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) select.value = saved;
    } catch (e) {}

    select.addEventListener('change', function() {
      var id = select.value === 'default' ? '' : select.value;
      saveAndApply(id);
    });

    container.appendChild(label);
    container.appendChild(select);
  }

  function init() {
    var paramId = getParamId();
    if (paramId !== null) {
      try {
        if (paramId === '' || paramId === 'default') {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, paramId);
        }
      } catch (e) {}
      if (window.history && window.history.replaceState) {
        var url = window.location.pathname + window.location.hash || '';
        window.history.replaceState({}, '', url);
      }
    }

    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    var idToApply = paramId !== null ? (paramId === 'default' ? '' : paramId) : (saved || '');
    applyOverlay(idToApply);

    var container = document.getElementById('style-switcher-container');
    if (container) {
      injectSwitcher(container);
      if (idToApply && getOverlayLink()) {
        var select = document.getElementById('style-overlay-select');
        if (select) select.value = idToApply;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
