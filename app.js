let records = [];
let goalRank = null;

const RANK_PRICE = {
    "브론즈": 150000,
    "실버": 300000,
    "골드": 600000,
    "다이아": 900000,
    "레드": 1500000,
    "블랙": 3000000
};

function addRecord() {
    const date = document.getElementById("dateInput").value;
    const amount = Number(document.getElementById("amountInput").value);

    if (!date || !amount) {
        alert("날짜와 금액을 입력하세요.");
        return;
    }

    records.push({ date: new Date(date), amount });
    updateUI();
}

function updateUI() {
    drawList();
    calcAll();
}

function drawList() {
    const list = document.getElementById("recordList");
    list.innerHTML = "";

    records.forEach((r, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${r.date.toISOString().split('T')[0]} — ${r.amount.toLocaleString()}원
            <button class="deleteBtn" onclick="deleteRecord(${i})">삭제</button>
        `;
        list.appendChild(li);
    });
}

function deleteRecord(i) {
    records.splice(i, 1);
    updateUI();
}

function calcAll() {
    const now = new Date();
    const ago13 = new Date();
    ago13.setDate(now.getDate() - 91);

    let total = 0;

    records.forEach(r => {
        if (r.date >= ago13) total += r.amount;
    });

    document.getElementById("totalArea").textContent = total.toLocaleString() + " 원";
    document.getElementById("rankArea").textContent = getRank(total);

    showExpireInfo();
    showNeedInfo(total);
    updateGoalNeed(total);
}

function getRank(total) {
    if (total >= 3000000) return "블랙";
    if (total >= 1500000) return "레드";
    if (total >= 900000) return "다이아";
    if (total >= 600000) return "골드";
    if (total >= 300000) return "실버";
    if (total >= 150000) return "브론즈";
    return "등급 없음";
}

/* A) 소멸 예정 정보 */
function showExpireInfo() {
    if (records.length === 0) {
        document.getElementById("expireInfo").textContent = "-";
        return;
    }

    let oldest = records[0].date;
    records.forEach(r => {
        if (r.date < oldest) oldest = r.date;
    });

    const expireDate = new Date(oldest);
    expireDate.setDate(expireDate.getDate() + 91);

    const now = new Date();
    const diff = Math.ceil((expireDate - now) / (1000 * 60 * 60 * 24));

    document.getElementById("expireInfo").textContent =
        `가장 오래된 충전 소멸: ${expireDate.toISOString().split('T')[0]} (D-${diff})`;
}

/* C) 부족 금액 계산 */
function showNeedInfo(total) {
    const rank = getRank(total);

    const next = {
        "등급 없음": "브론즈",
        "브론즈": "실버",
        "실버": "골드",
        "골드": "다이아",
        "다이아": "레드",
        "레드": "블랙",
        "블랙": null
    }[rank];

    if (!next) {
        document.getElementById("needInfo").textContent = "최고 등급입니다!";
        return;
    }

    const need = RANK_PRICE[next] - total;
    document.getElementById("needInfo").textContent =
        `${next} 등급까지 ${need.toLocaleString()}원 필요`;
}

/* B) 목표 등급 선택 */
function setGoal(rank) {
    goalRank = rank;
    document.getElementById("goalText").textContent = rank;
    calcAll();
}

function updateGoalNeed(total) {
    if (!goalRank) {
        document.getElementById("goalNeed").textContent = "-";
        return;
    }

    const need = RANK_PRICE[goalRank] - total;

    if (need <= 0) {
        document.getElementById("goalNeed").textContent = "이미 달성됨!";
        return;
    }

    document.getElementById("goalNeed").textContent =
        `${need.toLocaleString()}원 필요`;
}
