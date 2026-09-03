import { Resend } from 'resend';

/**
 * Delivers the Connect modal's form to the site owner's inbox.
 *
 * The frontend can't send email on its own — a secret API key can't live in
 * browser code — so this runs server-side as a Vercel serverless function,
 * holding the Resend API key as an environment variable instead.
 *
 * Uses the plain Web `Request`/`Response` signature rather than
 * `@vercel/node`'s types: Vercel's Node runtime supports this directly, and
 * the alternative pulled in transitive dependencies with known
 * vulnerabilities for no functional benefit here.
 */

const TO_EMAIL = 'deep4k2105@gmail.com';
/**
 * Resend's own shared sending address — the free tier can only send from a
 * domain verified with Resend, and this site has no custom domain (it's
 * hosted on a free Vercel subdomain) to verify one against. Mail still
 * delivers reliably to `TO_EMAIL`; it just shows this as the sender rather
 * than an address on the site's own domain.
 */
const FROM_EMAIL = 'onboarding@resend.dev';

const MAX_FIELD_LENGTH = 5000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Server is not configured to send email' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, message } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return new Response(JSON.stringify({ error: 'Name, email and message are all required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (name.length > MAX_FIELD_LENGTH || email.length > MAX_FIELD_LENGTH || message.length > MAX_FIELD_LENGTH) {
    return new Response(JSON.stringify({ error: 'One of the fields is too long' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: `Portfolio contact form <${FROM_EMAIL}>`,
      to: TO_EMAIL,
      // The visitor's own address as reply-to, so replying from the inbox
      // goes straight back to them instead of to Resend's shared sender.
      replyTo: email,
      subject: `New message from ${name} via the portfolio site`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send message' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error sending message:', err);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
