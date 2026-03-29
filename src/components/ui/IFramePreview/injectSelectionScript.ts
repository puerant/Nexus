/**
 * Generate a JavaScript string that, when injected into an iframe's HTML,
 * enables DOM element selection with hover highlighting and click-to-select.
 *
 * The script communicates with the parent window via postMessage.
 */
export function injectSelectionScript(): string {
  return `<script>
(function() {
  var overlay = null;
  var isActive = false;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = '__sel_overlay__';
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:99999;border:2px solid #007AFF;background:rgba(0,122,255,0.08);border-radius:3px;transition:all 0.08s ease;display:none;';
    document.body.appendChild(overlay);
  }

  function getCssSelector(el) {
    if (el.id) return '#' + el.id;
    var parts = [];
    while (el && el !== document.body && el !== document.documentElement) {
      var seg = el.tagName.toLowerCase();
      if (el.id) { parts.unshift('#' + el.id); break; }
      if (el.className && typeof el.className === 'string') {
        var cls = el.className.trim().split(/\\s+/).filter(function(c) { return c && c.indexOf('__sel') === -1; });
        if (cls.length) seg += '.' + cls.join('.');
      }
      var sib = el, nth = 1;
      while (sib = sib.previousElementSibling) { if (sib.tagName === el.tagName) nth++; }
      seg += ':nth-of-type(' + nth + ')';
      parts.unshift(seg);
      el = el.parentElement;
    }
    return parts.join(' > ');
  }

  function getAttributes(el) {
    var attrs = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name !== 'class' && a.name !== 'id') attrs[a.name] = a.value;
    }
    return attrs;
  }

  function showOverlay(el) {
    var rect = el.getBoundingClientRect();
    overlay.style.display = 'block';
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  }

  function hideOverlay() {
    if (overlay) overlay.style.display = 'none';
  }

  function onMouseOver(e) {
    if (!isActive) return;
    var el = e.target;
    if (el === overlay || el === document.body || el === document.documentElement) return;
    e.stopPropagation();
    showOverlay(el);
  }

  function onClick(e) {
    if (!isActive) return;
    var el = e.target;
    if (el === overlay || el === document.body || el === document.documentElement) return;
    e.preventDefault();
    e.stopPropagation();
    hideOverlay();

    var html = el.outerHTML;
    if (html.length > 500) html = html.substring(0, 500) + '...';

    var rect = el.getBoundingClientRect();

    window.parent.postMessage({
      type: '__element_selected__',
      data: {
        tagName: el.tagName.toLowerCase(),
        id: el.id || '',
        className: (typeof el.className === 'string') ? el.className : '',
        cssSelector: getCssSelector(el),
        outerHTML: html,
        attributes: getAttributes(el),
        boundingRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      }
    }, '*');
  }

  createOverlay();

  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === '__toggle_selection__') {
      isActive = e.data.active;
      if (!isActive) hideOverlay();
      document.body.style.cursor = isActive ? 'crosshair' : '';
    }
  });

  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('click', onClick, true);
})();
<\/script>`
}

/**
 * Inject the selection script into HTML content, placing it before </body>.
 * If no </body> tag exists, append it to the end.
 */
export function prepareHtmlWithSelection(html: string): string {
  const script = injectSelectionScript()
  if (html.includes('</body>')) {
    return html.replace('</body>', script + '</body>')
  }
  return html + script
}
