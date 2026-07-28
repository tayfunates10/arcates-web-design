import "server-only";

import { createHandoffAcknowledgement, requestsHumanHandoff } from "@/lib/chat/handoff-core";

export { requestsHumanHandoff };

export function handoffAcknowledgement() {
  return createHandoffAcknowledgement();
}
