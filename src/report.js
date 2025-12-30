// Downloadable report report.js
function formatQA(title, qaArray) {
    const lines = [];
    lines.push(title);
    qaArray.forEach(x => {
        lines.push(`- Question: ${x.q}`);
        lines.push(`  Response: ${x.a || "(no response)"}`);
    });
    lines.push("");
    return lines.join("\n");
}

function buildTxtSummary() {
    const lines = [];

    lines.push("Dark Blue Reset – Day 1");
    lines.push(`Date: ${new Date().toLocaleString()}`);

    // Profile
    if (dayMeta?.userProfile) {
        lines.push("");
        lines.push("Profile");
        lines.push(`- Name: ${dayMeta.userProfile.name || "-"}`);
        lines.push(`- Energy: ${dayMeta.userProfile.energy ?? "-"}`);
        lines.push(`- Priority: ${dayMeta.userProfile.priority || "-"}`);
        lines.push(`- Focus Hours (planned): ${dayMeta.focusHours ?? "-"}`);
    }

    // Mood
    if (dayMeta?.mood && MOOD_THEMES?.[dayMeta.mood]) {
        lines.push("");
        lines.push("Mood & Energy");

        const mood = MOOD_THEMES[dayMeta.mood];
        const boostPct = Math.round((mood.activityBoost - 1) * 100);

        lines.push(`- Selected Mood: ${mood.label}`);
        lines.push(`- Activity Adjustment: ${boostPct >= 0 ? "+" : ""}${boostPct}% (${mood.activityBoost.toFixed(1)}x)`);
        lines.push(`- Description: ${mood.description}`);
    }

    // Body condition
    if (dayMeta?.bodyCondition && BODY_CONDITIONS?.[dayMeta.bodyCondition]) {
        lines.push("");
        lines.push("Body Condition");

        const b = BODY_CONDITIONS[dayMeta.bodyCondition];
        const bAdjPct = Math.round((b.focusMultiplier - 1) * 100);

        lines.push(`- Condition: ${b.label}`);
        lines.push(`- Focus time multiplier: ${b.focusMultiplier}x (${bAdjPct >= 0 ? "+" : ""}${bAdjPct}%)`);
        lines.push(`- Note: ${b.note}`);
    }

    // Custom subjects
    if (Array.isArray(dayMeta?.customSubjects) && dayMeta.customSubjects.length) {
        lines.push("");
        lines.push("Custom Subjects");
        dayMeta.customSubjects.forEach(s => {
            lines.push(`- ${s.name} (${(s.checklist || []).length} checklist items)`);
        });
    }

    // Dice allocation
    if (dayMeta?.dice && typeof dayMeta.dice === "object") {
        lines.push("");
        lines.push("Focus Allocation (Dice)");
        Object.keys(dayMeta.dice).forEach(k => {
            lines.push(`- ${k}: ${dayMeta.dice[k]}%`);
        });
    }

    // Sessions
    if (Array.isArray(sessionLogs) && sessionLogs.length) {
        lines.push("");
        lines.push("Focus Sessions (Planned vs Actual)");

        sessionLogs.forEach(s => {
            const actualMin = s.actualSeconds ? (s.actualSeconds / 60).toFixed(1) : "0.0";
            lines.push(`- ${s.name}: planned ${s.plannedMinutes} min, actual ${actualMin} min (${s.status})`);

            if (s.notes) lines.push(`  Notes: ${s.notes}`);
            if (Array.isArray(s.questions) && s.questions.length) {
                lines.push(`  Qs/Todos: ${s.questions.join(" | ")}`);
            }
        });
    }

    // Notes
    if (Array.isArray(notes) && notes.length) {
        lines.push("");
        lines.push("Notes");

        notes.forEach(n => {
            const title = n.title ? ` — ${n.title}` : "";
            lines.push(`- [${n.type || "note"}${title}] step ${n.step ?? "?"}`);
        });
    }

    lines.push("");
    return lines.join("\n");
}

function showDownload() {
    clearUI();
    setProgress();

    const her = dayMeta?.userProfile?.name ? `, ${dayMeta.userProfile.name}` : "";

    const textEl = document.getElementById("text");
    if (textEl) {
        textEl.innerHTML = `🌙 Bravo! Nhark kaml b wa3i${her}. Tsb7i 3la khir 🌙`;
    }

    const subEl = document.getElementById("subtext");
    if (subEl) {
        subEl.innerHTML = "Download your daily report.";
    }

    const content = buildTxtSummary() || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `dark-blue-reset-day1-${new Date().toISOString().slice(0, 10)}.txt`;
    a.innerText = "⬇️ Download report (.txt)";
    a.className = "pill";
    a.style.display = "inline-block";
    a.style.margin = "8px auto";
    a.style.textAlign = "center";

    const res = document.getElementById("result");
    if (res) {
        res.style.display = "block";
        res.appendChild(a);
    }

    // Auto-trigger download (mobile/Safari)
    try { a.click(); } catch (e) {}

    setTimeout(() => URL.revokeObjectURL(url), 30000);

    const btns = document.getElementById("buttons");
    if (btns) {
        btns.appendChild(
            button("Restart", () => {
                if (typeof clearSavedState === "function") clearSavedState();

                stepIndex = 0;
                timerRemaining = 0;
                timerPaused = false;
                notes = [];
                currentAffirmationIx = 0;
                sessions = [];
                waves = { morning: [], afternoon: [], night: [] };
                runningQueue = [];
                runningIndex = -1;
                blockAccumMinutes = 0;
                activeSession = null;
                activeSessionExtra = null;
                sessionLogs = [];
                sessionIdCounter = 1;
                questionsBacklog = {};
                mealStatus = [];

                dayMeta = {
                    startTs: new Date().toISOString(),
                    userProfile: {},
                    focusHours: 4,
                    customSubjects: [],
                    dice: null
                };

                location.reload();
            }, "secondary")
        );
    }
}
