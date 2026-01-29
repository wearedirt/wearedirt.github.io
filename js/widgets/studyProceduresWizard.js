// js/widgets/studyProceduresWizard.js
(() => {
  window.App = window.App || {};
  window.App.Widgets = window.App.Widgets || {};

  window.App.Widgets.initStudyProceduresWizard = function initStudyProceduresWizard(rootEl) {
    const SECTIONS = [
      {
        key: "wear",
        label: "Section 5.1: Wearing DIRT Watch",
        items: [
          { title: "Guide on wearing the DIRT watch", body: "In this section, we will go over steps on how you can wear your DIRT watch prior to starting a study. Please read through each steps and follow along." },
          { title: "Wearing the DIRT watch", body: `Wear the DIRT watch on your <b>left wrist</b> and tighten the strap comfortably.`, images: ["assets/procedure_1.jpg"] },
          { title: "Plug in the data collection cable", body: `Plug in the white data collection cable. The "B" on the micro-usb plug should face up.`, images: ["assets/procedure_2.jpg"] },
          { title: "Place sticky pads on fingers", body: `Place two sticky pads on your left hand: one on your index finger, one on your middle finger.`, images: ["assets/procedure_3.jpg", "assets/procedure_4.jpg"], layout: "two" },
          { title: "Snap cable onto sticky pads", body: `Snap each cable connector onto the sticky pads using the metal nipples.`, images: ["assets/procedure_5.jpg"] },
          { title: "Final comfort check", body: `Make sure the white cable is not too extended. <b>Do not put pressure on the cable/fingers</b> to avoid noise.`, images: [] },
        ],
      },
      {
        key: "app",
        label: "Section 5.2: Using DIRT App",
        items: [
          { title: "Using the DIRT Research App", body: `After you have worn the DIRT watch, please open the DIRT Research App.`, images: [] },
          { title: "Enter Study Code and Select Device", body: `Enter the provided <b>Study Code</b> and press <b>Select Device</b>.`, images: ["assets/app_2.png"], note: `💡 <strong>Note:</strong> The Study Code was emailed to you and also sent via the Telegram group.` },
          { title: "Confirm reminder + choose device", body: `Press <b>Continue</b> on the reminder, then choose your device on the next screen.`, images: ["assets/app_reminder.png", "assets/app_3.png"], layout: "two" },
          { title: "Wait for connection", body: `Wait until the app connects to your watch (may take a minute).`, images: ["assets/app_please_wait.png"], warnings: [
              `⚠️ <strong>Warning:</strong> If the watch is still connected to the charging cable, you may see an error. Disconnect and retry.`,
              `⚠️ <strong>Warning:</strong> If battery is less than 40%, you may not be able to continue. Charge and return later.`,
            ],
          },
          { title: "Load Study and Start Study", body: `Once your watch is successfully connected, please press <b>Load Study</b>, then <b>Start Study</b>. Follow any additional instructions in the study.`, images: ["assets/app_battery.jpg", "assets/app_start_study.png"], layout: "two", note: `💡 <strong>Note:</strong> Battery information can fluctuate. This is normal.` },
        ],
      },
      {
        key: "finish",
        label: "Section 5.3: Uploading Data",
        items: [
          { title: "End of study (uploading your data)", body: `At the end of studies, you will need to upload your data. The next series of steps will guide you through the data uploading.`, warnings: ["⚠️ <strong>Warning:</strong> Please follow these instructions carefully to ensure your data is successfully uploaded!"] },
          { title: "First, remove watch + remove pads/cable", body: `
            <ol>
              <li>Unplug the white data collection cable from your watch.</li>
              <li>Peel off sticky pads and press them together.</li>
              <li>Unsnap cable from pads. Throw away pads; store the cable safely.</li>
              <li>Take off your DIRT watch.</li>
            </ol>
          `, images: [] },
          { title: "Next, plug in the watch", body: `Once you take off your watch, plug it in. If you are plugging in your device to a wall outlet, please make sure the DIRT watch is still close to your computer.`, images: ["assets/watch_plug_in.png"] },
          { title: "Then, start the uploading process while plugged in", body: `When your watch is plugged in, start the data upload.`, images: ["assets/app_data_upload_2.png"], warnings: ["⚠️ <strong>Warning:</strong> Please always plug in your device prior to uploading your data to ensure success!"] },
          { title: "Wait for your data to upload", body: `You will see this screen while your data uploads. This process may take a 2-5 minutes!`, images: ["assets/app_data_upload_3.png"], warnings: [`⚠️ <strong>Warning:</strong> Please keep your watch plugged in during this process. Do not navigate away from this screen during this process!`] },
          { title: "Success + post-study survey", body: `✅ <strong>Success!</strong> Once uploaded, you’ll return to the home screen. Exit the app and <b>complete the post-study survey</b>. The link to the survey was included in your announcement email and in Telegram. At this point, please store the watch safely, but <b>do not leave it plugged in long term</b>.`, images: [] },
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
      rootEl.querySelectorAll(".spp-tab").forEach((b) => b.classList.remove("active"));
      const active = rootEl.querySelector(`.spp-tab[data-spp-tab="${sectionIndex}"]`);
      if (active) active.classList.add("active");

      const section = SECTIONS[sectionIndex];
      const items = section.items;

      if (itemIndex >= items.length) itemIndex = items.length - 1;
      if (itemIndex < 0) itemIndex = 0;

      const item = items[itemIndex];
      const total = items.length;
      const pct = total > 1 ? Math.round((itemIndex / (total - 1)) * 100) : 100;

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
          <div class="spp-muted">${section.label} • Step ${itemIndex + 1} / ${items.length}</div>
          <div class="progress" role="progressbar" aria-label="Progress"
              aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
              style="height: 10px; margin-top: 10px;">
            <div class="progress-bar" style="width: ${pct}%"></div>
          </div>

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
      rootEl.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    function render() {
      rootEl.querySelectorAll(".spp-tab").forEach((b) => b.classList.remove("active"));
      const active = rootEl.querySelector(`.spp-tab[data-spp-tab="${sectionIndex}"]`);
      if (active) active.classList.add("active");

      if (viewMode === "all") return renderAllSteps();
      return renderStep();
    }

    render();
  };
})();
