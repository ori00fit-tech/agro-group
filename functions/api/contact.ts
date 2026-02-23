/**
 * Cloudflare Pages Function — POST /api/contact
 * Validates input with Zod, checks Turnstile, rate-limits by IP, sends email via Resend or MailChannels.
 */

import type { EventContext } from '@cloudflare/workers-types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY?: string;
  CONTACT_EMAIL: string;
  FROM_EMAIL?: string;
  RATE_LIMIT_KV?: KVNamespace; // optional KV for rate limiting
}

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}

// ─── Validation (inline Zod-like, no import needed) ──────────────────────────

function validate(data: unknown): { ok: true; payload: ContactPayload } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') return { ok: false, error: 'Invalid payload' };
  const d = data as Record<string, unknown>;

  const name = String(d.name ?? '').trim();
  const email = String(d.email ?? '').trim();
  const subject = String(d.subject ?? '').trim();
  const message = String(d.message ?? '').trim();
  const turnstileToken = String(d.turnstileToken ?? '').trim();

  if (!name || name.length < 2) return { ok: false, error: 'Nom invalide (min 2 caractères).' };
  if (!name || name.length > 100) return { ok: false, error: 'Nom trop long.' };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Email invalide.' };
  if (!subject || subject.length < 3) return { ok: false, error: 'Sujet requis.' };
  if (!message || message.length < 10) return { ok: false, error: 'Message trop court (min 10 caractères).' };
  if (message.length > 5000) return { ok: false, error: 'Message trop long (max 5000 caractères).' };
  if (!turnstileToken) return { ok: false, error: 'Validation Turnstile manquante.' };

  return { ok: true, payload: { name, email, subject, message, turnstileToken } };
}

// ─── Turnstile verification ───────────────────────────────────────────────────

async function verifyTurnstile(token: string, secretKey: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: secretKey, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

// ─── Rate limiting (IP-based, KV) ────────────────────────────────────────────

const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 60 * 60; // 1 hour in seconds

async function checkRateLimit(kv: KVNamespace | undefined, ip: string): Promise<boolean> {
  if (!kv) return true; // no KV = no rate limit
  const key = `rl:contact:${ip}`;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= RATE_LIMIT) return false;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
  return true;
}

// ─── Email sending ────────────────────────────────────────────────────────────

async function sendEmailResend(
  apiKey: string,
  from: string,
  to: string,
  payload: ContactPayload,
): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      reply_to: payload.email,
      subject: `[Agro Group Contact] ${payload.subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1f7a27; margin-bottom: 4px;">Nouveau message de contact</h2>
          <p style="color: #666; font-size: 14px;">Via le formulaire de contact agro-group.com</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #888; width: 100px;">Nom</td><td style="padding: 8px 0; font-weight: 600;">${payload.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${payload.email}">${payload.email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Sujet</td><td style="padding: 8px 0;">${payload.subject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <h3 style="font-size: 14px; color: #444; margin-bottom: 8px;">Message :</h3>
          <div style="background: #f9f9f9; border-left: 3px solid #1f7a27; padding: 16px; border-radius: 4px; white-space: pre-wrap; font-size: 14px; color: #333;">${payload.message}</div>
        </div>
      `,
    }),
  });
  return res.ok;
}

async function sendEmailMailChannels(to: string, payload: ContactPayload): Promise<boolean> {
  const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }], reply_to: { email: payload.email, name: payload.name } }],
      from: { email: 'noreply@agro-group.com', name: 'Agro Group Contact' },
      subject: `[Agro Group Contact] ${payload.subject}`,
      content: [
        {
          type: 'text/plain',
          value: `De: ${payload.name} <${payload.email}>\nSujet: ${payload.subject}\n\n${payload.message}`,
        },
      ],
    }),
  });
  return res.status === 202;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function onRequestPost(context: EventContext<Env, string, Record<string, unknown>>) {
  const { request, env } = context;

  const ip =
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For') ??
    '0.0.0.0';

  // Rate limit check
  const allowed = await checkRateLimit(env.RATE_LIMIT_KV, ip);
  if (!allowed) {
    return Response.json(
      { success: false, message: 'Trop de requêtes. Veuillez réessayer dans une heure.' },
      { status: 429 },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, message: 'Corps de requête invalide.' }, { status: 400 });
  }

  // Validate
  const validation = validate(body);
  if (!validation.ok) {
    return Response.json({ success: false, message: validation.error }, { status: 400 });
  }

  const { payload } = validation;

  // Verify Turnstile
  if (!env.TURNSTILE_SECRET_KEY) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping verification in dev');
  } else {
    const turnstileOk = await verifyTurnstile(payload.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!turnstileOk) {
      return Response.json({ success: false, message: 'Validation anti-spam échouée. Veuillez réessayer.' }, { status: 400 });
    }
  }

  // Send email
  const to = env.CONTACT_EMAIL ?? 'contact@agro-group.com';
  let sent = false;

  if (env.RESEND_API_KEY) {
    const from = env.FROM_EMAIL ?? 'contact@agro-group.com';
    sent = await sendEmailResend(env.RESEND_API_KEY, from, to, payload);
  } else {
    // Fallback to MailChannels (free on Cloudflare Workers)
    sent = await sendEmailMailChannels(to, payload);
  }

  if (!sent) {
    return Response.json(
      { success: false, message: 'Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter directement.' },
      { status: 500 },
    );
  }

  return Response.json({ success: true, message: 'Message envoyé avec succès.' });
}

// Method not allowed for other verbs
export function onRequest() {
  return new Response('Method Not Allowed', { status: 405 });
}
