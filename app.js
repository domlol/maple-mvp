let records = [];

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
    const list = document.getElementById("recordList");
    list.innerHTML = "";

    records.forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r.date.toISOString().split('T')[0]} — ${r.amount.toLocaleString()}원`;
        list.appendChild(li);
    });

    calcTotal();
}

function calcTotal() {
    const now = new Date();
    const ago13 = new Date();
    ago13.setDate(now.getDate() - 91); // 13주 = 91일

    let total = 0;

    records.forEach(r => {
        if (r.date >= ago13) total += r.amount;
    });

    document.getElementById("totalArea").textContent = total.toLocaleString() + " 원";
    document.getElementById("rankArea").textContent = getRank(total);
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
