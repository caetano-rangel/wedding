export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';
import stripe from '../../lib/stripe';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const secret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error('Webhook sig failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { metadata?: { slug?: string; email?: string } };
    const slug  = session.metadata?.slug;
    const email = session.metadata?.email;

    if (!slug) return NextResponse.json({ ok: true });

    const { data: row } = await supabase.from('casamentos').select('nomeNoivo,nomeNoiva,plano').eq('slug', slug).single();

    await supabase.from('casamentos').update({ status: 'aprovado', approvedAt: new Date().toISOString() }).eq('slug', slug);

    if (email && row) {
      const url   = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`;
      const nomes = `${row.nomeNoivo} & ${row.nomeNoiva}`;
      const badge = row.plano === 'premium' ? 'Premium ✨' : row.plano === 'completo' ? 'Completo 💍' : 'Básico';

      await resend.emails.send({
        from:    'WeddingTimee <contato@weddingtimee.com.br>',
        replyTo: 'contato@weddingtimee.com.br',
        to:      email,
        subject: `A página do casamento de ${nomes} está no ar! 💍`,
        html: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
            <div style="background:linear-gradient(135deg,#fce7f3,#fdf4ff);padding:40px 32px;text-align:center">
              <div style="font-size:48px;margin-bottom:12px">💍</div>
              <h1 style="font-size:24px;color:#500724;margin:0;font-weight:700;font-family:Georgia,serif">WeddingTimee</h1>
              <p style="color:#9d4771;margin:8px 0 0;font-size:14px">A página do seu casamento — para sempre.</p>
            </div>
            <div style="padding:36px 32px">
              <h2 style="color:#500724;font-size:20px;margin:0 0 12px;font-family:Georgia,serif">Página no ar! 🎉</h2>
              <p style="color:#9d4771;font-size:15px;line-height:1.7;margin:0 0 8px">
                A página de <strong>${nomes}</strong> está pronta e já pode ser compartilhada com os convidados!
              </p>
              <p style="color:#9d4771;font-size:14px;margin:0 0 24px">Plano <strong>${badge}</strong></p>
              <div style="text-align:center;margin:32px 0">
                <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#f9a8d4,#ec4899,#be185d);color:white;text-decoration:none;padding:14px 36px;border-radius:50px;font-size:15px;font-weight:700">
                  Ver a página do casamento 💍
                </a>
              </div>
              <p style="color:#6b7c6e;font-size:13px;line-height:1.6;margin:0 0 24px">
                Link direto:<br/><a href="${url}" style="color:#be185d;word-break:break-all">${url}</a>
              </p>
              <div style="background:#fce7f3;border-radius:12px;padding:16px 20px;border:1px solid #f9a8d4">
                <p style="color:#be185d;font-size:13px;font-weight:700;margin:0 0 4px">💡 Dica</p>
                <p style="color:#9d4771;font-size:13px;line-height:1.6;margin:0">
                  Na sua página tem um QR Code exclusivo — baixe e cole no convite físico para os convidados acessarem facilmente!
                </p>
              </div>
            </div>
            <div style="background:#500724;padding:24px 32px;text-align:center">
              <p style="color:#9d4771;font-size:12px;margin:0">
                © 2026 WeddingTimee · Todos os direitos reservados<br/>
                Dúvidas? <a href="mailto:contato@weddingtimee.com.br" style="color:#f9a8d4">contato@weddingtimee.com.br</a>
              </p>
            </div>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ ok: true });
}