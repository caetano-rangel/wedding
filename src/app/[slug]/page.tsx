'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import QRCode from 'qrcode';
import { Wine } from 'lucide-react';

/* ── Tipos ── */
interface Presente { nome: string; link: string; pix: string; }
interface WeddingData {
  nomeNoivo: string; nomeNoiva: string; dataCaramento: string; plano: string;
  fotoCapa: string; galeria: string[]; historia: string; frase: string;
  localCerimonia: string; endCerimonia: string; horarioCerimonia: string;
  localFesta: string | null; endFesta: string | null; horarioFesta: string | null; dressCode: string | null;
  presentes: Presente[] | null; pixLuaDeMel: string | null;
  tema: string | null; musicaUrl: string | null;
  convidados: { nome: string }[] | null;
  fotosColaborativas: string[] | null;
  mensagens: { nome: string; msg: string; data: string }[] | null;
}
interface Countdown { dias: number; horas: number; minutos: number; segundos: number; passou: boolean; }
interface PageProps { params: Promise<{ slug: string }>; }

/* ── Paleta dourada base (fallback / elementos fixos) ── */
const G = {
  shine:  'linear-gradient(135deg,#F5E6A3 0%,#D4AF5A 30%,#F0D98C 50%,#B8922A 70%,#E8CC6A 100%)',
  btn:    'linear-gradient(135deg,#EDD87A,#C8973A,#F0D870,#B8882A)',
  accent: '#C8973A',
  border: '#E8D898',
  bg:     '#FFFDF5',
};

/* ── Temas por slug ── */
const TEMAS: Record<string, { cor: string; gradient: string; light: string; dark: string }> = {
  rose:      { cor: '#C0496A', gradient: 'linear-gradient(135deg,#F5C0CE,#D4637A,#A03050)', light: '#FBE8EE', dark: '#6B1530' },
  blush:     { cor: '#C85A6A', gradient: 'linear-gradient(135deg,#F5B0BA,#D0606E,#A02838)', light: '#FBE6EA', dark: '#601020' },
  lavanda:   { cor: '#6A52A0', gradient: 'linear-gradient(135deg,#C4B0E8,#8870C0,#5040A0)', light: '#EDE8F8', dark: '#30206A' },
  champagne: { cor: '#B8922A', gradient: G.shine, light: G.bg, dark: '#5C3D00' },
  sage:      { cor: '#507A58', gradient: 'linear-gradient(135deg,#B0D8B8,#70A878,#406850)', light: '#E8F5EA', dark: '#203828' },
  azul:      { cor: '#3A70B0', gradient: 'linear-gradient(135deg,#A0C8F0,#5090D0,#2858A0)', light: '#E8F0F8', dark: '#182850' },
  bordeaux:  { cor: '#882840', gradient: 'linear-gradient(135deg,#E0A0B0,#B04060,#780030)', light: '#F8E8EC', dark: '#481020' },
  nude:      { cor: '#906040', gradient: 'linear-gradient(135deg,#E8C8A8,#C09070,#886040)', light: '#F8F0E8', dark: '#402010' },
  preto:     { cor: '#2C2820', gradient: G.shine, light: '#F5F4F0', dark: '#1C1810' },
};

const calcCountdown = (d: string): Countdown => {
  const diff = new Date(d + 'T00:00:00').getTime() - Date.now();
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0, segundos: 0, passou: true };
  return { dias: Math.floor(diff / 86400000), horas: Math.floor((diff % 86400000) / 3600000), minutos: Math.floor((diff % 3600000) / 60000), segundos: Math.floor((diff % 60000) / 1000), passou: false };
};

