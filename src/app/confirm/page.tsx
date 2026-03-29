'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

const G = {
  shine: 'linear-gradient(135deg,#F5E6A3 0%,#D4AF5A 30%,#F0D98C 50%,#B8922A 70%,#E8CC6A 100%)',
  btn:   'linear-gradient(135deg,#EDD87A,#C8973A,#F0D870,#B8882A)',
  accent: '#C8973A',
  border: '#E8D898',
};

const ConfirmPage = () => {
  const [status, setStatus] = useState('pendente');
  const [dots, setDots] = useState('');
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const router = useRouter() as any;
  const slug = searchParams.get('slug');

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!slug) return;
    const check = async () => {
      const { data } = await supabase.from('casamentos').select('status').eq('slug', slug).single();
      if (data) { setStatus(data.status); if (data.status === 'aprovado') router.push(`/${slug}`); }
    };
    check();
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, [slug, router]);

  const ok = status === 'aprovado';

  return (
    <div style={{
      fontFamily: "'Nunito',sans-serif", minHeight: '100vh',
      background: '#FAFAF8',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Nunito:wght@300;400;700&display=swap');
        .cg { font-family:'Cormorant Garamond',Georgia,serif !important; }
        @keyframes spin       { to { transform:rotate(360deg); } }
        @keyframes pulse-ring { 0%{transform:scale(.8);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
        @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      {/* Glows suaves */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 350, height: 350, background: 'radial-gradient(circle,rgba(212,175,90,.12),transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, background: 'radial-gradient(circle,rgba(212,175,90,.08),transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />

      {/* Card */}
      <div style={{
        background: '#FFFFFF', borderRadius: 28, padding: '52px 40px',
        border: '1px solid #EEEAE0', boxShadow: '0 4px 32px rgba(0,0,0,.06)',
        maxWidth: 460, width: '100%', textAlign: 'center',
      }}>
        {/* Spinner dourado */}
        <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 32px' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(212,175,90,.15)',
            animation: 'pulse-ring 1.5s ease-out infinite',
          }} />
          <div style={{
            position: 'relative', width: 80, height: 80, borderRadius: '50%',
            background: G.shine,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(200,151,58,.35),inset 0 1px 2px rgba(255,255,255,.6)',
          }}>
            <svg style={{ width: 32, height: 32, animation: 'spin 1.5s linear infinite' }} viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Ícone flutuante */}
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 2.5s ease-in-out infinite' }}>💍</div>

        <h1 className="cg" style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1C1A16', marginBottom: 12 }}>
          Confirmando pagamento
        </h1>
        <p style={{ color: '#7A7468', fontSize: '.95rem', lineHeight: 1.6, marginBottom: 28, fontWeight: 300 }}>
          Estamos preparando a página do casamento{dots}
        </p>

        {/* Badge de status */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 20px', borderRadius: 50, marginBottom: 28,
          background: ok ? G.shine : '#FAFAF8',
          border: `1px solid ${ok ? G.border : '#EEEAE0'}`,
          boxShadow: ok ? '0 2px 10px rgba(200,151,58,.2)' : 'none',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: ok ? '#2C1A00' : G.accent,
            boxShadow: `0 0 6px ${ok ? 'rgba(44,26,0,.4)' : 'rgba(200,151,58,.5)'}`,
          }} />
          <span style={{ fontSize: '.82rem', fontWeight: 700, color: ok ? '#2C1A00' : '#7A7468' }}>
            {ok ? 'Aprovado! Redirecionando...' : 'Aguardando confirmação'}
          </span>
        </div>

        <p style={{ color: '#B0A890', fontSize: '.78rem', fontWeight: 300 }}>
          Você receberá um e-mail com o link da página 💍
        </p>
      </div>

      {/* Logo rodapé */}
      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.7 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: G.shine, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>💍</div>
        <span className="cg" style={{ fontSize: '1rem', fontWeight: 700, color: G.accent }}>WeddingTimee</span>
      </div>
    </div>
  );
};

export default function ConfirmPageWrapper() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
        <p style={{ color: '#C8973A', fontFamily: 'Nunito,sans-serif', fontWeight: 300 }}>Carregando...</p>
      </div>
    }>
      <ConfirmPage />
    </Suspense>
  );
}