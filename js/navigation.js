// js/navigation.js
// - Navigation: [data-section] loads HTML into #dynamic-content
// - History: back button support via App.Nav.goBack()
// - Exposes: App.Nav.loadSection(), App.Nav.goBack()
(() => {
  window.App = window.App || {};
  window.App.Nav = window.App.Nav || {};

  let sectionHistory = [];

  function getContainer() {
    return document.getElementById("dynamic-content");
  }

  function setActiveNav(filename) {
    document.querySelectorAll("[data-section]").forEach((a) => {
      const isActive = a.getAttribute("data-section") === filename;
      a.classList.toggle("active", isActive);
    });
  }

  async function loadSection(filename, anchor = "") {
    const container = getContainer();
    if (!container) return;

    const current = container.getAttribute("data-current");
    if (current && current !== filename) sectionHistory.push(current);

    try {
      const res = await fetch(filename, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`);

      const html = await res.text();
      container.innerHTML = html;
      container.setAttribute("data-current", filename);

      setActiveNav(filename);

      // Let the app initialize any widgets that just got injected.
      if (typeof window.App?.initInjectedContent === "function") {
        window.App.initInjectedContent();
      }

      setTimeout(() => {
        if (anchor) {
          const el = document.querySelector(anchor);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } catch (err) {
      console.error("Error loading section:", err);
      container.innerHTML = `<div class="alert alert-danger">Error loading section: ${filename}</div>`;
    }
  }

  function goBack() {
    if (sectionHistory.length > 0) {
      const prev = sectionHistory.pop();
      loadSection(prev);
    }
  }

  function wireNavigationClicks() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-section]");
      if (!link) return;

      e.preventDefault();
      const filename = link.getAttribute("data-section");
      if (!filename) return;

      const anchor = link.getAttribute("data-anchor") || "";
      loadSection(filename, anchor);

      // Close the mobile nav if open
      const collapseEl = document.getElementById("navbarSupportedContent");
      if (collapseEl && collapseEl.classList.contains("show")) {
        try {
          const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
          bsCollapse.hide();
        } catch (_) {}
      }
    });
  }

  window.App.Nav.loadSection = loadSection;
  window.App.Nav.goBack = goBack;
  window.App.Nav.wireNavigationClicks = wireNavigationClicks;
})();
