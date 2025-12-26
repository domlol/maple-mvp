let records = [];
let selectedTarget = null;

// ============================
//       MVP 기준표
// ============================
const tierTable = {
    "브론즈": 150000,
    "실버": 300000,
    "골드": 600000,
    "다이아": 900000,
    "레드": 1500000,
    "블랙": 3000000
};

// ============================
//      LocalStorage 로드
// ============================
window.onload = function () {
    loadData();
    render();
};

function saveData() {
    localStorage.setItem("mvpData", JSON.stringify(records));
    localStorage.setItem("mvpTarget", selectedTarget);
}

function loadData() {
    const recordData = localStorage.getItem("mvpData");
    const targetData = localStorage.getItem("mvpTarget");

    if (recordData) records = JSON.parse(recordData);
    if (targetData) selectedTarget = targetData;
}

// ============================
//      기록 추가
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
//      기록 삭제
// ============================
function deleteRecord(index) {
    records.splice(index, 1);
    saveData();
    render();
}

// ============================
//      목표 등급 설정
// ============================
function setTarget(tier) {
    selectedTarget = tier;
    saveData();
    render();
}

// ============================
//      전체 초기화
// ============================
function resetAll() {
    if (!confirm("정말 모든 데이터를 삭제하시겠습니까?")) return;

    records = [];
    selectedTarget = null;
    saveData();
    render();
}

// ============================
//      렌더링
// ============================
function render() {

    // 날짜 정렬
    records.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 누적 금액
    const total = records.reduce((sum, r) => sum + r.amount, 0);
    document.getElementById("totalAmount").innerHTML =
        `총 누적 금액: <b>${total.toLocaleString()}원</b>`;

    // 현재 등급
    let currentTier = "무등급";
    for (let key in tierTable) {
        if (total >= tierTable[key]) currentTier = key;
    }
    document.getElementById("currentTier").innerHTML =
        `현재 등급: <b>${currentTier}</b>`;

    // 다음 등급 계산
    let nextTier = null;
    for (let key in tierTable) {
        if (total < tierTable[key]) {
            nextTier = key;
            break;
        }
    }

    if (nextTier) {
        const diff = tierTable[nextTier] - total;
        document.getElementById("nextTierInfo").innerHTML =
            `다음 등급(${nextTier})까지 <b>${diff.toLocaleString()}원</b> 부족`;
    } else {
        document.getElementById("nextTierInfo").innerHTML =
            `이미 최고 등급입니다 👍`;
    }

    // 목표 등급 계산
    if (selectedTarget) {
        const need = tierTable[selectedTarget] - total;
        document.getElementById("targetInfo").innerHTML =
            `현재 목표 등급: <b>${selectedTarget}</b>`;
        document.getElementById("targetTierInfo").innerHTML =
            need > 0
                ? `목표까지 <b>${need.toLocaleString()}원</b> 부족`
                : `이미 목표 등급 이상입니다!`;
    } else {
        document.getElementById("targetInfo").innerHTML = "";
        document.getElementById("targetTierInfo").innerHTML = "";
    }

    // 기록 리스트 표시
    const list = document.getElementById("recordList");
    list.innerHTML = "";

    records.forEach((r, i) => {
        const li = document.createElement("li");
        li.innerHTML = `${r.date} - ${r.amount.toLocaleString()}원 
            <span class="delete" onclick="deleteRecord(${i})">❌</span>`;
        list.appendChild(li);
    });

    // 소멸 예정 리스트
    const expireList = document.getElementById("expireList");
    expireList.innerHTML = "";

    const today = new Date();

    records.forEach(r => {
        const start = new Date(r.date);
        const expire = new Date(start);
        expire.setDate(expire.getDate() + 91); // 13주 → 91일

        const diff = Math.ceil((expire - today) / 86400000);

        const li = document.createElement("li");
        li.innerHTML = `${r.date} → 소멸까지 D-${diff} / ${r.amount.toLocaleString()}원`;
        expireList.appendChild(li);
    });

    // 가장 오래된 기록의 소멸일
    if (records.length > 0) {
        const oldest = new Date(records[0].date);
        const expire = new Date(oldest);
        expire.setDate(expire.getDate() + 91);

        const dday = Math.ceil((expire - today) / 86400000);

        document.getElementById("expireInfo").innerHTML =
            `등급 유지 소멸까지 <b>D-${dday}</b>`;
    } else {
        document.getElementById("expireInfo").innerHTML = "";
    }
}

// ============================
//      다크모드
// ============================
const themeToggle = document.getElementById("themeToggle");
let savedTheme = localStorage.getItem("theme");

// 저장된 테마 적용
if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ 라이트모드";
}

// 클릭 시 토글
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ 라이트모드";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 다크모드";
    }
});
