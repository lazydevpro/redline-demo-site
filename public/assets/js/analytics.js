/*!
 * Site analytics snippet (in-house, no-op stub — no real collector configured).
 * Tracks page views and outbound link clicks for the marketing team's dashboard.
 */
(function (window, document) {
  "use strict";

  var queue = (window.siteAnalytics = window.siteAnalytics || []);

  function track(event, payload) {
    queue.push({ event: event, payload: payload || {}, ts: Date.now() });
  }

  track("pageview", {
    path: window.location.pathname,
    referrer: document.referrer || null,
  });

  document.addEventListener("click", function (evt) {
    var link = evt.target && evt.target.closest ? evt.target.closest("a[href]") : null;
    if (!link) return;
    var href = link.getAttribute("href") || "";
    if (/^https?:\/\//i.test(href) && href.indexOf(window.location.host) === -1) {
      track("outbound_click", { href: href });
    }
  });
})(window, document);
