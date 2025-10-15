import { auth } from '@clerk/nextjs/server';
import { Database } from '@/db';
import { teamMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 認証済みユーザーのIDを取得
 */
export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }
  return userId;
}

/**
 * ユーザーが所属するチームIDを取得
 */
export async function getUserTeamId(db: Database, userId: string): Promise<string> {
  const member = await db.query.teamMembers.findFirst({
    where: eq(teamMembers.userId, userId),
  });
  
  if (!member) {
    throw new Error('User not in any team');
  }
  
  return member.teamId;
}

/**
 * チームスコープの検証
 * 指定されたリソースが、ユーザーの所属するチームに属するかを確認
 */
export async function assertTeamScope(
  db: Database,
  userId: string,
  teamId: string
): Promise<void> {
  const userTeamId = await getUserTeamId(db, userId);
  if (userTeamId !== teamId) {
    throw new Error('Forbidden: Team scope violation');
  }
}

