/*
 * Comparative dashboard interaction motion — presentation enhancement only.
 * Does not change source records, counts, filters, links, geometry or DOM sections.
 */
(function () {
  "use strict";
  const ROOT = document.documentElement;
  const viewClass = "oms-motion-enter";
  const mapClass = "oms-motion-update";
  const filterClass = "oms-motion-filter";

  function activate() {
    if (ROOT.classList.contains("oms-motion-ready")) return;
    const tabs = document.querySelector(".tabs");
    const map = document.getElementById("omsCommandMap");
    if (!tabs || !map) return;

    const cards = document.querySelectorAll(".metrics .metric");
    cards.forEach((card, index) => {
      card.style.setProperty("--oms-metric-order", String(index));
    });
    ROOT.classList.add("oms-motion-ready");

    let previousTab = tabs.querySelector(".tab.active")?.getAttribute("data-tab") || "dossiers";
    let previousFilter = null;

    function replay(element, name) {
      if (!element || !ROOT.classList.contains("oms-motion-ready")) return;
      element.classList.remove(name);
      // Re-trigger a CSS animation only on actual user-driven state changes.
      void element.offsetWidth;
      element.classList.add(name);
    }

    document.addEventListener("comparative:render", event => {
      const state = event.detail || {};
      const currentTab = state.tab || tabs.querySelector(".tab.active")?.getAttribute("data-tab");

      if (currentTab && currentTab !== previousTab) {
        previousTab = currentTab;
        const section = document.getElementById(currentTab);
        if (section?.classList.contains("section") && !section.hidden) replay(section, viewClass);
      }

      const filterState = JSON.stringify([
        state.state || "all", state.role || "all", state.leader || "all",
        state.issue || "all", state.accountSource || "all",
        state.publisher || "all"
      ]);
      // Don't flash the map repeatedly while the user types into search.
      if (previousFilter !== null && previousFilter !== filterState) {
        replay(map, mapClass);
        replay(ROOT, filterClass);
      }
      previousFilter = filterState;
    });

    // The district atlas can update without a comparative:render event.
    // A selection is already reflected by the map's existing active classes:
    // the animation layer only provides visual feedback for the same selection.
    map.addEventListener("click", event => {
      const node = event.target.closest?.(
        "[data-action='district'],[data-action='leader'],[data-action='issue'],[data-action='state']"
      );
      if (!node) return;
      replay(ROOT, filterClass);
    });

    // CSS transitions are disabled for people who prefer reduced motion.
    // All controls remain fully functional with or without this script.
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activate, { once: true });
  } else {
    activate();
  }
})();
