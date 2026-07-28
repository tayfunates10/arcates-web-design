import assert from "node:assert/strict";
import test from "node:test";
import { authTokenEventType, generateAuthToken, hashAuthToken, parseAuthTokenPayload } from "../lib/auth/token-core";
import { requestsHumanHandoff, createHandoffAcknowledgement } from "../lib/chat/handoff-core";
import {
  chatMessageSchema,
  knowledgeDocumentSchema,
  leadSchema,
  passwordResetSchema,
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

test("password reset requires matching strong passwords and a bounded token", () => {
  const token = generateAuthToken();
  assert.equal(passwordResetSchema.safeParse({
    token,
    password: "YeniGuvenliParola2026",
    passwordConfirm: "YeniGuvenliParola2026",
  }).success, true);

  assert.equal(passwordResetSchema.safeParse({
    token,
    password: "YeniGuvenliParola2026",
    passwordConfirm: "FarkliGuvenliParola2026",
  }).success, false);
});

test("authentication tokens are random, hash-only and typed", () => {
  const first = generateAuthToken();
  const second = generateAuthToken();
  assert.notEqual(first, second);
  assert.equal(first.length >= 40, true);
  assert.equal(hashAuthToken(first).length, 64);
  assert.equal(authTokenEventType("VERIFY_EMAIL", "user-1"), "VERIFY_EMAIL:user-1");

  const parsed = parseAuthTokenPayload({ userId: "user-1", expiresAt: new Date(Date.now() + 60_000).toISOString() });
  assert.equal(parsed?.userId, "user-1");
  assert.equal(parseAuthTokenPayload({ userId: 1, expiresAt: "invalid" }), null);
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
