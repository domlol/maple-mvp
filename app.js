const TIER = {
  브론즈: 150000,
  실버: 300000,
  골드: 600000,
  다이아: 900000,
  레드: 1500000,
  블랙: 3000000
};

let records = [];
let targetTier = null;

const summaryEl = document.getElementById("summary");
const tableEl = document.getElementById("recordTable");
const simEl = document.getElementById("simulation");

document.getElementById("themeToggle").onclick = () =>
  document.body.classList.toggle("dark");

function addRecord() {
  const d = dateInput.value;
  const a = +amountInput.value;
  if (!d || !a) return alert("날짜와 금액 입력");

  records.push({ date: new Date(d), amount: a });
  render();
}

function resetAll() {
  records = [];
  targetTier = null;
  render();
}

function setTarget(t) {
  targetTier = t;
  render();
}

function render() {
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 91);

  const valid = records.filter(r => r.date >= cutoff);
  const sum = valid.reduce((s, r) => s + r.amount, 0);

  const currentTier =
    Object.entries(TIER).reverse().find(([_, v]) => sum >= v)?.[0] || "없음";

  summaryEl.innerHTML = `
    현재 등급: <b>${currentTier}</b><br>
    최근 13주 누적: <b>${sum.toLocaleString()}원</b><br>
    ${
      targetTier
        ? sum >= TIER[targetTier]
          ? `✅ 목표 ${targetTier} 달성`
          : `❌ ${targetTier}까지 ${(TIER[targetTier] - sum).toLocaleString()}원 부족`
        : ""
    }
  `;

  tableEl.innerHTML = "";
  records.forEach((r, i) => {
    const exp = new Date(r.date);
    exp.setDate(exp.getDate() + 91);
    tableEl.innerHTML += `
      <tr>
        <td>${r.date.toISOString().slice(0,10)}</td>
        <td>${r.amount.toLocaleString()}</td>
        <td>D-${Math.ceil((exp - today)/86400000)}<br>${exp.toISOString().slice(0,10)}</td>
        <td><button onclick="records.splice(${i},1);render()">❌</button></td>
      </tr>`;
  });

  simEl.innerHTML = "";
  for (let i = 0; i < 13; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i * 7);
    const cut = new Date(d);
    cut.setDate(cut.getDate() - 91);
    const s = records.filter(r => r.date >= cut && r.date <= d)
      .reduce((x, r) => x + r.amount, 0);
    const tier =
      Object.entries(TIER).reverse().find(([_, v]) => s >= v)?.[0] || "없음";
    simEl.innerHTML += `
      <tr>
        <td>${d.toISOString().slice(0,10)}</td>
        <td>${s.toLocaleString()}</td>
        <td>${tier}</td>
      </tr>`;
  }
}

render();
