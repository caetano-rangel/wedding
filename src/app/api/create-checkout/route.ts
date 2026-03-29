export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import stripe from '../../lib/stripe';
import { supabase } from '../../lib/supabaseClient';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const plano            = formData.get('plano')            as string;
    const nomeNoivo        = formData.get('nomeNoivo')        as string;
    const nomeNoiva        = formData.get('nomeNoiva')        as string;
    const dataCaramento    = formData.get('dataCaramento')    as string;
    const email            = formData.get('email')            as string;
    const frase            = formData.get('frase')            as string ?? '';
    const fotoCapa         = formData.get('fotoCapa')         as File | null;
    const galeria          = formData.getAll('galeria')       as File[];
    const localCerimonia   = formData.get('localCerimonia')   as string;
    const endCerimonia     = formData.get('endCerimonia')     as string ?? '';
    const horarioCerimonia = formData.get('horarioCerimonia') as string;
    const localFesta       = formData.get('localFesta')       as string ?? '';
    const endFesta         = formData.get('endFesta')         as string ?? '';
    const horarioFesta     = formData.get('horarioFesta')     as string ?? '';
    const dressCode        = formData.get('dressCode')        as string ?? '';
    const historia         = formData.get('historia')         as string ?? '';
    const presentesRaw     = formData.get('presentes')        as string | null;
    const pixLuaDeMel      = formData.get('pixLuaDeMel')      as string ?? '';
    const tema             = formData.get('tema')             as string ?? 'rose';
    const musicaUrl        = formData.get('musicaUrl')        as string ?? '';

    if (!nomeNoivo || !nomeNoiva || !dataCaramento || !email || !plano || !localCerimonia) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const isCompleto = plano === 'completo' || plano === 'premium';

    let presentes = null;
    if (isCompleto && presentesRaw) {
      try { presentes = JSON.parse(presentesRaw); } catch { presentes = null; }
    }

    // Gera slug
    const slugify = (s: string) => s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

    const slug = `${slugify(nomeNoivo)}-e-${slugify(nomeNoiva)}-${nanoid(6)}`;

    // Upload foto de capa
    let fotaCapaUrl = '';
    if (fotoCapa && fotoCapa.size > 0) {
      const ext = fotoCapa.type.split('/')[1] || 'jpg';
      const { error } = await supabase.storage.from('casamentos').upload(`${slug}/capa.${ext}`, fotoCapa, { upsert: false });
      if (error) throw new Error('Erro no upload da foto de capa.');
      const { data: pub } = supabase.storage.from('casamentos').getPublicUrl(`${slug}/capa.${ext}`);
      fotaCapaUrl = pub.publicUrl || '';
    }

    // Upload galeria
    const galeriaUrls: string[] = [];
    for (const foto of galeria) {
      const ext = foto.type.split('/')[1] || 'jpg';
      const name = `${slug}/${nanoid(10)}.${ext}`;
      const { error } = await supabase.storage.from('casamentos').upload(name, foto, { upsert: false });
      if (error) { console.error('Upload galeria:', error); continue; }
      const { data: pub } = supabase.storage.from('casamentos').getPublicUrl(name);
      if (pub.publicUrl) galeriaUrls.push(pub.publicUrl);
    }

    // Insert Supabase
    const { error: insertError } = await supabase.from('casamentos').insert([{
      slug, plano, nomeNoivo, nomeNoiva, dataCaramento, email, frase,
      fotoCapa: fotaCapaUrl, galeria: galeriaUrls,
      localCerimonia, endCerimonia, horarioCerimonia,
      localFesta:    localFesta    || null,
      endFesta:      endFesta      || null,
      horarioFesta:  horarioFesta  || null,
      dressCode:     dressCode     || null,
      historia:      isCompleto    ? historia    : null,
      presentes:     isCompleto    ? presentes   : null,
      pixLuaDeMel:   isCompleto    ? pixLuaDeMel || null : null,
      tema:          plano === 'premium' ? tema       : 'rose',
      musicaUrl:     plano === 'premium' ? musicaUrl || null : null,
      convidados: null, fotosColaborativas: null, mensagens: null,
      status: 'pendente', createdAt: new Date().toISOString(),
    }]);

    if (insertError) {
      console.error('Supabase insert:', insertError.message);
      return NextResponse.json({ error: 'Erro ao salvar os dados.' }, { status: 500 });
    }

    // Stripe
    const priceId =
      plano === 'basico'   ? process.env.STRIPE_PRICE_BASICO   :
      plano === 'completo' ? process.env.STRIPE_PRICE_COMPLETO :
                             process.env.STRIPE_PRICE_PREMIUM;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      metadata: { slug, email },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/confirm?slug=${slug}`,
      cancel_url:  `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erro ao criar sessão de checkout.' }, { status: 500 });
  }
}