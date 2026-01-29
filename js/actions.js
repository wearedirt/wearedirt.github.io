// js/actions.js
// - Actions: [data-action="goBack"], [data-action="checkBluetooth"]
(() => {
  window.App = window.App || {};
  window.App.Actions = window.App.Actions || {};

  function wireActionButtons() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      if (action === "checkBluetooth") {
        e.preventDefault();
        checkBluetooth();
      } else if (action === "goBack") {
        e.preventDefault();
        window.App?.Nav?.goBack?.();
      }
    });
  }

  async function checkBluetooth() {
    const idInputEl = document.getElementById("participantId");
    const resultEl = document.getElementById("bt-result");
    if (!idInputEl || !resultEl) return;

    const idInput = idInputEl.value.trim().toUpperCase();
    if (!idInput || idInput.length !== 4) {
      resultEl.textContent = "❌ Please enter a 4-character ID.";
      return;
    }

    const targetName = `Verisense-01-22011801${idInput}`;

    try {
      await navigator.bluetooth.requestDevice({ filters: [{ name: targetName }] });
      resultEl.textContent = `✅ Device "${targetName}" is paired.`;
    } catch (error) {
      resultEl.textContent = "❌ Device not found or user cancelled.";
    }
  }

  window.App.Actions.wireActionButtons = wireActionButtons;
  window.App.Actions.checkBluetooth = checkBluetooth;
})();
