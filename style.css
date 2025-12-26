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
  render();
};

function saveData() {
  localStorage.setItem("mvpData", JSON.stringify(records));
  localStorage.setItem("mvpTarget", selectedTarget);
}

function loadData() {
  records = JSON.parse(localStorage.getItem("mvpData")) || [];
  selectedTarget = localStorage.getItem("mvpTarget");
}

function addRecord() {
  const date = chargeDate.value;
  const amount = Number(chargeAmount.value);
  if (!date || !amount) return alert("입력하세요");
  records.push({ date, amount });
  saveData();
  render();
}

function setTarget(t) {
  selectedTarget = t;
  saveData();
  render();
}

function render() {
  const today = new Date();
  const expireList = document.getElementById("expireList");
  expireList.innerHTML = "";

  let total = 0;
  let futureDrops = [];

  records.forEach(r => {
    const start = new Date(r.date);
    const expire = new Date(start.getTime() + 91 * 86400000);
    const dday = Math.ceil((expire - today) / 86400000);

    if (expire >= today) total += r.amount;
    else futureDrops.push({ expire, amount: r.amount });

    const li = document.createElement("li");
    li.innerHTML = `${r.date} → D-${dday} (${expire.toISOString().slice(0,10)}) / ${r.amount.toLocaleString()}원`;
    expireList.appendChild(li);
  });

  let currentTier = "무등급";
  for (let t in tierTable) if (total >= tierTable[t]) currentTier = t;

  document.getElementById("todayTier").innerHTML = `📅 오늘 기준 등급: <b>${currentTier}</b>`;
  document.getElementById("totalAmount").innerHTML = `13주 누적: ${total.toLocaleString()}원`;
  document.getElementById("currentTier").innerHTML = `현재 등급: ${currentTier}`;

  if (currentTier !== "무등급") {
    document.getElementById("tierRemainInfo").innerHTML =
      `등급 기준 남는 금액: ${(total - tierTable[currentTier]).toLocaleString()}원`;
  }

  simulate(total, futureDrops, currentTier);
}

function simulate(total, drops, tier) {
  const table = document.getElementById("simulationTable");
  table.innerHTML = "<tr><th>주차</th><th>예상 누적</th><th>예상 등급</th></tr>";

  let sum = total;

  for (let i = 0; i <= 13; i++) {
    drops.forEach(d => {
      if (Math.ceil((d.expire - new Date()) / 86400000 / 7) === i) {
        sum -= d.amount;
      }
    });

    let t = "무등급";
    for (let k in tierTable) if (sum >= tierTable[k]) t = k;

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${i}주 후</td><td>${sum.toLocaleString()}원</td><td>${t}</td>`;
    table.appendChild(tr);
  }
}
