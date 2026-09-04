const products = {
  ashow: {
    input: document.getElementById("ashow"),
    result: document.getElementById("ashow-result"),
    calculate: (bottles) => bottles * 0.936
  },
  smallAshow: {
    input: document.getElementById("small-ashow"),
    result: document.getElementById("small-ashow-result"),
    calculate: (bottles) => bottles * 0.29
  },
  transparent: {
    input: document.getElementById("transparent"),
    result: document.getElementById("transparent-result"),
    calculate: (bottles) => bottles * 0.936
  },
  siouguluan: {
    input: document.getElementById("siouguluan"),
    result: document.getElementById("siouguluan-result"),
    calculate: (bottles) => bottles * 0.936
  },
  premium: {
    input: document.getElementById("premium"),
    result: document.getElementById("premium-result"),
    calculate: (bottles) => bottles * 1.75
  }
};

const totalResult = document.getElementById("total-result");
const resetButton = document.getElementById("reset-button");
const lineShareButton = document.getElementById("line-share-button");
const ashowLossResult = document.getElementById("ashow-loss");
const siouguluanLossResult = document.getElementById("siouguluan-loss");
const premiumLossResult = document.getElementById("premium-loss");
const lossTotalResult = document.getElementById("loss-total");
const ashowOriginalResult = document.getElementById("ashow-original");
const siouguluanOriginalResult = document.getElementById("siouguluan-original");
const premiumOriginalResult = document.getElementById("premium-original");
const cfInput = document.getElementById("cf-value");

function getBottleCount(input) {
  let value = Number(input.value);
  if (!Number.isFinite(value) || value < 0) value = 0;
  return Math.floor(value);
}

function updateCalculation() {
  const bottles = {};
  const milk = {};
  let rawMilkTotal = 0;

  Object.entries(products).forEach(([key, product]) => {
    bottles[key] = getBottleCount(product.input);
    milk[key] = product.calculate(bottles[key]);
    product.result.textContent = milk[key].toFixed(2);
    rawMilkTotal += milk[key];
  });

  //
  // 料損規則：15 噸 = 15,000 L。沒有生產該商品時，料損為 0。
  //
  const ashowCombined = milk.ashow + milk.smallAshow + milk.transparent;
  const ashowLoss = ashowCombined > 0 ? (ashowCombined >= 15000 ? 500 : 400) : 0;
  const siouguluanLoss = milk.siouguluan > 0 ? 180 : 0;
  const premiumLoss = milk.premium > 0 ? (milk.premium >= 15000 ? 300 : 200) : 0;
  const totalLoss = ashowLoss + siouguluanLoss + premiumLoss;

  ashowOriginalResult.textContent = ashowCombined.toFixed(2);
  siouguluanOriginalResult.textContent = milk.siouguluan.toFixed(2);
  premiumOriginalResult.textContent = milk.premium.toFixed(2);

  ashowLossResult.textContent = ashowLoss;
  siouguluanLossResult.textContent = siouguluanLoss;
  premiumLossResult.textContent = premiumLoss;
  lossTotalResult.textContent = totalLoss;
  const cf = Number.parseFloat(cfInput.value);
  const validCf = Number.isFinite(cf) && cf >= 0 ? cf : 1.08;
  //
  // CF 套用於所有品項及其料損，優選（含優選料損）除外。
  //
  const cfApplicableTotal = (rawMilkTotal - milk.premium) + (totalLoss - premiumLoss);
  const premiumTotal = milk.premium + premiumLoss;
  totalResult.textContent = (cfApplicableTotal * validCf + premiumTotal).toFixed(2);
}

Object.values(products).forEach((product) => {
  //
  // 使用者點入瓶數欄位時，若目前為預設值 0，先清空方便直接輸入。
  //
  product.input.addEventListener("focus", () => {
    if (product.input.value === "0") {
      product.input.value = "";
    }
  });

  //
  // 若離開欄位時沒有輸入內容，恢復顯示 0。
  //
  product.input.addEventListener("blur", () => {
    if (product.input.value === "") {
      product.input.value = "0";
      updateCalculation();
    }
  });

  //
  // 僅保留 0-9，避免貼上或輸入非數字字元。
  //
  product.input.addEventListener("input", () => {
    product.input.value = product.input.value.replace(/\D/g, "");
    updateCalculation();
  });
});

//
// CF 可輸入小數，最多保留小數第二位，並即時計算。
//
cfInput.addEventListener("focus", () => {
  cfInput.select();
});

cfInput.addEventListener("input", () => {
  let value = cfInput.value.replace(/[^0-9.]/g, "");
  const firstDot = value.indexOf(".");
  if (firstDot !== -1) {
    const integerPart = value.slice(0, firstDot + 1);
    const decimalPart = value.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
    value = integerPart + decimalPart;
  }
  cfInput.value = value;
  updateCalculation();
});

cfInput.addEventListener("blur", () => {
  const value = Number.parseFloat(cfInput.value);
  if (!Number.isFinite(value) || value < 0) {
    cfInput.value = "1.08";
  } else {
    cfInput.value = String(value);
  }
  localStorage.setItem("milkCalculatorCf", cfInput.value);
  updateCalculation();
});

const savedCf = localStorage.getItem("milkCalculatorCf");
if (savedCf !== null && Number.isFinite(Number.parseFloat(savedCf))) {
  cfInput.value = savedCf;
}


function buildShareText() {
  const lines = ["【生乳量換算】\n"];

  let index = 1;

  Object.values(products).forEach((product) => {
    const bottles = getBottleCount(product.input);
    if (bottles > 0) {
      const name = product.input.closest(".product-card").querySelector("h2").textContent;
      lines.push(`${index}. ${name}`);
      lines.push(`${bottles} 瓶｜${product.result.textContent} L`);
      lines.push("");
      index += 1;
    }
  });

  lines.push("────────");
  lines.push(`料損　${lossTotalResult.textContent} L`);
  lines.push(`CF　${cfInput.value || "1.08"}（優選除外）`);
  lines.push(`總計　${totalResult.textContent} L`);

  return lines.join("\n");
}

lineShareButton.addEventListener("click", () => {
  const text = buildShareText();
  const lineUrl = `https://line.me/R/share?text=${encodeURIComponent(text)}`;
  window.location.href = lineUrl;
});

resetButton.addEventListener("click", () => {
  Object.values(products).forEach((product) => { product.input.value = 0; });
  updateCalculation();
});

updateCalculation();
