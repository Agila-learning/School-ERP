export interface IChannelProvider {
  name: string;
  send(recipientId: string, subject: string | undefined, content: string, attachments?: string[]): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export class MockEmailProvider implements IChannelProvider {
  name = 'EMAIL';
  async send(recipientId: string, subject: string | undefined, content: string, attachments?: string[]) {
    console.log(`[EmailProvider] Sending to ${recipientId} | Subject: ${subject}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, messageId: `email-${Date.now()}` };
  }
}

export class MockSmsProvider implements IChannelProvider {
  name = 'SMS';
  async send(recipientId: string, subject: string | undefined, content: string, attachments?: string[]) {
    console.log(`[SmsProvider] Sending to ${recipientId} | Content preview: ${content.substring(0, 20)}...`);
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, messageId: `sms-${Date.now()}` };
  }
}

export class MockWhatsAppProvider implements IChannelProvider {
  name = 'WHATSAPP';
  async send(recipientId: string, subject: string | undefined, content: string, attachments?: string[]) {
    console.log(`[WhatsAppProvider] Sending to ${recipientId}`);
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, messageId: `wa-${Date.now()}` };
  }
}

export class MockPushProvider implements IChannelProvider {
  name = 'PUSH';
  async send(recipientId: string, subject: string | undefined, content: string, attachments?: string[]) {
    console.log(`[PushProvider] Sending to ${recipientId}`);
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, messageId: `push-${Date.now()}` };
  }
}

// InApp Provider writes directly to a notification collection or emits socket event (mocked here)
export class MockInAppProvider implements IChannelProvider {
  name = 'IN_APP';
  async send(recipientId: string, subject: string | undefined, content: string, attachments?: string[]) {
    console.log(`[InAppProvider] Creating internal notification for ${recipientId}`);
    await new Promise(resolve => setTimeout(resolve, 10));
    return { success: true, messageId: `inapp-${Date.now()}` };
  }
}

export const providers = {
  EMAIL: new MockEmailProvider(),
  SMS: new MockSmsProvider(),
  WHATSAPP: new MockWhatsAppProvider(),
  PUSH: new MockPushProvider(),
  IN_APP: new MockInAppProvider()
};
