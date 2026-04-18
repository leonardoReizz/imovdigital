import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

const TIKTOK_EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

type UserData = {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

type EventProperties = {
  value?: number;
  currency?: string;
  contents?: Array<{ content_id: string; content_type: string; content_name: string }>;
};

@Injectable()
export class TikTokEventsService {
  private readonly logger = new Logger(TikTokEventsService.name);

  constructor(private readonly config: ConfigService) {}

  private sha256(value: string) {
    return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
  }

  async sendEvent(eventName: string, user: UserData, properties: EventProperties, eventId?: string) {
    const pixelId = this.config.get<string>('TIKTOK_PIXEL_ID');
    const accessToken = this.config.get<string>('TIKTOK_ACCESS_TOKEN');
    if (!pixelId || !accessToken) {
      this.logger.warn('TikTok CAPI not configured — skipping event');
      return;
    }

    const userData: Record<string, string> = {};
    if (user.email) userData.email = this.sha256(user.email);
    if (user.phone) userData.phone = this.sha256(user.phone);
    if (user.externalId) userData.external_id = this.sha256(user.externalId);
    if (user.ip) userData.ip = user.ip;
    if (user.userAgent) userData.user_agent = user.userAgent;

    const testEventCode = this.config.get<string>('TIKTOK_TEST_EVENT_CODE');

    const body: Record<string, unknown> = {
      event_source: 'web',
      event_source_id: pixelId,
      data: [
        {
          event: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          user: userData,
          properties,
        },
      ],
    };
    if (testEventCode) body.test_event_code = testEventCode;

    try {
      const res = await fetch(TIKTOK_EVENTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
        },
        body: JSON.stringify(body),
      });
      const json: any = await res.json().catch(() => ({}));
      if (json.code !== 0) {
        this.logger.error(`TikTok CAPI error: ${JSON.stringify(json)} | body=${JSON.stringify(body)}`);
      } else {
        this.logger.log(`TikTok event '${eventName}' sent (event_id=${(body.data as any[])[0].event_id}, test=${!!testEventCode})`);
      }
    } catch (err: any) {
      this.logger.error(`TikTok CAPI request failed: ${err?.message}`);
    }
  }
}
