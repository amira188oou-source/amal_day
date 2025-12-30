// Restore step handlers — for when page refreshes

function restoreGrounding() {
    const her = dayMeta.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";
    if (appConfig.fasting) {
        const act = getAdaptiveActivity("grounding") || "🧘‍♀️ Ground yourself (2 min)";
        render({ text: `${act}${her}`, subtext: `<span class="pill">2 minutes</span>` , center: true});
        startOrResume(2, next);
    } else {
        const act = getAdaptiveActivity("hydration") || "💧 Drink water (2 min)";
        render({ text: `${act}${her}`, subtext: `<span class="pill">2 minutes</span>` , center: true });
        startOrResume(2, next);
    }
}

function restoreSilence() {
    const act = getAdaptiveActivity("silence") || "🧘‍♀️ Sit silently (2 min)";
    render({ text: act, subtext: `<span class="pill">2 minutes</span>` , center: true });
    startOrResume(2, next);
}

function restoreMorningAudio() {
    const act = getAdaptiveActivity("morningAudio") || "🎧 Listen to calming audio (5 min)";
    render({ text: act, subtext: `<span class="pill">5 minutes</span>` , center: true});
    startOrResume(5, next);
}

function restoreQuranMemo() {
    render({ text: "📖 Quran memorization", subtext: `<span class="pill">15 minutes</span>`  , center: true});
    startOrResume(15, next);
}

function restoreQuranReading() {
    render({ text: "📖 Quran reading + Adkar Sabah", subtext: `<span class="pill">15 minutes</span>` , center: true});
    startOrResume(15, () => askReflection("morning", next));
}

function restoreLunch() {
    if (appConfig.fasting && isBeforeIftar()) {
        render({
            text: "🧘 Midday reset",
            subtext: `<span class="pill">10 minutes</span>`,
            buttons: [{ label: "Start 10 min", action: () => startTimer(10, next) }], center: true
        });
        if (timerRemaining > 0) resumeTimer(next);
    } else {
        render({
            text: "🍽️ Lunch break",
            subtext: `<span class="pill">20–30 minutes</span>`,
            buttons: [
                { label: "Start 25 min", action: () => startTimer(25, next) },
                { label: "Skip", variant: "secondary", action: next }
            ], center: true
        });
        if (timerRemaining > 0) resumeTimer(next);
    }
}

function restoreWriting() {
    render({
        text: "✍️ Writing: reflect on people who look down on themselves",
        subtext: `<span class="pill">25–50 minutes</span>`, center: true
    });
    startOrResume(30, next);
}

function restoreResearch() {
    render({
        text: "💻 Research",
        subtext: `<span class="pill">25–50 minutes</span>`, center: true
    });
    startOrResume(30, next);
}

function restorePause() {
    const pauseDur = getPauseDurationByMood();
    const pauseActivity = pickActivityByMood("pause") || "🌬️ Breathe";
    render({
        text: pauseActivity,
        subtext: `<span class="pill">${pauseDur} minutes</span>`, center: true
    });
    startOrResume(pauseDur, next);
}

function restoreEvening() {
    if (appConfig.fasting) {
        render({
            text: "📖 Quran reading & Adkar",
            subtext: `<span class="pill">15 minutes</span>`, center: true
        });
        document.getElementById("buttons").appendChild(button("Start 15 min", () => startTimer(15, next)));
        document.getElementById("buttons").appendChild(button("Or do an energy reset", next, "secondary"));
        if (timerRemaining > 0) resumeTimer(next);
    } else {
        render({
            text: "🎧 Listen to relaxing audio or podcast",
            buttons: [{ label: "Done", action: next }], center: true
        });
    }
}

function restoreBreak() {
    const breakDur = getBreakDurationByMood();
    const breakActivity = pickActivityByMood("break") || randomEnergy();
    render({
        text: breakActivity,
        subtext: `<span class="pill">${breakDur} minutes</span>`,
        buttons: [
            { label: "Start", action: () => startTimer(breakDur, next) },
            { label: "Skip", variant: "secondary", action: next }
        ], center: true
    });
    if (timerRemaining > 0) startOrResumeTimer(breakDur, next);
}

// ===============================
// Helper function for restore
// ===============================
function startOrResume(minutes, onEnd) {
    const wasTimerRunning = timerRemaining > 0;
    
    if (wasTimerRunning && typeof resumeTimer === "function") {
        resumeTimer(onEnd);
    } else {
        startTimer(minutes, onEnd);
    }
}