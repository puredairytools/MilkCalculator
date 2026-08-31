const products = {
  ashow: {
    input: document.getElementById("ashow"),
    result: document.getElementById("ashow-result"),
    calculate: (bottles) => bottles * 0.936 * 1.03 * 1.08
  },
  smallAshow: {
    input: document.getElementById("small-ashow"),
    result: document.getElementById("small-ashow-result"),
    calculate: (bottles) => bottles * 0.29 * 1.03 * 1.08
  },
  transparent: {
    input: document.getElementById("transparent"),
    result: document.getElementById("transparent-result"),
    calculate: (bottles) => bottles * 0.936 * 1.03 * 1.08
  },
  siouguluan: {
    input: document.getElementById("siouguluan"),
    result: document.getElementById("siouguluan-result"),
    calculate: (bottles) => bottles * 0.936 * 1.03
  },
  premium: {
    input: document.getElementById("premium"),
    result: document.getElementById("premium-result"),
    calculate: (bottles) => bottles * 1.75 * 1.03
  }
};

const totalResult = document.getElementById("total-result");
const resetButton = document.getElementById("reset-button");
const ashowLossResult = document.getElementById("ashow-loss");
const siouguluanLossResult = document.getElementById("siouguluan-loss");
const premiumLossResult = document.getElementById("premium-loss");
const lossTotalResult = document.getElementById("loss-total");
const ashowOriginalResult = document.getElementById("ashow-original");
const siouguluanOriginalResult = document.getElementById("siouguluan-original");
const premiumOriginalResult = document.getElementById("premium-original");

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

  // 料損規則：15 噸 = 15,000 kg。沒有生產該商品時，料損為 0。
  const ashowCombined = milk.ashow + milk.smallAshow + milk.transparent;
  const ashowLoss = ashowCombined > 0 ? (ashowCombined >= 15000 ? 648 : 432) : 0;
  const siouguluanLoss = milk.siouguluan > 0 ? 180 : 0;
  const premiumLoss = milk.premium > 0 ? (milk.premium >= 15000 ? 400 : 200) : 0;
  const totalLoss = ashowLoss + siouguluanLoss + premiumLoss;

  ashowOriginalResult.textContent = ashowCombined.toFixed(2);
  siouguluanOriginalResult.textContent = milk.siouguluan.toFixed(2);
  premiumOriginalResult.textContent = milk.premium.toFixed(2);

  ashowLossResult.textContent = ashowLoss;
  siouguluanLossResult.textContent = siouguluanLoss;
  premiumLossResult.textContent = premiumLoss;
  lossTotalResult.textContent = totalLoss;
  totalResult.textContent = (rawMilkTotal + totalLoss).toFixed(2);
}

Object.values(products).forEach((product) => {
  product.input.addEventListener("input", updateCalculation);
});

resetButton.addEventListener("click", () => {
  Object.values(products).forEach((product) => { product.input.value = 0; });
  updateCalculation();
});

updateCalculation();
