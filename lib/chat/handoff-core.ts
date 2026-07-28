const handoffPatterns = [
  /\btemsilci(?:ye)?\b/i,
  /\binsan deste(?:ğ|g)i\b/i,
  /\byetkili(?:ye)? bağlan\b/i,
  /\bmüşteri temsilcisi\b/i,
  /\bcanlı destek\b/i,
  /\buzman(?:a)? bağlan\b/i,
];

export function requestsHumanHandoff(message: string) {
  return handoffPatterns.some((pattern) => pattern.test(message));
}

export function createHandoffAcknowledgement() {
  return {
    text: "Temsilci talebiniz kaydedildi. Görüşmeniz insan desteği kuyruğuna alındı. Bu sırada eklemek istediğiniz ayrıntıları yazabilirsiniz; mesajlarınız aynı konuşmada temsilciye iletilecektir.",
    source: "HUMAN_HANDOFF_REQUESTED",
    knowledgeTitles: [] as string[],
  };
}
