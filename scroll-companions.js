"use strict";

(() => {
  const about = document.querySelector("#about");
  const education = document.querySelector("#education");
  const frame = document.querySelector(".site-frame");
  const header = document.querySelector(".site-header");
  const caption = about?.querySelector(".profile-caption");
  if (!about || !education || !frame || !header || !caption) return;

  const sections = [...document.querySelectorAll("#main > section[id]")];
  const root = document.createElement("div");
  root.className = "scroll-companions";
  root.hidden = true;
  root.inert = true;
  root.dataset.visible = "false";

  const profile = document.createElement("aside");
  profile.className = "companion-profile";
  profile.setAttribute("aria-label", "Researcher profile");
  const name = document.createElement("a");
  name.className = "companion-name";
  name.href = "#about";
  name.textContent = document.querySelector(".identity").textContent.trim();
  const heading = document.createElement("div");
  heading.className = "companion-heading";
  heading.append(name);
  const pronunciation = about.querySelector(".name-pronunciation");
  let pronunciationStatus;
  if (pronunciation) {
    const button = pronunciation.cloneNode(true);
    pronunciationStatus = document.createElement("p");
    pronunciationStatus.id = "companion-pronunciation-status";
    pronunciationStatus.className = "name-pronunciation-status";
    pronunciationStatus.setAttribute("role", "status");
    pronunciationStatus.setAttribute("aria-live", "polite");
    button.setAttribute("aria-describedby", pronunciationStatus.id);
    heading.append(button);
  }
  profile.append(heading);
  for (const selector of [".profile-role", ".profile-email", ".profile-links"]) {
    const source = caption.querySelector(selector);
    if (source) profile.append(source.cloneNode(true));
  }
  if (pronunciationStatus) profile.append(pronunciationStatus);

  const navigation = document.createElement("div");
  navigation.className = "companion-navigation";
  const nav = document.createElement("nav");
  nav.id = "companion-section-list";
  nav.setAttribute("aria-label", "Page sections");
  const list = document.createElement("ul");
  const links = sections.map(section => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${section.id}`;
    link.textContent = section.querySelector("h1, h2").textContent.trim();
    item.append(link);
    list.append(item);
    return link;
  });
  nav.append(list);
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "companion-toggle";
  toggle.textContent = "Sections";
  toggle.setAttribute("aria-controls", nav.id);
  toggle.setAttribute("aria-expanded", "false");
  navigation.append(nav, toggle);
  root.append(profile, navigation);
  document.body.append(root);

  let expanded = false;
  let scheduled = false;
  let wide = false;
  let visible = false;
  let visibilityVersion = 0;

  function updateMenu() {
    toggle.hidden = wide;
    nav.hidden = !wide && !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
  }

  function setVisible(nextVisible) {
    if (nextVisible === visible) return;
    visible = nextVisible;
    const version = ++visibilityVersion;
    if (visible && root.hidden) {
      root.hidden = false;
      // Establish the concealed styles before starting an entrance transition.
      // An interrupted exit stays rendered and reverses from its current state.
      getComputedStyle(navigation).opacity;
    }
    root.inert = !visible;
    root.dataset.visible = String(visible);
    if (visible) return;

    function finishExit() {
      if (version !== visibilityVersion || visible) return;
      const transitions = [profile, navigation]
        .flatMap(panel => panel.getAnimations())
        .filter(animation => animation.playState !== "finished" && animation.playState !== "idle");
      if (transitions.length) {
        // Re-check after a cancellation: resizing can replace an active transition.
        Promise.allSettled(transitions.map(animation => animation.finished)).then(finishExit);
        return;
      }
      root.hidden = true;
      // Keep an expanded compact menu intact until the whole panel has faded out.
      expanded = false;
      updateMenu();
    }
    finishExit();
  }

  function update() {
    scheduled = false;
    const style = getComputedStyle(document.documentElement);
    const rem = parseFloat(style.fontSize);
    const headerBottom = header.getBoundingClientRect().bottom;
    const readingLine = headerBottom;
    const shouldShow = education.getBoundingClientRect().top <= readingLine + 1;

    const bounds = frame.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const sideSpace = Math.min(bounds.left, viewportWidth - bounds.right);
    const edgeGap = rem;
    wide = sideSpace >= 10 * rem + 2 * edgeGap && window.innerHeight >= 2 * headerBottom + 8 * rem;
    root.dataset.layout = wide ? "wide" : "compact";
    if (wide) {
      const panelWidth = Math.min(12.5 * rem, sideSpace - 2 * edgeGap);
      root.style.setProperty("--companion-width", `${panelWidth}px`);
      root.style.setProperty("--companion-left", `${(bounds.left - panelWidth) / 2}px`);
      root.style.setProperty("--companion-right", `${(viewportWidth - bounds.right - panelWidth) / 2}px`);
    }
    root.style.setProperty("--companion-top", `${headerBottom + rem}px`);
    updateMenu();
    setVisible(shouldShow);

    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine + 1) active = section;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    links.forEach((link, index) => {
      if (sections[index] === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  toggle.addEventListener("click", () => {
    expanded = !expanded;
    updateMenu();
  });
  root.addEventListener("keydown", event => {
    if (event.key === "Escape" && !wide && expanded) {
      expanded = false;
      updateMenu();
      toggle.focus();
    }
  });
  root.addEventListener("click", event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    expanded = false;
    updateMenu();
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  });
  document.addEventListener("click", event => {
    if (!wide && expanded && !navigation.contains(event.target)) {
      expanded = false;
      updateMenu();
    }
  });
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("hashchange", schedule);
  document.fonts?.ready.then(schedule);
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(schedule);
    observer.observe(frame);
    observer.observe(header);
  }
  schedule();
})();
