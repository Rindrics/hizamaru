import type { 年次予測 } from '@/types';

interface 計算入力 {
  初期資産: number;
  月収: number;
  投資利回り: number;
  対象年数: number;
}

export function 年次予測を計算(入力: 計算入力): 年次予測[] {
  const { 初期資産, 月収, 投資利回り, 対象年数 } = 入力;
  const 予測結果: 年次予測[] = [];

  let 現在資産 = 初期資産;
  const 基準年 = new Date().getFullYear();

  for (let 年度 = 0; 年度 < 対象年数; 年度++) {
    const 年収 = 月収 * 12;
    const 投資利益 = 現在資産 * 投資利回り;
    const 支出 = 0; // TODO: ライフイベントと予算から計算

    現在資産 = 現在資産 + 年収 - 支出 + 投資利益;

    予測結果.push({
      年: 基準年 + 年度,
      年齢: {}, // TODO: 家族メンバーの生年月日から計算
      収入: 年収,
      支出: 支出,
      投資利益: 投資利益,
      資産: 現在資産,
      ライフイベント: [],
    });
  }

  return 予測結果;
}
