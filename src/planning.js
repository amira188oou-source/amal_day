// planning.js
function showPlanningForm(onDone) {
    clearUI();
    setProgress();

    const moodKey = dayMeta.mood || "calm";
    const moodBoost = MOOD_THEMES[moodKey]?.activityBoost ?? 1.0;

    const textEl = document.getElementById("text");
    const subEl = document.getElementById("subtext");
    const checklist = document.getElementById("checklist");

    if (!textEl || !subEl || !checklist) return;

    textEl.innerHTML = "⏱️ Gentle planning";
    subEl.innerHTML = `
        Check schedule, calculate time, reserve rest, choose focus sessions
        <br>
        <span class="note">
            Activity duration adjusted for your mood (${Math.round(moodBoost * 100)}%)
        </span>
    `;

    checklist.innerHTML = "";

    const makeField = (label, id) => {
        const f = document.createElement("div");
        f.className = "field";
        f.innerHTML = `
            <label>${label}</label>
            <textarea id="${id}"></textarea>
        `;
        return f;
    };

    checklist.append(
        makeField("Key commitments today (time blocks)", "plan-commit"),
        makeField("Rest & breaks reserved (describe)", "plan-rest"),
        makeField("Top 3 outcomes for today", "plan-outcomes")
    );

    // Custom subjects
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    wrapper.innerHTML = `<label>Add your focus subjects (optional)</label>`;

    const list = document.createElement("div");
    list.id = "custom-list";

    const addRow = document.createElement("div");
    addRow.className = "row";
    addRow.innerHTML = `
        <input type="text" id="cs-name" placeholder="Subject name (e.g., 🟡 Portfolio)">
        <textarea id="cs-tasks" placeholder="Checklist items, one per line"></textarea>
    `;

    const addBtn = button("Add Subject", () => {
        const name = document.getElementById("cs-name")?.value.trim();
        const tasksRaw = document.getElementById("cs-tasks")?.value || "";

        const tasks = tasksRaw
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean);

        if (!name || tasks.length === 0) return;

        dayMeta.customSubjects.push({ name, checklist: tasks });
        renderCustomList(list);

        document.getElementById("cs-name").value = "";
        document.getElementById("cs-tasks").value = "";
    }, "secondary");

    wrapper.append(addRow, addBtn, list);
    checklist.appendChild(wrapper);

    renderCustomList(list);

    const buttons = document.getElementById("buttons");
    if (buttons) {
        buttons.appendChild(
            button("Continue", () => {
                addNote({
                    type: "planning",
                    title: "Planning completed",
                    content: "Ready for focus sessions"
                });
                if (typeof saveAppState === "function") saveAppState();
                onDone && onDone();
            })
        );
    }
}

function renderCustomList(container) {
    container.innerHTML = "";

    if (!Array.isArray(dayMeta.customSubjects) || dayMeta.customSubjects.length === 0) {
        container.innerHTML = `<div class="note">No custom subjects added yet.</div>`;
        return;
    }

    dayMeta.customSubjects.forEach((s, idx) => {
        const item = document.createElement("div");
        item.className = "checklist-item";
        item.innerHTML = `<span>${s.name} — ${s.checklist.length} items</span>`;

        const rm = button("Remove", () => {
            dayMeta.customSubjects.splice(idx, 1);
            renderCustomList(container);
        }, "ghost");

        item.appendChild(rm);
        container.appendChild(item);
    });
}

// ===============================
// Mood selector
// ===============================
function showMoodSelector(onDone) {
    clearUI();
    setProgress();

    const textEl = document.getElementById("text");
    const subEl = document.getElementById("subtext");
    const container = document.getElementById("result");

    if (!textEl || !subEl || !container) return;

    textEl.innerHTML = "🌅 How are you feeling today?";
    subEl.innerHTML = `<span class="note">This will adjust activities and break length throughout your day</span>`;

    container.style.display = "block";
    container.innerHTML = "";

    Object.entries(MOOD_THEMES).forEach(([key, mood]) => {
        const [r, g, b] = hexToRgb(mood.primary);

        const card = document.createElement("div");
        card.style.cssText = `
            padding: 16px;
            margin: 8px 0;
            border-radius: 12px;
            background: rgba(${r}, ${g}, ${b}, 0.12);
            border: 2px solid ${mood.primary};
            cursor: pointer;
            transition: transform 0.2s ease;
        `;

        card.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">${mood.emoji}</div>
            <div style="font-weight: 600; margin-bottom: 4px;">${mood.label}</div>
            <div style="font-size: 13px; color: var(--muted);">${mood.description}</div>
        `;

        card.onmouseenter = () => card.style.transform = "scale(1.03)";
        card.onmouseleave = () => card.style.transform = "scale(1)";
        card.onclick = () => {
            dayMeta.mood = key;
            applyMoodTheme(key);
            addNote({ type: "mood", title: "Mood selected", content: mood.label });
            if (typeof saveAppState === "function") saveAppState();
            showPlanningForm(onDone);
        };

        container.appendChild(card);
    });
}

// ===============================
// Theme application
// ===============================
function applyMoodTheme(moodKey) {
    const t = MOOD_THEMES[moodKey] || MOOD_THEMES.calm;
    const r = document.documentElement;

    r.style.setProperty("--primary", t.primary);
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--bg", t.bg);
    r.style.setProperty("--card", t.card);

    r.style.setProperty("--surface-1", t.card);
    r.style.setProperty("--surface-2", t.card);
    r.style.setProperty("--surface-3", t.card);

    const [pr, pg, pb] = hexToRgb(t.primary);
    const [ar, ag, ab] = hexToRgb(t.accent);

    r.style.setProperty("--primary-10", `rgba(${pr}, ${pg}, ${pb}, 0.10)`);
    r.style.setProperty("--primary-20", `rgba(${pr}, ${pg}, ${pb}, 0.20)`);
    r.style.setProperty("--accent-10", `rgba(${ar}, ${ag}, ${ab}, 0.10)`);
    r.style.setProperty("--accent-20", `rgba(${ar}, ${ag}, ${ab}, 0.20)`);

    localStorage.setItem("userMood", moodKey);
}

function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    return m
        ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
        : [127, 127, 127];
}

// ===============================
// Persistence helpers
// ===============================
function loadMoodTheme() {
    const saved = localStorage.getItem("userMood");
    if (saved && MOOD_THEMES[saved]) {
        dayMeta.mood = saved;
        applyMoodTheme(saved);
    }
}

function applyBodyCondition(bodyKey) {
    if (!BODY_CONDITIONS[bodyKey]) return;

    dayMeta.bodyCondition = bodyKey;
    localStorage.setItem("userBodyCondition", bodyKey);

    const note = BODY_CONDITIONS[bodyKey].note;
    const res = document.getElementById("result");

    if (note && res) {
        const prev = res.querySelector(".body-note");
        if (prev) prev.remove();

        const info = document.createElement("div");
        info.className = "note body-note";
        info.style.marginTop = "8px";
        info.innerText = `Body: ${BODY_CONDITIONS[bodyKey].label} — ${note}`;

        res.style.display = "block";
        res.appendChild(info);
    }
}

function loadBodyCondition() {
    const saved = localStorage.getItem("userBodyCondition");
    if (saved && BODY_CONDITIONS[saved]) {
        applyBodyCondition(saved);
    }
}
