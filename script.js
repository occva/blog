const allowCursorEffects =
  window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
  window.matchMedia("(pointer: fine)").matches;
const allowKiteEffects = window.matchMedia(
  "(prefers-reduced-motion: no-preference)",
).matches;

const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const clearShyItemState = (item) => {
  item.style.setProperty("--shift-x", "0px");
  item.style.setProperty("--shift-y", "0px");
  item.style.setProperty("--hover-turn", "0deg");
  item.classList.remove("is-alert");
};

const resetShyItems = (shyItems) => {
  shyItems.forEach(clearShyItemState);
};

const updateShyItems = (itemMetrics, pointerX, pointerY) => {
  itemMetrics.forEach(({ item, centerX, centerY, reach, maxOffset }) => {
    const deltaX = centerX - pointerX;
    const deltaY = centerY - pointerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance >= reach) {
      clearShyItemState(item);
      return;
    }

    const strength = (reach - distance) / reach;
    const safeDistance = Math.max(distance, 0.001);
    const directionX = deltaX / safeDistance;
    const directionY = deltaY / safeDistance;

    item.style.setProperty(
      "--shift-x",
      `${(directionX * maxOffset * strength).toFixed(2)}px`,
    );
    item.style.setProperty(
      "--shift-y",
      `${(directionY * maxOffset * strength).toFixed(2)}px`,
    );
    item.style.setProperty(
      "--hover-turn",
      `${(directionX * strength * 7).toFixed(2)}deg`,
    );
    item.classList.add("is-alert");
  });
};

const buildAreaState = (area) => ({
  area,
  allowTilt: area.classList.contains("map-area--tilt"),
  shyItems: Array.from(
    area.querySelectorAll(".tree, .walker:not(.walker--static)"),
  ),
  areaRect: null,
  itemMetrics: [],
  pointer: null,
  frameId: 0,
});

const refreshAreaMetrics = (areaState) => {
  areaState.areaRect = areaState.area.getBoundingClientRect();
  areaState.itemMetrics = areaState.shyItems.map((item) => ({
    item,
    centerX: item.offsetLeft + item.offsetWidth / 2,
    centerY: item.offsetTop + item.offsetHeight / 2,
    reach: item.classList.contains("walker") ? 140 : 120,
    maxOffset: item.classList.contains("walker") ? 18 : 14,
  }));
};

const runAreaFrame = (areaState) => {
  areaState.frameId = 0;

  if (!areaState.pointer || !areaState.areaRect) {
    return;
  }

  const pointerX = areaState.pointer.clientX - areaState.areaRect.left;
  const pointerY = areaState.pointer.clientY - areaState.areaRect.top;

  if (areaState.allowTilt) {
    const x = pointerX / areaState.areaRect.width - 0.5;
    const y = pointerY / areaState.areaRect.height - 0.5;

    areaState.area.style.transform = `perspective(1200px) rotateX(${(
      y * -1.2
    ).toFixed(2)}deg) rotateY(${(x * 1.4).toFixed(2)}deg)`;
  }

  updateShyItems(areaState.itemMetrics, pointerX, pointerY);
};

const scheduleAreaFrame = (areaState) => {
  if (areaState.frameId) {
    return;
  }

  areaState.frameId = window.requestAnimationFrame(() =>
    runAreaFrame(areaState),
  );
};

