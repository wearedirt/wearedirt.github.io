// js/scripts.js
// - Removes inline onclick by using [data-section] links in index.html
// - Keeps dynamic section loading into #dynamic-content
// - Adds optional [data-action] buttons for section-level actions (Bluetooth check, Back)
// - Auto-inits Troubleshooter when #ts-root exists in injected HTML

(() => {
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
      initInjectedContent();

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
    } else {
      console.log("No previous section found.");
    }
  }

  function wireNavigationClicks() {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-section]");
      if (!link) return;

      e.preventDefault();
      const filename = link.getAttribute("data-section");
      if (!filename) return;

      loadSection(filename);

      // Collapse mobile nav after click (Bootstrap 5)
      const collapseEl = document.getElementById("navbarSupportedContent");
      if (collapseEl && collapseEl.classList.contains("show")) {
        try {
          const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
          bsCollapse.hide();
        } catch (_) {}
      }
    });
  }

  function wireActionButtons() {
    // Example usage in section HTML:
    // <button type="button" class="btn btn-primary" data-action="checkBluetooth">Check Bluetooth</button>
    // <button type="button" class="btn btn-secondary" data-action="goBack">Back</button>
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");
      if (action === "checkBluetooth") {
        e.preventDefault();
        checkBluetooth();
      } else if (action === "goBack") {
        e.preventDefault();
        goBack();
      }
    });
  }

  async function checkBluetooth() {
      const idInput = document.getElementById('participantId').value.trim().toUpperCase();
      const targetName = `Verisense-01-22011801${idInput}`;
      const resultEl = document.getElementById('bt-result');

      let status = "No";
      try {
          const device = await navigator.bluetooth.requestDevice({
              filters: [{ name: targetName }]
          });
          status = "Yes";
          resultEl.textContent = `✅ Device "${targetName}" is paired.`;
      } catch (error) {
          resultEl.textContent = `❌ Device not found or user cancelled.`;
      }
  }

  function initInjectedContent() {
    const tsMount = document.getElementById("ts-root");
    if (tsMount) {
      if (tsMount.dataset.initialized === "true") return;
      tsMount.dataset.initialized = "true";
      initTroubleshooter(tsMount);
    }
  }

  function initTroubleshooter(rootEl) {
    const TREE = {
      start: "Start",
      nodes: {
        Start: {
          type: "question",
          title: "What are you having trouble with?",
          text: "Choose what best matches your situation.",
          choices: [
            { label: "Trouble with my DIRT Watch.", next: "dirt_watch" },
            { label: "Trouble with the DIRT App.", next: "dirt_app" },
            { label: "I am running low on stickies.", next: "contact_recruit" },
            { label: "I have lost or damaged my device and/or accessories.", next: "contact_recruit" },
            { label: "I have questions about the panel and/or issues with payment.", next: "contact_recruit" },
          ],
        },
        dirt_watch: {
          type: "question",
          title: "What type of trouble are you having with your DIRT watch?",
          text: "Choose what best matches your situation.",
          choices: [
            { label: "I cannot pair my device with my computer.", next: "r2" },
            { label: "I cannot connect my device to the DIRT App.", next: "r1" },
            { label: "My device is not charging.", next: "r1" },
            { label: "My device is dying really quickly even after charging for a while.", next: "r1" },
          ],
        },
        dirt_app: {
          type: "question",
          title: "Has it been charging for at least 30 minutes?",
          text: "Use the provided charger and a known-good USB adapter/outlet.",
          choices: [
            { label: "Yes, 30+ minutes", next: "r3" },
            { label: "No / not sure", next: "r4" },
          ],
        },
        r1: {
          type: "result",
          title: "Basics look OK",
          text: "Continue setup. If the app still can’t connect, toggle phone Bluetooth off/on and retry.",
        },
        r2: {
          type: "result",
          title: "Not showing in Bluetooth",
          text: "Try: (1) restart phone Bluetooth, (2) move closer, (3) restart phone, (4) charge 30 minutes and retry.",
        },
        r3: {
          type: "result",
          title: "Charged but still won’t power on",
          text: "Try a different USB adapter/outlet. If no response, collect device label + participant ID and escalate.",
          actions: [
            {
              label: "Copy support note template",
              onClick: () =>
                copyText(
                  "Support request:\n- Issue: watch will not power on after 30+ minutes charging\n- Participant ID:\n- Steps tried: different outlet/adapter, reseated charger\n- Date/time:"
                ),
            },
          ],
        },
        contact_recruit: {
          type: "result",
          title: "Contact your panel administrator or recruiter.",
          text: "For issues related to 1) running low on stickies, 2) lost or damaged device/accessories, or 3) general questions about the panel and/or payments, please contact your panel adminstrator/recruiter.",
        },
      },
    };

    rootEl.innerHTML = `
      <style>
        .ts-card { max-width: 900px; border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
        .ts-choices { display: grid; gap: 10px; margin-top: 12px; }
        .ts-btn { padding: 10px 12px; border-radius: 10px; border: 1px solid #ccc; background: #fff; cursor: pointer; text-align: left; }
        .ts-btn:hover { background: #f6f6f6; }
        .ts-meta { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .ts-pill { font-size: 12px; padding: 6px 10px; border: 1px solid #eee; border-radius: 999px; background: #fafafa; }
        .ts-path { margin-top: 12px; color: #555; font-size: 13px; }
      </style>

      <div class="ts-card">
        <h2 class="ts-title" style="margin:0 0 8px 0;"></h2>
        <p class="ts-text" style="margin:0;"></p>
        <div class="ts-choices" aria-live="polite"></div>

        <div class="ts-meta">
          <span class="ts-pill ts-nodeId"></span>
          <button class="ts-btn ts-back" style="display:none; width:auto;">← Back</button>
          <button class="ts-btn ts-restart" style="width:auto;">Restart</button>
        </div>

        <div class="ts-path"></div>
      </div>
    `;

    const elTitle = rootEl.querySelector(".ts-title");
    const elText = rootEl.querySelector(".ts-text");
    const elChoices = rootEl.querySelector(".ts-choices");
    const elNodeId = rootEl.querySelector(".ts-nodeId");
    const elBack = rootEl.querySelector(".ts-back");
    const elRestart = rootEl.querySelector(".ts-restart");
    const elPath = rootEl.querySelector(".ts-path");

    let current = TREE.start;
    const history = [];
    const pathLabels = [];

    function render() {
      const node = TREE.nodes[current];
      if (!node) return;

      elTitle.textContent = node.title || "";
      elText.textContent = node.text || "";
      elNodeId.textContent = "Node: " + current;

      elChoices.innerHTML = "";
      elBack.style.display = history.length ? "inline-block" : "none";
      elPath.textContent = pathLabels.length ? "Path: " + pathLabels.join(" → ") : "";

      if (node.type === "question") {
        node.choices.forEach((choice) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "ts-btn";
          btn.textContent = choice.label;
          btn.addEventListener("click", () => {
            history.push(current);
            pathLabels.push(choice.label);
            current = choice.next;
            render();
          });
          elChoices.appendChild(btn);
        });
      } else if (node.type === "result") {
        if (node.actions?.length) {
          node.actions.forEach((action) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "ts-btn";
            btn.textContent = action.label;
            btn.addEventListener("click", action.onClick);
            elChoices.appendChild(btn);
          });
        } else {
          const done = document.createElement("div");
          done.style.marginTop = "10px";
          done.style.color = "#666";
          done.textContent = "You’ve reached an outcome. Use Restart to try another path.";
          elChoices.appendChild(done);
        }
      }
    }

    elBack.addEventListener("click", () => {
      if (!history.length) return;
      current = history.pop();
      pathLabels.pop();
      render();
    });

    elRestart.addEventListener("click", () => {
      current = TREE.start;
      history.length = 0;
      pathLabels.length = 0;
      render();
    });

    render();
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard.");
    } catch {
      alert("Copy failed. (Some browsers require HTTPS.)");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireNavigationClicks();
    wireActionButtons();
    loadSection("welcome.html");
  });
})();
