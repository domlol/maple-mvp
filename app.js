/*************************************************
 * 전역 변수
 *************************************************/
let records = [];
let targetTier = null;

const tiers = {
  "브론즈": 150000,
  "실버": 300000,
  "골드": 600000,
  "다이아": 900000,
  "레드": 1500000,
  "블랙": 3000000
};

/*************************************************
 * 초기 로드
 *************************************************/
window.onload = () => {
  load();
  applySavedTheme();
  updateAll();
};

/*************************************************
 * 저장 / 불러오기
 *************************************************/
function save() {
  localStorage.setItem("mvpRecords", JSON.stringify(records));
  localStorage.setItem("mvpTarget", targetTier);
}

function load() {
  const r = localStorage.getItem("mvpRecords");
  const t = localStorage.getItem("mvpTarget");

  if (r) records = JSON.parse(r);
  if (t) targetTier = t;
}

/*************************************************
 * 기록 추가 / 삭제
 *************************************************/
function addRecord() {
  const date = document.getElementById("chargeDate").value;
  const amount = Number(document.getElementById("chargeAmount").value);

  if (!date || !amount) {
    alert("날짜와 금액을 입력해주세요!");
    return;
  }

  records.push({ date, amount });
  save();
  updateAll();
}

function deleteRecord(i) {
  records.splice(i, 1);
  save();
  updateAll();
}

/*************************************************
 * 목표 MVP 설정
 *************************************************/
function setTarget(tier) {
  targetTier = tier;
  save();
  updateAll();
}

/*************************************************
 * 전체 초기화
 *************************************************/
function resetAll() {
  if (!confirm("정말 모든 데이터를 삭제하시겠습니까?")) return;
  records = [];
  targetTier = null;
  save();
  updateAll();
}

/*************************************************
 * 핵심 계산
 *************************************************/
function getCurrentTier(sum) {
  let tier = "무등급";
  for (let t in tiers) {
    if (sum >= tiers[t]) tier = t;
  }
  return tier;
}

/*************************************************
 * 전체 갱신
 *************************************************/
function updateAll() {
  // 날짜순 정렬
  records.sort((a, b) => new Date(a.date) - new Date(b.date));

  const today = new Date();

  // 13주(91일) 유효 기록만 계산
  const validRecords = records.filter(r => {
    const d = new Date(r.date);
    const diff = (today - d) / 86400000;
    return diff <= 91;
  });

  const sum = validRecords.reduce((s, r) => s + r.amount, 0);

  // ================= 요약 =================
  document.getElementById("totalAmount").innerText =
    `최근 13주 누적 금액: ${sum.toLocaleString()}원`;

  const currentTier = getCurrentTier(sum);
  document.getElementById("currentTier").innerText =
    `현재 등급: ${currentTier}`;

  document.getElementById("todayTier").innerText =
    `📅 오늘 기준 등급: ${currentTier}`;

  if (currentTier !== "무등급") {
    const remain = sum - tiers[currentTier];
    document.getElementById("tierRemainInfo").innerText =
      `현재 등급 기준 남는 금액: ${remain.toLocaleString()}원`;
  } else {
    document.getElementById("tierRemainInfo").innerText = "";
  }

  // ================= 목표 MVP =================
  const targetInfo = document.getElementById("targetInfo");
  const targetGuide = document.getElementById("targetTierGuide");

  if (targetTier) {
    const need = tiers[targetTier] - sum;
    targetInfo.innerText = `🎯 목표 MVP: ${targetTier}`;

    if (need > 0) {
      targetGuide.innerText =
        `목표 달성까지 ${need.toLocaleString()}원 부족`;
    } else {
      targetGuide.innerText =
        `🎉 목표 MVP 달성 완료!`;
    }
  } else {
    targetInfo.innerText = "";
    targetGuide.innerText = "목표 MVP를 선택해주세요.";
  }

  // ================= 등급 하락 안내 =================
  let dropDate = null;

  validRecords.forEach(r => {
    const d = new Date(r.date);
    d.setDate(d.getDate() + 91);
    if (!dropDate || d < dropDate) dropDate = d;
  });

  if (dropDate) {
    document.getElementById("dropInfo").innerText =
      `⚠️ 가장 빠른 금액 소멸일: ${dropDate.toISOString().slice(0, 10)}`;
  } else {
    document.getElementById("dropInfo").innerText = "";
  }

  // ================= 기록 리스트 =================
  const list = document.getElementById("recordList");
  list.innerHTML = "";

  records.forEach((r, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${r.date} - ${r.amount.toLocaleString()}원
      <span class="delete" onclick="deleteRecord(${i})">❌</span>
    `;
    list.appendChild(li);
  });

  // ================= 소멸 리스트 =================
  const expireList = document.getElementById("expireList");
  expireList.innerHTML = "";

  records.forEach(r => {
    const start = new Date(r.date);
    const expire = new Date(start);
    expire.setDate(expire.getDate() + 91);

    const dday = Math.ceil((expire - today) / 86400000);

    const li = document.createElement("li");
    li.innerHTML = `
      ${r.date} → 소멸까지 D-${dday}
      (${expire.getFullYear()}-${expire.getMonth() + 1}-${expire.getDate()})
      / <b>${r.amount.toLocaleString()}원</b>
    `;
    expireList.appendChild(li);
  });

  highlightTarget();
}

/*************************************************
 * 목표 버튼 강조
 *************************************************/
function highlightTarget() {
  document.querySelectorAll(".target-buttons button")
    .forEach(b => b.classList.remove("active"));

  if (targetTier) {
    const btn = [...document.querySelectorAll(".target-buttons button")]
      .find(b => b.innerText === targetTier);
    if (btn) btn.classList.add("active");
  }
}

/*************************************************
 * 다크모드
 *************************************************/
function applySavedTheme() {
  const saved = localStorage.getItem("theme");
  const btn = document.getElementById("themeToggle");

  if (saved === "dark") {
    document.body.classList.add("dark");
    btn.innerText = "☀️ 라이트모드";
  }
}

document.getElementById("themeToggle").addEventListener("click", () => {
  const btn = document.getElementById("themeToggle");
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    btn.innerText = "☀️ 라이트모드";
  } else {
    localStorage.setItem("theme", "light");
    btn.innerText = "🌙 다크모드";
  }
});
