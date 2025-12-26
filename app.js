let records = JSON.parse(localStorage.getItem("chargeRecords") || "[]");
let targetTier = localStorage.getItem("targetTier");
let chart;

const tiers = {
  브론즈: 150000,
  실버: 300000,
  골드: 600000,
  다이아: 900000,
  레드: 1500000,
  블랙: 3000000
};

function save() {
  localStorage.setItem("chargeRecords", JSON.stringify(records));
  localStorage.setItem("targetTier", targetTier);
}

function addRecord() {
  const date = chargeDate.value;
  const amount = Number(chargeAmount.value);
  if (!date || !amount) return alert("날짜와 금액 입력");

  records.push({ date, amount });
  save();
  updateAll();
}

function deleteRecord(i) {
  if (!confirm("삭제할까요?")) return;
  records.splice(i, 1);
  save();
  updateAll();
}

function resetAll() {
  if (!confirm("모두 초기화할까요?")) return;
  records = [];
  save();
  updateAll();
}

function setTarget(t) {
  targetTier = t;
  save();
  updateAll();
}

function get13WeekSum(base = new Date()) {
  const start = new Date(base);
  start.setDate(start.getDate() - 91);
  return records.filter(r => {
    const d = new Date(r.date);
    return d >= start && d <= base;
  }).reduce((s, r) => s + r.amount, 0);
}

function getTier(sum) {
  let t = "무등급";
  for (let k in tiers) if (sum >= tiers[k]) t = k;
  return t;
}

function updateAll() {
  const today = new Date();
  const sum = get13WeekSum(today);
  const tier = getTier(sum);

  todayTier.innerText = `📅 오늘 기준 등급: ${tier}`;
  totalAmount.innerText = `13주 누적: ${sum.toLocaleString()}원`;
  currentTier.innerText = `현재 등급: ${tier}`;

  tierRemainInfo.innerText =
    tier !== "무등급"
      ? `등급 기준 남는 금액: ${(sum - tiers[tier]).toLocaleString()}원`
      : "";

  renderSimulation();
  renderExpire();
  renderRecords();
  renderChart();
}

function renderSimulation() {
  simulationTable.innerHTML =
    "<tr><th>기준 날짜</th><th>예상 누적</th><th>예상 등급</th></tr>";

  for (let w = 0; w <= 13; w++) {
    const d = new Date();
    d.setDate(d.getDate() + w * 7);
    const s = get13WeekSum(d);
    simulationTable.innerHTML +=
      `<tr><td>${d.toISOString().slice(0,10)}</td><td>${s.toLocaleString()}원</td><td>${getTier(s)}</td></tr>`;
  }
}

function renderExpire() {
  expireList.innerHTML = "";
  const today = new Date();

  records.forEach(r => {
    const d = new Date(r.date);
    const exp = new Date(d);
    exp.setDate(exp.getDate() + 91);
    const dd = Math.ceil((exp - today) / 86400000);

    expireList.innerHTML +=
      `<li>${r.date} → 소멸 D-${dd} (${exp.toISOString().slice(0,10)}) / ${r.amount.toLocaleString()}원</li>`;
  });
}

function renderRecords() {
  recordList.innerHTML = "";
  records.forEach((r, i) => {
    recordList.innerHTML +=
      `<li>${r.date} / ${r.amount.toLocaleString()}원
       <button onclick="deleteRecord(${i})">삭제</button></li>`;
  });
}

function renderChart() {
  const labels = [];
  const data = [];

  for (let w = 13; w >= 0; w--) {
    const d = new Date();
    d.setDate(d.getDate() - w * 7);
    labels.push(d.toISOString().slice(5,10));
    data.push(get13WeekSum(d));
  }

  if (chart) chart.destroy();
  chart = new Chart(trendChart, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "13주 누적 금액",
        data,
        borderWidth: 2
      }]
    }
  });
}

themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
};

updateAll();
