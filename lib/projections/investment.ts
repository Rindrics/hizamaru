interface 複利計算入力 {
  元本: number;
  年利率: number;
  年数: number;
  複利計算周期?: number;
}

export function 複利を計算(入力: 複利計算入力): number {
  const { 元本, 年利率, 年数, 複利計算周期 = 1 } = 入力;
  const 利率 = 年利率 / 100;

  return 元本 * Math.pow(1 + 利率 / 複利計算周期, 複利計算周期 * 年数);
}

interface 投資予測入力 {
  初期金額: number;
  年間拠出額: number;
  年間利回り: number;
  年数: number;
}

export function 投資予測を計算(入力: 投資予測入力): number {
  const { 初期金額, 年間拠出額, 年間利回り, 年数 } = 入力;
  const 利率 = 年間利回り / 100;

  let 残高 = 初期金額;

  for (let 年 = 0; 年 < 年数; 年++) {
    残高 = 残高 * (1 + 利率) + 年間拠出額;
  }

  return 残高;
}
