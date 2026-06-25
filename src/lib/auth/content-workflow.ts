import {
  createContentRevision,
  submitContentRevision,
} from "@/lib/services/admin-service";
import type { ContentChangeType, ContentEntityType } from "@/types/admin";

import { isOwnerRole } from "./permissions";

export function requiresApprovalWorkflow(role?: string | null) {
  return Boolean(role) && !isOwnerRole(role);
}

export async function submitContentChangeForApproval(options: {
  entityType: ContentEntityType;
  entityId: string;
  payload: Record<string, unknown>;
  changeType?: ContentChangeType;
  summary?: string;
  submitNote?: string;
}) {
  const revision = await createContentRevision({
    entityType: options.entityType,
    entityId: options.entityId,
    changeType: options.changeType ?? "update",
    payload: options.payload,
    summary: options.summary,
    submitNote: options.submitNote,
  });

  await submitContentRevision(revision.id, options.submitNote);

  return revision;
}
