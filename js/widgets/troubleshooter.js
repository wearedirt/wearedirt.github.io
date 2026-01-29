// js/widgets/troubleshooter.js
(() => {
  window.App = window.App || {};
  window.App.Widgets = window.App.Widgets || {};

  window.App.Widgets.initTroubleshooter = function initTroubleshooter(rootEl) {
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
            { label: "My DIRT watch is not being detected by the DIRT App.", next: "r_watch_cannotdetect" },
            { label: "My device is not charging.", next: "r1" },
            { label: "My device is dying really quickly even after charging for a while.", next: "r1" },
          ],
        },
        dirt_app: {
          type: "question",
          title: "What problems are you having with the DIRT App?",
          text: "Choose what best matches your situation.",
          choices: [
            { label: "I am getting an error with the provided Study Code.", next: "r_studycode" },
            { label: "The DIRT watch cannot be detected by the DIRT app.", next: "r_watch_cannotdetect" },
            { label: "I cannot press the ''Load Study'' button.", next: "r_loadstudy_inactive" },
            { label: "The DIRT App froze during a study.", next: "r_appfroze_midstudy" },
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
        r_pairing_issue: {
          type: "result",
          title: "Issues with pairing your DIRT watch",
          text: "Please make sure you don't have any extra spaces at the beginning or at the end of the Study Code. Also, please make sure the hyphen in the study code is a hyphen (-) rather than an em dash (—)",
        },
        r_studycode: {
          type: "result",
          title: "Issues with Study Code",
          text: "Please make sure you don't have any extra spaces at the beginning or at the end of the Study Code. Also, please make sure the hyphen in the study code is a hyphen (-) rather than an em dash (—)",
        },
        r_watch_cannotdetect: {
          type: "result",
          title: "Issues with the DIRT App detecting your DIRT watch",
          text: "Close the DIRT app then go to Bluetooth settings to un-pair the DIRT watch. Do a full restart of your computer and pair the watch again in your Bluetooth settings. Relaunch the DIRT App and re-attempt device connection. Please note that sometimes it does take a little for the DIRT App to detect your watch, especially if you're sitting further away from your computer.",
        },
        r_loadstudy_inactive: {
          type: "result",
          title: "Cannot press the ''Load Study'' button.",
          text: "You need to provide valid Study Code AND connect your DIRT watch before the ''Load Study'' button can be pressed.",
        },
        r_appfroze_midstudy: {
          type: "result",
          title: "DIRT App froze during a study",
          text: "We apologize for the inconvenience. If the DIRT App froze during data upload, please quit out and email your panel administator to let them know that this had happened. You will still be credited for your participation when we can confirm of such occurrence. However, if \
                the DIRT App froze during any part of the study, please quit out and restart the study.",
        },
        contact_recruit: {
          type: "result",
          title: "Contact your panel administrator or recruiter.",
          text: "For issues related to 1) running low on stickies, 2) lost or damaged device/accessories, or 3) general questions about the panel and/or payments, please reach out to your panel adminstrator.",
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
  };
})();
