// js/scripts.js
// Clean, deterministic version.
// - Navigation: [data-section] loads HTML into #dynamic-content (no inline onclick)
// - Actions: [data-action="goBack"], [data-action="checkBluetooth"]
// - Widgets: troubleshooter (#ts-root) + bluetooth wizard (#bt-wizard-root)

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

      const collapseEl = document.getElementById("navbarSupportedContent");
      if (collapseEl && collapseEl.classList.contains("show")) {
        try {
          const bsCollapse = bootstrap.Collapse.getOrCreateInstance(collapseEl);
          bsCollapse.hide();
        } catch (_) { }
      }
    });
  }

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
        goBack();
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

  function initInjectedContent() {
    const tsMount = document.getElementById("ts-root");
    if (tsMount && tsMount.dataset.initialized !== "true") {
      tsMount.dataset.initialized = "true";
      initTroubleshooter(tsMount);
    }

    const btWizardMount = document.getElementById("bt-wizard-root");
    if (btWizardMount && btWizardMount.dataset.initialized !== "true") {
      btWizardMount.dataset.initialized = "true";
      initBluetoothWizard(btWizardMount);
    }

    const sppMount = document.getElementById("spp-wizard-root");
    if (sppMount && sppMount.dataset.initialized !== "true") {
      sppMount.dataset.initialized = "true";
      initStudyProceduresWizard(sppMount);
    }
  }

  // ----------------------------
  // Troubleshooter
  // ----------------------------
  function initTroubleshooter(rootEl) {
    const TREE = {
      start: "q1",
      nodes: {
        q1: {
          type: "question",
          title: "Can you power the watch on?",
          text: "Choose what best matches your situation.",
          choices: [
            { label: "Yes, it powers on", next: "q2" },
            { label: "No, it won’t power on", next: "q3" },
          ],
        },
        q2: {
          type: "question",
          title: "Does the watch appear in Bluetooth?",
          text: "Open Bluetooth settings and see if it appears / can be selected.",
          choices: [
            { label: "Yes, it appears", next: "r1" },
            { label: "No, it does not appear", next: "r2" },
          ],
        },
        q3: {
          type: "question",
          title: "Has it been charging for at least 30 minutes?",
          text: "Use the provided charger and a known-good USB adapter/outlet.",
          choices: [
            { label: "Yes, 30+ minutes", next: "r3" },
            { label: "No / not sure", next: "r4" },
          ],
        },
        r1: { type: "result", title: "Basics look OK", text: "Continue setup. If the app still can’t connect, toggle Bluetooth off/on and retry." },
        r2: { type: "result", title: "Not showing in Bluetooth", text: "Try: restart Bluetooth, move closer, restart device, charge 30 minutes and retry." },
        r3: { type: "result", title: "Charged but still won’t power on", text: "Try a different USB adapter/outlet. If no response, escalate to support." },
        r4: { type: "result", title: "Charge first", text: "Charge for at least 30 minutes, then retry powering on." },
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
      </div>
    `;

    const elTitle = rootEl.querySelector(".ts-title");
    const elText = rootEl.querySelector(".ts-text");
    const elChoices = rootEl.querySelector(".ts-choices");
    const elNodeId = rootEl.querySelector(".ts-nodeId");
    const elBack = rootEl.querySelector(".ts-back");
    const elRestart = rootEl.querySelector(".ts-restart");

    let current = TREE.start;
    const history = [];

    function render() {
      const node = TREE.nodes[current];
      if (!node) return;

      elTitle.textContent = node.title || "";
      elText.textContent = node.text || "";
      elNodeId.textContent = "Node: " + current;

      elChoices.innerHTML = "";
      elBack.style.display = history.length ? "inline-block" : "none";

      if (node.type === "question") {
        node.choices.forEach((choice) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "ts-btn";
          btn.textContent = choice.label;
          btn.addEventListener("click", () => {
            history.push(current);
            current = choice.next;
            render();
          });
          elChoices.appendChild(btn);
        });
      } else {
        const done = document.createElement("div");
        done.style.marginTop = "10px";
        done.style.color = "#666";
        done.textContent = "Outcome reached. Use Restart to try another path.";
        elChoices.appendChild(done);
      }
    }

    elBack.addEventListener("click", () => {
      if (!history.length) return;
      current = history.pop();
      render();
    });

    elRestart.addEventListener("click", () => {
      current = TREE.start;
      history.length = 0;
      render();
    });

    render();
  }

  // ----------------------------
  // Bluetooth wizard
  // ----------------------------
  function initBluetoothWizard(rootEl) {
    const CHECK_PAIRING_FILE = "bluetooth_check_form.html";

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
          { title: "Show all devices (if available)", body: "If you see “Show all devices”, select it. If you do NOT see it, use the Alternative path.", images: ["assets/bluetooth_w11_5.png"], note: "For some Windows 11 machines, you will NOT have the option to ''Show all devices''. If this is the case, please go to the alternative steps to set up your device." },
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

      <div class="wiz-card">
        <h2 style="margin:0 0 6px 0;">Choose your operating system</h2>
        <p class="wiz-muted" style="margin:0 0 12px 0;">We’ll show one step at a time.</p>

        <div class="wiz-row">
          <button type="button" class="wiz-btn" data-wiz-pick="win10">Windows 10</button>
          <button type="button" class="wiz-btn" data-wiz-pick="win11">Windows 11</button>
        </div>

        <div id="wiz-stage" style="margin-top:16px;"></div>
      </div>
    `;

    const stage = rootEl.querySelector("#wiz-stage");

    rootEl.addEventListener("click", (e) => {
      const pick = e.target.closest("[data-wiz-pick]")?.getAttribute("data-wiz-pick");
      if (pick) {
        osKey = pick;
        mode = "main";
        stepIndex = 0;
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
      } else if (action === "useAlt") {
        mode = "alt";
        stepIndex = 0; // NOT seamless
        render();
      } else if (action === "showAll") {
        renderAllSteps();
      } else if (action === "useMain") {
        // Back from "Show all steps"
        render();
      } else if (action === "checkPairing") {
        loadSection(CHECK_PAIRING_FILE);
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

      // Win11 Alternative button ONLY on main step 4 (index 3)
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

      stage.innerHTML = `
        <div class="wiz-grid wiz-stack">
          <div>
            <div class="wiz-muted">${os.label}${osKey === "win11" && mode === "alt" ? " • Alternative" : ""} • Step ${stepIndex + 1} of ${total}</div>

            <div class="progress" role="progressbar" aria-label="Progress" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" style="height: 10px; margin-top: 10px;">
              <div class="progress-bar" style="width: ${pct}%"></div>
            </div>

            <h3 style="margin:10px 0 8px 0;">${escapeHtml(step.title)}</h3>
            <p style="margin:0;">${escapeHtml(step.body)}</p>
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
        const showAltHere = isWin11Main && i === 3; // Step 4 (0-indexed)

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

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[c]));
    }
  }

  // ----------------------------
  // Study participation wizard
  // ----------------------------
  function initStudyProceduresWizard(rootEl) {
    const SECTIONS = [
      {
        key: "wear",
        label: "Step 1: Wearing DIRT Watch",
        items: [
          {
            title: "Guide on wearing the DIRT watch",
            body: "In this section, we will go over steps on how you can wear your DIRT watch prior to starting a study. Please read through each steps and follow along.",
          },
          {
            title: "Wearing the DIRT watch",
            body: `Wear the DIRT watch on your <b>left wrist</b> and tighten the strap comfortably.`,
            images: ["assets/procedure_1.jpg"],
          },
          {
            title: "Plug in the data collection cable",
            body: `Plug in the white data collection cable. The "B" on the micro-usb plug should face up.`,
            images: ["assets/procedure_2.jpg"],
          },
          {
            title: "Place sticky pads on fingers",
            body: `Place two sticky pads on your left hand: one on your index finger, one on your middle finger.`,
            images: ["assets/procedure_3.jpg", "assets/procedure_4.jpg"],
            layout: "two",
          },
          {
            title: "Snap cable onto sticky pads",
            body: `Snap each cable connector onto the sticky pads using the metal nipples.`,
            images: ["assets/procedure_5.jpg"],
          },
          {
            title: "Final comfort check",
            body: `Make sure the white cable is not too extended. <b>Do not put pressure on the cable/fingers</b> to avoid noise.`,
            images: [],
          },
        ],
      },

      {
        key: "app",
        label: "Step 2: Using DIRT App",
        items: [
          { title: "Using the DIRT Research App", body: `After you have worn the DIRT watch, please open the DIRT Research App.`, images: [] },
          {
            title: "Enter Study Code and Select Device",
            body: `Enter the provided <b>Study Code</b> and press <b>Select Device</b>.`,
            images: ["assets/app_2.png"],
            note: `💡 <strong>Note:</strong> The Study Code was emailed to you and also sent via the Telegram group.`,
          },
          {
            title: "Confirm reminder + choose device",
            body: `Press <b>Continue</b> on the reminder, then choose your device on the next screen.`,
            images: ["assets/app_reminder.png", "assets/app_3.png"],
            layout: "two",
          },
          {
            title: "Wait for connection",
            body: `Wait until the app connects to your watch (may take a minute).`,
            images: ["assets/app_please_wait.png"],
            warnings: [
              `⚠️ <strong>Warning:</strong> If the watch is still connected to the charging cable, you may see an error. Disconnect and retry.`,
              `⚠️ <strong>Warning:</strong> If battery is less than 40%, you may not be able to continue. Charge and return later.`,
            ],
          },
          {
            title: "Load Study and Start Study",
            body: `Once your watch is connected, please press <b>Load Study</b>, then <b>Start Study</b>. Follow any additional instructions in the study.`,
            images: ["assets/app_battery.jpg", "assets/app_start_study.png"],
            layout: "two",
            note: `💡 <strong>Note:</strong> Battery information can fluctuate. This is normal.`,
          },
        ],
      },

      {
        key: "finish",
        label: "Step 3: Finishing Study & Uploading Data",
        items: [
          {
            title: "End of study (uploading your data)",
            body: `At the end of studies, you will need to upload your data. The next series of steps will guide you through the data uploading.`,
            warnings: ["⚠️ <strong>Warning:</strong> Please follow these instructions carefully to ensure your data is successfully uploaded!"],
          },
          {
            title: "First, remove watch + remove pads/cable",
            body: `
            <ol>
              <li>Unplug the white data collection cable from your watch.</li>
              <li>Peel off sticky pads and press them together.</li>
              <li>Unsnap cable from pads. Throw away pads; store the cable safely.</li>
              <li>Take off your DIRT watch.</li>
            </ol>
          `,
            images: [],
          },
          {
            title: "Next, plug in the watch",
            body: `Once you take off your watch, plug it in. If you are plugging in your device to a wall outlet, please make sure the DIRT watch is still close to your computer.`,
            images: ["assets/watch_plug_in.png"],
          },
          {
            title: "Then, start the uploading process while plugged in",
            body: `When your watch is plugged in, start the data upload.`,
            images: ["assets/app_data_upload_2.png"],
            warnings: ["⚠️ <strong>Warning:</strong> Please always plug in your device prior to uploading your data to ensure success!"],
          },
          {
            title: "Wait for your data to upload",
            body: `You will see this screen while your data uploads. This process may take a 2-5 minutes!`,
            images: ["assets/app_data_upload_3.png"],
            warnings: [`⚠️ <strong>Warning:</strong> Please keep your watch plugged in during this process. Do not navigate away from this screen during this process!`],
          },
          {
            title: "Success + post-study survey",
            body: `✅ <strong>Success!</strong> Once uploaded, you’ll return to the home screen. Exit the app and <b>complete the post-study survey</b>. The link to the survey was included in your announcement email and in Telegram. At this point, please store the watch safely, but <b>do not leave it plugged in long term</b>.`,
            images: [],
          }
        ],
      },
    ];

    let sectionIndex = 0;
    let itemIndex = 0;
    let viewMode = "step"; // "step" | "all"

    rootEl.innerHTML = `
    <style>
      .spp-card { border:1px solid #ddd; border-radius:12px; padding:16px; max-width:1100px; }
      .spp-tabs { display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; }
      .spp-tab { border:1px solid #ccc; background:#fff; border-radius:999px; padding:8px 12px; cursor:pointer; }
      .spp-tab:hover { background:#f6f6f6; }
      .spp-tab.active { background:#f1f1f1; }
      .spp-grid { display:grid; gap:12px; grid-template-columns: 1fr; margin-top:14px; }
      @media (min-width: 992px) { .spp-grid { grid-template-columns: 1.2fr 0.8fr; } }
      .spp-img { max-width:100%; border-radius:10px; border:1px solid #ddd; margin-top:8px; }
      .spp-nav { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
      .spp-btn { border:1px solid #ccc; background:#fff; border-radius:10px; padding:10px 12px; cursor:pointer; }
      .spp-btn:hover { background:#f6f6f6; }
      .spp-muted { color:#666; font-size:13px; }
    </style>

    <div class="spp-card">
      <div class="spp-muted">Choose a section anytime:</div>
      <div class="spp-tabs">
        ${SECTIONS.map((s, i) => `<button type="button" class="spp-tab" data-spp-tab="${i}">${s.label}</button>`).join("")}
      </div>

      <div id="spp-stage"></div>
    </div>
  `;

    const stage = rootEl.querySelector("#spp-stage");

    rootEl.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-spp-tab]")?.getAttribute("data-spp-tab");
      if (tab !== undefined && tab !== null) {
        sectionIndex = Number(tab);
        itemIndex = 0;
        viewMode = "step";
        render();
        return;
      }

      const action = e.target.closest("[data-spp-action]")?.getAttribute("data-spp-action");
      if (!action) return;

      const items = SECTIONS[sectionIndex].items;

      if (action === "showAll") {
        viewMode = "all";
        render();
      } else if (action === "backToStep") {
        viewMode = "step";
        render();
      } else if (action === "prev") {
        itemIndex = Math.max(0, itemIndex - 1);
        render();
      } else if (action === "next") {
        itemIndex = Math.min(items.length - 1, itemIndex + 1);
        render();
      }

      const jump = e.target.closest("[data-spp-jump]")?.getAttribute("data-spp-jump");
      if (jump) {
        e.preventDefault();
        const [sectionKey, stepStr] = jump.split(":");
        const newSectionIndex = SECTIONS.findIndex((s) => s.key === sectionKey);
        const newStepIndex = Number(stepStr);

        if (newSectionIndex >= 0) {
          sectionIndex = newSectionIndex;
          itemIndex = Number.isFinite(newStepIndex) ? newStepIndex : 0;
          viewMode = "step";
          render();

          // Optional: scroll wizard into view after jump
          rootEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

    });

    function renderAllSteps() {
      const section = SECTIONS[sectionIndex];
      const items = section.items;

      stage.innerHTML = `
      <div class="spp-muted">${section.label}</div>
      <h3 style="margin:6px 0 12px 0;">All steps</h3>

      <ol>
        ${items.map((it, i) => {
        const imgs = (it.images || []);
        const imgHtml =
          it.layout === "two" && imgs.length >= 2
            ? `<div class="row" style="margin-top:8px;">
                   <div class="col-md-6"><img class="spp-img" src="${imgs[0]}" alt="" /></div>
                   <div class="col-md-6"><img class="spp-img" src="${imgs[1]}" alt="" /></div>
                 </div>`
            : imgs.map((src) => `<img class="spp-img" src="${src}" alt="" />`).join("");

        const noteHtml = it.note
          ? `<div class="alert alert-info" role="alert" style="margin-top:8px;">${it.note}</div>`
          : "";

        const warningsHtml = (it.warnings || []).length
          ? it.warnings.map((w) => `<div class="alert alert-warning" role="alert" style="margin-top:8px;">${w}</div>`).join("")
          : "";

        return `
            <li style="margin-bottom:18px;">
              <div class="spp-muted">Step ${i + 1}</div>
              <div><strong>${it.title}</strong></div>
              <div style="margin-top:6px;">${it.body}</div>
              ${noteHtml}
              ${warningsHtml}
              ${imgHtml ? `<div style="margin-top:8px;">${imgHtml}</div>` : ""}
            </li>
          `;
      }).join("")}
      </ol>

      <div class="spp-nav">
        <button type="button" class="spp-btn" data-spp-action="backToStep">Back to step-by-step</button>
      </div>
    `;
    }

    function renderStep() {
      // Tabs active state
      rootEl.querySelectorAll(".spp-tab").forEach((b) => b.classList.remove("active"));
      const active = rootEl.querySelector(`.spp-tab[data-spp-tab="${sectionIndex}"]`);
      if (active) active.classList.add("active");

      const section = SECTIONS[sectionIndex];
      const items = section.items;

      if (itemIndex >= items.length) itemIndex = items.length - 1;
      if (itemIndex < 0) itemIndex = 0;

      const item = items[itemIndex];

      const imgs = (item.images || []);
      const imgHtml =
        item.layout === "two" && imgs.length >= 2
          ? `<div class="row">
             <div class="col-md-6"><img class="spp-img" src="${imgs[0]}" alt="" /></div>
             <div class="col-md-6"><img class="spp-img" src="${imgs[1]}" alt="" /></div>
           </div>`
          : imgs.map((src) => `<img class="spp-img" src="${src}" alt="" />`).join("");

      const noteHtml = item.note
        ? `<div class="alert alert-info" role="alert" style="margin-top:10px;">${item.note}</div>`
        : "";

      const warningsHtml = (item.warnings || []).length
        ? item.warnings.map((w) => `<div class="alert alert-warning" role="alert" style="margin-top:10px;">${w}</div>`).join("")
        : "";

      stage.innerHTML = `
      <div class="spp-grid spp-stack">
        <div>
          <div class="spp-muted">${section.label} • ${itemIndex + 1} / ${items.length}</div>
          <h3 style="margin:8px 0 8px 0;">${item.title}</h3>
          <div>${item.body}</div>

          ${noteHtml}
          ${warningsHtml}

          <div class="spp-images" style="margin-top:12px;">
            ${imgHtml || `<div class="spp-muted">No images for this step.</div>`}
          </div>

          <div class="spp-nav">
            <button type="button" class="spp-btn" data-spp-action="prev" ${itemIndex === 0 ? "disabled" : ""}>← Back</button>
            <button type="button" class="spp-btn" data-spp-action="next" ${itemIndex === items.length - 1 ? "disabled" : ""}>Next →</button>
            <button type="button" class="spp-btn" data-spp-action="showAll">Show all steps</button>
          </div>
        </div>
      </div>
    `;
    }

    // Expose a jump API so links outside #spp-wizard-root can control the wizard
    rootEl.__sppJump = (sectionKey, stepIndex = 0) => {
      const newSectionIndex = SECTIONS.findIndex((s) => s.key === sectionKey);
      if (newSectionIndex < 0) return;

      sectionIndex = newSectionIndex;
      itemIndex = Number.isFinite(stepIndex) ? stepIndex : 0;
      viewMode = "step";
      render();

      // optional: bring wizard into view
      rootEl.scrollIntoView({ behavior: "smooth", block: "start" });
    };


    function render() {
      // Tabs active state
      rootEl.querySelectorAll(".spp-tab").forEach((b) => b.classList.remove("active"));
      const active = rootEl.querySelector(`.spp-tab[data-spp-tab="${sectionIndex}"]`);
      if (active) active.classList.add("active");

      if (viewMode === "all") {
        renderAllSteps();
        return;
      }
      renderStep();
    }

    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireNavigationClicks();
    wireActionButtons();
    loadSection("welcome.html");
  });

  // Global handler so timeline links (outside #spp-wizard-root) can jump the wizard
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
