import { Database } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 固定ユーザーID（2名で使用）
 * 実運用時は環境変数などで変更可能
 */
const USERS = {
  A: 'user_a',
  B: 'user_b',
};

/**
 * デフォルトユーザーID（ユーザーA）
 */
export async function getAuthUserId(): Promise<string> {
  // 認証なしなのでデフォルトユーザーAを返す
  return USERS.A;
}

/**
 * ユーザーが所属するチームIDを取得
 */
export async function getUserTeamId(db: Database, userId: string): Promise<string> {
  const member = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, userId),
  });
  
  if (!member) {
    // チームがない場合はデフォルトチームを返す
    return 'team_default';
  }
  
  return member.teamId;
}

/**
 * チームスコープの検証（簡略版）
 */
export async function assertTeamScope(
  db: Database,
  userId: string,
  teamId: string
): Promise<void> {
  // 認証なしの簡易版なのでチェックのみ
  const userTeamId = await getUserTeamId(db, userId);
  if (userTeamId !== teamId) {
    throw new Error('Forbidden: Team scope violation');
  }
}


