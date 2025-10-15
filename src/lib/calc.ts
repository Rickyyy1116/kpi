/**
 * KPI達成率の計算
 * @param dir - 方向（up: 目標値以上を目指す、down: 目標値以下を目指す）
 * @param current - 現在の値
 * @param target - 目標値
 * @returns 達成率（0〜1.2）
 */
export function kpiRatio({ 
  dir, 
  current, 
  target 
}: { 
  dir: 'up' | 'down'; 
  current: number; 
  target: number; 
}) {
  if (target <= 0) return 0;
  const r = dir === 'up' 
    ? current / target 
    : target / Math.max(current, 0.0001);
  return Math.min(r, 1.2);
}

/**
 * Goal進捗の計算（等配平均）
 * @param kpis - KPIの配列（weight と ratio を含む）
 * @returns 進捗率（0〜100%）
 */
export function goalProgress(kpis: { weight?: number; ratio: number; }[]) {
  if (kpis.length === 0) return 0;
  const totalW = kpis.reduce((s, k) => s + (k.weight ?? 1), 0) || 1;
  const score = kpis.reduce((s, k) => s + (k.ratio * (k.weight ?? 1)), 0) / totalW;
  return Math.round(score * 100);
}

/**
 * 未更新判定
 * @param lastUpdate - 最終更新日時（ミリ秒）
 * @param frequency - 頻度
 * @returns 未更新かどうか
 */
export function isOverdue(lastUpdate: number | null, frequency: 'daily' | 'weekly' | 'monthly'): boolean {
  if (!lastUpdate) return true;
  
  const now = Date.now();
  const diff = now - lastUpdate;
  const dayMs = 24 * 60 * 60 * 1000;
  
  switch (frequency) {
    case 'daily':
      return diff > dayMs;
    case 'weekly':
      return diff > 7 * dayMs;
    case 'monthly':
      return diff > 30 * dayMs;
    default:
      return false;
  }
}

/**
 * 残日数の計算
 * @param dueDate - 期限（ミリ秒）
 * @returns 残日数
 */
export function daysRemaining(dueDate: number | null): number | null {
  if (!dueDate) return null;
  const now = Date.now();
  const diff = dueDate - now;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

