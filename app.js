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

/* ===== 다크 / 라이트 ===== */
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

/* ===== 유틸 ===== */
const addDays = (d, n) => new Date(d.getTime() + n*86400000);
const fmt = d => `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`;
const won = n => n.toLocaleString()+"원";

/* ===== 기록 ===== */
function addRecord() {
  const date = document.getElementById("chargeDate").value;
  const amount = Number(document.getElementById("chargeAmount").value);
  if (!date || amount <= 0) return alert("입력 오류");

  records.push({ date: new Date(date), amount });
  renderAll();
}

function getTotal(base = new Date()) {
  const from = addDays(base, -91);
  return records.filter(r => r.date >= from && r.date <= base)
    .reduce((s,r)=>s+r.amount,0);
}

function getTier(amount) {
  let t="브론즈";
  for (let k in TIER_REQUIREMENTS)
    if (amount >= TIER_REQUIREMENTS[k]) t=k;
  return t;
}

/* ===== 목표 ===== */
function setTarget(t) {
  targetTier = t;
  renderSummary();
}

/* ===== 요약 ===== */
function renderSummary() {
  const total = getTotal();
  const tier = getTier(total);

  document.getElementById("summary").innerHTML = `
    <div>현재 등급:
      <span class="badge ${tier}">${tier}</span>
    </div>
    <div>최근 13주 누적: ${won(total)}</div>
  `;

  const guide = document.getElementById("targetGuide");
  if (!targetTier) {
    guide.innerText = "🎯 목표 MVP를 선택하세요.";
    return;
  }

  const need = TIER_REQUIREMENTS[targetTier];
  if (total >= need) {
    guide.innerHTML = `✅ <span class="badge ${targetTier}">${targetTier}</span> 달성 완료`;
  } else {
    const until = fmt(addDays(new Date(), 91));
    guide.innerHTML =
      `❌ <b>${until}</b>까지 <b>${won(need-total)}</b> 유지 필요`;
  }
}

/* ===== 시뮬레이션 ===== */
function renderSimulation() {
  const table = document.getElementById("simulation");
  table.innerHTML = `
    <tr><th>날짜</th><th>누적</th><th>등급</th></tr>
  `;
  for (let i=0;i<=12;i++){
    const d = addDays(new Date(), i*7);
    const t = getTotal(d);
    const tier = getTier(t);
    table.innerHTML += `
      <tr>
        <td>${fmt(d)} (${i}주차)</td>
        <td>${won(t)}</td>
        <td><span class="badge ${tier}">${tier}</span></td>
      </tr>
    `;
  }
}

function renderAll(){
  renderSummary();
  renderSimulation();
}

renderAll();
