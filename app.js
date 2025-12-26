let records = [];
let selectedTarget = null;

const tierTable = {
    "브론즈": 150000,
    "실버": 300000,
    "골드": 600000,
    "다이아": 900000,
    "레드": 1500000,
    "블랙": 3000000
};

window.onload = () => {
    loadData();
    applySavedTheme();
    render();
};

function saveData() {
    localStorage.setItem("mvpData", JSON.stringify(records));
    localStorage.setItem("mvpTarget", selectedTarget);
}

function loadData() {
    records = JSON.parse(localStorage.getItem("mvpData") || "[]");
    selectedTarget = localStorage.getItem("mvpTarget");
}

function addRecord() {
    const date = chargeDate.value;
    const amount = Number(chargeAmount.value);
    if (!date || !amount) {
        alert("날짜와 금액을 입력하세요");
        return;
    }
    records.push({ date, amount });
    saveData();
    render();
}

function deleteRecord(i) {
    records.splice(i, 1);
    saveData();
    render();
}

function setTarget(tier) {
    selectedTarget = tier;
    saveData();
    render();
}

function resetAll() {
    if (!confirm("정말 모든 데이터를 삭제하시겠습니까?")) return;
    records = [];
    selectedTarget = null;
    saveData();
    render();
}

/* 🔥 MVP 13주 기준 (이번 주 포함) */
function get13WeekRange() {
    const now = new Date();
    const day = now.getDay(); // 0=일, 4=목
    const diffToThisThu = (day <= 4 ? 4 - day : 11 - day);

    const thisThu = new Date(now);
    thisThu.setDate(now.getDate() + diffToThisThu);
    thisThu.setHours(0, 0, 0, 0);

    const nextThu = new Date(thisThu);
    nextThu.setDate(thisThu.getDate() + 7);

    const start = new Date(thisThu);
    start.setDate(thisThu.getDate() - 13 * 7);

    return { start, end: nextThu };
}

function render() {
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    const { start, end } = get13WeekRange();
    const valid = records.filter(r => {
        const d = new Date(r.date);
        return d >= start && d < end;
    });

    const total = valid.reduce((s, r) => s + r.amount, 0);

    totalAmount.innerHTML = `총 누적 금액: <b>${total.toLocaleString()}원</b>`;

    let tier = "무등급";
    for (let t in tierTable) {
        if (total >= tierTable[t]) tier = t;
    }
    currentTier.innerHTML = `현재 등급: <b>${tier}</b>`;

    let nextTier = Object.keys(tierTable).find(t => total < tierTable[t]);
    nextTierInfo.innerHTML = nextTier
        ? `다음 등급(${nextTier})까지 ${(tierTable[nextTier] - total).toLocaleString()}원`
        : "이미 최고 등급입니다 👍";

    if (selectedTarget) {
        const need = tierTable[selectedTarget] - total;
        targetInfo.innerHTML = `목표 등급: <b>${selectedTarget}</b>`;
        targetTierInfo.innerHTML = need > 0
            ? `목표까지 ${need.toLocaleString()}원 부족`
            : "이미 목표 달성!";
    } else {
        targetInfo.innerHTML = "";
        targetTierInfo.innerHTML = "";
    }

    expireInfo.innerHTML =
        `MVP 기준 기간: ${start.toLocaleDateString()} ~ ${(new Date(end - 1)).toLocaleDateString()}`;

    recordList.innerHTML = "";
    records.forEach((r, i) => {
        recordList.innerHTML += `
          <li>${r.date} - ${r.amount.toLocaleString()}원
          <span style="cursor:pointer" onclick="deleteRecord(${i})"> ❌</span></li>`;
    });
}

/* 다크모드 */
function applySavedTheme() {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️ 라이트모드";
    }
}

themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
};
