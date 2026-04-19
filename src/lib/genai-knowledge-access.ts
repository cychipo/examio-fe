import { env } from "@/lib/env";
import { User } from "@/types/user";

function getAllowedEmails(): string[] {
  return env.genAITutorAllowedEmails
    .split(",")
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
}

export function canAccessGenAIKnowledgeManager(user: User | null | undefined) {
  if (!user || user.role !== "teacher") {
    return false;
  }

  const allowedEmails = getAllowedEmails();
  if (allowedEmails.length === 0) {
    return true;
  }

  return allowedEmails.includes(user.email.trim().toLowerCase());
}

export function isGenAIKnowledgeRestrictedByEmail() {
  return getAllowedEmails().length > 0;
}
