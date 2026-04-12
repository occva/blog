const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }

  callback();
};

const getDotLinks = () =>
  Array.from(document.querySelectorAll(".article-dot-link")).filter(
    (link) => link instanceof HTMLAnchorElement,
  );

const getDirectoryLinks = () =>
  Array.from(document.querySelectorAll(".article-directory-link")).filter(
    (link) => link instanceof HTMLAnchorElement,
  );

const assignHeadingAnchors = () => {
  const dotLinks = getDotLinks();
  const sectionHeadings = Array.from(document.querySelectorAll(".article-body h2"));

  dotLinks.slice(1).forEach((link, index) => {
    const anchorId = link.dataset.anchorId;
    const heading = sectionHeadings[index];

    if (!anchorId || !(heading instanceof HTMLElement)) {
      return;
    }

    heading.id = anchorId;
  });
};

const jumpToHash = () => {
  const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));

  if (!hash) {
    return;
  }

  const target = document.getElementById(hash);

  if (!(target instanceof HTMLElement)) {
    return;
  }

  target.scrollIntoView({
    block: "start",
  });
};

const setupActiveDots = () => {
  const directoryLinksByAnchor = new Map(
    getDirectoryLinks().map((link) => [link.dataset.anchorId, link]),
  );

  const sections = getDotLinks()
    .map((link) => {
      const anchorId = link.dataset.anchorId;
      const target = anchorId ? document.getElementById(anchorId) : null;
      const directoryLink = anchorId ? directoryLinksByAnchor.get(anchorId) : null;

      if (!anchorId || !(target instanceof HTMLElement)) {
        return null;
      }

      return { link, target, directoryLink };
    })
    .filter(Boolean);

  if (sections.length === 0) {
    return;
  }

  const updateActiveDot = () => {
    const offset = 168;
    let currentSection = sections[0];

    sections.forEach((section) => {
      if (section.target.getBoundingClientRect().top <= offset) {
        currentSection = section;
      }
    });

    sections.forEach((section) => {
      section.link.classList.toggle("is-active", section === currentSection);
      section.directoryLink?.classList.toggle("is-active", section === currentSection);
    });
  };

  let ticking = false;

  const scheduleUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(() => {
      updateActiveDot();
      ticking = false;
    });
  };

  updateActiveDot();

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
};

const setupCopyButtons = () => {
  const blocks = Array.from(document.querySelectorAll(".article-body pre"));

  blocks.forEach((block) => {
    if (!(block instanceof HTMLElement)) {
      return;
    }

    const existingWrapper =
      block.parentElement instanceof HTMLElement &&
      block.parentElement.classList.contains("article-code-block")
        ? block.parentElement
        : null;

    const wrapper = existingWrapper ?? document.createElement("div");

    if (!existingWrapper) {
      wrapper.className = "article-code-block";
      block.before(wrapper);
      wrapper.append(block);
    }

    if (wrapper.querySelector(".article-copy-button")) {
      return;
    }

    const code = block.querySelector("code");
    const button = document.createElement("button");
    const resetButton = () => {
      button.textContent = "复制";
      button.disabled = false;
    };

    button.type = "button";
    button.className = "article-copy-button";
    button.textContent = "复制";
    button.setAttribute("aria-label", "复制代码");

    button.addEventListener("click", async () => {
      const content = code?.textContent ?? "";

      if (!content.trim()) {
        return;
      }

      button.disabled = true;

      try {
        await navigator.clipboard.writeText(content.replace(/\n$/, ""));
        button.textContent = "已复制";
      } catch (error) {
        button.textContent = "复制失败";
      }

      window.setTimeout(resetButton, 1600);
    });

    wrapper.append(button);
  });
};

const setupResponsiveTables = () => {
  const tables = Array.from(document.querySelectorAll(".article-body table"));

  tables.forEach((table) => {
    if (!(table instanceof HTMLTableElement)) {
      return;
    }

    if (
      table.parentElement instanceof HTMLElement &&
      table.parentElement.classList.contains("article-table-wrap")
    ) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "article-table-wrap";
    table.before(wrapper);
    wrapper.append(table);
  });
};

