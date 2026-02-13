/**
 * Calculates the natural log of the Gamma function ln(Γ(x))
 * using the Lanczos approximation.
 */
function logGamma(x: number): number {
  const c = [
    76.18009172947146, -86.5053203294168, 24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let i = 0; i <= 5; i++) {
    ser += c[i] / ++y;
  }
  return -tmp + Math.log((2.506628274631 * ser) / x);
}

export function gammaDistributionPoints(
  alpha: number,
  lambda: number,
  min: number,
  max: number,
) {
  const points: { x: number; y: number }[] = [];

  // Gamma distribution is only defined for x > 0
  const start = Math.max(Math.ceil(min), 1);
  const end = Math.floor(max);

  for (let x = start; x <= end; x += 0.3) {
    // We calculate in log space first to maintain precision and avoid overflow
    // log(f(x)) = α log(λ) + (α - 1) log(x) - λx - log(Γ(α))
    const logY =
      alpha * Math.log(lambda) +
      (alpha - 1) * Math.log(x) -
      lambda * x -
      logGamma(alpha);

    points.push({ x, y: Math.exp(logY) });
  }

  return points;
}
