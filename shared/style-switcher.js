/**
 * Style overlay switcher — applies optional theme overlay after style.css.
 * Theme selector UI only on index.html; choice persists in localStorage and applies to all pages.
 */
(function() {
  var STORAGE_KEY = 'redpill-style-overlay';
  var FONT_SCALE_STORAGE_KEY = 'redpill-font-scale';

  var THEMES = [
    { id: 'signal', label: 'Signal' },
    { id: 'obsidian', label: 'Obsidian' },
    { id: 'forge', label: 'Forge' },
    { id: 'cloud', label: 'Cloud' },
    { id: 'clouded', label: 'Clouded' },
    { id: 'matrix-forge', label: 'Matrix Forge' },
    { id: 'sovereign-vault', label: 'Sovereign Vault' },
    { id: 'luxury', label: 'Luxury' },
    { id: 'beach', label: 'Beach' },
    { id: 'beached', label: 'Beached' },
    { id: 'neomorphism', label: 'Neomorphism' },
    { id: 'clinical-dark', label: 'Clinical Dark' },
    { id: 'raw-truth', label: 'Raw Truth' }
  ];

  var LEGACY_THEME_MAP = {
    'predatory-luxury': 'luxury',
    'sand': 'beach',
    'brutal-neomorphism': 'neomorphism',
    'clinical-obsidian': 'clinical-dark',
    'style-sovereign-vault': 'sovereign-vault',
    'style-matrix-forge': 'matrix-forge',
    'clinical-dominance': 'beach',
    'sovereign-gold': 'beach'
  };

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
    if (id && LEGACY_THEME_MAP[id]) id = LEGACY_THEME_MAP[id];
    if (!id || id === 'default') {
      link.href = '';
      return;
    }
    link.href = './style/' + id + '.css';
  }

  function applyFontScale(scale) {
    try {
      // scale is a number (e.g. 0.9, 0.8). Default is 1.
      document.documentElement.style.setProperty('--font-scale', String(scale || 1));
    } catch (e) {}
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

    // Font size scaling (global)
    var fontLabel = document.createElement('label');
    fontLabel.htmlFor = 'font-scale-select';
    fontLabel.textContent = 'Font: ';
    fontLabel.className = 'style-switcher-label';

    var fontSelect = document.createElement('select');
    fontSelect.id = 'font-scale-select';
    fontSelect.setAttribute('aria-label', 'Font size');
    fontSelect.className = 'font-scale-select';

    var options = [
      { value: '0.7', label: '70%' },
      { value: '0.8', label: '80%' },
      { value: '0.85', label: '85%' },
      { value: '0.9', label: '90%' },
      { value: '0.95', label: '95%' },
      { value: '1', label: '100%' },
      { value: '1.05', label: '105%' },
      { value: '1.1', label: '110%' },
      { value: '1.15', label: '115%' },
      { value: '1.2', label: '120%' }
    ];

    options.forEach(function(o) {
      var opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      fontSelect.appendChild(opt);
    });

    try {
      var savedScale = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      if (savedScale) fontSelect.value = savedScale;
      else fontSelect.value = '1';
    } catch (e) {}

    fontSelect.addEventListener('change', function() {
      var scale = fontSelect.value || '1';
      try {
        localStorage.setItem(FONT_SCALE_STORAGE_KEY, scale);
      } catch (e) {}
      applyFontScale(scale);
    });

    container.appendChild(fontLabel);
    container.appendChild(fontSelect);
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

    // Apply saved font scale even if selector UI isn't present.
    try {
      var savedScale = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
      applyFontScale(savedScale ? savedScale : 1);
    } catch (e) {
      applyFontScale(1);
    }

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
