export type アカウント = {
  ID: string;
  招待トークン: string;
  招待トークン有効期限: Date;
  作成日: Date;
};

export type ユーザー = {
  ID: string;
  アカウントID: string;
  メール: string;
  表示名: string | null;
  デモモード: boolean;
  作成日: Date;
};

export type 家族メンバー続柄 =
  | '夫'
  | '妻'
  | '長女'
  | '長男'
  | '次女'
  | '次男'
  | '三女'
  | '三男';

export type 家族メンバー = {
  ID: string;
  アカウントID: string;
  名前: string;
  生年月日: Date;
  続柄: 家族メンバー続柄;
  作成日: Date;
};

export type ライフプラン = {
  ID: string;
  アカウントID: string;
  名前: string;
  説明: string | null;
  有効フラグ: boolean;
  作成日: Date;
  更新日: Date;
};

export type ライフイベント種別 =
  | '出産'
  | '住宅購入'
  | '入学'
  | '習い事'
  | '退職';

type 基本ライフイベント = {
  ID: string;
  ライフプランID: string;
  イベント年: number;
  作成日: Date;
  更新日: Date;
};

export type 出産イベント = 基本ライフイベント & {
  イベント種別: '出産';
  家族メンバーID: string;
};

export type 住宅購入イベント = 基本ライフイベント & {
  イベント種別: '住宅購入';
  住宅価格: number;
  頭金: number;
  ローン返済年数: number;
  ローン利率: number;
  ボーナス月加算?: number;
};

export type 入学イベント = 基本ライフイベント & {
  イベント種別: '入学';
  学校種別: string;
  開始年: number;
  終了年: number;
  年間入学金?: number;
};

export type 習い事イベント = 基本ライフイベント & {
  イベント種別: '習い事';
  開始年: number;
  終了年: number;
  月謝: number;
  年次支出?: 習い事年次支出[];
};

export type 退職イベント = 基本ライフイベント & {
  イベント種別: '退職';
  退職年: number;
};

export type ライフイベント =
  | 出産イベント
  | 住宅購入イベント
  | 入学イベント
  | 習い事イベント
  | 退職イベント;

type 年別金額 = {
  ID: string;
  有効開始年: number;
  有効終了年?: number;
  作成日: Date;
};

type 習い事年次支出 = 年別金額 & {
  名前: string;
  金額: number;
  回数?: number;
};

export type 収入 = 年別金額 & {
  ライフプランID: string;
  家族メンバーID: string;
  月給: number;
  ボーナス額: number;
  想定昇給率: number;
};

export type 投資 = {
  ID: string;
  ライフプランID: string;
  投資種別: 'nisa' | 'ideco' | 'stock';
  年間拠出額: number;
  年間利回り: number;
  開始年: number;
  終了年?: number;
  作成日: Date;
};

export type 予算カテゴリ = {
  ID: string;
  アカウントID: string;
  名前: string;
  デフォルト: boolean;
  作成日: Date;
};

export type 予算 = {
  ID: string;
  ライフプランID: string;
  予算カテゴリID: string;
  金額: number;
  有効期間: string; // 'YYYY-MM'
  作成日: Date;
};

export type 支出 = {
  ID: string;
  アカウントID: string;
  予算カテゴリID: string;
  金額: number;
  支出日: Date;
  メモ?: string;
  作成日: Date;
};

// 予測計算の結果型
export type 年次予測 = {
  年: number;
  年齢: { [家族メンバーID: string]: number };
  収入: number;
  支出: number;
  投資利益: number;
  資産: number;
  ライフイベント: ライフイベント[];
};

export type 返済計画 = {
  月: number;
  元金: number;
  利息: number;
  残高: number;
  ボーナス加算?: number;
};

// API レスポンス型
export type アクション結果<T> =
  | { 成功: true; データ: T }
  | { 成功: false; エラー: string };
