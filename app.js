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

// ============================
// 초기 로드
// ============================
window.onload = () => {
    loadData();
    applySavedTheme();
    render();
};

// ============================
// 데이터 저장 / 불러오기
// ============================
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

// ============================
// 기록 추가
// ============================
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

// ============================
// 기록 삭제
// ============================
function deleteRecord(i) {
    records.splice(i, 1);
    saveData();
    render();
}

// ============================
// 목표 등급 설정
// ============================
function setTarget(tier) {
    selectedTarget = tier;
    saveData();
    render();
}

// ============================
// 전체 초기화
// ============================
function resetAll() {
    if (!confirm("정말 모든 데이터를 삭제하시겠습니까?")) return;
    records = [];
    selectedTarget = null;
    saveData();
    render();
}

// ============================
// 렌더링
// ============================
function render() {
    // 날짜 순으로 정렬
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 총 금액
    const total = records.reduce((s, r) => s + r.amount, 0);
    document.getElementById("totalAmount").innerHTML =
        `총 누적 금액: <b>${total.toLocaleString()}원</b>`;

    // 현재 등급
    let currentTier = "무등급";
    for (let t in tierTable) {
        if (total >= tierTable[t]) currentTier = t;
    }
    document.getElementById("currentTier").innerHTML =
        `현재 등급: <b>${currentTier}</b>`;

    // 다음 등급 계산
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
    if (currentTier !== "무등급") {
        const remain = total - tierTable[currentTier];
        document.getElementById("tierRemainInfo").innerHTML =
            `현재 등급 기준 남는 금액: <b>${remain.toLocaleString()}원</b>`;
    } else {
        document.getElementById("tierRemainInfo").innerHTML = "";
    }

    // 목표 등급 정보
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

    // ============================
    // 기록 리스트
    // ============================
    const list = document.getElementById("recordList");
    list.innerHTML = "";

    records.forEach((r, i) => {
        const li = document.createElement("li");
        li.innerHTML = `${r.date} - ${r.amount.toLocaleString()}원 
            <span class="delete" onclick="deleteRecord(${i})">❌</span>`;
        list.appendChild(li);
    });

    // ============================
    // 소멸 리스트
    // ============================
    const expireList = document.getElementById("expireList");
    expireList.innerHTML = "";
    const today = new Date();

    records.forEach((r) => {
        const start = new Date(r.date);
        const expireDate = new Date(start.getTime() + 91 * 24 * 60 * 60 * 1000);
        const dday = Math.ceil((expireDate - today) / 86400000);

        const li = document.createElement("li");
        li.innerHTML = `
            ${r.date} → 소멸까지 D-${dday}  
            (소멸일: ${expireDate.getFullYear()}-${expireDate.getMonth() + 1}-${expireDate.getDate()})  
            / <b>${r.amount.toLocaleString()}원</b>
        `;
        expireList.appendChild(li);
    });
}

// ============================
// 다크모드
// ============================
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
