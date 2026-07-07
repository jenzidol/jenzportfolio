// Cloudflare Pages Function: POST /api/contact
// Relays contact-form submissions to Jenny's inbox via Resend.
// Requires env vars: RESEND_API_KEY (secret), optionally CONTACT_TO_EMAIL.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const name = String(data.name || '').trim().slice(0, 200);
  const email = String(data.email || '').trim().slice(0, 200);
  const company = String(data.company || '').trim().slice(0, 200);
  const message = String(data.message || '').trim().slice(0, 5000);

  // Honeypot: bots fill the hidden "website" field — pretend success, send nothing
  if (data.website) return json({ ok: true });

  if (!name || !email || !message) {
    return json({ ok: false, error: 'Please fill in your name, email, and message.' }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }
  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: 'The contact form is not configured yet. Please email me directly.' }, 503);
  }

  const to = env.CONTACT_TO_EMAIL || 'jennyfaye.alipen@gmail.com';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: [to],
      reply_to: email,
      subject: `Portfolio inquiry from ${name}${company ? ` (${company})` : ''}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        company ? `Company: ${company}` : null,
        '',
        message,
      ].filter(Boolean).join('\n'),
    }),
  });

  if (!res.ok) {
    console.log('Resend error:', res.status, await res.text());
    return json({ ok: false, error: 'Something went wrong sending your message. Please email me directly.' }, 502);
  }

  return json({ ok: true });
}
