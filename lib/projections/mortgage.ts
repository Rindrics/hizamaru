import type { 返済計画 } from '@/types';

interface ローン入力 {
  借入額: number;
  年利率: number;
  返済年数: number;
}

export function ローン返済計画を計算(入力: ローン入力): 返済計画[] {
  const { 借入額, 年利率, 返済年数 } = 入力;
  const 月利率 = 年利率 / 12;
  const 総月数 = 返済年数 * 12;
  const 月返済額 =
    (借入額 * 月利率 * Math.pow(1 + 月利率, 総月数)) /
    (Math.pow(1 + 月利率, 総月数) - 1);

  const 返済スケジュール: 返済計画[] = [];
  let 残高 = 借入額;

  for (let 月数 = 1; 月数 <= 総月数; 月数++) {
    const 利息 = 残高 * 月利率;
    const 元金 = 月返済額 - 利息;
    残高 -= 元金;

    返済スケジュール.push({
      月: 月数,
      元金: 元金,
      利息: 利息,
      残高: Math.max(0, 残高),
    });
  }

  return 返済スケジュール;
}
