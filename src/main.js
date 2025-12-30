// Main flow main.js
function next() {
    if (mainFlowLocked) return;
    mainFlowLocked = true;
    setTimeout(() => mainFlowLocked = false, 150);

    stopTimer();
    stepIndex++;
    setProgress();

    switch (stepIndex) {
        case 1: stepGrounding(); break;
        case 2: stepSilence(); break;
        case 3: stepBreathing(); break;
        case 4: stepMorningWalk(); break;
        case 5: stepAffirmations(); break;
        case 6: stepMorningAudio(); break;
        case 7: stepTransition(); break;
        case 8: stepQuranMemo(); break;
        case 9: stepQuranReading(); break;
        case 10: stepMoodSelector(); break;
        case 11: stepDiceRoller(); break;
        case 12: stepMorningWave(); break;
        case 13: stepBreak(); break;
        case 14: stepLunch(); break;
        case 15: stepAfternoonWave(); break;
        case 16: stepWriting(); break;
        case 17: stepResearch(); break;
        case 18: stepPause(); break;
        case 19: stepEnergyReset(); break;
        case 20: stepEvening(); break;
        case 21: stepNightWave(); break;
        case 22: stepAffirmationReview(); break;
        case 23: stepJournalChallenge(); break;
        case 24: stepJournalWins(); break;
        case 25: stepJournalReflection(); break;
        case 26: stepCongrats(); break;
        case 27: stepEndOfDay(); break;
        default: showDownload(); break;
    }
}

(function init() {
    const h = new Date().getHours();
    const title = document.getElementById("title");
    if (h < 12) title.innerHTML = "Reset – Morning";
    else if (h < 18) title.innerHTML = "Reset – Afternoon";
    else title.innerHTML = "Reset – Night";


    // Restore last saved state for today (if any)
    const saved = (typeof loadAppState === "function") ? loadAppState() : null;
    console.log("Saved state:", saved);

    if (saved) {
        if (typeof saved.dayMeta === "object") dayMeta = Object.assign(dayMeta, saved.dayMeta);
        if (Array.isArray(saved.sessions)) sessions = saved.sessions;
        if (saved.waves) waves = saved.waves;
        if (Array.isArray(saved.sessionLogs)) sessionLogs = saved.sessionLogs;
        if (Array.isArray(saved.mealStatus)) mealStatus = saved.mealStatus;
        if (typeof saved.stepIndex === "number") {
            stepIndex = saved.stepIndex;
        }
        if (typeof saved.timerRemaining === "number") {
            timerRemaining = saved.timerRemaining;
            console.log("Restored timerRemaining:", timerRemaining);
        }
    }

    loadMealStatus();
    if (typeof showNextMealNotification === "function") showNextMealNotification();

    // **RESTORE MOOD THEME BEFORE RENDERING**
    if (dayMeta.mood && typeof applyMoodTheme === "function") {
        applyMoodTheme(dayMeta.mood);
    }

    // **RESTORE BODY CONDITION BEFORE RENDERING**
    if (dayMeta.bodyCondition && typeof applyBodyCondition === "function") {
        applyBodyCondition(dayMeta.bodyCondition);
    }

    // If state was restored, jump directly to the saved step — skip profile/setup
    if (saved && saved.stepIndex > 0) {
        console.log("Calling renderCurrentStep with stepIndex:", stepIndex, "timerRemaining:", timerRemaining);
        renderCurrentStep();
    } else {
        // First time: show profile → setup → flow
        askProfile(() => {
            showSetup(() => {
                if (stepIndex <= 0) stepIndex = 0;
                next();
            });
        });
    }
})();

function renderCurrentStep() {
    const step = stepIndex;

    switch (step) {
        case 1: restoreGrounding(); break;
        case 2: restoreSilence(); break;
        case 3: render({ text: "🌬️ Deep breathing (6 times)", subtext: `<span class="note">Inhale 4, hold 2, exhale 6.</span>`, buttons: [{ label: "Done", action: next }] }); break;
        case 4: stepMorningWalk(); break;
        case 5: stepAffirmations(); break;
        case 6: restoreMorningAudio(); break;
        case 7: stepTransition(); break;
        case 8: restoreQuranMemo(); break;
        case 9: restoreQuranReading(); break;
        case 10: stepMoodSelector(); break;
        case 11: stepDiceRoller(); break;
        case 12: stepMorningWave(); break;
        case 13: restoreBreak(); break;
        case 14: stepLunch(); break;
        case 15: stepAfternoonWave(); break;
        case 16: restoreWriting(); break;
        case 17: restoreResearch(); break;
        case 18: restorePause(); break;
        case 19: stepEnergyReset(); break;
        case 20: restoreEvening(); break;
        case 21: stepNightWave(); break;
        case 22: stepAffirmationReview(); break;
        case 23: stepJournalChallenge(); break;
        case 24: stepJournalWins(); break;
        case 25: stepJournalReflection(); break;
        case 26: stepCongrats(); break;
        case 27: stepEndOfDay(); break;
        default: showDownload(); break;
    }
}