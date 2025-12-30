function showAffirmations(onDone) {
    if (currentAffirmationIx >= affirmationsArabic.length) {
        onDone();
        return;
    }

    // Get mood-based affirmations
    const mood = dayMeta.mood || "calm";
    const affirmList = AFFIRMATIONS[mood]?.english || affirmationsEnglish;
    const affirmation = affirmList[currentAffirmationIx % affirmList.length];

    // Also get Arabic version if available
    const affirmArabic = AFFIRMATIONS[mood]?.arabic?.[currentAffirmationIx % affirmList.length] || "✨";

    clearUI();
    setProgress();

    document.getElementById("text").innerHTML = affirmation;
    document.getElementById("subtext").innerHTML = `<span class="note">${affirmArabic}</span>`;

    const res = document.getElementById("result");
    res.style.display = "block";
    res.innerHTML = "";

    const affirmCard = document.createElement("div");
    affirmCard.className = "affirm";
    affirmCard.innerHTML = `
        <div style="font-size: 48px; margin: 20px 0;">✨</div>
        <div style="font-size: 18px; line-height: 1.6; margin: 16px 0;">"${affirmation}"</div>
        <div style="color: var(--muted); font-size: 14px; margin-top: 12px;">${affirmArabic}</div>
    `;
    res.appendChild(affirmCard);

    document.getElementById("buttons").appendChild(
        button("I can do it", () => {
            currentAffirmationIx++;
            onDone && onDone();
        })
    );
}