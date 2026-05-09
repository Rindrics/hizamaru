# ADR-003: データバリデーションに Zod を採用

## ステータス
承認（Accepted）

## 日付
2026-05-09

## 背景

hizamaru では以下の複雑なバリデーションが必要である：
- ライフイベント（出産、住宅購入、習い事、退職）の複数パラメータ
- 収入の年次変動（昇給率、期間指定）
- 投資設定（投資種別、拠出額、想定利回り）
- 予算カテゴリと月次予算の関連付け
- 支出入力のカテゴリとの整合性

クライアント側とサーバー側の両方で同じスキーマを使用し、バリデーションを統一したい。TypeScript の型安全性と組み合わせ、ランタイムのバリデーションエラーを明確に扱えるライブラリが必要。

## 候補と評価

| ライブラリ | 学習曲線 | TypeScript 統合 | スキーマ共有 | hizamaru 適性 |
|---------|--------|------------|----------|-----------|
| **Zod** | ★★☆ やさしい | ネイティブ | 容易 | ⭐⭐⭐ |
| Yup | ★★★ 難しい | ラッパー必要 | 中程度 | ⭐⭐☆ |
| io-ts | ★★★★ 難しい | ネイティブ | 容易 | ⭐☆☆ |
| Joi | ★★★ 難しい | 別設定必要 | 中程度 | ⭐☆☆ |
| Valibot | ★★☆ やさしい | ネイティブ | 容易 | ⭐⭐☆ |

## 決定

**Zod を採用する。**

## 理由

### 1. TypeScript ネイティブ設計
- スキーマから自動的に TypeScript 型を推論（`z.infer<typeof schema>`）
- クライアント・サーバー間で同じスキーマをインポートして使用可能
- 型定義の二重管理が不要

**コード例:**
```typescript
import { z } from 'zod';

export const EducationEventSchema = z.object({
  familyMemberId: z.string().uuid(),
  eventType: z.literal('education'),
  eventYear: z.number().int().min(2000).max(2100),
  schoolType: z.enum(['nursery', 'elementary', 'junior_high', 'high_school', 'university']),
  startYear: z.number().int(),
  endYear: z.number().int(),
  monthlyTuition: z.number().positive(),
  annualEntranceFee: z.number().nonnegative(),
  extraActivitiesMonthly: z.number().nonnegative().optional().default(0),
}).refine(data => data.endYear > data.startYear, {
  message: '終了年は開始年より後である必要があります',
  path: ['endYear'],
});

type EducationEvent = z.infer<typeof EducationEventSchema>;
```

### 2. hizamaru の複雑なバリデーションに対応
- Nested object・array の複合バリデーション
- `refine()` で複数フィールドの相互バリデーション（例：開始年 < 終了年）
- enum で event_type に基づいた型安全性

### 3. エラーメッセージの詳細性
- バリデーション失敗時に、どのフィールドが・なぜ失敗したかを明確に返す
- Server Actions での統一的なエラーハンドリング

**コード例:**
```typescript
'use server';

export async function 入学イベント作成(data: unknown) {
  const result = EducationEventSchema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error.flatten().fieldErrors,
    };
  }

  // result.data は型安全な EducationEvent
  const event = await db.lifeEvents.create(result.data);
  return { success: true, data: event };
}
```

### 4. 学習曲線が緩い
- シンプルなチェーン可能な API（`.string().email().min(10)`）
- ドキュメントが充実している
- エラーメッセージのカスタマイズが容易

### 5. ファイルサイズが小さい
- Tree-shaking 対応
- gzip 圧縮後 ~8KB（io-ts の 1/3 程度）

## 影響

### ポジティブ
- クライアント・サーバー間のスキーマ統一
- バリデーション漏れの防止
- 型安全な開発
- エラーメッセージの一貫性

### ネガティブ
- すべてのスキーマを Zod で定義する必要（初期開発コスト）
- `safeParse()` と `parse()` の使い分け判断が必要

## 代替案と選定されない理由

### Yup
- **理由**: TypeScript 統合が後付けで、型推論が弱い。
- **採用条件**: Formik を強く使用したい場合（現在は shadcn/ui + React Hook Form で対応）

### io-ts
- **理由**: 関数型プログラミングのパラダイムで学習曲線が高い。
- **採用条件**: 関数型言語からの移行者が開発チーム にいる場合

### Valibot
- **理由**: Zod と同等だが、コミュニティが小さい。
- **採用条件**: バンドルサイズ最適化が最優先の場合

## 次のステップ

1. `pnpm add zod` でインストール
2. `src/types/schemas/` にスキーマ定義ファイルを作成
3. ライフイベント、収入、投資、予算などのスキーマを定義
4. Server Actions に `safeParse()` を組み込む
5. フォームコンポーネントに `useFormContext` (React Hook Form) と組み合わせ

## 将来の変更検討

- **バンドルサイズ最適化が最優先な場合**: Valibot への乗り換え検討
- **リアルタイム バリデーション UI が必須な場合**: フォームライブラリの拡張（conform など）検討
