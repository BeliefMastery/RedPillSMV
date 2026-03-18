// Universal WebGL Nebula Background (vivid blue-white clouds, organic swimming motion)
(function() {
  const canvas = document.getElementById('nebula-canvas');
  if (!canvas) return;

  // Check for WebGL support, reduced motion, or mobile/touch devices
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowPowerDevice = window.matchMedia('(max-width: 1024px)').matches ||
    window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (prefersReducedMotion || lowPowerDevice) {
    canvas.style.display = 'none';
    return;
  }

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    canvas.style.display = 'none'; // Gracefully degrade to CSS gradient
    return;
  }

  // Resize canvas with capped DPR for performance
  let resizeRaf = null;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  const onResize = () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  };
  window.addEventListener('resize', onResize);
  resize();

  // Vertex Shader (simple full-screen quad - unchanged)
  const vsSource = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = (position + 1.0) / 2.0;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment Shader (faster swimming, more distinct blue-white clouds, breathing effect)
  const fsSource = `
    precision mediump float;
    uniform float time;
    uniform float scrollY;
    uniform vec2 resolution;
    varying vec2 uv;

    // Simple noise function (approximates Perlin)
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p) { // Fractional Brownian Motion for organic texture
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; ++i) {  // Increased iterations for more detail
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 pos = uv * resolution / min(resolution.x, resolution.y); // Aspect-correct

      // Faster, more organic swimming motion - clouds morph and roam
      float scrollOffset = scrollY * 0.0003;
      float breathe = sin(time * 0.3) * 0.5 + 0.5; // Breathing pulse (faster)
      
      // Multiple drift layers with different speeds for swimming effect
      vec2 drift1 = vec2(time * 0.035, sin(time * 0.025) * 0.5 + scrollOffset); // 2x+ faster
      vec2 drift2 = vec2(cos(time * 0.028) * 0.4, time * 0.03 + scrollOffset * 0.5); // More lateral movement
      vec2 drift3 = vec2(sin(time * 0.042) * 0.45, cos(time * 0.032) * 0.4); // Counter-rotating
      vec2 drift4 = vec2(cos(time * 0.05) * 0.3, sin(time * 0.04) * 0.35); // Additional layer
      
      // Add rotational swirl for organic morphing
      float angle = time * 0.08;
      mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

      // Multiple FBM layers with breathing and rotation
      float n1 = fbm((pos + drift1) * (1.2 + breathe * 0.2));
      float n2 = fbm((rot * (pos + drift2)) * 2.5) * 0.7;
      float n3 = fbm((pos + drift3) * 4.5) * 0.4;
      float n4 = fbm((rot * (pos + drift4)) * 3.2) * 0.3; // Extra morphing layer
      float n = (n1 + n2 + n3 + n4) / 2.4; // Combine for rich texture

      // Dynamic radial variations (breathing clouds)
      float dist = length(pos - vec2(0.5, 0.5));
      float radial = sin(dist * 4.0 + time * 0.15) * 0.15 * breathe; // Pulsing
      n += radial;

      // More distinct blue-white scheme (no pink, stronger contrast)
      vec3 color1 = vec3(0.08, 0.12, 0.20); // Deep space base
      vec3 color2 = vec3(0.2, 0.5, 0.95); // Rich electric blue
      vec3 color3 = vec3(0.75, 0.85, 1.0); // Bright white-blue highlights
      vec3 color4 = vec3(0.35, 0.65, 1.0); // Mid-tone cyan-blue
      
      // More aggressive color mixing for distinct clouds
      vec3 baseColor = mix(color1, color2, smoothstep(0.25, 0.55, n));
      vec3 midColor = mix(color2, color4, smoothstep(0.4, 0.7, n));
      vec3 highlightColor = mix(midColor, color3, smoothstep(0.6, 0.9, n));
      vec3 color = mix(baseColor, highlightColor, smoothstep(0.3, 0.8, n));

      // Breathing glow effect (pulses with time)
      float glowIntensity = sin(time * 0.25) * 0.15 + 0.25;
      float glow = sin(n * 6.28 + time * 0.2) * glowIntensity * breathe;
      color += vec3(0.15, 0.25, 0.4) * glow;

      // Sharper cloud edges (more distinct formations)
      n = pow(n, 1.2); // Increase contrast
      color *= (0.7 + n * 0.6); // Darker darks, brighter brights

      // Softer edge fade
      float edgeFade = smoothstep(0.0, 0.05, uv.x) * smoothstep(1.0, 0.95, uv.x) *
                       smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
      color *= edgeFade;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // Compile shader
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // Program setup
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) {
    canvas.style.display = 'none';
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    canvas.style.display = 'none';
    return;
  }
  gl.useProgram(program);

  // Quad vertices
  const positionLocation = gl.getAttribLocation(program, 'position');
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Uniforms
  const timeLocation = gl.getUniformLocation(program, 'time');
  const scrollYLocation = gl.getUniformLocation(program, 'scrollY');
  const resolutionLocation = gl.getUniformLocation(program, 'resolution');

  // Scroll tracking for parallax effect (throttled)
  let scrollY = 0;
  let scrollRaf = null;
  function updateScroll() {
    scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    scrollRaf = null;
  }
  const onScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  updateScroll();

  // Animation loop
  let startTime = performance.now();
  let animationId = null;
  let lastFrame = 0;
  const frameInterval = 1000 / 30; // 30fps cap
  const timeScale = 0.15; // Slow drift to prevent acceleration over long sessions
  let isPaused = false;

  function render(now) {
    if (isPaused) return;
    if (now - lastFrame < frameInterval) {
      animationId = requestAnimationFrame(render);
      return;
    }
    lastFrame = now;
    const elapsed = (now - startTime) / 1000;
    const stableTime = (elapsed * timeScale) % 10000;
    gl.uniform1f(timeLocation, stableTime);
    gl.uniform1f(scrollYLocation, scrollY);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animationId = requestAnimationFrame(render);
  }
  animationId = requestAnimationFrame(render);

  // Pause animation when tab is hidden
  function handleVisibility() {
    if (document.hidden) {
      isPaused = true;
      if (animationId) cancelAnimationFrame(animationId);
      animationId = null;
    } else {
      isPaused = false;
      lastFrame = 0;
      startTime = performance.now();
      animationId = requestAnimationFrame(render);
    }
  }
  document.addEventListener('visibilitychange', handleVisibility);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', handleVisibility);
  });
})();

// Link debug identifiers + broken link checks (same-origin only).
(function() {
  function isSkippableHref(href) {
    if (!href) return true;
    const trimmed = href.trim();
    if (!trimmed || trimmed.startsWith('#')) return true;
    const lower = trimmed.toLowerCase();
    return (
      lower.startsWith('mailto:') ||
      lower.startsWith('tel:') ||
      lower.startsWith('javascript:')
    );
  }

  function buildDebugId(link, index) {
    const href = link.getAttribute('href') || '';
    const text = (link.textContent || '').trim().slice(0, 40);
    const page = location.pathname.replace(/\W+/g, '_') || 'page';
    const suffix = text ? text.replace(/\s+/g, '_') : 'link';
    return `${page}_link_${index}_${suffix}`.replace(/_{2,}/g, '_');
  }

  function shouldCheckUrl(url) {
    if (!url || !url.origin) return false;
    if (location.protocol === 'file:') return false;
    return url.origin === location.origin;
  }

  function reportBrokenLink(link, url, debugId, status) {
    link.dataset.debugBroken = 'true';
    console.warn('[LinkCheck] Broken link', {
      debugId,
      href: link.getAttribute('href'),
      resolved: url ? url.toString() : null,
      status
    });
  }

  function checkLink(link, url, debugId) {
    fetch(url.toString(), { method: 'HEAD', cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          reportBrokenLink(link, url, debugId, response.status);
        }
      })
      .catch(() => {
        fetch(url.toString(), { method: 'GET', cache: 'no-store' })
          .then((response) => {
            if (!response.ok) {
              reportBrokenLink(link, url, debugId, response.status);
            }
          })
          .catch(() => {
            reportBrokenLink(link, url, debugId, 'fetch_failed');
          });
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Skip link checking when offline (Capacitor/local app) to avoid failed fetches
    if (!navigator.onLine || location.protocol === 'file:' || location.hostname === 'localhost') return;
    const links = Array.from(document.querySelectorAll('a[href]'));
    links.forEach((link, index) => {
      if (!link.dataset.debugId) {
        link.dataset.debugId = buildDebugId(link, index);
      }

      const href = link.getAttribute('href');
      if (isSkippableHref(href)) {
        return;
      }

      let url;
      try {
        url = new URL(href, location.href);
      } catch {
        reportBrokenLink(link, null, link.dataset.debugId, 'invalid_url');
        return;
      }

      if (!shouldCheckUrl(url)) {
        return;
      }

      if (url.pathname === location.pathname && url.hash) {
        return;
      }

      checkLink(link, url, link.dataset.debugId);
    });
  });
})();