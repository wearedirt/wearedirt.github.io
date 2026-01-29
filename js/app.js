// js/app.js
// - Initializes widgets inside dynamically-loaded sections
// - Boots initial page load
// - Handles global [data-spp-jump] links (timeline jumps)
(() => {
  window.App = window.App || {};
  window.App.Widgets = window.App.Widgets || {};

  window.App.initInjectedContent = function initInjectedContent() {
    const welcomeMount = document.getElementById("welcome-wizard-root");
    if (welcomeMount && welcomeMount.dataset.initialized !== "true") {
      welcomeMount.dataset.initialized = "true";
      window.App?.Widgets?.initWelcomeWizard?.(welcomeMount);
    }

    const tsMount = document.getElementById("ts-root");
    if (tsMount && tsMount.dataset.initialized !== "true") {
      tsMount.dataset.initialized = "true";
      window.App?.Widgets?.initTroubleshooter?.(tsMount);
    }

    const btWizardMount = document.getElementById("bt-wizard-root");
    if (btWizardMount && btWizardMount.dataset.initialized !== "true") {
      btWizardMount.dataset.initialized = "true";
      window.App?.Widgets?.initBluetoothWizard?.(btWizardMount);
    }

    const sppMount = document.getElementById("spp-wizard-root");
    if (sppMount && sppMount.dataset.initialized !== "true") {
      sppMount.dataset.initialized = "true";
      window.App?.Widgets?.initStudyProceduresWizard?.(sppMount);
    }

    const installMount = document.getElementById("install-app-wizard-root");
    if (installMount && installMount.dataset.initialized !== "true") {
      installMount.dataset.initialized = "true";
      window.App?.Widgets?.initInstallAppWizard?.(installMount);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.App?.Nav?.wireNavigationClicks?.();
    window.App?.Actions?.wireActionButtons?.();
    window.App?.Nav?.loadSection?.("welcome.html");
  });

  // Global handler so links (outside #spp-wizard-root) can jump the wizard
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-spp-jump]");
    if (!link) return;

    e.preventDefault();

    const val = link.getAttribute("data-spp-jump") || "";
    const [sectionKey, stepStr] = val.split(":");
    const stepIndex = Number(stepStr || "0");

    const wizardRoot = document.getElementById("spp-wizard-root");
    if (wizardRoot && typeof wizardRoot.__sppJump === "function") {
      wizardRoot.__sppJump(sectionKey, stepIndex);
    } else {
      console.warn("Study procedures wizard not initialized yet.");
    }
  });
})();
