/*************************************************
 * Maple MVP Calculator - Stable Version
 *************************************************/

let records = [];
let selectedTarget = null;

/* MVP 기준 금액 */
const tierTable = {
  "브론즈": 150000,
  "실버": 300000,
  "골드": 600000,
  "다이아": 900000,
  "레드": 1500000,
  "블랙": 3000000
};

/* =========================
   초기 로드
========================= */
window.onload = () => {
  loadData();
  render();
};

/* =========================
   저장 / 불러오기
========================= */
function saveData() {
  localStorage.setItem("mvpRecords", JSON.stringify(records));
  localStorage.setItem("mvpTarget", selectedTarget);
}

function loadData() {
  records = JSON.parse(localStorage.getItem("mvpRecords")) || [];
  selectedTarget = localStorage.getItem("mvpTarget");
}

/* =========================
   기록 추가
========================= */
function addRecord() {
  const dateInput = document.getElementById("chargeDate");
  const amountInput = document.getElementById("chargeAmount");

  if (!dateInput || !amountInput) {
    alert("입력 요소를 찾을 수 없습니다.");
    return;
  }

  const date = dateInput.value;
  const amount = Number(amountInput.value);

  if (!date || !amount) {
    alert("날짜와 금액을 입력해주세요.");
    return;
  }

  records.push({ date, amount });
  saveData();
  render();

  amountInput.value = "";
}

/* =========================
   목표 등급
========================= */
function setTarget(tier) {
  selectedTarget = tier;
  saveData();
  render();
}

/* =========================
   핵심 계산 로직
========================= */
function getExpireDate(date) {
  const d = new Date(date);
  return new Date(d.getTime() + 91 * 24 * 60 * 60 * 1000);
}

function getTierByAmount(amount) {
  let tier = "무등급";
  for (let t in tierTable) {
    if (amount >= tierTable[t]) tier = t;
  }
  return tier;
}

/* =========================
   렌더링
========================= */
function render() {
  const today = new Date();

  let total = 0;
  let futureDrops = [];

  const expireList = document.getElementById("expireList");
  expireList.innerHTML = "";

  records.forEach(r => {
    const expire = getExpireDate(r.date);
    const dday = Math.ceil((expire - today) / 86400000);

    if (expire >= today) {
      total += r.amount;
      futureDrops.push({ expire, amount: r.amount });
    }

    const li = document.createElement("li");
    li.innerHTML = `
      ${r.date} → 
      소멸 D-${dday} 
      (${expire.getFullYear()}-${expire.getMonth() + 1}-${expire.getDate()})
      / <b>${r.amount.toLocaleString()}원</b>
    `;
    expireList.appendChild(li);
  });

  const currentTier = getTierByAmount(total);

  document.getElementById("todayTier").innerHTML =
    `📅 오늘 기준 등급: <b>${currentTier}</b>`;

  document.getElementById("totalAmount").innerHTML =
    `13주 누적: <b>${total.toLocaleString()}원</b>`;

  document.getElementById("currentTier").innerHTML =
    `현재 등급: <b>${currentTier}</b>`;

  if (currentTier !== "무등급") {
    document.getElementById("tierRemainInfo").innerHTML =
      `등급 기준 남는 금액: <b>${(total - tierTable[currentTier]).toLocaleString()}원</b>`;
  } else {
    document.getElementById("tierRemainInfo").innerHTML = "";
  }

  renderSimulation(total, futureDrops);
  renderChargeGuide(total, currentTier);
}

/* =========================
   주차별 시뮬레이션
========================= */
function renderSimulation(total, drops) {
  const table = document.getElementById("simulationTable");
  table.innerHTML =
    "<tr><th>주차</th><th>예상 누적</th><th>예상 등급</th></tr>";

  for (let week = 0; week <= 13; week++) {
    let sum = total;

    drops.forEach(d => {
      const w = Math.floor((d.expire - new Date()) / (7 * 86400000));
      if (w === week) sum -= d.amount;
    });

    const tier = getTierByAmount(sum);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${week}주 후</td>
      <td>${sum.toLocaleString()}원</td>
      <td>${tier}</td>
    `;
    table.appendChild(tr);
  }
}

/* =========================
   충전 추천
========================= */
function renderChargeGuide(total, tier) {
  const keep = document.getElementById("keepTierGuide");
  const target = document.getElementById("targetTierGuide");

  keep.innerHTML = "";
  target.innerHTML = "";

  if (tier !== "무등급") {
    const need = tierTable[tier] - total;
    if (need > 0) {
      keep.innerHTML =
        `👉 <b>${need.toLocaleString()}원</b> 이상 충전하면 등급 유지`;
    } else {
      keep.innerHTML = `✅ 현재 충전 없이도 등급 유지 중`;
    }
  }

  if (selectedTarget) {
    const need = tierTable[selectedTarget] - total;
    target.innerHTML =
      need > 0
        ? `🎯 목표(${selectedTarget})까지 <b>${need.toLocaleString()}원</b> 필요`
        : `🎉 이미 목표 등급 달성!`;
  }
}
