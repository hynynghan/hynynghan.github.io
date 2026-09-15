"use strict";

(() => {
  const venues = [...document.querySelectorAll(".publication-venue")].map(venue => ({
    label: venue.querySelector(".venue-label"),
    image: venue.querySelector(".venue-logo"),
    link: venue.querySelector(".venue-logo-link"),
  })).filter(venue => venue.label && venue.image && venue.link);
  if (!venues.length) return;

  const context = document.createElement("canvas").getContext("2d");
  if (!context) return;
  let scheduled = false;

  function measure() {
    scheduled = false;
    for (const { label, image, link } of venues) {
      const style = getComputedStyle(label);
      context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      context.textBaseline = "alphabetic";
      // Brackets are decoration; match the visible letters of the venue name.
      const text = label.textContent.replace(/^\s*\[/, "").trim();
      const metrics = context.measureText(text);
      const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      if (!Number.isFinite(height) || height <= 0) continue;

      // Correct the original logos' transparent margins without editing their files.
      const sourceHeight = Number(image.getAttribute("height"));
      const inkHeight = Number(image.dataset.inkHeight) || sourceHeight;
      const bottomMargin = Number(image.dataset.inkBottom) || 0;
      const imageHeight = sourceHeight > 0 && inkHeight > 0 ? height * sourceHeight / inkHeight : height;
      const bottomPadding = sourceHeight > 0 ? imageHeight * bottomMargin / sourceHeight : 0;
      link.style.setProperty("--venue-logo-height", `${imageHeight}px`);
      link.style.setProperty("--venue-logo-offset", `${-metrics.actualBoundingBoxDescent - bottomPadding}px`);
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(measure);
  }

  schedule();
  document.fonts?.ready.then(schedule);
  document.fonts?.addEventListener("loadingdone", schedule);
  window.addEventListener("resize", schedule, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    for (const { label } of venues) observer.observe(label.closest(".entry-meta"));
  }
})();
