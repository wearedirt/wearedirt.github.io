// js/core.js
// Small shared utilities + a single shared namespace to avoid globals everywhere.
(() => {
  window.App = window.App || {};
  window.App.Utils = window.App.Utils || {};

  window.App.Utils.escapeHtml = function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[c]));
  };
})();
