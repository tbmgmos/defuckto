import { Block, Report, ReportTargetType } from '../models';
import { db, delay } from './localDatabase';
import { createId } from '../utils/id';
import { isoNow } from '../utils/date';

// No real review queue in this demo (see spec §28) — reports are just
// recorded. A production version would route these to a moderation
// dashboard and could auto-hide content past a report threshold.
export const moderationService = {
  async reportContent(reporterId: string, targetType: ReportTargetType, targetId: string, reason: string): Promise<Report> {
    const report: Report = {
      id: createId('rep'),
      reporterId,
      targetType,
      targetId,
      reason,
      createdAt: isoNow(),
    };
    db.reports.push(report);
    return delay(report);
  },

  async blockUser(blockerId: string, blockedId: string): Promise<Block> {
    const existing = db.blocks.find((b) => b.blockerId === blockerId && b.blockedId === blockedId);
    if (existing) return delay(existing, 0);
    const block: Block = { id: createId('blk'), blockerId, blockedId, createdAt: isoNow() };
    db.blocks.push(block);
    return delay(block);
  },

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    db.blocks = db.blocks.filter((b) => !(b.blockerId === blockerId && b.blockedId === blockedId));
    return delay(undefined, 0);
  },

  async getBlockedIds(blockerId: string): Promise<Set<string>> {
    return delay(new Set(db.blocks.filter((b) => b.blockerId === blockerId).map((b) => b.blockedId)));
  },
};
