// js/widgets/installAppWizard.js
(() => {
  window.App = window.App || {};
  window.App.Widgets = window.App.Widgets || {};

  window.App.Widgets.initInstallAppWizard = function initInstallAppWizard(rootEl) {
    const SECTIONS = [
      {
        key: "download",
        label: "Download",
        title: "Download the most current DIRT App",
        bodyHtml: `
          <p>You can download the latest version of the DIRT App
            <a href="https://dirtresearchtechnologiesinc.box.com/s/9vhw17v5ti5b64qhj6xsowl8rjc0vvxp" target="_blank" rel="noopener noreferrer">here</a>.
          </p>
          <div class="alert alert-info" role="alert">
            💡 <strong>Note:</strong> The current version of the DIRT App is <b>1.0.20</b>.
          </div>
        `,
        images: [],
      },
      {
        key: "install",
        label: "Install",
        title: "Installing the DIRT App",
        bodyHtml: `
          <p>
            The DIRT App is installed via a <code>.msix</code> file named
            <code>dt_pres_v1.0.20.msix</code>.
            Once you have downloaded the installation file, double click on it to initiate the installation process.
            You will see the following screen:
          </p>
        `,
        images: [
          { src: "assets/app_install.png", width: "600px", alt: "App install" },
        ],
        afterHtml: `
          <p style="margin-top:12px;">
            If you have previously installed the DIRT App, you will instead see the following screen with the option to "Update" instead of "Install".
          </p>
        `,
        afterImages: [
          { src: "assets/app_update.png", width: "600px", alt: "Update App" },
        ],
        afterHtml2: `
          <p style="margin-top:12px;">
            Press <b>Install</b> or <b>Update</b> to install the DIRT App. Once the app has been installed, it will launch in full screen and look similar to the image below.
            For now, you are all done with the set up! Please exit the DIRT App using the exit button at the top right corner. You can access the DIRT App anytime you need to participate in a study. 
            Please read the next section to see how to access the DIRT App from your computer.
          </p>
        `,
        afterImages2: [
          { src: "assets/app_1.png", width: "1000px", alt: "App launched" },
        ]
      },
      {
        key: "reopen",
        label: "Accessing the DIRT App",
        title: "Accessing the DIRT App",
        bodyHtml: `
          <p>To access the DIRT App moving forward, you can access it by:</p>
          <ol>
            <li>Press the ⊞ Windows button</li>
            <li>Type in <b>DIRT Research App</b></li>
            <li>Select the DIRT App from the "Best match" list or click on "Open" (either works)</li>
          </ol>

          <div class="alert alert-info" role="alert">
            💡 <strong>Tip:</strong> You can also pin the DIRT Research App to your Start menu and/or Taskbar for quicker access moving forward.
            Doing so will place the app into your start menu once you press the ⊞ Windows button or into your taskbar at the bottom of your screen.
          </div>
        `,
        images: [
          { src: "assets/app_open.png", width: "600px", alt: "App open" },
          { src: "assets/app_pin.png", width: "600px", alt: "App pinned" },
        ],
      }
    ];

    let sectionIndex = 0;

    rootEl.innerHTML = `
      <style>
        .ia-card { border:1px solid #ddd; border-radius:12px; padding:16px; max-width:1100px; }
        .ia-tabs { display:flex; gap:10px; flex-wrap:wrap; margin-top:10px; }
        .ia-tab { border:1px solid #ccc; background:#fff; border-radius:999px; padding:8px 12px; cursor:pointer; }
        .ia-tab:hover { background:#f6f6f6; }
        .ia-tab.active { background:#f1f1f1; }
        .ia-muted { color:#666; font-size:13px; }
        .ia-img { max-width:100%; border-radius:10px; border:1px solid #ddd; margin-top:10px; }
        .ia-nav { display:flex; gap:10px; flex-wrap:wrap; margin-top:14px; }
        .ia-btn { border:1px solid #ccc; background:#fff; border-radius:10px; padding:10px 12px; cursor:pointer; }
        .ia-btn:hover { background:#f6f6f6; }
      </style>

      <div class="ia-card">
        <div class="ia-muted">Click a step to jump:</div>
        <div class="ia-tabs">
          ${SECTIONS.map((s, i) => `<button type="button" class="ia-tab" data-ia-tab="${i}">${s.label}</button>`).join("")}
        </div>

        <div id="ia-stage" style="margin-top:14px;"></div>

        <div class="ia-nav">
          <button type="button" class="ia-btn" data-ia-action="prev">← Back</button>
          <button type="button" class="ia-btn" data-ia-action="next">Next →</button>
          <button type="button" class="ia-btn" data-ia-action="all">Show all</button>
        </div>
      </div>
    `;

    const stage = rootEl.querySelector("#ia-stage");

    rootEl.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-ia-tab]")?.getAttribute("data-ia-tab");
      if (tab !== undefined && tab !== null) {
        sectionIndex = Number(tab);
        render();
        return;
      }

      const action = e.target.closest("[data-ia-action]")?.getAttribute("data-ia-action");
      if (!action) return;

      if (action === "prev") {
        sectionIndex = Math.max(0, sectionIndex - 1);
        render();
      } else if (action === "next") {
        sectionIndex = Math.min(SECTIONS.length - 1, sectionIndex + 1);
        render();
      } else if (action === "all") {
        renderAll();
      }
    });

    function setActiveTab() {
      rootEl.querySelectorAll(".ia-tab").forEach((b) => b.classList.remove("active"));
      const active = rootEl.querySelector(`.ia-tab[data-ia-tab="${sectionIndex}"]`);
      if (active) active.classList.add("active");
    }

    function imgBlock(img) {
      return `<img src="${img.src}" alt="${img.alt || ""}" class="ia-img" style="${img.width ? `width:${img.width};` : ""}" />`;
    }

    function render() {
      setActiveTab();
      const s = SECTIONS[sectionIndex];

      const imgs = (s.images || []).map(imgBlock).join("");
      const afterImgs = (s.afterImages || []).map(imgBlock).join("");
      const afterImgs2 = (s.afterImages2 || []).map(imgBlock).join("");

      const total = SECTIONS.length;
      const pct = total > 1 ? Math.round((sectionIndex / (total - 1)) * 100) : 100;

      stage.innerHTML = `
        <div class="ia-muted">Step ${sectionIndex + 1} / ${SECTIONS.length}</div>
        <div class="progress" role="progressbar" aria-label="Progress"
            aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
            style="height: 10px; margin-top: 10px;">
          <div class="progress-bar" style="width: ${pct}%"></div>
        </div>

        <h2 style="margin:6px 0 10px 0;">${s.title}</h2>
        <div>${s.bodyHtml || ""}</div>
        ${imgs ? `<div>${imgs}</div>` : ""}

        ${s.afterHtml ? `<div style="margin-top:12px;">${s.afterHtml}</div>` : ""}
        ${afterImgs ? `<div>${afterImgs}</div>` : ""}
        ${s.afterHtml2 ? `<div style="margin-top:12px;">${s.afterHtml2}</div>` : ""}
        ${afterImgs2 ? `<div>${afterImgs2}</div>` : ""}
      `;

      // Disable nav buttons at ends
      const prevBtn = rootEl.querySelector('[data-ia-action="prev"]');
      const nextBtn = rootEl.querySelector('[data-ia-action="next"]');
      if (prevBtn) prevBtn.disabled = sectionIndex === 0;
      if (nextBtn) nextBtn.disabled = sectionIndex === SECTIONS.length - 1;
    }

    function renderAll() {
      setActiveTab();
      stage.innerHTML = `
        <h2 style="margin:6px 0 12px 0;">All steps</h2>
        <ol>
          ${SECTIONS.map((s, i) => {
            const imgs = (s.images || []).map(imgBlock).join("");
            const afterImgs = (s.afterImages || []).map(imgBlock).join("");
            return `
              <li style="margin-bottom:18px;">
                <div class="ia-muted">Step ${i + 1}</div>
                <div><strong>${s.title}</strong></div>
                <div style="margin-top:8px;">${s.bodyHtml || ""}</div>
                ${imgs ? `<div>${imgs}</div>` : ""}
                ${s.afterHtml ? `<div style="margin-top:12px;">${s.afterHtml}</div>` : ""}
                ${afterImgs ? `<div>${afterImgs}</div>` : ""}
                ${s.afterHtml2 ? `<div style="margin-top:12px;">${s.afterHtml2}</div>` : ""}
                ${afterImgs2 ? `<div>${afterImgs2}</div>` : ""}
              </li>
            `;
          }).join("")}
        </ol>
      `;
    }

    render();
  };
})();
