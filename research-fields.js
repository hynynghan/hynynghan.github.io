"use strict";

(() => {
  const data = window.researchFieldsData;
  if (!Array.isArray(data?.fields) || !Array.isArray(data?.publications)) return;
  const fields = new Map(data.fields.map(field => [field.id, field]));
  const papers = new Map(data.publications.map(paper => [paper.code, paper]));
  const triggers = [...document.querySelectorAll("[data-research-field]")]
    .filter(button => fields.has(button.dataset.researchField));
  if (!triggers.length || document.getElementById("research-field-popover")) return;

  const popup = document.createElement("div");
  popup.id = "research-field-popover";
  popup.className = "research-field-popover";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-modal", "false");
  popup.setAttribute("aria-labelledby", "research-field-title");
  popup.setAttribute("aria-describedby", "research-field-description");
  popup.hidden = true;
  const header = document.createElement("div");
  header.className = "research-field-header";
  const title = document.createElement("h3");
  title.id = "research-field-title";
  const closeButton = document.createElement("button");
  closeButton.className = "research-field-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close");
  closeButton.textContent = "×";
  header.append(title, closeButton);
  const content = document.createElement("div");
  content.className = "research-field-content";
  const description = document.createElement("p");
  description.id = "research-field-description";
  description.className = "research-field-description";
  const subheading = document.createElement("h4");
  subheading.className = "research-field-subheading";
  subheading.textContent = "Related research";
  const list = document.createElement("ul");
  list.className = "research-field-papers";
  content.append(description, subheading, list);
  popup.append(header, content);
  document.body.append(popup);

  let activeTrigger = null;
  let positionFrame = 0;
  let activeCitation = null;
  let citationFrame = 0;
  let citationHideTimer = 0;
  let restoringCitationFocus = false;
  const focusableSelector = 'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"], audio[controls], video[controls]';
  const clamp = (value, low, high) => Math.min(Math.max(value, low), Math.max(low, high));

  function available(element) {
    return element.isConnected && !element.closest('[hidden], [inert], [aria-hidden="true"]')
      && element.getClientRects().length > 0 && getComputedStyle(element).visibility === "visible";
  }

  function focusableElements(root) {
    return [...root.querySelectorAll(focusableSelector)]
      .filter(element => element.tabIndex >= 0 && !element.matches(":disabled") && available(element));
  }

  function hideCitation(restoreFocus = false) {
    clearTimeout(citationHideTimer);
    cancelAnimationFrame(citationFrame);
    citationFrame = 0;
    const previous = activeCitation;
    activeCitation = null;
    if (!previous) return;
    previous.card.hidden = true;
    previous.button.setAttribute("aria-expanded", "false");
    previous.pinned = false;
    if (restoreFocus && available(previous.button)) {
      restoringCitationFocus = true;
      previous.button.focus({ preventScroll: true });
      restoringCitationFocus = false;
    }
  }

  function positionCitation() {
    citationFrame = 0;
    if (!activeCitation) return;
    const { button, card } = activeCitation;
    const anchor = button.getBoundingClientRect();
    const visibleContent = content.getBoundingClientRect();
    if (!available(button) || anchor.bottom <= visibleContent.top || anchor.top >= visibleContent.bottom
      || anchor.right <= visibleContent.left || anchor.left >= visibleContent.right) {
      const needsVisibleFocus = activeCitation.wrapper.contains(document.activeElement);
      hideCitation();
      if (needsVisibleFocus) closeButton.focus({ preventScroll: true });
      return;
    }
    const viewport = window.visualViewport;
    const leftEdge = (viewport?.offsetLeft || 0) + 12;
    const rightEdge = (viewport?.offsetLeft || 0) + (viewport?.width || innerWidth) - 12;
    const topEdge = Math.max((viewport?.offsetTop || 0) + 12, document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0);
    const bottomEdge = (viewport?.offsetTop || 0) + (viewport?.height || innerHeight) - 12;
    const gap = 6;
    card.style.maxWidth = `${Math.max(0, rightEdge - leftEdge)}px`;
    card.style.maxHeight = `${Math.max(0, bottomEdge - topEdge)}px`;
    const naturalHeight = card.getBoundingClientRect().height;
    const below = Math.max(0, bottomEdge - anchor.bottom - gap);
    const above = Math.max(0, anchor.top - topEdge - gap);
    const placeBelow = below >= naturalHeight || below >= above;
    card.style.maxHeight = `${placeBelow ? below : above}px`;
    const bounds = card.getBoundingClientRect();
    card.style.left = `${clamp(anchor.right - bounds.width, leftEdge, rightEdge - bounds.width)}px`;
    card.style.top = `${placeBelow ? anchor.bottom + gap : anchor.top - gap - bounds.height}px`;
  }

  function scheduleCitationPosition() {
    if (activeCitation && !citationFrame) citationFrame = requestAnimationFrame(positionCitation);
  }

  function showCitation(citation) {
    clearTimeout(citationHideTimer);
    if (activeCitation !== citation) hideCitation();
    activeCitation = citation;
    citation.card.hidden = false;
    citation.button.setAttribute("aria-expanded", "true");
    positionCitation();
  }

  function deferCitationHide(citation) {
    clearTimeout(citationHideTimer);
    citationHideTimer = setTimeout(() => {
      if (activeCitation === citation && !citation.pinned && !citation.wrapper.contains(document.activeElement)) hideCitation();
    }, 180);
  }

  function appendReferences(field) {
    if (!Array.isArray(field.references) || !field.references.length) return;
    const references = document.createElement("span");
    references.className = "research-field-citations";
    field.references.forEach((reference, index) => {
      const number = index + 1;
      const wrapper = document.createElement("span");
      wrapper.className = "research-field-citation";
      const superscript = document.createElement("sup");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "research-field-citation-button";
      button.textContent = String(number);
      button.setAttribute("aria-label", `Reference ${number}: ${reference.title}`);
      button.setAttribute("aria-expanded", "false");
      const card = document.createElement("span");
      card.id = `research-reference-${field.id}-${number}`;
      card.className = "research-field-reference";
      card.setAttribute("role", "note");
      card.setAttribute("aria-label", `Reference ${number}`);
      card.hidden = true;
      button.setAttribute("aria-controls", card.id);
      const authors = document.createElement("span");
      authors.className = "research-field-reference-authors";
      authors.textContent = `${reference.authors} (${reference.year}).`;
      const source = document.createElement("a");
      source.className = "research-field-reference-title";
      source.textContent = reference.title;
      source.href = reference.url;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.setAttribute("aria-label", `${reference.title} (opens in a new tab)`);
      const venue = document.createElement("span");
      venue.className = "research-field-reference-venue";
      venue.textContent = reference.venue;
      card.append(authors, source, venue);
      if (index === 0) superscript.append("(");
      superscript.append(button);
      superscript.append(index === field.references.length - 1 ? ")" : ",");
      wrapper.append(superscript, card);
      references.append(wrapper);
      const citation = { wrapper, button, card, pinned: false };
      wrapper.addEventListener("pointerenter", event => {
        if (event.pointerType !== "touch") showCitation(citation);
      });
      wrapper.addEventListener("pointerleave", () => deferCitationHide(citation));
      wrapper.addEventListener("focusin", () => {
        if (!restoringCitationFocus) showCitation(citation);
      });
      wrapper.addEventListener("focusout", event => {
        if (!wrapper.contains(event.relatedTarget) && activeCitation === citation) hideCitation();
      });
      button.addEventListener("click", () => {
        if (activeCitation === citation && citation.pinned) hideCitation();
        else {
          showCitation(citation);
          citation.pinned = true;
        }
      });
    });
    description.append(references);
  }

  function close(restoreFocus = false) {
    hideCitation();
    const previousTrigger = activeTrigger;
    activeTrigger = null;
    cancelAnimationFrame(positionFrame);
    positionFrame = 0;
    popup.hidden = true;
    for (const trigger of triggers) trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus && previousTrigger && available(previousTrigger)) previousTrigger.focus({ preventScroll: true });
  }

  function position() {
    positionFrame = 0;
    if (!activeTrigger) return;
    if (!available(activeTrigger)) {
      close();
      return;
    }
    const viewport = window.visualViewport;
    const leftEdge = (viewport?.offsetLeft || 0) + 12;
    const rightEdge = (viewport?.offsetLeft || 0) + (viewport?.width || innerWidth) - 12;
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0;
    const topEdge = Math.max((viewport?.offsetTop || 0) + 12, headerBottom + 8);
    const bottomEdge = (viewport?.offsetTop || 0) + (viewport?.height || innerHeight) - 12;
    const anchor = activeTrigger.getBoundingClientRect();
    if (anchor.bottom <= topEdge || anchor.top >= bottomEdge || anchor.right <= leftEdge || anchor.left >= rightEdge || bottomEdge <= topEdge) {
      close();
      return;
    }
    const gap = 8;
    const below = Math.max(0, bottomEdge - anchor.bottom - gap);
    const above = Math.max(0, anchor.top - topEdge - gap);
    const previousScroll = content.scrollTop;
    popup.style.maxWidth = `${Math.max(0, rightEdge - leftEdge)}px`;
    popup.style.maxHeight = `${bottomEdge - topEdge}px`;
    popup.style.setProperty("--research-field-max-height", `${bottomEdge - topEdge}px`);
    const naturalHeight = popup.getBoundingClientRect().height;
    const placeBelow = below >= naturalHeight || below >= above;
    const room = placeBelow ? below : above;
    if (room < header.getBoundingClientRect().height + 32) {
      // Never leave a clipped, unusable dialog in a very short viewport.
      close(true);
      return;
    }
    popup.style.maxHeight = `${room}px`;
    popup.style.setProperty("--research-field-max-height", `${room}px`);
    popup.dataset.placement = placeBelow ? "below" : "above";
    const bounds = popup.getBoundingClientRect();
    const placeRight = anchor.right + gap + bounds.width <= rightEdge;
    popup.dataset.align = placeRight ? "right" : "left";
    const left = placeRight ? anchor.right + gap : anchor.left - gap - bounds.width;
    const top = placeBelow ? anchor.bottom + gap : anchor.top - gap - bounds.height;
    popup.style.left = `${clamp(left, leftEdge, rightEdge - bounds.width)}px`;
    popup.style.top = `${clamp(top, topEdge, bottomEdge - bounds.height)}px`;
    content.scrollTop = previousScroll;
    positionCitation();
  }

  function schedulePosition() {
    if (activeTrigger && !positionFrame) positionFrame = requestAnimationFrame(position);
  }

  function render(field) {
    title.textContent = field.title;
    description.textContent = field.description.trimEnd();
    appendReferences(field);
    list.replaceChildren();
    for (const code of field.publications || []) {
      const paper = papers.get(code);
      if (!paper) continue;
      const item = document.createElement("li");
      const paperTitle = document.createElement(paper.href ? "a" : "span");
      paperTitle.className = "research-field-paper-title";
      paperTitle.textContent = paper.title;
      if (paper.href) paperTitle.href = paper.href;
      const meta = document.createElement("p");
      meta.className = "research-field-paper-meta";
      const statusKey = String(paper.status || "").trim().toLowerCase();
      const year = paper.year && !String(paper.venue || "").includes(String(paper.year)) ? paper.year : null;
      const status = statusKey === "published" ? null : paper.status;
      meta.textContent = statusKey === "under review" ? "Under review"
        : [...new Set([paper.venue, year, status, paper.award].filter(Boolean).map(String))].join(" ");
      if (paper.preprint) {
        const preprint = document.createElement("a");
        preprint.href = paper.preprint;
        preprint.textContent = "Preprint";
        meta.append(" (", preprint, ")");
      }
      item.append(paperTitle, meta);
      list.append(item);
    }
    subheading.textContent = `Related research ${list.children.length}`;
    content.scrollTop = 0;
  }

  for (const trigger of triggers) {
    trigger.hidden = false;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", popup.id);
    trigger.setAttribute("aria-expanded", "false");
    trigger.addEventListener("click", () => {
      if (activeTrigger === trigger) {
        close(true);
        return;
      }
      close();
      render(fields.get(trigger.dataset.researchField));
      activeTrigger = trigger;
      trigger.setAttribute("aria-expanded", "true");
      popup.hidden = false;
      position();
      if (activeTrigger) closeButton.focus({ preventScroll: true });
    });
  }

  closeButton.addEventListener("click", () => close(true));
  document.addEventListener("pointerdown", event => {
    if (activeCitation && !activeCitation.wrapper.contains(event.target)) hideCitation();
    if (activeTrigger && !popup.contains(event.target) && !triggers.some(trigger => trigger.contains(event.target))) close();
  });
  document.addEventListener("focusin", event => {
    if (activeTrigger && !popup.contains(event.target) && !activeTrigger.contains(event.target)) close();
  });
  document.addEventListener("keydown", event => {
    if (activeTrigger && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (activeCitation) hideCitation(activeCitation.wrapper.contains(document.activeElement));
      else close(true);
    }
  }, true);
  popup.addEventListener("keydown", event => {
    if (!activeTrigger || event.key !== "Tab") return;
    const inside = focusableElements(popup);
    if (event.shiftKey && document.activeElement === inside[0]) {
      event.preventDefault();
      close(true);
    } else if (!event.shiftKey && document.activeElement === inside.at(-1)) {
      const outside = focusableElements(document).filter(element => !popup.contains(element));
      const next = outside[outside.indexOf(activeTrigger) + 1];
      if (next) {
        event.preventDefault();
        close();
        next.focus();
      } else {
        // Leave Tab's default action free to advance beyond the page.
        close(true);
      }
    }
  });
  popup.addEventListener("click", event => {
    const link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (link.closest(".research-field-reference")) return;
    const url = new URL(link.href, location.href);
    let target = null;
    if (!link.hasAttribute("download") && (!link.target || link.target === "_self")
      && url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) {
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { /* Keep native link behavior. */ }
    }
    close();
    if (target) {
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => {
          if (target.getAttribute("tabindex") === "-1") target.removeAttribute("tabindex");
        }, { once: true });
      }
      target.focus({ preventScroll: true });
    }
    // Native navigation and the existing section-scroll listener handle scrolling.
  });
  window.addEventListener("resize", schedulePosition, { passive: true });
  window.addEventListener("scroll", event => {
    if (!(event.target instanceof Node) || !popup.contains(event.target)) schedulePosition();
    else if (event.target === content) scheduleCitationPosition();
  }, { passive: true, capture: true });
  window.visualViewport?.addEventListener("resize", schedulePosition, { passive: true });
  window.visualViewport?.addEventListener("scroll", schedulePosition, { passive: true });
  document.fonts?.ready.then(schedulePosition);
  document.fonts?.addEventListener("loadingdone", schedulePosition);
  document.addEventListener("visibilitychange", () => { if (document.hidden) close(); });
  window.addEventListener("pagehide", () => close());
})();
