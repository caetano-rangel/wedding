export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';
import { nanoid } from 'nanoid';

// Recebe fotos colaborativas enviadas pelos convidados
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const slug  = formData.get('slug')  as string;
    const fotos = formData.getAll('fotos') as File[];

    if (!slug || fotos.length === 0) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    // Verifica se a página existe e é premium
    const { data: row } = await supabase
      .from('casamentos')
      .select('plano, fotosColaborativas')
      .eq('slug', slug)
      .eq('status', 'aprovado')
      .single();

    if (!row) return NextResponse.json({ error: 'Página não encontrada.' }, { status: 404 });
    if (row.plano !== 'premium') return NextResponse.json({ error: 'Galeria colaborativa disponível apenas no plano Premium.' }, { status: 403 });

    const urls: string[] = [];

    for (const foto of fotos) {
      const ext      = foto.type.split('/')[1] || 'jpg';
      const fileName = `${slug}/colaborativas/${nanoid(10)}.${ext}`;

      const { error } = await supabase.storage.from('casamentos').upload(fileName, foto, { upsert: false });
      if (error) { console.error('Upload colaborativa:', error); continue; }

      const { data: pub } = supabase.storage.from('casamentos').getPublicUrl(fileName);
      if (pub.publicUrl) urls.push(pub.publicUrl);
    }

    // Atualiza array de fotos colaborativas
    const existing = (row.fotosColaborativas as string[]) || [];
    await supabase
      .from('casamentos')
      .update({ fotosColaborativas: [...existing, ...urls] })
      .eq('slug', slug);

    return NextResponse.json({ ok: true, uploaded: urls.length });
  } catch (err) {
    console.error('edit-photos error:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}