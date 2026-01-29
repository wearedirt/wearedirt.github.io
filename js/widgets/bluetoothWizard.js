// js/widgets/bluetoothWizard.js
(() => {
  window.App = window.App || {};
  window.App.Widgets = window.App.Widgets || {};

  window.App.Widgets.initBluetoothWizard = function initBluetoothWizard(rootEl) {
    const CHECK_PAIRING_FILE = "bluetooth_check_form.html";
    const escapeHtml = window.App?.Utils?.escapeHtml || ((s) => String(s));

    const DATA = {
      win10: {
        label: "Windows 10",
        steps: [
          { title: "Turning on Bluetooth", body: "Press the ⊞ Windows key → type and select “Bluetooth and other devices settings” → ensure Bluetooth is On.", images: ["assets/windows10_bt_1.png", "assets/windows10_bt_2.png"], note: "Before you can set up the DIRT watch or participate in any of the research studies, please ensure your computer's Bluetooth is turned on and your DIRT watch is charged!" },
          { title: "Add a device", body: "Select “Add Bluetooth or other devices”.", images: ["assets/windows10_bt_3.png"] },
          { title: "Choose Bluetooth", body: "Select the first option to add Bluetooth devices.", images: ["assets/windows10_bt_4.png"] },
          { title: "Select your watch", body: "Select “Verisense-01-xxxxxxxxXXXX” where XXXX matches your participant ID (example: E474).", images: ["assets/windows10_bt_5.png"] },
          { title: "Enter the PIN", body: "Enter pin “123456” and connect.", images: ["assets/windows10_bt_6.png"] },
          { title: "Finish", body: "Press “Done” when complete.", images: ["assets/windows10_bt_7.png"] },
        ],
      },
      win11: {
        label: "Windows 11",
        steps: [
          { title: "Turning on Bluetooth", body: "Open Bluetooth settings and make sure Bluetooth is On.", images: ["assets/bluetooth_w11_1.png", "assets/bluetooth_w11_2.png"], note: "Before you can set up the DIRT watch or participate in any of the research studies, please ensure your computer's Bluetooth is turned on and your DIRT watch is charged!" },
          { title: "Add device", body: "Select “Add device”.", images: ["assets/bluetooth_w11_3.png"] },
          { title: "Choose Bluetooth", body: "Select the first option to add Bluetooth devices.", images: ["assets/bluetooth_w11_4.png"] },
          { title: "Show all devices (if available)", body: "If you see “Show all devices”, select it.", images: ["assets/bluetooth_w11_5.png"]},
          { title: "Select your watch", body: "Select “Verisense-01-xxxxxxxxXXXX” where XXXX matches your participant ID (example: E474).", images: ["assets/bluetooth_w11_6.png"] },
          { title: "Enter the PIN", body: "Enter pin “123456” and connect.", images: ["assets/bluetooth_w11_7.png"] },
          { title: "Finish", body: "Press “Done” when complete.", images: ["assets/bluetooth_w11_8.png"] },
        ],
        alternativeSteps: [
          { title: "Open Bluetooth settings", body: "Open Bluetooth settings.", images: ["assets/bluetooth_w11_1.png"], note: "Before you can set up the DIRT watch or participate in any of the research studies, please ensure your computer's Bluetooth is turned on and your DIRT watch is charged!" },
          { title: "Scroll to Device settings", body: "Scroll down until you see the section “Device settings”.", images: ["assets/w11_alt_5.png"] },
          { title: "Set discovery to Advanced", body: "Under “Bluetooth devices discovery”, select “Advanced”.", images: ["assets/w11_alt_6.png"] },
          { title: "Add device", body: "Scroll back up and select “Add device”.", images: ["assets/bluetooth_w11_3.png"] },
          { title: "Choose Bluetooth", body: "Select the first option to add Bluetooth devices.", images: ["assets/bluetooth_w11_4.png"] },
          { title: "Select your watch", body: "Select “Verisense-01-xxxxxxxxXXXX” where XXXX matches your participant ID (example: E474).", images: ["assets/bluetooth_w11_6.png"] },
          { title: "Enter the PIN", body: "Enter pin “123456” and connect.", images: ["assets/bluetooth_w11_7.png"] },
          { title: "Finish", body: "Press “Done” when complete.", images: ["assets/bluetooth_w11_8.png"] },
        ],
      },
    };

    let osKey = null; // win10|win11
    let mode = "main"; // main|alt
    let stepIndex = 0;

    rootEl.innerHTML = `
      <style>
        .wiz-card { border:1px solid #ddd; border-radius:12px; padding:16px; max-width: 1100px; }
        .wiz-row { display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; }
        .wiz-btn { border:1px solid #ccc; background:#fff; border-radius:10px; padding:10px 12px; cursor:pointer; }
        .wiz-btn:hover { background:#f6f6f6; }
        .wiz-nav { display:flex; gap:10px; align-items:center; margin-top:14px; flex-wrap:wrap; }
        .wiz-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:12px; }
        .wiz-muted { color:#666; font-size: 13px; }
        .wiz-img { max-width: 100%; border-radius: 10px; border: 1px solid #ddd; }
        .wiz-grid { display:grid; gap:12px; grid-template-columns: 1fr; }
        @media (min-width: 992px) { .wiz-grid { grid-template-columns: 1.2fr 0.8fr; } }
      </style>

      <!-- OS picker -->
      <div id="wiz-picker" class="wiz-card">
        <h2 style="margin:0 0 6px 0;">Choose your operating system</h2>
        <p class="wiz-muted" style="margin:0 0 12px 0;">We’ll show one step at a time.</p>

        <div class="wiz-row">
          <button type="button" class="wiz-btn" data-wiz-pick="win10">Windows 10</button>
          <button type="button" class="wiz-btn" data-wiz-pick="win11">Windows 11</button>
        </div>
      </div>

      <!-- Wizard (hidden until OS chosen) -->
      <div id="wiz-flow" class="wiz-card" style="display:none;">
        <div id="wiz-stage"></div>
      </div>
    `;

    const stage = rootEl.querySelector("#wiz-stage");
    const pickerEl = rootEl.querySelector("#wiz-picker");
    const flowEl = rootEl.querySelector("#wiz-flow");

    rootEl.addEventListener("click", (e) => {
      const pick = e.target.closest("[data-wiz-pick]")?.getAttribute("data-wiz-pick");
      if (pick) {
        osKey = pick;
        mode = "main";
        stepIndex = 0;

        if (pickerEl) pickerEl.style.display = "none";
        if (flowEl) flowEl.style.display = "block";

        render();
        return;
      }

      const action = e.target.closest("[data-wiz-action]")?.getAttribute("data-wiz-action");
      if (!action) return;

      if (action === "prev") {
        stepIndex = Math.max(0, stepIndex - 1);
        render();
      } else if (action === "next") {
        stepIndex = stepIndex + 1;
        render();
      } else if (action === "reset") {
        osKey = null;
        mode = "main";
        stepIndex = 0;

        stage.innerHTML = "";

        if (flowEl) flowEl.style.display = "none";
        if (pickerEl) pickerEl.style.display = "block";
      } else if (action === "useAlt") {
        mode = "alt";
        stepIndex = 0; // NOT seamless
        render();
      } else if (action === "showAll") {
        renderAllSteps();
      } else if (action === "useMain") {
        render();
      } else if (action === "checkPairing") {
        window.App?.Nav?.loadSection?.(CHECK_PAIRING_FILE);
      }
    });

    function getSteps() {
      if (!osKey) return [];
      const os = DATA[osKey];
      if (osKey === "win11" && mode === "alt") return os.alternativeSteps;
      return os.steps;
    }

    function render() {
      if (!osKey) {
        stage.innerHTML = "";
        return;
      }

      const os = DATA[osKey];
      const steps = getSteps();

      if (stepIndex >= steps.length) stepIndex = steps.length - 1;
      if (stepIndex < 0) stepIndex = 0;

      const step = steps[stepIndex];
      const total = steps.length;
      const pct = total > 1 ? Math.round((stepIndex / (total - 1)) * 100) : 100;

      const altToggle =
        osKey === "win11" && mode === "main" && stepIndex === 3
          ? `<div class="wiz-row" style="margin-top:10px;">
              <button type="button" class="wiz-btn" data-wiz-action="useAlt">Use Windows 11 Alternative Steps</button>
            </div>`
          : "";

      const noteHtml = step.note
        ? `<div class="alert alert-warning" role="alert" style="margin-top:12px;">
            ⚠️ <strong>Note:</strong> ${escapeHtml(step.note)}
          </div>`
        : "";

      const imgs = (step.images || []).map((src) => `<div><img src="${src}" alt="" class="wiz-img" /></div>`).join("");

      const altInlineLink =
        osKey === "win11" && mode === "main" && stepIndex === 3
          ? `
            <div class="wiz-muted" style="margin-top:8px;">
              For some Windows 11 setups, you will <strong>not</strong> see “Show all devices”.
              <a href="#" data-wiz-action="useAlt">Please use these alternative steps</a>.
            </div>
          `
          : "";

      stage.innerHTML = `
        <div class="wiz-grid wiz-stack">
          <div>
            <div class="wiz-muted">${os.label}${osKey === "win11" && mode === "alt" ? " • Alternative" : ""} • Step ${stepIndex + 1} of ${total}</div>

            <div class="progress" role="progressbar" aria-label="Progress" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" style="height: 10px; margin-top: 10px;">
              <div class="progress-bar" style="width: ${pct}%"></div>
            </div>

            <h3 style="margin:10px 0 8px 0;">${escapeHtml(step.title)}</h3>
            <p style="margin:0;">${escapeHtml(step.body)}</p>
            ${altInlineLink}
            ${noteHtml}

            <div class="wiz-images" style="margin-top:12px;">
              ${imgs || `<div class="wiz-muted">No images for this step.</div>`}
            </div>

            <div class="wiz-nav">
              <button type="button" class="wiz-btn" data-wiz-action="prev" ${stepIndex === 0 ? "disabled" : ""}>← Back</button>
              <button type="button" class="wiz-btn" data-wiz-action="next" ${stepIndex === total - 1 ? "disabled" : ""}>Next →</button>
              <button type="button" class="wiz-btn" data-wiz-action="showAll">Show all steps</button>
              <button type="button" class="wiz-btn" data-wiz-action="reset">Change OS</button>
            </div>

            ${stepIndex === total - 1 ? `
              <div class="wiz-actions">
                <button type="button" class="wiz-btn" data-wiz-action="checkPairing">Check if pairing was done correctly</button>
              </div>
            ` : ``}

            ${altToggle}
          </div>
        </div>
      `;
    }

    function renderAllSteps() {
      const os = DATA[osKey];
      const steps = getSteps();

      stage.innerHTML = `
        <div class="wiz-muted">${os.label}${osKey === "win11" && mode === "alt" ? " • Alternative" : ""}</div>
        <h3 style="margin:6px 0 12px 0;">All steps</h3>

        <ol>
          ${steps.map((s, i) => {
        const isWin11Main = osKey === "win11" && mode === "main";
        const showAltHere = isWin11Main && i === 3;

        return `
              <li style="margin-bottom:16px;">
                <div><strong>${escapeHtml(s.title)}</strong></div>
                <div>${escapeHtml(s.body)}</div>

                ${s.note
            ? `<div class="alert alert-warning" role="alert" style="margin-top:8px;">
                      ⚠️ <strong>Note:</strong> ${escapeHtml(s.note)}
                    </div>`
            : ""}

                ${showAltHere
            ? `<div style="margin-top:8px;">
                        <button type="button" class="wiz-btn" data-wiz-action="useAlt">
                          Use Windows 11 Alternative Steps
                        </button>
                      </div>`
            : ""
          }

                ${(s.images || [])
            .map((src) => `<img src="${src}" class="wiz-img" style="margin-top:8px;" />`)
            .join("")}
              </li>
            `;
      }).join("")}
        </ol>

        <div class="wiz-nav">
          <button type="button" class="wiz-btn" data-wiz-action="useMain">Back to step-by-step</button>
          <button type="button" class="wiz-btn" data-wiz-action="checkPairing">Check if pairing was done correctly</button>
          <button type="button" class="wiz-btn" data-wiz-action="reset">Change OS</button>
        </div>
      `;
    }
  };
})();
