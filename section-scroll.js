"use strict";

(() => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const footer = document.querySelector(".site-footer");
  if (!header) return;

  let headerHeight = header.getBoundingClientRect().height;
  let anchor = hashTarget();
  let pending = Boolean(anchor);
  let pinned = false;
  let settleTimer;
  let measureFrame;
  let keepAlignment = pending;

  function hashTarget(hash = location.hash) {
    if (!hash || hash === "#") return null;
    try {
      return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return null;
    }
  }

  function anchorPosition() {
    if (!anchor?.isConnected) return null;
    const top = anchor.getBoundingClientRect().top + window.scrollY - headerHeight;
    const limit = Math.max(0, root.scrollHeight - root.clientHeight);
    return Math.max(0, Math.min(top, limit));
  }

  function isAligned() {
    const top = anchorPosition();
    return top !== null && Math.abs(window.scrollY - top) <= 1;
  }

  // Let native fragment navigation finish, including its smooth animation.
  // A correction only compensates for layout or header changes afterward.
  function settle() {
    clearTimeout(settleTimer);
    if (!pending) return;
    const top = anchorPosition();
    pending = false;
    if (top === null) return;
    if (Math.abs(window.scrollY - top) > 1) {
      window.scrollTo({ top, behavior: "instant" });
    }
    pinned = isAligned();
  }

  function waitForScroll() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 140);
  }

  function measure() {
    measureFrame = 0;
    headerHeight = header.getBoundingClientRect().height;
    root.style.setProperty("--site-header-height", `${headerHeight}px`);
    if (footer) root.style.setProperty("--site-footer-height", `${footer.getBoundingClientRect().height}px`);
    if (keepAlignment && anchor) {
      pending = true;
      waitForScroll();
    }
    keepAlignment = false;
  }

  function scheduleMeasurement() {
    keepAlignment ||= pending || pinned;
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  }

  function release() {
    pending = false;
    pinned = false;
    keepAlignment = false;
    clearTimeout(settleTimer);
  }

  function follow(target) {
    release();
    anchor = target;
    pending = Boolean(anchor);
    if (pending) waitForScroll();
  }

  // Do not prevent clicks or replace history: hashes, keyboard activation,
  // Back/Forward and prefers-reduced-motion retain their browser behavior.
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    follow(hashTarget(url.hash));
  });
  window.addEventListener("hashchange", () => {
    const target = hashTarget();
    if (pending && target === anchor) {
      waitForScroll();
    } else {
      // Back/Forward may restore a position the reader manually scrolled to.
      // Only a link activated above needs a post-navigation correction.
      release();
      anchor = target;
    }
  });
  window.addEventListener("scroll", () => {
    pinned = isAligned();
    if (pending) waitForScroll();
  }, { passive: true });
  window.addEventListener("scrollend", settle);
  window.addEventListener("wheel", release, { passive: true });
  window.addEventListener("touchstart", release, { passive: true });
  window.addEventListener("pointerdown", release, { passive: true });
  window.addEventListener("keydown", event => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) release();
  });
  window.addEventListener("resize", scheduleMeasurement);
  window.addEventListener("load", scheduleMeasurement);
  document.fonts?.ready.then(scheduleMeasurement);
  document.fonts?.addEventListener("loadingdone", scheduleMeasurement);
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(scheduleMeasurement);
    observer.observe(header, { box: "border-box" });
    if (footer) observer.observe(footer, { box: "border-box" });
  }
  measure();
})();