if (allowCursorEffects) {
  const areaStates = Array.from(document.querySelectorAll(".map-area"))
    .map(buildAreaState)
    .filter((areaState) => areaState.allowTilt || areaState.shyItems.length);

  let refreshFrameId = 0;
  const hasActivePointer = () =>
    areaStates.some((areaState) => areaState.pointer);

  const scheduleMetricsRefresh = () => {
    if (!hasActivePointer() || refreshFrameId) {
      return;
    }

    refreshFrameId = window.requestAnimationFrame(() => {
      refreshFrameId = 0;

      areaStates.forEach((areaState) => {
        refreshAreaMetrics(areaState);

        if (areaState.pointer) {
          scheduleAreaFrame(areaState);
        }
      });
    });
  };

  areaStates.forEach((areaState) => {
    refreshAreaMetrics(areaState);

    areaState.area.addEventListener(
      "pointerenter",
      () => {
        refreshAreaMetrics(areaState);
      },
      { passive: true },
    );

    areaState.area.addEventListener(
      "pointermove",
      (event) => {
        areaState.pointer = {
          clientX: event.clientX,
          clientY: event.clientY,
        };

        scheduleAreaFrame(areaState);
      },
      { passive: true },
    );

    areaState.area.addEventListener(
      "pointerleave",
      () => {
        areaState.pointer = null;

        if (areaState.frameId) {
          window.cancelAnimationFrame(areaState.frameId);
          areaState.frameId = 0;
        }

        if (areaState.allowTilt) {
          areaState.area.style.transform = "";
        }

        resetShyItems(areaState.shyItems);
      },
      { passive: true },
    );
  });

  window.addEventListener("resize", scheduleMetricsRefresh, { passive: true });
  window.addEventListener("scroll", scheduleMetricsRefresh, { passive: true });
}

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const gustAnimations = new WeakMap();

const clearGustAnimation = (element) => {
  const previousAnimation = gustAnimations.get(element);

  if (!previousAnimation) {
    return;
  }

  previousAnimation.cancel();
  gustAnimations.delete(element);
};

const playGustAnimation = (element, keyframes, options) => {
  if (!element) {
    return;
  }

  clearGustAnimation(element);

  const animation = element.animate(keyframes, options);
  gustAnimations.set(element, animation);

  const cleanup = () => {
    if (gustAnimations.get(element) === animation) {
      gustAnimations.delete(element);
    }
  };

  animation.addEventListener("finish", cleanup, { once: true });
  animation.addEventListener("cancel", cleanup, { once: true });
};

const readAngle = (element) => {
  const angle = Number.parseFloat(
    getComputedStyle(element).getPropertyValue("--angle"),
  );

  return Number.isFinite(angle) ? angle : 0;
};

const buildGustSamples = (baseAngle) => {
  const driftCount = 4 + Math.floor(Math.random() * 2);
  const samples = [{ offset: 0, x: 0, y: 0, turn: baseAngle, scale: 1 }];

  for (let index = 1; index <= driftCount; index += 1) {
    const intensity = 1 - (index / (driftCount + 2)) * 0.16;

    samples.push({
      offset: index / (driftCount + 1),
      x: randomBetween(-30, 34) * intensity,
      y: randomBetween(-24, 20) * intensity,
      turn: baseAngle + randomBetween(-18, 18),
      scale: 1 + randomBetween(-0.05, 0.08),
    });
  }

  samples.push({ offset: 1, x: 0, y: 0, turn: baseAngle, scale: 1 });

  return samples;
};

const mapKiteGustFrames = (samples) =>
  samples.map((sample) => ({
    offset: sample.offset,
    transform: `translate3d(${sample.x.toFixed(2)}px, ${sample.y.toFixed(
      2,
    )}px, 0) rotate(${sample.turn.toFixed(2)}deg) scale(${sample.scale.toFixed(
      3,
    )})`,
  }));

const mapStringGustFrames = (samples, baseAngle) =>
  samples.map((sample) => ({
    offset: sample.offset,
    transform: `translate3d(${(sample.x * 0.54).toFixed(2)}px, ${(
      sample.y * 0.38
    ).toFixed(2)}px, 0) rotate(${((sample.turn - baseAngle) * 0.45).toFixed(
      2,
    )}deg)`,
  }));

const gustConfigs = [
  {
    kite: document.querySelector(".scene--intro > .kite"),
    string: document.querySelector(".kite-string--intro"),
  },
  {
    kite: document.querySelector(".mobile-hero__kite"),
    string: document.querySelector(".mobile-hero__string"),
  },
].filter((config) => config.kite);

if (allowKiteEffects && "animate" in Element.prototype) {
  gustConfigs.forEach(({ kite, string }) => {
    kite.addEventListener("click", () => {
      const baseAngle = readAngle(kite);
      const gustSamples = buildGustSamples(baseAngle);

      playGustAnimation(kite, mapKiteGustFrames(gustSamples), {
        duration: 1450,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });

      playGustAnimation(string, mapStringGustFrames(gustSamples, baseAngle), {
        duration: 1450,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    });
  });
}
