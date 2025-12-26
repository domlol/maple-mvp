// ===== 전역 상태 =====
let records = [];
let targetTier = null;

const TIER_REQUIREMENTS = {
  브론즈: 0,
  실버: 300000,
  골드: 600000,
  다이아: 1000000,
  레드: 1500000,
  블랙: 3000000
};

// ===== 유틸 =====
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function formatWon(num) {
  return num.toLocaleString() + "원";
}

// ===== 충전 기록 추가 =====
function addRecord() {
  const date = document.getElementById("chargeDate").value;
  const amount = Number(document.getElementById("chargeAmount").value);

  if (!date || !amount || amount <= 0) {
    alert("날짜와 금액을 올바르게 입력하세요.");
    return;
  }

  records.push({
    date: new Date(date),
    amount
  });

  document.getElementById("chargeAmount").value = "";
  renderAll();
}

// ===== 기록 삭제 =====
function removeRecord(index) {
  records.splice(index, 1);
  renderAll();
}

// ===== 최근 13주 금액 =====
function getTotalAmount(baseDate = new Date()) {
  const from = addDays(baseDate, -7 * 13);
  return records
    .filter(r => r.date >= from && r.date <= baseDate)
    .reduce((sum, r) => sum + r.amount, 0);
}

// ===== 현재 등급 계산 =====
function getTierByAmount(amount) {
  let tier = "브론즈";
  for (const [name, req] of Object.entries(TIER_REQUIREMENTS)) {
    if (amount >= req) tier = name;
  }
  return tier;
}

// ===== 목표 설정 =====
function setTarget(tier) {
  targetTier = tier;
  renderSummary();
}

// ===== 기록 테이블 =====
function renderRecordList() {
  const tbody = document.getElementById("recordList");
  tbody.innerHTML = "";

  records.forEach((r, i) => {
    const expire = addDays(r.date, 7 * 13);
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatDate(r.date)}</td>
      <td>${formatWon(r.amount)}</td>
      <td>D-${Math.ceil((expire - new Date()) / (1000*60*60*24))}<br>${formatDate(expire)}</td>
      <td><button onclick="removeRecord(${i})">❌</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== 요약 정보 =====
function renderSummary() {
  const total = getTotalAmount();
  const currentTier = getTierByAmount(total);

  document.getElementById("todayTier").innerText =
    `📅 오늘 기준 등급: ${currentTier}`;

  document.getElementById("totalAmount").innerText =
    `최근 13주 누적 금액: ${formatWon(total)}`;

  document.getElementById("currentTier").innerText =
    `현재 등급: ${currentTier}`;

  const currentReq = TIER_REQUIREMENTS[currentTier];
  document.getElementById("tierRemainInfo").innerText =
    `현재 등급 기준 남은 금액: ${formatWon(
      Math.max(0, currentReq + 1 - total)
    )}`;

  // ===== 목표 MVP =====
  const targetResult = document.getElementById("targetResult");
  if (!targetTier) {
    targetResult.innerText = "🎯 목표 MVP 등급을 선택하세요.";
    return;
  }

  const targetReq = TIER_REQUIREMENTS[targetTier];

  if (total >= targetReq) {
    targetResult.innerText =
      `✅ 목표 달성! (${targetTier})`;
  } else {
    targetResult.innerText =
      `❌ 목표 미달성 (${targetTier}) · ${formatWon(
        targetReq - total
      )} 부족`;
  }
}

// ===== 주차별 시뮬레이션 =====
function renderSimulation() {
  const table = document.getElementById("simulationTable");
  table.innerHTML = `
    <tr>
      <th>주차</th>
      <th>예상 금액</th>
      <th>예상 등급</th>
    </tr>
  `;

  for (let i = 0; i <= 12; i++) {
    const date = addDays(new Date(), i * 7);
    const total = getTotalAmount(date);
    const tier = getTierByAmount(total);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i}주 후</td>
      <td>${formatWon(total)}</td>
      <td>${tier}</td>
    `;
    table.appendChild(tr);
  }
}

// ===== 전체 렌더 =====
function renderAll() {
  renderRecordList();
  renderSummary();
  renderSimulation();
}

// ===== 초기화 =====
function resetAll() {
  if (!confirm("모든 기록을 삭제할까요?")) return;
  records = [];
  targetTier = null;
  renderAll();
}

// 최초 실행
renderAll();
