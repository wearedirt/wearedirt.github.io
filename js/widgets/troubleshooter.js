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
            { label: "My device is not charging or dying quickly after charging for a while.", next: "r_notcharging" },
            { label: "I am getting the error ''Error reading device status, please try again''", next: "r_errorstatus" },
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
            { label: "Pop up error regarding: ''Win_ble_server.exe - System error''", next: "r_winble" },
          ],
        },
        r_notcharging: {
          type: "result",
          title: "Watch charging issue",
          text: "Please refer to Section 2 to look at instructions on how to charge your DIRT watch. Please be attentive to the LED light behind the watch, which will let you know whether or not your watch is receiving charge. The LED light should be a SOLID red light and not rapidly blinking red when you plug in your device to charge. PLEASE NOTE: only the DIRT App can provide the true battery level of your DIRT Watch. The Windows bluetooth manager will not report a correct battery level (as many will say 0%). If your device continues to have charging issues, please reach out to your panel management team and let them know ASAP. ",
        },
        r2: {
          type: "result",
          title: "Unable to pair with Bluetooth",
          text: "Please go through Windows Update to ensure your Windows System is up to date, including your Bluetooth driver. After you have completed such updates, please try pairing your DIRT watch again using the instructions provided in Section 3.",
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
                the DIRT App froze during any part of the study, please quit out and restart the study. PLEASE NOTE: when running a study, close out of all other applications and internet browsers as these may interfere and cause the DIRT App to crash.",
        },
        r_winble: {
          type: "result",
          title: "I got a popup that says: ''Win_ble_server.exe - System error'' or a similar error",
          text: "1) Uninstall the Dirt app. 2) Go to the following link (https://www.techpowerup.com/download/visual-c-redistributable-runtime-package-all-in-one/) and press the blue Download button on the left-hand side of the page. Save the .zip file to your desktop and right-click and unzip or extract the file. In the new unzipped folder, launch ''install_all.bat.'' Go through all the installations to repair your C++ packages. 3) Reinstall the Dirt app.",
        },
        r_errorstatus: {
          type: "result",
          title: "I am getting the error ''Error reading device status, please try again''",
          text: "Please reach out to your panel management team and ask them to show you how to remove the battery from your device to do a hard reset. This should help resolve this issue.",
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
