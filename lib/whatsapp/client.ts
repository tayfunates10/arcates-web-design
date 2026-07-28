import "server-only";

type SendTextOptions = {
  to: string;
  body: string;
  replyToMessageId?: string;
};

export function whatsappConfigured() {
  return Boolean(
    process.env.WHATSAPP_GRAPH_API_VERSION?.trim()
    && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
    && process.env.WHATSAPP_ACCESS_TOKEN?.trim(),
  );
}

export async function sendWhatsAppText(options: SendTextOptions) {
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();

  if (!apiVersion || !phoneNumberId || !accessToken) {
    throw new Error("WhatsApp gönderim ortam değişkenleri eksik.");
  }

  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: options.to,
      type: "text",
      text: {
        preview_url: false,
        body: options.body.slice(0, 4_096),
      },
      ...(options.replyToMessageId ? { context: { message_id: options.replyToMessageId } } : {}),
    }),
    signal: AbortSignal.timeout(12_000),
  });

  const data = await response.json() as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string; code?: number };
  };

  if (!response.ok) {
    throw new Error(`WhatsApp API hatası (${data.error?.code ?? response.status}): ${data.error?.message ?? "Bilinmeyen hata"}`);
  }

  const messageId = data.messages?.[0]?.id;
  if (!messageId) throw new Error("WhatsApp API mesaj kimliği döndürmedi.");
  return messageId;
}
