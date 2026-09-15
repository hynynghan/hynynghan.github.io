"use strict";

(() => {
  const config = document.getElementById("visitor-analytics");
  const tracker = document.getElementById("umami-tracker");
  const domains = tracker?.dataset.domains?.split(",").map(domain => domain.trim()) || [];
  if (!config || !domains.includes(location.hostname)) return;

  // The public board contains only the metrics selected by the owner.
  // The administrator dashboard and API credentials are never embedded here.
  if (config.dataset.publicBoardUrl && document.getElementById("about")) {
    const card = document.createElement("aside");
    card.className = "visitor-stats section-inner";
    card.setAttribute("aria-labelledby", "visitor-stats-title");
    const heading = document.createElement("div");
    heading.className = "visitor-stats-heading";
    const title = document.createElement("h2");
    title.id = "visitor-stats-title";
    title.textContent = "Visitors";
    const link = document.createElement("a");
    link.href = config.dataset.publicBoardUrl;
    link.textContent = "View map";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    const frame = document.createElement("iframe");
    frame.src = config.dataset.publicBoardUrl;
    frame.title = "Visitor count and country map";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    heading.append(title, link);
    card.append(heading, frame);
    document.querySelector(".site-footer")?.before(card);
  }

  function optedOut() {
    if (navigator.doNotTrack === "1") return true;
    try { return Boolean(localStorage.getItem("umami.disabled")); }
    catch { return false; }
  }

  function track(name, data) {
    if (optedOut() || typeof window.umami?.track !== "function") return false;
    try {
      Promise.resolve(window.umami.track(name, data)).catch(() => {});
      return true;
    } catch { return false; }
  }

  const label = element => (element.textContent.trim()
    || element.getAttribute("aria-label") || "link").replace(/\s+/g, " ").slice(0, 100);

  document.addEventListener("click", event => {
    const target = event.target.closest?.("a, button");
    if (!target || target.closest(".visitor-stats")) return;
    const area = target.closest(".companion-profile") ? "side profile"
      : target.closest(".companion-navigation") ? "side navigation"
      : target.closest(".site-header") ? "header"
      : target.closest("section[id]")?.id || "page";

    if (target.matches(".name-pronunciation")) {
      track("name_pronunciation", { area });
      return;
    }
    if (target.dataset.researchField && target.getAttribute("aria-expanded") === "true") {
      track("research_field_open", { field: target.dataset.researchField });
      return;
    }
    if (!target.matches("a[href]") || target.hasAttribute("data-umami-event")) return;
    let url;
    try { url = new URL(target.href, location.href); }
    catch { return; }
    if (!["https:", "http:", "mailto:"].includes(url.protocol)) return;

    const kind = url.protocol === "mailto:" ? "email"
      : target.matches(".venue-logo-link") ? "venue"
      : target.matches(".publication-teaser") ? "teaser"
      : target.closest(".profile-links") ? "profile"
      : target.closest(".publication, .research-field-papers") ? "publication"
      : url.origin === location.origin ? "navigation" : "external";
    // Keep public labels and paths; do not send email addresses or query strings.
    const destination = kind === "email" ? "email"
      : url.origin === location.origin ? url.pathname + url.hash
      : url.hostname + url.pathname;
    track("link_click", { kind, label: kind === "email" ? "Email" : label(target),
      destination: destination.slice(0, 200), area });
  });

  if (typeof IntersectionObserver !== "function") return;
  const seen = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || document.visibilityState !== "visible" || seen.has(entry.target.id)) continue;
      if (track("section_view", { section: entry.target.id })) {
        seen.add(entry.target.id);
        observer.unobserve(entry.target);
      }
    }
  }, { rootMargin: "-15% 0px -60% 0px", threshold: 0 });
  document.querySelectorAll("#main > section[id]").forEach(section => observer.observe(section));
})();