const setupFloatingArticleNav = ({
  selector,
  mediaQuery,
  spaceTargetSelector,
  spaceProperty,
}) => {
  const nav = document.querySelector(selector);
  const spaceTarget = spaceTargetSelector
    ? document.querySelector(spaceTargetSelector)
    : null;

  if (!(nav instanceof HTMLElement)) {
    return;
  }

  if (spaceTargetSelector && !(spaceTarget instanceof HTMLElement)) {
    return;
  }

  const query = window.matchMedia(mediaQuery);
  let lastY = window.scrollY;
  let hiddenOffset = 0;
  let maxOffset = 1;
  let ticking = false;

  const applyState = () => {
    const progress = Math.min(hiddenOffset / maxOffset, 1);

    nav.style.setProperty("--article-nav-y", `${-hiddenOffset}px`);
    nav.style.setProperty("--article-nav-progress", progress.toFixed(3));
    nav.classList.toggle("is-hidden", progress > 0.98);
  };

  const measure = () => {
    if (!query.matches) {
      hiddenOffset = 0;
      maxOffset = 1;
      nav.classList.remove("is-hidden");
      nav.style.removeProperty("--article-nav-y");
      nav.style.removeProperty("--article-nav-progress");

      if (spaceTarget instanceof HTMLElement && spaceProperty) {
        spaceTarget.style.removeProperty(spaceProperty);
      }

      lastY = window.scrollY;
      return;
    }

    const navTop = parseFloat(window.getComputedStyle(nav).top) || 0;
    const navHeight = nav.offsetHeight;
    const contentGap = 18;
    const hideBuffer = 14;

    if (spaceTarget instanceof HTMLElement && spaceProperty) {
      spaceTarget.style.setProperty(
        spaceProperty,
        `${Math.ceil(navTop + navHeight + contentGap)}px`,
      );
    }

    maxOffset = Math.max(Math.ceil(navTop + navHeight + hideBuffer), 1);
    hiddenOffset = Math.min(hiddenOffset, maxOffset);
    applyState();
  };

  const update = () => {
    ticking = false;

    if (!query.matches) {
      return;
    }

    const currentY = Math.max(window.scrollY, 0);
    const delta = currentY - lastY;
    lastY = currentY;

    if (currentY <= 8) {
      hiddenOffset = 0;
      applyState();
      return;
    }

    if (Math.abs(delta) < 0.5) {
      return;
    }

    hiddenOffset = Math.min(Math.max(hiddenOffset + delta, 0), maxOffset);
    applyState();
  };

  const scheduleUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(update);
  };

  const handleResize = () => {
    measure();
    lastY = window.scrollY;
  };

  measure();
  applyState();

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", handleResize);
  window.visualViewport?.addEventListener("resize", handleResize);
  nav.addEventListener("focusin", () => {
    hiddenOffset = 0;
    applyState();
  });

  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handleResize);
    return;
  }

  if (typeof query.addListener === "function") {
    query.addListener(handleResize);
  }
};

const setupArticleNavs = () => {
  setupFloatingArticleNav({
    selector: ".article-desktop-nav",
    mediaQuery: "(min-width: 721px)",
  });

  setupFloatingArticleNav({
    selector: ".article-mobile-nav",
    mediaQuery: "(max-width: 720px)",
    spaceTargetSelector: ".map-world--article-mobile",
    spaceProperty: "--article-mobile-nav-space",
  });
};

ready(() => {
  assignHeadingAnchors();
  setupActiveDots();
  setupResponsiveTables();
  setupCopyButtons();
  setupArticleNavs();

  if (window.location.hash) {
    window.setTimeout(jumpToHash, 0);
  }

  window.addEventListener("hashchange", jumpToHash);
});
