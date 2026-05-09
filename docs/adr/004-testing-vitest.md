# ADR-004: テストフレームワークに Vitest を採用

## ステータス
承認（Accepted）

## 日付
2026-05-09

## 背景

hizamaru では以下のテストが必要である：
- **計算エンジン**: 年次予測計算、住宅ローン計算の正確性（金融アプリケーションとして重要）
- **ライフイベント管理**: 複数パラメータのバリデーション
- **Server Actions**: Supabase 連携のロジック
- **UI コンポーネント**: shadcn/ui + Recharts の組み合わせ

Next.js 16 App Router と TypeScript の開発環境に統合でき、高速で DX が良いテストフレームワークが必要。

## 候補と評価

| フレームワーク | 設定の簡単さ | 実行速度 | Next.js 統合 | 評価 |
|------------|----------|--------|----------|------|
| **Vitest** | ★★☆ やさしい | ★★★ 非常に速い | ネイティブ | ⭐⭐⭐ |
| Jest | ★★★ 難しい | ★★☆ 通常速度 | 別設定が必要 | ⭐⭐☆ |
| Node:test | ★★☆ やさしい | ★★★ 速い | 最小限の設定 | ⭐⭐☆ |
| Mocha | ★★★ 難しい | ★★☆ 通常速度 | 別設定が必要 | ⭐☆☆ |

## 決定

**Vitest を採用する。**

## 理由

### 1. Vite ベースで高速実行
- Vite（Next.js 内部で使用）と同じエコシステム
- ホットモジュールリロード対応で開発フローが快適
- Jest より大幅に高速（単純な計算テストで 10 倍速）

**ベンチマーク例:**
```
Jest:   1500ms ~ 2000ms（キャッシュなし）
Vitest: 100ms ~ 200ms（同じテストセット）
```

### 2. TypeScript ネイティブ
- `.ts` / `.tsx` テストファイルをそのまま実行
- `ts-jest` などの設定が不要
- tsconfig.json の設定をそのまま継承

### 3. API が Jest 互換
- `describe()`, `it()`, `expect()` が同じ
- Jest から移行が容易（学習コスト低い）
- Jest 用のスニペット・ユーティリティが流用可能

**コード例:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateYearlyProjections } from '@/lib/projections/calculator';

describe('calculateYearlyProjections', () => {
  it('月収から年収を正確に計算する', () => {
    const projections = calculateYearlyProjections({
      initialAsset: 1000000,
      monthlyIncome: 300000,
      investmentRate: 0.10,
      years: 5,
    });
    
    expect(projections[0].yearlyIncome).toBe(3600000); // 300000 * 12
  });

  it('複利計算が正確である', () => {
    const projections = calculateYearlyProjections({
      initialAsset: 1000000,
      monthlyIncome: 0,
      investmentRate: 0.05,
      years: 2,
    });
    
    expect(projections[1].asset).toBe(1102500); // 1000000 * 1.05^2
  });

  it('ライフイベント費用を支出に計上する', () => {
    const projections = calculateYearlyProjections({
      initialAsset: 5000000,
      monthlyIncome: 300000,
      lifeEvents: [
        { year: 2027, amount: 3000000, name: 'home_purchase' },
      ],
      years: 3,
    });
    
    expect(projections[1].totalExpense).toContain(3000000);
  });
});
```

### 4. 計算エンジンのテストに最適
- 純粋関数（`src/lib/projections/calculator.ts`）のテストが簡潔
- snapshot testing で複雑な出力の差分を検出
- パラメータテスト（`describe.each()`）で複数パターンを効率的にテスト

### 5. UI Testing にも対応
- `@vitest/ui` で GUI テストランナー
- Playwright / Cypress と組み合わせ可能（E2E テスト）

## 影響

### ポジティブ
- 高速な開発フィードバック
- TypeScript のシームレス対応
- 計算ロジックの正確性を保証
- Server Actions のテスト容易化

### ネガティブ
- Jest ユーザーには新しいツール学習が必要（API は互換）
- 一部の複雑なモック設定は Jest より分かりにくい可能性

## 代替案と選定されない理由

### Jest
- **理由**: Vitest より遅く、TypeScript 設定が複雑（`ts-jest` ラッパー必要）
- **採用条件**: レガシープロジェクトとの統一が必須の場合

### Node:test
- **理由**: Node 標準 API で外部依存なしだが、アサーション/モック機能が限定的
- **採用条件**: 超シンプルなテストのみで十分な場合

## 次のステップ

1. `pnpm add -D vitest @vitest/ui` でインストール
2. `vitest.config.ts` を作成（Vite 設定を拡張）
3. `src/**/*.test.ts` / `src/**/*.test.tsx` を作成
   - `lib/projections/calculator.test.ts` ← 優先度高
   - `lib/projections/mortgage.test.ts`
   - `lib/projections/investment.test.ts`
4. `package.json` に `"test": "vitest"` スクリプト追加
5. `pnpm test` で実行、または `pnpm test:ui` で GUI 表示

## テスト戦略

### フェーズ別テストターゲット

| フェーズ | テスト対象 | テスト種別 | ターゲットカバレッジ |
|--------|---------|---------|------------|
| 1 (認証) | Server Actions | ユニット + E2E | 80% |
| 2 (家族・ライフプラン) | CRUD Server Actions | ユニット | 75% |
| 3 (ライフイベント) | バリデーション + CRUD | ユニット | 80% |
| 4 (計算エンジン) | 計算ロジック | ユニット | **95%+** |
| 5-8 (UI) | コンポーネント + 統合 | ユニット + E2E | 60% |

**優先順位:**
1. 計算エンジン（金融アプリの根幹）
2. Server Actions（ビジネスロジック）
3. UI コンポーネント（回帰防止）

## 将来の変更検討

- **E2E テストの充実が必要な場合**: Playwright を別途追加（`pnpm add -D @playwright/test`）
- **カバレッジリポート が必須な場合**: `vitest --coverage` で自動生成
