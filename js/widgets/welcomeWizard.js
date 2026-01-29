// js/widgets/welcomeWizard.js
(() => {
  window.App = window.App || {};
  window.App.Widgets = window.App.Widgets || {};

  window.App.Widgets.initWelcomeWizard = function initWelcomeWizard(rootEl) {
    const TRACKS = [
      {
        key: "new",
        label: "New Participant",
        title: "For new participants",
        steps: [
          {
            label: "Check Package Contents",
            title: "Go over the package contents you have received",
            bodyHtml: `
              <p>Review what you have received in your welcome package.</p>
              <p>See <a href="#" data-section="package_contents.html">SECTION 1</a> for more information</p>
            `,
          },
          {
            label: "Charge watch",
            title: "Ensure your DIRT watch is fully charged",
            bodyHtml: `
              <p>Before you can set up your DIRT watch, please charge it fully. This may take between 4-5 hours.</p>
              <p>See <a href="#" data-section="charging_device.html">SECTION 2</a> for more information on how to charge your DIRT watch.</p>
            `,
          },
          {
            label: "Setup Bluetooth",
            title: "Ensure computer's Bluetooth is on & pair your DIRT watch with your computer",
            bodyHtml: `
              <p>You will need to pair your DIRT watch with your computer before you can use it for a research study. Please follow the instructions carefully in Section 3 
              to do so. For the time being, our software and hardware will only work on <b>Windows</b> systems (Windows 10 with the latest updates or Windows 11).</p>

              <p>See <a href="#" data-section="bluetooth_setup.html">SECTION 3</a> for more information.</p>

              <div class="alert alert-info" role="alert">
                💡 <strong>Note:</strong> You should do this with the Windows computer you plan on using
                to participate in future research studies with us.
                Please reach out immediately if you run into any issues while pairing your DIRT watch!
                <b>This is very important for your future participation!</b>
              </div>
            `,
          },
          {
            label: "Install app",
            title: "Install the DIRT App",
            bodyHtml: `
              <p>All of the research studies in this research panel will require using the DIRT App. Please go through Section 4 to install the application and Section 5 to
              familiarize yourself with the necessary steps to participate in a study. 

              <p>See <a href="#" data-section="install_app.html">SECTION 4</a> for more information.</p>
            `,
          },
        ],
      },
      {
        key: "returning",
        label: "Returning Participant",
        title: "For returning participants (before starting a new study)",
        steps: [
          {
            label: "Charge watch",
            title: "Ensure your DIRT watch is charged",
            bodyHtml: `
              <p>Before starting any projects, please ensure your watch has been charging for <b>at least 4 hours</b>. Please check that the red LED light is flashing behind your watch, as that is an indicator the watch is on.
              <p>See <a href="#" data-section="charging_device.html">SECTION 2</a> for a reminder on how to charge your DIRT watch.</p>
            `,
          },
          {
            label: "Turn Bluetooth On",
            title: "Ensure computer's Bluetooth connection has been turned on",
            bodyHtml: `
              <p>In order to participate in a study, the DIRT App has to connect to your DIRT watch. We do this using Bluetooth so you <b>must</b> have your Bluetooth enabled on your computer.
              <p>See <a href="#" data-section="bluetooth_setup.html" data-anchor="#turning-on-bt">SECTION 3</a> for a reminder on how to turn on your computer's Bluetooth.</p>
            `,
          },
          {
            label: "Start a Study",
            title: "Go over the study participation procedures",
            bodyHtml: `
              <p>See <a href="#" data-section="study_participation_procedures.html">SECTION 5</a> for a complete overview of the study participation procedures.</p>

              <div class="alert alert-info" role="alert">
                💡 <strong>Note:</strong> Even if you are a returning participant, please consider
                looking through these instructions carefully again to remind yourself of the
                participation procedures.
              </div>
            `,
          },
        ],
      },
    ];

    let selectedTrackIndex = null; // null until user chooses
    let stepIndex = 0;

    rootEl.innerHTML = `
      <style>
        .wel-card { border:1px solid #ddd; border-radius:12px; padding:16px; max-width:1100px; }
        .wel-muted { color:#666; font-size:13px; }
        .wel-row { display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; }
        .wel-pick { border:1px solid #ccc; background:#fff; border-radius:12px; padding:12px 14px; cursor:pointer; text-align:left; }
        .wel-pick:hover { background:#f6f6f6; }
        .wel-steps { display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; }
        .wel-step { border:1px solid #ccc; background:#fff; border-radius:999px; padding:8px 12px; cursor:pointer; }
        .wel-step:hover { background:#f6f6f6; }
        .wel-step.active { background:#f1f1f1; }
        .wel-nav { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
        .wel-btn { border:1px solid #ccc; background:#fff; border-radius:10px; padding:10px 12px; cursor:pointer; }
        .wel-btn:hover { background:#f6f6f6; }
      </style>

      <div class="wel-card">
        <p style="margin:0 0 6px 0;">Thank you for being part of our research network!</p>
        <p style="margin:0;">
          On this page, you will find an overview of everything you will need to know in order to get started using our
          hardware and software. Please go through all the overview steps before you visit any specific sections. 
        </p>

        <!-- Picker (hidden after selection) -->
        <div id="wel-picker" style="margin-top:14px;">
          <div class="wel-muted">Choose your status:</div>
          <div class="wel-row" style="margin-top:10px;">
            ${TRACKS.map((t, i) => `
              <button type="button" class="wel-pick" data-wel-pick="${i}">
                <div style="font-weight:600;">${t.label}</div>
                <div class="wel-muted" style="margin-top:4px;">${t.title}</div>
              </button>
            `).join("")}
          </div>
        </div>

        <!-- Flow (only visible after selection) -->
        <div id="wel-flow" style="display:none; margin-top:16px;">
          <div class="wel-row" style="justify-content:space-between; align-items:center;">
            <div class="wel-muted" id="wel-selected"></div>
          </div>

          <div id="wel-steps" class="wel-steps"></div>
          <div id="wel-stage" style="margin-top:14px;"></div>

          <div class="wel-nav">
            <button type="button" class="wel-btn" data-wel-action="prev">← Back</button>
            <button type="button" class="wel-btn" data-wel-action="next">Next →</button>
            <button type="button" class="wel-btn" data-wel-action="resetChoice">Change Status</button>

          </div>
        </div>
      </div>
    `;

    const pickerEl = rootEl.querySelector("#wel-picker");
    const flowEl = rootEl.querySelector("#wel-flow");
    const selectedEl = rootEl.querySelector("#wel-selected");
    const stepsRow = rootEl.querySelector("#wel-steps");
    const stage = rootEl.querySelector("#wel-stage");

    rootEl.addEventListener("click", (e) => {
      const pick = e.target.closest("[data-wel-pick]")?.getAttribute("data-wel-pick");
      if (pick !== undefined && pick !== null) {
        selectedTrackIndex = Number(pick);
        stepIndex = 0;

        // 2) Hide status buttons once chosen
        if (pickerEl) pickerEl.style.display = "none";

        flowEl.style.display = "block";
        render();
        flowEl.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const step = e.target.closest("[data-wel-step]")?.getAttribute("data-wel-step");
      if (step !== undefined && step !== null) {
        stepIndex = Number(step);
        render();
        return;
      }

      const action = e.target.closest("[data-wel-action]")?.getAttribute("data-wel-action");
      if (!action) return;

      // 1) Reset choice button (shows status buttons again)
      if (action === "resetChoice") {
        selectedTrackIndex = null;
        stepIndex = 0;

        if (pickerEl) pickerEl.style.display = "block";
        flowEl.style.display = "none";

        stepsRow.innerHTML = "";
        stage.innerHTML = "";
        selectedEl.textContent = "";
        return;
      }

      if (selectedTrackIndex === null) return;

      const steps = TRACKS[selectedTrackIndex].steps;

      if (action === "prev") {
        stepIndex = Math.max(0, stepIndex - 1);
        render();
      } else if (action === "next") {
        stepIndex = Math.min(steps.length - 1, stepIndex + 1);
        render();
      }
    });

    function renderStepChips(track) {
      const steps = track.steps;
      stepsRow.innerHTML = steps
        .map((s, i) => `<button type="button" class="wel-step" data-wel-step="${i}">${s.label}</button>`)
        .join("");

      rootEl.querySelectorAll(".wel-step").forEach((b) => b.classList.remove("active"));
      const active = rootEl.querySelector(`.wel-step[data-wel-step="${stepIndex}"]`);
      if (active) active.classList.add("active");
    }

    function render() {
      if (selectedTrackIndex === null) return;

      const track = TRACKS[selectedTrackIndex];
      selectedEl.textContent = `Selected: ${track.label}`;

      const steps = track.steps;

      if (stepIndex < 0) stepIndex = 0;
      if (stepIndex >= steps.length) stepIndex = steps.length - 1;

      renderStepChips(track);

      const step = steps[stepIndex];
      const total = steps.length;
      const pct = total > 1 ? Math.round((stepIndex / (total - 1)) * 100) : 100;

      stage.innerHTML = `
        <div class="wel-muted">${track.title} • ${stepIndex + 1} / ${total}</div>

        <div class="progress" role="progressbar" aria-label="Progress"
             aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
             style="height: 10px; margin-top: 10px;">
          <div class="progress-bar" style="width: ${pct}%"></div>
        </div>

        <h3 style="margin:10px 0 10px 0;">${step.title}</h3>
        <div>${step.bodyHtml || ""}</div>
      `;

      const prevBtn = rootEl.querySelector('[data-wel-action="prev"]');
      const nextBtn = rootEl.querySelector('[data-wel-action="next"]');
      if (prevBtn) prevBtn.disabled = stepIndex === 0;
      if (nextBtn) nextBtn.disabled = stepIndex === steps.length - 1;
    }
  };
})();
