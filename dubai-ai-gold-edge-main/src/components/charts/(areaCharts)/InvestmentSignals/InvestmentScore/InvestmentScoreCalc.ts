type Input = {
  median_price: number;
  median_rent: number;
  transaction_count: number;
  previous_transaction_count: number;
  price_volatility: number;
  rent_volatility: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function safeDiv(a: number, b: number) {
  return b === 0 ? 0 : a / b;
}

/**
 * Yield score:
 * benchmark = 6% (Dubai average proxy)
 */
function calcYieldScore(rent: number, price: number) {
  const yieldPct = safeDiv(rent, price) * 100;

  // 0–10% yield mapped to score
  return clamp((yieldPct / 10) * 100);
}

/**
 * Growth score:
 * based on transaction momentum
 */
function calcGrowthScore(current: number, previous: number) {
  const growth = safeDiv(current - previous, previous) * 100;

  // -20% → 0, +20% → 100
  return clamp(((growth + 20) / 40) * 100);
}

/**
 * Liquidity score:
 * based on absolute volume
 */
function calcLiquidityScore(count: number) {
  // assume:
  // 0 tx = 0
  // 1000+ tx = strong liquidity

  return clamp((count / 1000) * 100);
}

/**
 * Volatility score:
 * lower volatility = better score
 */
function calcVolatilityScore(priceVol: number, rentVol: number) {
  const avg = (priceVol + rentVol) / 2;

  // 0.0 volatility = 100 score
  // 0.5 volatility = 0 score cap
  return clamp((1 - avg / 0.5) * 100);
}

export function computeInvestmentScore(input: Input) {
  const yield_score = calcYieldScore(
    input.median_rent,
    input.median_price
  );

  const growth_score = calcGrowthScore(
    input.transaction_count,
    input.previous_transaction_count
  );

  const liquidity_score = calcLiquidityScore(
    input.transaction_count
  );

  const volatility_score = calcVolatilityScore(
    input.price_volatility,
    input.rent_volatility
  );

  const final_score = clamp(
    yield_score * 0.25 +
    growth_score * 0.25 +
    liquidity_score * 0.2 +
    volatility_score * 0.15
  );

  return {
    yield_score: Number(yield_score.toFixed(1)),
    growth_score: Number(growth_score.toFixed(1)),
    liquidity_score: Number(liquidity_score.toFixed(1)),
    volatility_score: Number(volatility_score.toFixed(1)),
    final_score: Number(final_score.toFixed(1)),
  };
}