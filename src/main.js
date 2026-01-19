// src/main.js — main flow with centralized step config
let returnStepAfterWork = null;
function finishWork(type, title) {
  const notes = document.getElementById("fw-notes")?.value || "";
  const mins = document.getElementById("fw-min")?.value || "";

  addNote({
    type,
    title,
    content: notes,
    meta: {
      duration: mins,
      date: new Date().toLocaleString()
    }
  });

  if (typeof saveAppState === "function") saveAppState();

  // back 
  if (returnStepAfterWork !== null) {
    stepIndex = returnStepAfterWork;
    returnStepAfterWork = null;
    renderCurrentStep();
  }
}


function loadStateFromURL() {
  const p = new URLSearchParams(location.search);
  const encoded = p.get("state");
  if (!encoded) return null;
  try {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function isSameDay(ts) {
  if (!ts) return false;
  const d1 = new Date(ts);
  const d2 = new Date();
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function next() {
  if (typeof removeFloatingNext === "function") removeFloatingNext();
  if (mainFlowLocked) return;
  mainFlowLocked = true;
  setTimeout(() => (mainFlowLocked = false), 150);
  stopTimer();
  stepIndex++;
  setProgress();
  if (typeof runStepAt === "function") runStepAt(stepIndex);
  else showDownload();
}

(function init() {
  const h = new Date().getHours();
  const title = document.getElementById("title");
  if (title) {
    if (h < 12) title.innerHTML = "The Journey – Morning";
    else if (h < 18) title.innerHTML = "The Journey – Afternoon";
    else title.innerHTML = "The Journey – Night";
  }

  // Restore state: URL → localStorage
  let saved = null;
  const urlState = loadStateFromURL();
  if (urlState && isSameDay(urlState.dayMeta?.startTs)) {
    saved = urlState;
    console.log("Restored state from URL (same day)");
  } else {
    const local = (typeof loadAppState === "function") ? loadAppState() : null;
    if (local && isSameDay(local.dayMeta?.startTs)) {
      saved = local;
      console.log("Restored state from localStorage (same day)");
    } else {
      console.log("New day detected → starting fresh");
    }
  }

  if (saved) {
    if (typeof saved.dayMeta === "object") dayMeta = Object.assign(dayMeta, saved.dayMeta);
    if (Array.isArray(saved.sessions)) sessions = saved.sessions;
    if (saved.waves) waves = saved.waves;
    if (Array.isArray(saved.sessionLogs)) sessionLogs = saved.sessionLogs;
    if (Array.isArray(saved.mealStatus)) mealStatus = saved.mealStatus;
    if (typeof saved.stepIndex === "number") stepIndex = saved.stepIndex;
    if (typeof saved.timerRemaining === "number") {
      timerRemaining = saved.timerRemaining;
      console.log("Restored timerRemaining:", timerRemaining);
    }
  }

  loadMealStatus();
  if (typeof showNextMealNotification === "function") showNextMealNotification();
  if (dayMeta.bodyCondition && typeof applyBodyCondition === "function") {
    applyBodyCondition(dayMeta.bodyCondition);
  }

  if (saved && saved.stepIndex > 0) {
    console.log("Restoring stepIndex:", stepIndex, "timerRemaining:", timerRemaining);
    renderCurrentStep();
  } else {
    askProfile(() => {
      showSetup(() => {
        if (stepIndex <= 0) stepIndex = 0;
        next();
      });
    });
  }
})();

function openOther() {
  returnStepAfterWork = stepIndex;
  clearUI();

  render({
    text: "📌 Mandatory Task",
    subtext: "Take care of this, your flow will be waiting"
  });

  const c = document.getElementById("checklist");
  c.innerHTML = `
    <div class="field">
      <label>Duration (minutes)</label>
      <input id="fw-min" type="number" min="5" value="25">
    </div>
    <div class="field">
      <label>What do you have to do?</label>
      <textarea id="fw-notes"></textarea>
    </div>
  `;

  const btns = document.getElementById("buttons");
  btns.innerHTML = "";

  // START
  btns.appendChild(
    button("Start", () => {
      const mins = Number(document.getElementById("fw-min").value || 25);

      startTimer(mins, () => {
        btns.innerHTML = "";
        btns.appendChild(
          button("DONE", () => {
            finishWork("free-other", "Mandatory Task");
          }, "primary")
        );
      });
    })
  );

  // BACK no save
  btns.appendChild(
    button("Back", () => {
      if (typeof stopTimer === "function") stopTimer();

      if (returnStepAfterWork !== null) {
        stepIndex = returnStepAfterWork;
        returnStepAfterWork = null;
        renderCurrentStep();
      }
    }, "ghost")
  );
}


function openFreeWork() {
  returnStepAfterWork = stepIndex;
  clearUI();

  render({
    text: "⏱️ Free Work Session",
    subtext: "Focus freely. When you’re done, click Done to return"
  });

  const c = document.getElementById("checklist");
  c.innerHTML = `
    <div class="field">
      <label>Duration (minutes)</label>
      <input id="fw-min" type="number" min="5" value="25">
    </div>
    <div class="field">
      <label>What are you working on?</label>
      <textarea id="fw-notes"></textarea>
    </div>
  `;

  const btns = document.getElementById("buttons");
  btns.innerHTML = "";

  // START
  btns.appendChild(
    button("Start Work", () => {
      const mins = Number(document.getElementById("fw-min").value || 25);

      startTimer(mins, () => {
        // ⏰end time
        btns.innerHTML = "";
        btns.appendChild(
          button("DONE", () => {
            finishWork("free-work", "Free Work Session");
          }, "primary")
        );
      });
    })
  );

  // BACK withou save
  btns.appendChild(
    button("Back", () => {
      if (typeof stopTimer === "function") stopTimer();

      if (returnStepAfterWork !== null) {
        stepIndex = returnStepAfterWork;
        returnStepAfterWork = null;
        renderCurrentStep();
      }
    }, "ghost")
  );
}



function renderCurrentStep() {
  if (typeof restoreStepAt === "function") restoreStepAt(stepIndex);
  else showDownload();
}