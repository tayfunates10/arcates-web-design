import assert from "node:assert/strict";
import test from "node:test";
import { requestsHumanHandoff, createHandoffAcknowledgement } from "../lib/chat/handoff-core";
import {
  chatMessageSchema,
  knowledgeDocumentSchema,
  leadSchema,
  registrationSchema,
  supportTicketSchema,
} from "../lib/validation";

test("human handoff phrases are recognized without matching ordinary support text", () => {
  assert.equal(requestsHumanHandoff("Beni canlı desteğe bağlar mısınız?"), true);
  assert.equal(requestsHumanHandoff("Bir müşteri temsilcisi ile görüşmek istiyorum"), true);
  assert.equal(requestsHumanHandoff("Web sitesi için teknik destek paketi istiyorum"), false);
  assert.equal(createHandoffAcknowledgement().source, "HUMAN_HANDOFF_REQUESTED");
});

test("registration requires a strong password and explicit consent", () => {
  const valid = registrationSchema.safeParse({
    name: "Tayfun Ateş",
    company: "Arcates",
    email: "tayfun@example.com",
    password: "GuvenliParola2026",
    consent: "on",
  });
  assert.equal(valid.success, true);

  const weak = registrationSchema.safeParse({
    name: "Tayfun Ateş",
    company: "Arcates",
    email: "tayfun@example.com",
    password: "123456",
    consent: "on",
  });
  assert.equal(weak.success, false);
});

test("lead and support payload limits reject incomplete records", () => {
  assert.equal(leadSchema.safeParse({
    name: "Tayfun Ateş",
    email: "tayfun@example.com",
    description: "Kısa",
    consent: true,
  }).success, false);

  assert.equal(supportTicketSchema.safeParse({
    title: "Hata",
    description: "Yetersiz açıklama",
    priority: "URGENT",
  }).success, false);
});

test("chat and knowledge schemas enforce bounded, normalized content", () => {
  assert.equal(chatMessageSchema.safeParse({ message: "" }).success, false);
  assert.equal(chatMessageSchema.safeParse({ message: "Proje durumumu göster" }).success, true);

  const knowledge = knowledgeDocumentSchema.safeParse({
    title: "Arcates destek süreci",
    slug: "arcates-destek-sureci",
    content: "Bu içerik doğrulanmış destek sürecini ve kullanıcıların izlemesi gereken adımları ayrıntılı biçimde açıklar.",
    visibility: "PUBLIC",
  });
  assert.equal(knowledge.success, true);
});
