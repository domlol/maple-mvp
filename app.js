const TIER_RULES = {
  브론즈: 0,
  실버: 300000,
  골드: 600000,
  다이아: 1200000,
  레드: 2500000,
  블랙: 5000000
};

let records = JSON.parse(localStorage.getItem("chargeRecords")) || [];
let targetTier = null;

function save() {
  localStorage.setItem("chargeRecords", JSON.stringify(records));
}

function addRecord() {
  const date = document.getElementById("chargeDate").value;
  const amount = Number(document.getElementById("chargeAmount").value);
  if (!date || !amount) return alert("날짜와 금액을 입력하세요");
  records.push({ date, amount });
  save();
  updateAll();
}

function resetAll() {
  if (!confirm("모든 기록을 삭제할까요?")) return;
  records = [];
  save();
  updateAll();
}

function setTarget(tier) {
  targetTier = tier;
  document.getElementById("targetInfo").innerText = `🎯 목표 등급: ${tier}`;
  updateAll();
}

function calc13WeeksSum(baseDate) {
  const start = new Date(baseDate);
  start.setDate(start.getDate() - 7 * 12);
  return records
    .filter(r => new Date(r.date) >= start && new Date(r.date) <= baseDate)
    .reduce((s, r) => s + r.amount, 0);
}

function getTier(amount) {
  return Object.entries(TIER_RULES)
    .reverse()
    .find(([_, v]) => amount >= v)?.[0] || "브론즈";
}

function updateAll() {
  const today = new Date();
  const sum = calc13WeeksSum(today);
  const tier = getTier(sum);

  document.getElementById("todayTier").innerText = `📆 오늘 기준 등급: ${tier}`;
  document.getElementById("totalAmount").innerText = `13주 누적: ${sum.toLocaleString()}원`;
  document.getElementById("currentTier").innerText = `현재 등급: ${tier}`;

  const need = TIER_RULES[tier] - sum;
  document.getElementById("tierRemainInfo").innerText =
    need > 0 ? `등급 기준 남은 금액: ${need.toLocaleString()}원` : `✔ 등급 유지 중`;

  updateDropInfo();
  updateSimulation();
  updateExpire();
  updateGuide();
}

function updateDropInfo() {
  if (!records.length) {
    document.getElementById("dropInfo").innerText = "";
    return;
  }
  const oldest = records.reduce((a, b) =>
    new Date(a.date) < new Date(b.date) ? a : b
  );
  const expire = new Date(oldest.date);
  expire.setDate(expire.getDate() + 7 * 13);
  const dday = Math.ceil((expire - new Date()) / (1000 * 60 * 60 * 24));
  document.getElementById("dropInfo").innerText =
    `⏰ 등급 하락 예상: D-${dday} (${expire.toLocaleDateString()})`;
}

function updateSimulation() {
  const table = document.getElementById("simulationTable");
  table.innerHTML = "<tr><th>주차</th><th>예상 누적</th><th>예상 등급</th></tr>";
  for (let i = 0; i <= 13; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i * 7);
    const sum = calc13WeeksSum(d);
    table.innerHTML += `<tr><td>${i}주 후</td><td>${sum.toLocaleString()}원</td><td>${getTier(sum)}</td></tr>`;
  }
}

function updateExpire() {
  const ul = document.getElementById("expireList");
  ul.innerHTML = "";
  records.forEach(r => {
    const exp = new Date(r.date);
    exp.setDate(exp.getDate() + 7 * 13);
    const d = Math.ceil((exp - new Date()) / (1000*60*60*24));
    ul.innerHTML += `<li>${r.date} → D-${d} (${exp.toLocaleDateString()}) / ${r.amount.toLocaleString()}원</li>`;
  });
}

function updateGuide() {
  const keep = document.getElementById("keepTierGuide");
  if (!records.length) {
    keep.innerText = "📌 충전 기록을 추가하면 추천이 표시됩니다.";
    return;
  }
  keep.innerText = "📌 현재 등급 유지를 위해 소멸 전 충전을 고려하세요.";
}

updateAll();
