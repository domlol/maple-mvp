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
    if (!date || !amount) return alert("날짜와 금액을 입력하세요");

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
    if (!confirm("모든 데이터를 삭제할까요?")) return;
    records = [];
    selectedTarget = null;
    saveData();
    render();
}

/* 이번 주 포함 13주 */
function get13WeekRange() {
    const now = new Date();
    const day = now.getDay();
    const diff = (day <= 4 ? 4 - day : 11 - day);

    const thisThu = new Date(now);
    thisThu.setDate(now.getDate() + diff);
    thisThu.setHours(0, 0, 0, 0);

    const nextThu = new Date(thisThu);
    nextThu.setDate(thisThu.getDate() + 7);

    const start = new Date(thisThu);
    start.setDate(thisThu.getDate() - 13 * 7);

    return { start, end: nextThu };
}

/* 현재 금액 기준 등급 계산 */
function getTierByAmount(amount) {
    let tier = "무등급";
    for (let t in tierTable) {
        if (amount >= tierTable[t]) tier = t;
    }
    return tier;
}

/* 🔥 아무것도 안 했을 때 등급 하락 시점 계산 */
function getDropInfo(validRecords, currentTier) {
    let tempSum = validRecords.reduce((s, r) => s + r.amount, 0);

    const sorted = [...validRecords].sort(
        (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let r of sorted) {
        tempSum -= r.amount;
        const newTier = getTierByAmount(tempSum);

        if (newTier !== currentTier) {
            const expireDate = new Date(r.date);
            expireDate.setDate(expireDate.getDate() + 91);

            return {
                from: currentTier,
                to: newTier,
                date: expireDate
            };
        }
    }
    return null;
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

    const currentTier = getTierByAmount(total);
    currentTier.innerHTML = `현재 등급 (오늘 기준): <b>${currentTier}</b>`;

    if (currentTier !== "무등급") {
        const remain = total - tierTable[currentTier];
        tierRemainInfo.innerHTML =
            `현재 등급 기준 남는 금액: <b>${remain.toLocaleString()}원</b>`;
    } else {
        tierRemainInfo.innerHTML = "";
    }

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

    /* 🔥 등급 하락 경고 */
    const drop = getDropInfo(valid, currentTier);
    if (drop) {
        nextTierInfo.innerHTML += `<br>
        ⚠ 이대로 두면 <b>${drop.from}</b> → <b>${drop.to}</b><br>
        📅 ${drop.date.getFullYear()}-${drop.date.getMonth() + 1}-${drop.date.getDate()}
        `;
    }

    recordList.innerHTML = "";
    expireList.innerHTML = "";

    const today = new Date();

    records.forEach((r, i) => {
        const startDate = new Date(r.date);
        const expireDate = new Date(startDate);
        expireDate.setDate(startDate.getDate() + 91);

        const dday = Math.ceil((expireDate - today) / 86400000);

        recordList.innerHTML += `
          <li>
            ${r.date} - ${r.amount.toLocaleString()}원
            <span style="cursor:pointer" onclick="deleteRecord(${i})"> ❌</span>
          </li>
        `;

        expireList.innerHTML += `
          <li>
            ${r.amount.toLocaleString()}원 →
            소멸 D-${dday}
            (${expireDate.getFullYear()}-${expireDate.getMonth()+1}-${expireDate.getDate()})
          </li>
        `;
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