/* ── Carrossel de fotos ── */
function Carrossel({ fotos, cor }: { fotos: string[]; cor: string }) {
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [lb, setLb] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    const c = () => setMobile(window.innerWidth < 640);
    c(); window.addEventListener('resize', c); return () => window.removeEventListener('resize', c);
  }, []);

  // Bloqueia scroll do body quando lightbox está aberto
  useEffect(() => {
    if (lb) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lb]);

  const prev = () => setActive(i => (i - 1 + fotos.length) % fotos.length);
  const next = () => setActive(i => (i + 1) % fotos.length);

  /* ── Touch handlers ── */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 8) {
      isDragging.current = true;
      e.stopPropagation();
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (isDragging.current) {
      if (dx < -40) next();
      else if (dx > 40) prev();
    }
    isDragging.current = false;
  };

  /* ── Touch handlers para o lightbox (swipe dentro dele) ── */
  const lbTouchStartX = useRef(0);
  const onLbTouchStart = (e: React.TouchEvent) => { lbTouchStartX.current = e.touches[0].clientX; };
  const onLbTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - lbTouchStartX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
  };

  const len = fotos.length;
  const ip = (active - 1 + len) % len;
  const iN = (active + 1) % len;
  const vis =
    len === 1 ? [{ idx: active, pos: 'c' }]
    : len === 2 ? [{ idx: ip, pos: 'l' }, { idx: active, pos: 'c' }]
    : [{ idx: ip, pos: 'l' }, { idx: active, pos: 'c' }, { idx: iN, pos: 'r' }];

  const sty = (pos: string): React.CSSProperties =>
    pos === 'c'
      ? {
          width: mobile ? '78%' : '68%',
          height: mobile ? 300 : 440,
          borderRadius: 18,
          objectFit: 'cover',
          boxShadow: `0 12px 40px ${cor}44`,
          border: `2px solid ${cor}44`,
          transform: 'scale(1)',
          opacity: 1,
          zIndex: 2,
          cursor: 'zoom-in',
          transition: 'all .4s cubic-bezier(.22,1,.36,1)',
          flexShrink: 0,
          WebkitTapHighlightColor: 'transparent',
        }
      : {
          width: mobile ? '14%' : '28%',
          height: mobile ? 240 : 320,
          borderRadius: mobile ? 10 : 14,
          objectFit: 'cover',
          border: '1.5px solid #EEEAE0',
          transform:
            pos === 'l'
              ? mobile ? 'scale(0.85) translateX(32px)' : 'scale(0.88) translateX(12px)'
              : mobile ? 'scale(0.85) translateX(-32px)' : 'scale(0.88) translateX(-12px)',
          opacity: mobile ? 0.3 : 0.55,
          zIndex: 1,
          cursor: 'pointer',
          transition: 'all .4s cubic-bezier(.22,1,.36,1)',
          flexShrink: 0,
          WebkitTapHighlightColor: 'transparent',
        };

  if (!fotos.length) return null;

  return (
    <div style={{ width: '100%', userSelect: 'none' }}>
      {/* ── Lightbox ── */}
      {lb && (
        <div
          onClick={() => setLb(false)}
          onTouchStart={onLbTouchStart}
          onTouchEnd={onLbTouchEnd}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.92)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          {/* Botão fechar */}
          <button
            onClick={e => { e.stopPropagation(); setLb(false); }}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,.18)', border: 'none', borderRadius: '50%',
              width: 44, height: 44, color: '#fff', fontSize: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >✕</button>

          {/* Seta esquerda */}
          {fotos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,.18)', border: 'none', borderRadius: '50%',
                width: 48, height: 48, color: '#fff', fontSize: 26, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}
            >‹</button>
          )}

          {/* Foto */}
          <img
            src={fotos[active]}
            alt=""
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '88vw', maxHeight: '88vh', borderRadius: 12, objectFit: 'contain', display: 'block' }}
          />

          {/* Seta direita */}
          {fotos.length > 1 && (
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,.18)', border: 'none', borderRadius: '50%',
                width: 48, height: 48, color: '#fff', fontSize: 26, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
              }}
            >›</button>
          )}

          {/* Contador de fotos */}
          {fotos.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,.18)', borderRadius: 20, padding: '4px 16px',
              color: '#fff', fontSize: '.82rem', fontFamily: "'Nunito',sans-serif",
            }}>
              {active + 1} / {fotos.length}
            </div>
          )}
        </div>
      )}

      {/* ── Track ── */}
      <div
        ref={ref}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', width: '100%',
        }}
      >
        {vis.map(({ idx, pos }) => (
          <img
            key={idx}
            src={fotos[idx]}
            alt=""
            draggable={false}
            style={sty(pos) as React.CSSProperties}
            onClick={() => {
              if (isDragging.current) return;
              if (pos === 'c') setLb(true);
              else if (pos === 'l') prev();
              else next();
            }}
          />
        ))}
      </div>

      {/* ── Dots ── */}
      {fotos.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {fotos.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? 20 : 8, height: 8,
                borderRadius: 4, border: 'none', cursor: 'pointer',
                background: i === active ? cor : '#E8D898',
                transition: 'all .3s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Página pública ── */
export default function WeddingPage({ params }: PageProps) {
  const [slug, setSlug]         = useState('');
  const [data, setData]         = useState<WeddingData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [cd, setCd]             = useState<Countdown | null>(null);
  const [qr, setQr]             = useState('');
  const [rsvpNome, setRsvpNome] = useState('');
  const [rsvpDone, setRsvpDone] = useState(false);
  const [rsvpLoad, setRsvpLoad] = useState(false);
  const [msgNome, setMsgNome]   = useState('');
  const [msgTxt, setMsgTxt]     = useState('');
  const [msgDone, setMsgDone]   = useState(false);
  const [msgs, setMsgs]         = useState<{ nome: string; msg: string; data: string }[]>([]);
  const [copied, setCopied]     = useState<string | null>(null);

  useEffect(() => { params.then(p => setSlug(p.slug)); }, [params]);

  useEffect(() => {
    if (!slug) return;
    supabase.from('casamentos').select('*').eq('slug', slug).eq('status', 'aprovado').single()
      .then(({ data: row }) => {
        if (!row) { setNotFound(true); } else { setData(row as WeddingData); setMsgs(row.mensagens || []); }
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!data?.dataCaramento) return;
    const id = setInterval(() => setCd(calcCountdown(data.dataCaramento)), 1000);
    setCd(calcCountdown(data.dataCaramento));
    return () => clearInterval(id);
  }, [data?.dataCaramento]);

  useEffect(() => {
    if (!slug) return;
    QRCode.toDataURL(`${window.location.origin}/${slug}`, { width: 220, margin: 2, color: { dark: '#2C1A00', light: '#ffffff' } })
      .then(setQr).catch(console.error);
  }, [slug]);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 2000); });
  };

  const handleRSVP = async () => {
    if (!rsvpNome.trim()) return;
    setRsvpLoad(true);
    await supabase.from('rsvp').insert([{ slug, nome: rsvpNome, createdAt: new Date().toISOString() }]);
    setRsvpDone(true); setRsvpLoad(false);
  };

  const handleMsg = async () => {
    if (!msgNome.trim() || !msgTxt.trim()) return;
    const nova = { nome: msgNome, msg: msgTxt, data: new Date().toISOString() };
    await supabase.from('mensagens').insert([{ slug, ...nova }]);
    setMsgs(m => [...m, nova]); setMsgDone(true);
  };

  /* ── Estados de carregamento ── */
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, background: G.shine, borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(200,151,58,.35)' }}>
          <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="29" r="15" stroke="#2C1A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 8L21 4H25.1339H29.0536L32 8L25 14L18 8Z" fill="none" stroke="#2C1A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ color: '#B0A890', fontFamily: 'Nunito,sans-serif', fontWeight: 300 }}>Carregando...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: G.shine, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(200,151,58,.35)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", color: '#1C1A16', fontSize: '1.8rem', fontWeight: 700 }}>Página não encontrada</h1>
        <p style={{ color: '#7A7468', marginTop: 8, fontWeight: 300 }}>Esta página não existe ou o pagamento ainda não foi confirmado.</p>
      </div>
    </div>
  );

  if (!data) return null;

  const tema = TEMAS[data.tema || 'champagne'] || TEMAS.champagne;
  const isCompleto = data.plano === 'completo' || data.plano === 'premium';
  const isPremium  = data.plano === 'premium';
  const nomes = `${data.nomeNoivo} & ${data.nomeNoiva}`;
  const dataFmt = new Date(data.dataCaramento + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  /* ── Estilos compartilhados ── */
  const section = (bg = '#FFFFFF'): React.CSSProperties => ({ padding: '64px 24px', background: bg });
  const wrap: React.CSSProperties = { maxWidth: 700, margin: '0 auto' };
  const card: React.CSSProperties = { background: '#FFFFFF', borderRadius: 20, padding: '28px 24px', border: '1px solid #EEEAE0', boxShadow: '0 2px 16px rgba(0,0,0,.04)' };
  const inputSty: React.CSSProperties = { width: '100%', padding: '12px 16px', marginTop: 6, background: '#FAFAF8', color: '#1C1A16', border: '1px solid #EEEAE0', borderRadius: 12, fontSize: '.95rem', fontFamily: "'Nunito',sans-serif", outline: 'none' };
  const btnGold: React.CSSProperties = { background: G.btn, color: '#fff', border: 'none', borderRadius: 50, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", boxShadow: '0 5px 18px rgba(200,151,58,.4),inset 0 1px 0 rgba(255,255,255,.3)', transition: 'all .3s' };
  const secTitle = (txt: string) => (
    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', color: '#1C1A16', textAlign: 'center', marginBottom: 8, fontWeight: 700 }}>{txt}</h2>
  );

  return (
    <div style={{ fontFamily: "'Nunito',sans-serif", background: '#FAFAF8', color: '#1C1A16', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,600&family=Nunito:wght@300;400;600;700&display=swap');
        .cg { font-family:'Cormorant Garamond',Georgia,serif !important; }
        input:focus, textarea:focus { border-color:${tema.cor} !important; box-shadow:0 0 0 3px ${tema.cor}22 !important; }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .btn-gold-h:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(200,151,58,.55),inset 0 1px 0 rgba(255,255,255,.3) !important; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 24px', position: 'relative', overflow: 'hidden', background: '#FFFFFF' }}>
        {data.fotoCapa && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${data.fotoCapa})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: .18 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(255,255,255,0) 40%,rgba(250,248,240,.95) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle,rgba(212,175,90,.1),transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 320, height: 320, background: 'radial-gradient(circle,rgba(212,175,90,.07),transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <div style={{ width: 64, height: 64, background: G.shine, borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(200,151,58,.4),inset 0 1px 2px rgba(255,255,255,.6)', animation: 'float 3s ease-in-out infinite' }}>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="29" r="15" stroke="#2C1A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 8L21 4H25.1339H29.0536L32 8L25 14L18 8Z" fill="none" stroke="#2C1A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <p style={{ fontSize: '.82rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: 12, color: G.accent }}>
            Casamento de
          </p>
          <h1 className="cg" style={{ fontSize: 'clamp(2.4rem,7vw,4rem)', fontWeight: 700, color: '#1C1A16', lineHeight: 1.15, marginBottom: 14 }}>
            {nomes}
          </h1>

          <div style={{ width: 80, height: 1, background: G.shine, margin: '0 auto 14px', boxShadow: '0 0 8px rgba(200,151,58,.4)' }} />

          <p style={{ color: '#7A7468', fontSize: '1rem', marginBottom: 28, fontWeight: 300 }}>— {dataFmt} —</p>

          {data.frase && (
            <blockquote className="cg" style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#5A5040', maxWidth: 440, margin: '0 auto 28px', borderLeft: `3px solid ${G.accent}`, paddingLeft: 16, textAlign: 'left' }}>
              &ldquo;{data.frase}&rdquo;
            </blockquote>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: '50%', animation: 'bounce 2s infinite', color: G.accent, opacity: .6, fontSize: 18, fontWeight: 300 }}>↓</div>
      </section>

      {/* ── COUNTDOWN ── */}
      {cd && !cd.passou && (
        <section style={{ padding: '60px 24px', background: '#FAFAF8', textAlign: 'center' }}>
          <p className="cg" style={{ fontSize: '1.5rem', color: '#1C1A16', marginBottom: 28, fontWeight: 700 }}>Faltam apenas...</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ val: cd.dias, label: 'dias' }, { val: cd.horas, label: 'horas' }, { val: cd.minutos, label: 'min' }, { val: cd.segundos, label: 'seg' }].map(({ val, label }) => (
              <div key={label} style={{ background: '#FFFFFF', borderRadius: 18, padding: '20px 24px', minWidth: 82, border: '1px solid #EEEAE0', boxShadow: '0 2px 12px rgba(200,151,58,.1)' }}>
                <div className="cg" style={{ fontSize: '2.8rem', fontWeight: 700, color: '#1C1A16', lineHeight: 1 }}>{String(val).padStart(2, '0')}</div>
                <div style={{ fontSize: '.72rem', color: '#B0A890', marginTop: 4, fontWeight: 300 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ width: 120, height: 1, background: G.shine, margin: '40px auto 0', boxShadow: '0 0 6px rgba(200,151,58,.3)' }} />
        </section>
      )}
      {cd?.passou && (
        <section style={{ ...section('#FAFAF8'), textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: G.shine, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(200,151,58,.35)' }}>
            {/* Use o componente do ícone com as propriedades corretas */}
            <Wine
              size={28}
              color="#2C1A00"
              strokeWidth={1.8}
            />
          </div>
          <p className="cg" style={{ fontSize: '1.8rem', color: '#1C1A16', fontWeight: 700 }}>O grande dia chegou!</p>
        </section>
      )}

      {/* ── EVENTO ── */}
      <section style={section('#FFFFFF')}>
        <div style={wrap}>
          {secTitle('Informações do Evento')}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '0 auto 36px', width: 120 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            <div style={card}>
              <div style={{ width: 44, height: 44, background: G.shine, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: '0 3px 10px rgba(200,151,58,.3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M10 4h4M3 22V10l9-6 9 6v12H3ZM9 22v-6h6v6"/></svg>
              </div>
              <h3 className="cg" style={{ fontSize: '1.3rem', color: '#1C1A16', marginBottom: 8, fontWeight: 700 }}>Cerimônia</h3>
              <p style={{ fontWeight: 700, color: '#374151', fontSize: '.95rem' }}>{data.localCerimonia}</p>
              {data.horarioCerimonia && <p style={{ color: '#7A7468', fontSize: '.88rem', marginTop: 4, fontWeight: 300, display: 'flex', alignItems: 'center', gap: 5 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B0A890" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>{data.horarioCerimonia}</p>}
              {data.endCerimonia && <a href={`https://maps.google.com/?q=${encodeURIComponent(data.endCerimonia)}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, color: G.accent, fontSize: '.88rem', textDecoration: 'none', fontWeight: 700 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0Z"/><circle cx="12" cy="10" r="3"/></svg>Ver no mapa →</a>}
            </div>
            {data.localFesta && (
              <div style={card}>
                <div style={{ width: 44, height: 44, background: G.shine, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: '0 3px 10px rgba(200,151,58,.3)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 22h8"/><path d="M12 22V13"/><path d="M20 7H4l1.5 6A6 6 0 0012 18a6 6 0 006.5-5L20 7Z"/>
                    <path d="M4 7V5a1 1 0 011-1h14a1 1 0 011 1v2"/>
                    <path d="M9 3v2M12 2v3M15 3v2"/>
                  </svg>
                </div>
                <h3 className="cg" style={{ fontSize: '1.3rem', color: '#1C1A16', marginBottom: 8, fontWeight: 700 }}>Recepção</h3>
                <p style={{ fontWeight: 700, color: '#374151', fontSize: '.95rem' }}>{data.localFesta}</p>
                {data.horarioFesta && <p style={{ color: '#7A7468', fontSize: '.88rem', marginTop: 4, fontWeight: 300, display: 'flex', alignItems: 'center', gap: 5 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B0A890" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>{data.horarioFesta}</p>}
                {data.endFesta && <a href={`https://maps.google.com/?q=${encodeURIComponent(data.endFesta)}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12, color: G.accent, fontSize: '.88rem', textDecoration: 'none', fontWeight: 700 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={G.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0Z"/><circle cx="12" cy="10" r="3"/></svg>Ver no mapa →</a>}
              </div>
            )}
          </div>
          {data.dressCode && (
            <div style={{ textAlign: 'center', marginTop: 20, padding: '14px', background: G.bg, borderRadius: 14, border: `1px solid ${G.border}` }}>
              <span style={{ fontSize: '.9rem', color: '#5C3D00', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5C3D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {/* Corpo da camisa */}
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.62 1.96V10a2 2 0 002 2h2v8a2 2 0 002 2h8a2 2 0 002-2v-8h2a2 2 0 002-2V5.42a2 2 0 00-1.62-1.96z" />
                  {/* Gola/Decote */}
                  <path d="M16 2a4 4 0 01-8 0" />
                  <path d="M12 5l3-3" />
                  <path d="M12 5l-3-3" />
                </svg>
                Dress Code: {data.dressCode}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── RSVP — completo+ ── */}
      {isCompleto && (
        <section style={section('#FAFAF8')}>
          <div style={{ ...wrap, maxWidth: 480, textAlign: 'center' }}>
            {secTitle('Confirmação de Presença')}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '0 auto 24px', width: 120 }} />
            <p style={{ color: '#7A7468', marginBottom: 28, fontWeight: 300 }}>Confirme sua presença no grande dia</p>
            {rsvpDone ? (
              <div style={{ ...card, padding: '36px' }}>
                <div style={{ width: 56, height: 56, background: G.shine, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 2s ease-in-out infinite', boxShadow: '0 4px 14px rgba(200,151,58,.35)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
                </div>
                <p className="cg" style={{ fontSize: '1.4rem', color: '#1C1A16', fontWeight: 700 }}>Presença confirmada!</p>
                <p style={{ color: '#7A7468', marginTop: 8, fontWeight: 300 }}>Mal podemos esperar para vê-lo(a)!</p>
              </div>
            ) : (
              <div style={card}>
                <input value={rsvpNome} onChange={e => setRsvpNome(e.target.value)} placeholder="Seu nome completo" style={inputSty} />
                <button onClick={handleRSVP} disabled={rsvpLoad || !rsvpNome.trim()} className="btn-gold-h"
                  style={{ ...btnGold, marginTop: 16, width: '100%', padding: '14px', fontSize: '1rem', opacity: (rsvpLoad || !rsvpNome.trim()) ? .6 : 1 }}>
                  {rsvpLoad ? 'Confirmando...' : 'Confirmar presença'}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── NOSSA HISTÓRIA — completo+ ── */}
      {isCompleto && data.historia && (
        <section style={section('#FFFFFF')}>
          <div style={{ ...wrap, textAlign: 'center', maxWidth: 640 }}>
            <div style={{ width: 52, height: 52, background: G.shine, borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(200,151,58,.35)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78Z"/></svg>
            </div>
            {secTitle('Nossa História')}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '0 auto 28px', width: 120 }} />
            <p style={{ color: '#5A5040', lineHeight: 1.9, fontSize: '1rem', fontStyle: 'italic', fontWeight: 300, whiteSpace: 'pre-line' }} className="cg">
              &ldquo;{data.historia}&rdquo;
            </p>
          </div>
        </section>
      )}

      {/* ── GALERIA — completo+ ── */}
      {isCompleto && data.galeria?.length > 0 && (
        <section style={section('#FAFAF8')}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {secTitle('Galeria do Casal')}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '0 auto 36px', width: 120 }} />
            <Carrossel fotos={data.galeria} cor={tema.cor} />
          </div>
        </section>
      )}

      {/* ── PRESENTES — completo+ ── */}
      {isCompleto && data.pixLuaDeMel && (
        <section style={section('#FFFFFF')}>
          <div style={wrap}>
            {secTitle('Lista de Presentes')}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '0 auto 12px', width: 120 }} />
            <p style={{ color: '#7A7468', textAlign: 'center', marginBottom: 32, fontWeight: 300 }}>Escolha um presente especial para o casal 🎁</p>
            <div style={{ background: G.shine, borderRadius: 20, padding: '32px 24px', textAlign: 'center', boxShadow: '0 8px 32px rgba(200,151,58,.3),inset 0 1px 0 rgba(255,255,255,.4)' }}>
              <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,.35)', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2l6 5.5-1.3 4.8L12 14l4.5 4.5.3.7Z"/></svg>
              </div>
              <h3 className="cg" style={{ fontSize: '1.5rem', color: '#2C1A00', marginBottom: 8, fontWeight: 700 }}>Contribuição para a Lua de Mel</h3>
              <p style={{ color: '#7A5410', marginBottom: 20, fontSize: '.9rem', fontWeight: 300 }}>Ajude o casal a realizar o sonho da viagem perfeita</p>
              <button onClick={() => copy(data.pixLuaDeMel!, 'luaDemel')}
                style={{ background: '#2C1A00', color: '#F0D870', border: 'none', borderRadius: 50, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontSize: '.95rem', transition: 'all .3s' }}>
                {copied === 'luaDemel' ? 'Pix copiado!' : 'Copiar Pix da Lua de Mel'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── GALERIA COLABORATIVA — premium ── */}
      {isPremium && (
        <section style={section('#FAFAF8')}>
          <div style={{ ...wrap, textAlign: 'center' }}>
            {secTitle('Álbum Colaborativo')}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '0 auto 20px', width: 120 }} />
            <p style={{ color: '#7A7468', marginBottom: 28, fontWeight: 300 }}>Envie suas fotos e faça parte do álbum do casal</p>
            <div style={card}>
              <input type="file" accept="image/*" style={{ ...inputSty, padding: '10px 16px' }} />
              <button className="btn-gold-h" style={{ ...btnGold, marginTop: 16, width: '100%', padding: '12px', fontSize: '.95rem' }}>Enviar foto</button>
            </div>
            {data.fotosColaborativas && data.fotosColaborativas.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginTop: 24 }}>
                {data.fotosColaborativas.map((f, i) => <img key={i} src={f} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, border: '1px solid #EEEAE0' }} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── LIVRO DE MENSAGENS — premium ── */}
      {isPremium && (
        <section style={section('#FFFFFF')}>
          <div style={{ ...wrap, maxWidth: 600, textAlign: 'center' }}>
            {secTitle('Livro de Mensagens')}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '0 auto 20px', width: 120 }} />
            <p style={{ color: '#7A7468', marginBottom: 28, fontWeight: 300 }}>Deixe uma mensagem especial para {data.nomeNoivo} e {data.nomeNoiva}</p>
            {msgDone ? (
              <div style={{ ...card, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, background: G.shine, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 2s ease-in-out infinite', boxShadow: '0 4px 14px rgba(200,151,58,.35)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <p className="cg" style={{ fontSize: '1.3rem', color: '#1C1A16', fontWeight: 700 }}>Mensagem enviada!</p>
              </div>
            ) : (
              <div style={{ ...card, marginBottom: 24 }}>
                <input value={msgNome} onChange={e => setMsgNome(e.target.value)} placeholder="Seu nome" style={inputSty} />
                <textarea value={msgTxt} onChange={e => setMsgTxt(e.target.value)} placeholder={`Escreva uma mensagem para ${data.nomeNoivo} e ${data.nomeNoiva}...`} rows={4} style={{ ...inputSty, marginTop: 12, resize: 'vertical' }} />
                <button onClick={handleMsg} disabled={!msgNome.trim() || !msgTxt.trim()} className="btn-gold-h"
                  style={{ ...btnGold, marginTop: 16, width: '100%', padding: '14px', fontSize: '.95rem', opacity: (!msgNome.trim() || !msgTxt.trim()) ? .6 : 1 }}>
                  Enviar mensagem
                </button>
              </div>
            )}
            {msgs.length > 0 && msgs.map((m, i) => (
              <div key={i} style={{ ...card, marginBottom: 12, textAlign: 'left' }}>
                <p style={{ fontWeight: 700, color: G.accent, fontSize: '.88rem', marginBottom: 6 }}>{m.nome}</p>
                <p style={{ color: '#5A5040', fontSize: '.92rem', fontStyle: 'italic', fontWeight: 300 }} className="cg">&ldquo;{m.msg}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── QR CODE ── */}
      <section style={{ padding: '64px 24px', background: G.bg, textAlign: 'center', borderTop: `1px solid ${G.border}`, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ width: 52, height: 52, background: G.shine, borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(200,151,58,.35)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z" fill="#2C1A00"/></svg>
        </div>
        {secTitle('QR Code')}
        <p style={{ color: '#7A7468', marginBottom: 28, fontWeight: 300 }}>Imprima e cole nos convites físicos e nas mesas da festa</p>
        {qr && (
          <div>
            <div style={{ display: 'inline-block', background: '#FFFFFF', borderRadius: 16, padding: 16, border: `1px solid ${G.border}`, boxShadow: '0 4px 20px rgba(200,151,58,.15)' }}>
              <img src={qr} alt="QR Code" style={{ display: 'block', width: 180, height: 180 }} />
              <p className="cg" style={{ color: '#5C3D00', fontSize: '.82rem', marginTop: 8, fontWeight: 700 }}>{nomes}</p>
            </div>
            <div style={{ marginTop: 20 }}>
              <a href={qr} download="qrcode-casamento.png"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.btn, color: '#fff', textDecoration: 'none', borderRadius: 50, padding: '10px 24px', fontWeight: 700, fontSize: '.9rem', fontFamily: "'Nunito',sans-serif", boxShadow: '0 4px 14px rgba(200,151,58,.4)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar QR Code
              </a>
            </div>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#FAFAF8', borderTop: '1px solid #F0EDE4', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, background: G.shine, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(200,151,58,.3)' }}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="29" r="15" stroke="#2C1A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 8L21 4H25.1339H29.0536L32 8L25 14L18 8Z" fill="none" stroke="#2C1A00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="cg" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4, color: G.accent }}>WeddingTimee</p>
        <p style={{ color: '#B0A890', fontSize: '.78rem', fontWeight: 300 }}>A página do seu casamento — para sempre.</p>
        <p style={{ color: '#C0BAB0', fontSize: '.72rem', marginTop: 16 }}>
          © 2026 WeddingTimee ·{' '}
          <a href="https://weddingtimee.com.br" style={{ color: G.accent }}>weddingtimee.com.br</a>
        </p>
      </footer>
    </div>
  );
}