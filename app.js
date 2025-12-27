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

// ----------------------------
// Load saved data
// ----------------------------
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
    const data = localStorage.getItem("mvpData");
    const target = localStorage.getItem("mvpTarget");

    if (data) records = JSON.parse(data);
    if (target) selectedTarget = target;
}

// ----------------------------
// Add record
// ----------------------------
function addRecord() {
    const date = document.getElementById("chargeDate").value;
    const amount = Number(document.getElementById("chargeAmount").value);

    if (!date || !amount) {
        alert("날짜와 금액을 입력해주세요!");
        return;
    }

    records.push({ date, amount });
    saveData();
    render();
}

// ----------------------------
// Delete record
// ----------------------------
function deleteRecord(i) {
    records.splice(i, 1);
    saveData();
    render();
}

// ----------------------------
// Set target
// ----------------------------
function setTarget(tier) {
    selectedTarget = tier;
    saveData();
    render();
}

// ----------------------------
// Reset all
// ----------------------------
function resetAll() {
    if (!confirm("정말 모든 데이터를 삭제하시겠습니까?")) return;
    records = [];
    selectedTarget = null;
    saveData();
    render();
}

// ----------------------------
// Rendering
// ----------------------------
function render() {
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    const total = records.reduce((s, r) => s + r.amount, 0);

    document.getElementById("totalAmount").innerHTML =
        `총 누적 금액: <b>${total.toLocaleString()}원</b>`;

    // 현재 등급 계산
    let currentTier = "무등급";
    for (let t in tierTable) {
        if (total >= tierTable[t]) currentTier = t;
    }
    document.getElementById("currentTier").innerHTML =
        `현재 등급: <b>${currentTier}</b>`;

    // 다음 등급
    let nextTier = null;
    for (let t in tierTable) {
        if (total < tierTable[t]) {
            nextTier = t;
            break;
        }
    }

    if (nextTier) {
        const diff = tierTable[nextTier] - total;
        document.getElementById("nextTierInfo").innerHTML =
            `다음 등급 (${nextTier})까지 <b>${diff.toLocaleString()}원</b> 부족`;
    } else {
        document.getElementById("nextTierInfo").innerHTML =
            `이미 최고 등급입니다 👍`;
    }

    // 현재 등급 기준 남는 금액
    let tierRemainText = "";
    if (currentTier !== "무등급") {
        const remain = total - tierTable[currentTier];
        tierRemainText = `현재 등급 기준 남는 금액: <b>${remain.toLocaleString()}원</b>`;
    }
    document.getElementById("tierRemainInfo").innerHTML = tierRemainText;

    // 목표 등급
    if (selectedTarget) {
        const need = tierTable[selectedTarget] - total;
        document.getElementById("targetInfo").innerHTML =
            `목표 등급: <b>${selectedTarget}</b>`;

        document.getElementById("targetTierInfo").innerHTML =
            need > 0
                ? `목표까지 <b>${need.toLocaleString()}원</b> 부족`
                : `이미 목표 등급 이상입니다!`;
    } else {
        document.getElementById("targetInfo").innerHTML = "";
        document.getElementById("targetTierInfo").innerHTML = "";
    }

    // 기록 리스트
    const list = document.getElementById("recordList");
    list.innerHTML = "";

    records.forEach((r, i) => {
        const li = document.createElement("li");
        li.innerHTML = `${r.date} - ${r.amount.toLocaleString()}원 
            <span class="delete" onclick="deleteRecord(${i})">❌</span>`;
        list.appendChild(li);
    });

    // ----------------------------
    // 소멸 리스트 (23:59 고정 버전)
    // ----------------------------
    const expireList = document.getElementById("expireList");
    expireList.innerHTML = "";
    const today = new Date();

    records.forEach((r) => {
        const start = new Date(r.date);

        // 유지기간 = 충전일 + 90일
        const expireDate = new Date(start);
        expireDate.setDate(expireDate.getDate() + 90);

        // ---- 날짜만 수동 추출 ----
        const y = expireDate.getFullYear();
        const m = expireDate.getMonth() + 1;
        const d = expireDate.getDate();

        // ---- 시간은 직접 문자열로 고정 ----
        const expireString = `${y}-${m}-${d} 23:59`;

        // ---- 남은 일수 계산 ----
        const ddayCalc = new Date(expireDate);
        ddayCalc.setHours(23, 59, 0, 0);
        const dday = Math.ceil((ddayCalc - today) / 86400000);

        const li = document.createElement("li");
        li.innerHTML = `
            ${r.date} → 소멸까지 D-${dday}  
            (소멸일: ${expireString})  
            / ${r.amount.toLocaleString()}원
        `;
        expireList.appendChild(li);
    });

    // ----------------------------
    // 가장 오래된 기록 유지기간(D-day)
    // ----------------------------
    if (records.length > 0) {
        const oldest = new Date(records[0].date);
        const expire = new Date(oldest);
        expire.setDate(expire.getDate() + 90);

        const left = new Date(expire);
        left.setHours(23, 59, 0, 0);

        const dday = Math.ceil((left - today) / 86400000);

        document.getElementById("expireInfo").innerHTML =
            `등급 유지 소멸까지 <b>D-${dday}</b>`;
    } else {
        document.getElementById("expireInfo").innerHTML = "";
    }
}

// ----------------------------
// Dark Mode
// ----------------------------
function applySavedTheme() {
    const saved = localStorage.getItem("theme");
    const btn = document.getElementById("themeToggle");

    if (saved === "dark") {
        document.body.classList.add("dark");
        btn.textContent = "☀️ 라이트모드";
    }
}

document.getElementById("themeToggle").addEventListener("click", () => {
    const btn = document.getElementById("themeToggle");
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        btn.textContent = "☀️ 라이트모드";
    } else {
        localStorage.setItem("theme", "light");
        btn.textContent = "🌙 다크모드";
    }
});
