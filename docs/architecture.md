# アーキテクチャドキュメント — hizamaru

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [ドメインモデル](#2-ドメインモデル)
3. [データベーススキーマ](#3-データベーススキーマ)
4. [Server Actions 一覧](#4-server-actions-一覧)
5. [画面構成](#5-画面構成)
6. [フォルダ構成](#6-フォルダ構成)
7. [開発環境](#7-開発環境)

---

## 1. プロジェクト概要

夫婦2名を対象としたライフプランニングアプリ。「n歳時点でいくら必要か」を収支推移から自動計算し、家計簿と連動させることで実生活に即した資産シミュレーションを提供する。

| 項目           | 内容                                                |
| -------------- | --------------------------------------------------- |
| フレームワーク | Next.js 16（App Router）                            |
| データベース   | Supabase（PostgreSQL）                              |
| 認証           | Supabase Auth（招待制、最大2名）                    |
| パッケージ管理 | pnpm                                                |
| デプロイ       | Vercel                                              |
| APIレイヤー    | Server Actions のみ（REST API Routes は使用しない） |
| 開発ポート     | 31300〜31399                                        |

---

## 2. ドメインモデル

### 2.1 エンティティ一覧と責務

```
ユーザー
  - Supabase Auth の auth.users と 1:1 対応
  - アカウントID を持ち、アカウント に所属する

アカウント
  - 最大 2 名の ユーザー を持つ（夫婦単位）
  - 招待トークン で招待制を実現

家族メンバー
  - アカウント に属する「家族の構成員」（ユーザー とは別概念）
  - 本人（夫・妻）も含め、子供なども登録する
  - 年齢推移の基準となる `誕生日` を持つ

ライフプラン
  - アカウントに属する複数シナリオの1つ
  - ライフイベント, 収入, 投資 のコンテナ
  - 各アカウントはシナリオを10個保持できる

出産
  - 誕生日、生まれる子の 家族メンバーID（事後登録）

住宅購入
  - 購入価格, 頭金
  - ローン額, ローン年数, ローン年率
  - ボーナス返済額（/年）
  - 住宅ローン控除年数
  - 控除率（通常0.7%）

習い事
  - 家族メンバーID（対象の子供）
  - 月謝（月謝は一定ではない。デフォルト一定でいいが、任意の年以降の金額を設定できるようにしたい。）
  - イベント費（発表会費など年単位費用）
  - 開始年, 終了年

退職
  - 家族メンバーID（退職する本人）
  - 計画年
  - 退職金

収入
  - ライフプラン + 家族メンバー に紐づく
  - 月給（月謝と一緒で、デフォルト一定、任意の年以降いくらという設定を複数できるようにしたい）
  - ボーナス額（/回）
  - ボーナス回数/年
  - 開始年, 終了年

投資
  - ライフプラン に紐づく
  - 投資種別：新NISA | iDeCo | 株式
  - 家族メンバーID（iDeCo は個人紐づけ）
  - 年間積立額（月次でなくていいのか気になる）
  - 年率（%）
  - 開始年, 終了年

予算カテゴリ
  - アカウント に紐づく（アカウント 固有＋デフォルトのマージ）
  - 名称（食費、住宅費、交通費、…）
  - デフォルト定義かどうか（これ必要かな？初期化時にデフォルトを作ればいいだけでは？）

予算
  - ライフプラン + 予算カテゴリ に紐づく
  - 月次予算額
  - 有効期間開始（YYYY-MM）

支出
  - アカウント に紐づく（ライフプラン をまたいで実績は共通）
  - 予算カテゴリID
  - 金額, 支出日（DATE）
  - メモ
```

### 2.2 エンティティ関係図（テキスト表現）

```
auth.users (Supabase)
    |
    | 1:1
    v
ユーザー ──────────────────────── アカウント ──────────── 家族メンバー
  (family_id FK)                 | 1:N              (誕生日)
                                 |
                         ライフプラン
                           |  |  |  |
                   1:N  ───┘  |  └───  1:N
                   ▼          |         ▼
            ライフイベント   収入   投資
           (イベント種別で    (新NISA/iDeCo/株式)
            サブタイプ分岐)
                           |
                         予算
                           | N:1
                     予算カテゴリ ←── アカウント
                                              |
                                          支出
```

### 2.3 設計上の判断

**Single Table Inheritance（ライフイベント）:**
`life_events` テーブルを「1テーブル + サブタイプカラム」の STI パターンで実装した理由は、出産・住宅購入・入学・退職のいずれも `計画年` と `家族メンバーID` という共通軸を持ち、ライフイベントタイムライン画面で全イベントを1クエリで取得することが性能・実装の観点から重要だから。サブタイプごとに別テーブルを作る設計（多態的関連）は、タイムライン表示時に必要な `UNION ALL` が冗長になるため採用しない。

**支出のアカウント直紐づけ:**
支出実績はシナリオに関係なく「実際に使った金額」であるため `アカウントID` に直接紐づける。予算（`予算`）はシナリオ別に異なる金額を設定できるが、実績は1つだけ存在する（過去は変わらないから）。

---

## 3. データベーススキーマ

### 3.1 RLS（Row Level Security）の方針

| 原則                              | 内容                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| 全テーブルで RLS 有効             | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`                                                 |
| アカウントID ベースのアクセス制御 | `auth.uid()` から `ユーザー.アカウントID` を解決し、同一アカウント のデータのみ参照・更新可 |
| 支出/予算カテゴリ                 | アカウント スコープ（ライフプラン をまたいで共有）                                          |
| ライフプラン 以下のデータ         | ライフプラン.アカウントID で制御                                                            |
| 招待トークン                      | 未認証ユーザーが SELECT のみ可（招待フロー用）                                              |

### 3.2 テーブル定義（SQL）

```sql
-- ===========================
-- アカウント
-- ===========================
CREATE TABLE families (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  invite_token  TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "招待トークンは誰でも参照可"
  ON families FOR SELECT
  USING (true);

CREATE POLICY "アカウントメンバーは自分のアカウントを更新可"
  ON families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- ===========================
-- ユーザー（auth.users の拡張プロファイル）
-- ===========================
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id    UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id  UUID NOT NULL REFERENCES families(id),
  display_name TEXT,
  role       TEXT CHECK (role IN ('primary', 'partner')) DEFAULT 'primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分のアカウント内のユーザーを参照可"
  ON users FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "ユーザーは自分のプロフィールを更新可"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- ===========================
-- 家族メンバー
-- ===========================
CREATE TABLE family_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id),
  name        TEXT NOT NULL,
  birth_date  DATE NOT NULL,
  relation    TEXT CHECK (relation IN ('self_primary', 'self_partner', 'child', 'other')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "家族メンバーはアカウント内でアクセス可"
  ON family_members FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- ===========================
-- ライフプラン
-- ===========================
CREATE TABLE life_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID NOT NULL REFERENCES families(id),
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE life_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ライフプランはアカウント内でアクセス可"
  ON life_plans FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- ===========================
-- ライフイベント（全種別共通テーブル）
-- ===========================
CREATE TABLE life_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_plan_id    UUID NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL CHECK (
    event_type IN ('birth', 'home_purchase', 'education', 'retirement')
  ),
  title           TEXT NOT NULL,
  planned_year    INT NOT NULL,
  family_member_id UUID REFERENCES family_members(id),
  -- birth
  expected_birth_date DATE,
  -- home_purchase
  purchase_price       NUMERIC(14,0),
  down_payment         NUMERIC(14,0),
  loan_amount          NUMERIC(14,0),
  loan_years           INT,
  loan_rate            NUMERIC(6,4),
  bonus_payment_amount NUMERIC(14,0),
  tax_deduction_years  INT,
  tax_deduction_rate   NUMERIC(6,4) DEFAULT 0.007,
  -- education
  lesson_monthly_fee        NUMERIC(10,0),
  lesson_event_fee_per_year NUMERIC(10,0),
  education_start_year      INT,
  education_end_year        INT,
  -- retirement
  severance_pay    NUMERIC(14,0),
  -- 共通
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ライフイベントはライフプラン経由でアクセス可"
  ON life_events FOR ALL
  USING (
    life_plan_id IN (
      SELECT id FROM life_plans
      WHERE family_id IN (
        SELECT family_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- ===========================
-- 収入（人物別・シナリオ別）
-- ===========================
CREATE TABLE incomes (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_plan_id         UUID NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  family_member_id     UUID NOT NULL REFERENCES family_members(id),
  monthly_salary       NUMERIC(12,0) NOT NULL DEFAULT 0,
  bonus_amount         NUMERIC(12,0) NOT NULL DEFAULT 0,
  bonus_count_per_year INT NOT NULL DEFAULT 2,
  expected_raise_rate  NUMERIC(5,4) NOT NULL DEFAULT 0,
  valid_from_year      INT NOT NULL,
  valid_until_year     INT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "収入はライフプラン経由でアクセス可"
  ON incomes FOR ALL
  USING (
    life_plan_id IN (
      SELECT id FROM life_plans
      WHERE family_id IN (
        SELECT family_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- ===========================
-- 投資
-- ===========================
CREATE TABLE investments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_plan_id        UUID NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  family_member_id    UUID REFERENCES family_members(id),
  investment_type     TEXT NOT NULL CHECK (
    investment_type IN ('nisa', 'ideco', 'stock')
  ),
  label               TEXT NOT NULL,
  annual_contribution NUMERIC(12,0) NOT NULL DEFAULT 0,
  annual_return_rate  NUMERIC(6,4) NOT NULL DEFAULT 0.05,
  start_year          INT NOT NULL,
  end_year            INT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "投資はライフプラン経由でアクセス可"
  ON investments FOR ALL
  USING (
    life_plan_id IN (
      SELECT id FROM life_plans
      WHERE family_id IN (
        SELECT family_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- ===========================
-- 予算カテゴリ
-- ===========================
CREATE TABLE budget_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id   UUID REFERENCES families(id),
  name        TEXT NOT NULL,
  icon        TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "デフォルトカテゴリは認証ユーザーが参照可"
  ON budget_categories FOR SELECT
  USING (
    is_default = TRUE
    OR family_id IN (
      SELECT family_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "アカウントは独自のカテゴリを管理可"
  ON budget_categories FOR INSERT UPDATE DELETE
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- ===========================
-- 予算（月次予算設定）
-- ===========================
CREATE TABLE budgets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  life_plan_id        UUID NOT NULL REFERENCES life_plans(id) ON DELETE CASCADE,
  budget_category_id  UUID NOT NULL REFERENCES budget_categories(id),
  monthly_amount      NUMERIC(12,0) NOT NULL DEFAULT 0,
  valid_from          TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (life_plan_id, budget_category_id, valid_from)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "予算はライフプラン経由でアクセス可"
  ON budgets FOR ALL
  USING (
    life_plan_id IN (
      SELECT id FROM life_plans
      WHERE family_id IN (
        SELECT family_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- ===========================
-- 支出（支出実績）
-- ===========================
CREATE TABLE expenses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id           UUID NOT NULL REFERENCES families(id),
  budget_category_id  UUID NOT NULL REFERENCES budget_categories(id),
  amount              NUMERIC(12,0) NOT NULL,
  spent_on            DATE NOT NULL,
  note                TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "支出はアカウント内でアクセス可"
  ON expenses FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- ===========================
-- インデックス
-- ===========================
CREATE INDEX idx_life_events_life_plan    ON life_events(life_plan_id);
CREATE INDEX idx_life_events_type_year    ON life_events(event_type, planned_year);
CREATE INDEX idx_incomes_life_plan        ON incomes(life_plan_id);
CREATE INDEX idx_investments_life_plan    ON investments(life_plan_id);
CREATE INDEX idx_budgets_life_plan        ON budgets(life_plan_id);
CREATE INDEX idx_expenses_family_spent_on ON expenses(family_id, spent_on);
CREATE INDEX idx_expenses_category        ON expenses(budget_category_id);
```

---

## 4. Server Actions 一覧

Server Actions は `src/app/actions/` 配下のカテゴリ別ファイルに配置する。全 Actions は `use server` ディレクティブを持ち、認証チェックを先頭で実行する。

### 4.1 認証・アカウント管理アクション

ファイル: `src/app/actions/auth.ts`

```typescript
// アカウント作成: 新規アカウント作成とユーザー登録
アカウント作成(input: {
  accountName: string;
  displayName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string; accountId?: string }>

// 参加: 招待トークンでアカウントに参加
参加(input: {
  inviteToken: string;
  displayName: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string; accountId?: string }>

// ユーザー情報更新: プロフィール更新
ユーザー情報更新(input: {
  displayName: string;
}): Promise<{ success: boolean; error?: string; user?: UserProfile }>

// 招待トークン再生成
招待トークン再生成(): Promise<{ success: boolean; error?: string; inviteToken?: string }>
```

### 4.2 家族メンバーアクション

ファイル: `src/app/actions/family-members.ts`

```typescript
// 家族メンバー一覧取得
家族メンバー一覧取得(): Promise<{ success: boolean; error?: string; data?: FamilyMember[] }>

// 家族メンバー追加: 子供の誕生時など
家族メンバー追加(input: {
  name: string;
  birthDate: string;
  relation: 'self_primary' | 'self_partner' | 'child' | 'other';
}): Promise<{ success: boolean; error?: string; data?: FamilyMember }>

// 家族メンバー更新
家族メンバー更新(
  id: string,
  input: Partial<{ name: string; birthDate: string; relation: string }>
): Promise<{ success: boolean; error?: string; data?: FamilyMember }>

// 家族メンバー削除
家族メンバー削除(id: string): Promise<{ success: boolean; error?: string }>
```

### 4.3 ライフプランアクション

ファイル: `src/app/actions/life-plans.ts`

```typescript
// ライフプラン一覧取得: シナリオ一覧
ライフプラン一覧取得(): Promise<{ success: boolean; error?: string; data?: LifePlan[] }>

// ライフプラン作成: 新規シナリオ作成（最初のシナリオは自動的にメインシナリオ=is_active:true）
ライフプラン作成(input: {
  name: string;
  description?: string;
}): Promise<{ success: boolean; error?: string; data?: LifePlan }>

// ライフプラン更新
ライフプラン更新(
  id: string,
  input: Partial<{ name: string; description: string; isActive: boolean }>
): Promise<{ success: boolean; error?: string; data?: LifePlan }>

// ライフプラン複製: 既存シナリオをコピー
ライフプラン複製(sourceId: string, newName: string): Promise<{ success: boolean; error?: string; data?: LifePlan }>

// ライフプラン削除
ライフプラン削除(id: string): Promise<{ success: boolean; error?: string }>
```

### 4.4 ライフイベントアクション

ファイル: `src/app/actions/life-events.ts`

```typescript
// 出産イベント作成
出産イベント作成(lifePlanId: string, input: {
  title: string;
  plannedYear: number;
  expectedBirthDate?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string; data?: LifeEvent }>

// 住宅購入イベント作成
住宅購入イベント作成(lifePlanId: string, input: {
  title: string;
  plannedYear: number;
  purchasePrice: number;
  downPayment: number;
  loanAmount: number;
  loanYears: number;
  loanRate: number;
  bonusPaymentAmount: number;
  taxDeductionYears: number;
  taxDeductionRate: number;
  notes?: string;
}): Promise<{ success: boolean; error?: string; data?: LifeEvent }>

// 入学イベント作成: 習い事含む
入学イベント作成(lifePlanId: string, input: {
  title: string;
  plannedYear: number;
  familyMemberId: string;
  lessonMonthlyFee: number;
  lessonEventFeePerYear: number;
  educationStartYear: number;
  educationEndYear: number;
  notes?: string;
}): Promise<{ success: boolean; error?: string; data?: LifeEvent }>

// 退職イベント作成
退職イベント作成(lifePlanId: string, input: {
  title: string;
  plannedYear: number;
  familyMemberId: string;
  severancePay: number;
  notes?: string;
}): Promise<{ success: boolean; error?: string; data?: LifeEvent }>

// ライフイベント更新
ライフイベント更新(
  id: string,
  input: Partial<any>
): Promise<{ success: boolean; error?: string; data?: LifeEvent }>

// ライフイベント削除
ライフイベント削除(id: string): Promise<{ success: boolean; error?: string }>
```

### 4.5 収入アクション

ファイル: `src/app/actions/incomes.ts`

```typescript
// 収入追加
収入追加(lifePlanId: string, input: {
  familyMemberId: string;
  monthlySalary: number;
  bonusAmount: number;
  bonusCountPerYear: number;
  expectedRaiseRate: number;
  validFromYear: number;
  validUntilYear?: number;
}): Promise<{ success: boolean; error?: string; data?: Income }>

// 収入更新
収入更新(
  id: string,
  input: Partial<any>
): Promise<{ success: boolean; error?: string; data?: Income }>

// 収入削除
収入削除(id: string): Promise<{ success: boolean; error?: string }>
```

### 4.6 投資アクション

ファイル: `src/app/actions/investments.ts`

```typescript
// 投資一覧取得
投資一覧取得(lifePlanId: string): Promise<{ success: boolean; error?: string; data?: Investment[] }>

// 投資追加: 新NISA、iDeCo、株式など
投資追加(lifePlanId: string, input: {
  familyMemberId?: string;
  investmentType: 'nisa' | 'ideco' | 'stock';
  label: string;
  annualContribution: number;
  annualReturnRate: number;
  startYear: number;
  endYear?: number;
}): Promise<{ success: boolean; error?: string; data?: Investment }>

// 投資更新
投資更新(
  id: string,
  input: Partial<any>
): Promise<{ success: boolean; error?: string; data?: Investment }>

// 投資削除
投資削除(id: string): Promise<{ success: boolean; error?: string }>
```

### 4.7 予算アクション

ファイル: `src/app/actions/budgets.ts`

```typescript
// 予算カテゴリ一覧取得: デフォルト＋アカウント独自
予算カテゴリ一覧取得(): Promise<{ success: boolean; error?: string; data?: BudgetCategory[] }>

// 予算カテゴリ作成
予算カテゴリ作成(input: {
  name: string;
  icon?: string;
  sortOrder: number;
}): Promise<{ success: boolean; error?: string; data?: BudgetCategory }>

// 予算カテゴリ更新
予算カテゴリ更新(
  id: string,
  input: Partial<{ name: string; icon: string; sortOrder: number }>
): Promise<{ success: boolean; error?: string; data?: BudgetCategory }>

// 予算カテゴリ削除
予算カテゴリ削除(id: string): Promise<{ success: boolean; error?: string }>

// 月次予算一覧取得
月次予算一覧取得(lifePlanId: string, month: string): Promise<{ success: boolean; error?: string; data?: Budget[] }>

// 月次予算作成または更新
月次予算設定(lifePlanId: string, input: {
  budgetCategoryId: string;
  monthlyAmount: number;
  validFrom: string;
}): Promise<{ success: boolean; error?: string; data?: Budget }>
```

### 4.8 支出アクション

ファイル: `src/app/actions/expenses.ts`

```typescript
// 支出一覧取得（残高付き）: 当月支出とカテゴリ別残高
支出一覧取得(month: string): Promise<{ success: boolean; error?: string; data?: Array<{
  expense: Expense;
  category: BudgetCategory;
  budget: Budget | null;
  remaining: number;
}> }>

// 支出記録: 家計簿に支出を入力
支出記録(input: {
  budgetCategoryId: string;
  amount: number;
  spentOn: string;
  note?: string;
}): Promise<{ success: boolean; error?: string; data?: Expense }>

// 支出更新
支出更新(
  id: string,
  input: Partial<any>
): Promise<{ success: boolean; error?: string; data?: Expense }>

// 支出削除
支出削除(id: string): Promise<{ success: boolean; error?: string }>

// 月別支出サマリー: カテゴリ別の予算・実績・残高
月別支出サマリー(year: number, month: number): Promise<{ success: boolean; error?: string; data?: Array<{
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remaining: number;
}> }>
```

### 4.9 予測計算アクション

ファイル: `src/app/actions/projections.ts`

```typescript
// 年次予測計算: 収支・資産推移を計算
年次予測計算(lifePlanId: string, options?: {
  fromYear?: number;
  toYear?: number;
}): Promise<{ success: boolean; error?: string; data?: YearlyProjection[] }>

// 住宅ローン返済計画: 元利均等返済の内訳計算
住宅ローン返済計画(input: {
  loanAmount: number;
  loanYears: number;
  loanRate: number;
  bonusPaymentAmount: number;
}): Promise<{ success: boolean; error?: string; data?: Array<{
  year: number;
  monthlyPayment: number;
  bonusPayment: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}> }>
```

---

## 5. 画面構成

### 5.1 画面一覧とルート

| 画面名                     | ルート                      | 認証要否 |
| -------------------------- | --------------------------- | -------- |
| ログイン                   | `/login`                    | 不要     |
| 家族作成（初回登録）       | `/onboarding/create`        | 不要     |
| 参加                       | `/invite/[token]`           | 不要     |
| ダッシュボード             | `/`                         | 要       |
| ライフイベントタイムライン | `/timeline`                 | 要       |
| ライフイベント詳細         | `/timeline/[eventId]`       | 要       |
| ライフイベント追加         | `/timeline/new`             | 要       |
| 収入設定                   | `/settings/income`          | 要       |
| 投資設定                   | `/settings/investments`     | 要       |
| 予算設定                   | `/settings/budgets`         | 要       |
| 家計簿（支出入力）         | `/household`                | 要       |
| 月別サマリー               | `/household/[year]/[month]` | 要       |
| シナリオ管理               | `/scenarios`                | 要       |
| 家族設定                   | `/settings/family`          | 要       |
| カテゴリ管理               | `/settings/categories`      | 要       |

### 5.2 主要画面の詳細

#### ダッシュボード (`/`)

- **表示内容**: メインシナリオの資産推移グラフ（現在年〜5年先）、直近ライフイベント、今月の家計簿残高
- **メインシナリオ切り替え**: ヘッダーに「現在のシナリオ」ドロップダウンを配置、ユーザーが選択可能
  - 選択するとダッシュボード全体が再計算される（`is_active` を更新）
- **使用 Server Actions**: ライフプラン一覧取得（メインシナリオ判定用）、年次予測計算（is_active=true のシナリオで実行）、月別支出サマリー、ライフプラン更新（メインシナリオ切り替え時）

#### ライフイベントタイムライン (`/timeline`) ★ 要件で明示的に要求された画面

- **表示内容**: メインシナリオの西暦別、家族メンバー年齢と必要資金の一覧表
- **レイアウト**: 縦軸=西暦年、横軸=家族メンバー（年齢表示）+ ライフイベント + 必要資金
- **インタラクション**: 各ライフイベント上で「編集」をクリック → モーダルで直接編集
- **使用 Server Actions**: 年次予測計算（全期間）、家族メンバー一覧取得、出産イベント作成/更新/削除、住宅購入イベント作成/更新/削除、入学イベント作成/更新/削除、退職イベント作成/更新/削除

#### 家計簿 (`/household`)

- **表示内容**: カテゴリ別の当月予算残高、支出入力フォーム
- **インタラクション**: 支出入力 → Server Action → 即時残高更新
- **使用 Server Actions**: 支出一覧取得、支出記録、月別支出サマリー

#### 家族設定 (`/settings/family`)

- **表示内容**: 家族メンバー一覧、各メンバーの収入設定（ライフプラン選択時）
- **インタラクション**: 家族メンバー追加・編集、家族メンバーの年別収入を設定
- **使用 Server Actions**: 家族メンバー一覧取得、家族メンバー追加/更新/削除、収入追加/更新/削除、ライフプラン一覧取得

#### シナリオ管理 (`/scenarios`)

- **表示内容**: ライフプラン一覧、複数プランの比較グラフ、各シナリオの要約
- **インタラクション**: シナリオ作成・複製・削除、メインシナリオ設定
- **使用 Server Actions**: ライフプラン一覧取得、ライフプラン作成、ライフプラン複製、ライフプラン削除、ライフプラン更新（メインシナリオ切り替え）、年次予測計算（複数シナリオで並列実行して比較）

---

## 6. フォルダ構成

```
hizamaru/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # ルートレイアウト
│   │   ├── page.tsx                      # ダッシュボード
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   ├── invite/
│   │   │   └── [token]/
│   │   │       └── page.tsx
│   │   ├── timeline/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [eventId]/
│   │   │       └── page.tsx
│   │   ├── household/
│   │   │   ├── page.tsx
│   │   │   └── [year]/
│   │   │       └── [month]/
│   │   │           └── page.tsx
│   │   ├── scenarios/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── family/
│   │   │   │   └── page.tsx
│   │   │   └── categories/
│   │   │       └── page.tsx
│   │   └── actions/
│   │       ├── auth.ts
│   │       ├── family-members.ts
│   │       ├── life-plans.ts
│   │       ├── life-events.ts
│   │       ├── incomes.ts
│   │       ├── investments.ts
│   │       ├── budgets.ts
│   │       ├── expenses.ts
│   │       └── projections.ts
│   ├── components/
│   │   ├── ui/                           # 汎用UIコンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── timeline/
│   │   │   ├── timeline-table.tsx
│   │   │   ├── event-card.tsx
│   │   │   └── event-form/
│   │   │       ├── birth-event-form.tsx
│   │   │       ├── home-purchase-form.tsx
│   │   │       ├── education-event-form.tsx
│   │   │       └── retirement-event-form.tsx
│   │   ├── household/
│   │   │   ├── expense-input-form.tsx
│   │   │   ├── budget-balance-card.tsx
│   │   │   └── monthly-summary-chart.tsx
│   │   ├── projections/
│   │   │   ├── asset-projection-chart.tsx
│   │   │   └── scenario-comparison.tsx
│   │   └── settings/
│   │       ├── income-form.tsx
│   │       ├── investment-form.tsx
│   │       └── category-crud.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # ブラウザ用
│   │   │   ├── server.ts                 # Server Components/Actions用
│   │   │   └── proxy.ts
│   │   ├── projections/
│   │   │   ├── calculator.ts             # 年次予測計算エンジン（純粋関数）
│   │   │   ├── mortgage.ts               # 住宅ローン計算
│   │   │   └── investment.ts             # 複利計算
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts                      # 全型定義
│   └── proxy.ts
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql        # スキーマ定義
│   └── seed.sql                          # デフォルトカテゴリ等
├── docs/
│   └── architecture.md                   # このファイル
├── .env.local.example
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

---

## 7. 開発環境

### 環境変数（.env.local）

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
```

### パッケージマネージャー・スクリプト

```json
{
  "scripts": {
    "dev": "next dev --port 31300",
    "build": "next build",
    "start": "next start --port 31300"
  }
}
```

ポート指定により 31300〜31399 要件を満たす。

### 計算エンジンの方針

`src/lib/projections/calculator.ts` は Server Action から切り離された**純粋関数**として実装する。

- Supabase への追加クエリなし
- メモリ上で 50 年分の計算を完結
- 複数シナリオ比較時の並列実行（Promise.all）が可能
- 単体テスト容易

計算ロジックの概要：

1. 全収入を `開始年` 〜 `終了年` でスライス、`昇給率` で年次スケール
2. 固定支出（住宅ローン元利均等返済、教育費月謝×12）を各年に配置
3. 投資残高を `年率` の複利で各年末に更新
4. 住宅ローン控除：`計画年` から `控除年数` の間、`ローン額 × 控除率` を所得税から控除
5. 各年の `累積残高` = 前年累積 + 当年 `純収支` + 投資評価益
