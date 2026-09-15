"use strict";

(() => {
  const buttons = [...document.querySelectorAll(".name-pronunciation")];
  if (!buttons.length) return;
  const statuses = new Map(buttons.map(button => [
    button, document.getElementById(button.getAttribute("aria-describedby")),
  ]));
  const audio = typeof Audio === "function" ? new Audio(buttons[0].dataset.audio) : null;
  let activeButton = null;
  let attempt = 0;
  let timeout;

  // A local synthesized clip plays the same Korean pronunciation on every device.
  // Loading starts only after a click, never automatically on page load.
  if (audio) audio.preload = "none";
  for (const button of buttons) {
    button.hidden = false;
    button.dataset.state = "idle";
  }

  function reset() {
    clearTimeout(timeout);
    for (const button of buttons) button.dataset.state = "idle";
    activeButton = null;
  }

  function fail() {
    const failedButton = activeButton;
    ++attempt;
    audio?.pause();
    reset();
    const status = statuses.get(failedButton);
    if (status) {
      status.textContent = `The pronunciation audio could not be played. Try again. Korean spelling: ${failedButton.dataset.name}.`;
    }
  }

  for (const button of buttons) {
    button.addEventListener("click", async () => {
      const currentAttempt = ++attempt;
      reset();
      for (const status of statuses.values()) {
        if (status) status.textContent = "";
      }
      activeButton = button;
      if (!audio) {
        fail();
        return;
      }
      // Both buttons share one player, so clicking either restarts the name.
      audio.pause();
      button.dataset.state = "loading";
      try {
        if (audio.error) audio.load();
        audio.currentTime = 0;
        timeout = setTimeout(() => {
          if (attempt === currentAttempt) fail();
        }, 10000);
        await audio.play();
        if (attempt !== currentAttempt) return;
        clearTimeout(timeout);
        button.dataset.state = "playing";
      } catch {
        if (attempt === currentAttempt) fail();
      }
    });
  }

  audio?.addEventListener("ended", () => {
    if (audio.ended) reset();
  });
  audio?.addEventListener("error", () => {
    if (activeButton && audio.error) fail();
  });
  window.addEventListener("pagehide", () => {
    ++attempt;
    audio?.pause();
    reset();
  });
})();
