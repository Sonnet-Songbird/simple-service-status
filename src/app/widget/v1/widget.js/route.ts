const WIDGET_SCRIPT = `(function () {
  var s = document.currentScript;
  var serviceSlug = s.getAttribute('data-service');
  if (!serviceSlug) return;

  var pollMs = Math.max(Number(s.getAttribute('data-poll-interval-ms')) || 60000, 15000);
  var apiBase = new URL(s.src).origin;
  var targetSelector = s.getAttribute('data-target');
  var host = targetSelector
    ? document.querySelector(targetSelector)
    : (function () {
        var div = document.createElement('div');
        s.insertAdjacentElement('afterend', div);
        return div;
      })();
  if (!host) return;

  var shadow = host.attachShadow({ mode: 'open' });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function render(dto) {
    shadow.innerHTML =
      dto.state === 'scheduled_maintenance' && dto.activeSchedule
        ? '<div class="notice-banner">' + escapeHtml(dto.activeSchedule.noticeMessage) + '</div>'
        : '';
  }

  function poll() {
    fetch(apiBase + '/api/v1/status?service=' + encodeURIComponent(serviceSlug), { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (dto) { if (dto) render(dto); })
      .catch(function () {});
  }

  poll();
  setInterval(poll, pollMs);
})();
`

export function GET(): Response {
  return new Response(WIDGET_SCRIPT, {
    status: 200,
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=3600, immutable',
    },
  })
}
