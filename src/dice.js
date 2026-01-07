// dice.js — allocation and session building

// Random proportional allocation that sums to 100 (integers)
function allocatePercents(subjects) {
  const w = subjects.map(() => Math.random() + 0.1);
  const sum = w.reduce((a, b) => a + b, 0);
  const raw = w.map(x => (x / sum) * 100);
  const ints = raw.map(x => Math.floor(x));
  let rem = 100 - ints.reduce((a, b) => a + b, 0);
  const frac = raw
    .map((x, i) => ({ i, f: x - ints[i] }))
    .sort((a, b) => b.f - a.f);
  for (let k = 0; k < rem; k++) {
    ints[frac[k % frac.length].i]++;
  }
  for (let i = 0; i < ints.length; i++) {
    if (ints[i] === 0) ints[i] = 1;
  }
  let total = ints.reduce((a, b) => a + b, 0);
  while (total > 100) {
    for (let i = 0; i < ints.length && total > 100; i++) {
      if (ints[i] > 1) {
        ints[i]--;
        total--;
      }
    }
  }
  return ints;
}

// Split minutes into chunks up to maxChunk; merge tiny tail instead of forcing a floor
function clampSessionMinutes(mins, { maxChunk = 50, minTailMerge = 10 } = {}) {
  const out = [];
  const total = Math.round(Number(mins) || 0);
  if (total <= 0) return out;
  if (total <= maxChunk) return [total];
  let remaining = total;
  while (remaining > maxChunk) {
    out.push(maxChunk);
    remaining -= maxChunk;
  }
  if (remaining > 0) {
    if (out.length && remaining < minTailMerge) {
      out[out.length - 1] += remaining;
    } else {
      out.push(remaining);
    }
  }
  return out;
}

// Build sessions using a fixed total minute budget (focusHours * multipliers)
function buildSessionsFromDice() {
  const base = appConfig.baseSubjectsEditable || [];
  const customs = Array.isArray(dayMeta.customSubjects) ? dayMeta.customSubjects : [];
  const all = [...base, ...customs];

  const focusHours = Number(dayMeta.focusHours) || 0;
  const moodBoost = dayMeta.mood ? (MOOD_THEMES[dayMeta.mood]?.activityBoost || 1.0) : 1.0;
  const bodyMult = dayMeta.bodyCondition ? (BODY_CONDITIONS[dayMeta.bodyCondition]?.focusMultiplier || 1.0) : 1.0;
  const combinedMultiplier = moodBoost * bodyMult;

  const totalFocusMinutes = Math.max(0, Math.round(focusHours * 60 * combinedMultiplier));

  const perc = allocatePercents(all);

  sessions = [];
  sessionIdCounter = 1;
  dayMeta.dice = {};

  for (let i = 0; i < all.length; i++) {
    const p = perc[i];
    dayMeta.dice[all[i].name] = p;
    const subjectMins = Math.round((totalFocusMinutes * p) / 100);
    const chunks = clampSessionMinutes(subjectMins);
    chunks.forEach(m =>
      sessions.push({
        id: sessionIdCounter++,
        name: all[i].name,
        checklist: all[i].checklist,
        minutes: m
      })
    );
  }

  // Shuffle sessions randomly so order is not predictable
  for (let i = sessions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sessions[i], sessions[j]] = [sessions[j], sessions[i]];
  }
}

// Assign sessions into morning/afternoon/night; cap night minutes if fasting
function distributeWaves() {
  waves = { morning: [], afternoon: [], night: [] };
  const ifFasting = appConfig.fasting;

  const biases = [
    [0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 1, 0], // more morning
    [0, 1, 2, 0, 1, 2, 0, 1, 2], // balanced
    [1, 0, 1, 2, 0, 1, 2, 1, 0] // varied
  ];

  const bias = biases[Math.floor(Math.random() * biases.length)];

  sessions.forEach((s, idx) => {
    const slot = bias[idx % bias.length];
    if (slot === 0) waves.morning.push(s);
    else if (slot === 1) waves.afternoon.push(s);
    else waves.night.push(s);
  });

  if (ifFasting) {
    waves.night.forEach(ss => {
      ss.minutes = Math.min(ss.minutes, 25);
    });
  }
}