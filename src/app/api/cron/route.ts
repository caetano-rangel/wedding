export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabaseClient';

// Chamado por um cron job externo (ex: Vercel Cron ou cron-job.org)
// Remove registros pendentes com mais de 2 horas (pagamento não concluído)
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('casamentos')
    .delete()
    .eq('status', 'pendente')
    .lt('createdAt', cutoff);

  if (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cleanedBefore: cutoff });
}