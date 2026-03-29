'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Plano = 'basico' | 'completo' | 'premium';
type Presente = { nome: string; link: string; pix: string };
type FormData = {
  plano: Plano;
  nomeNoivo: string; nomeNoiva: string; dataCaramento: string; email: string;
  frase: string; historia: string;
  localCerimonia: string; endCerimonia: string; horarioCerimonia: string;
  localFesta: string; endFesta: string; horarioFesta: string; dressCode: string;
  presentes: Presente[]; pixLuaDeMel: string;
  tema: string; musicaUrl: string;
};
type FieldErrors = Partial<Record<string, string>>;

const G = {
  shine:  'linear-gradient(135deg,#F5E6A3 0%,#D4AF5A 30%,#F0D98C 50%,#B8922A 70%,#E8CC6A 100%)',
  txt:    'linear-gradient(135deg,#A07820,#D4AF5A,#A07820)',
  btn:    'linear-gradient(135deg,#EDD87A,#C8973A,#F0D870,#B8882A)',
  border: '#E8D898', bg: '#FFFDF5', accent: '#C8973A',
};

const TEMAS = [
  { id:'rose',      nome:'Rosa Romântico',    cor:'#D4637A' },
  { id:'blush',     nome:'Blush Delicado',    cor:'#E07A8A' },
  { id:'lavanda',   nome:'Lavanda Eterno',    cor:'#7C6AAE' },
  { id:'champagne', nome:'Champagne Luxo',    cor:'#B8922A' },
  { id:'sage',      nome:'Sage & Branco',     cor:'#5A8A6A' },
  { id:'azul',      nome:'Azul Serenidade',   cor:'#4A7AB5' },
  { id:'bordeaux',  nome:'Bordeaux Elegante', cor:'#8B3A52' },
  { id:'nude',      nome:'Nude Moderno',      cor:'#A07850' },
  { id:'preto',     nome:'Preto & Ouro',      cor:'#2C2820' },
];

/* ── DiamondRing icon — IconPark ── */
function RingIcon({ size = 22, color = '#2C1A00' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="29" r="15" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 8L21 4H25.1339H29.0536L32 8L25 14L18 8Z" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

const compressImage = (file: File): Promise<File> => new Promise(resolve => {
  const maxSize = 800, quality = 0.7;
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    URL.revokeObjectURL(url);
    const canvas = document.createElement('canvas');
    let { width, height } = img;
    if (width > maxSize || height > maxSize) {
      if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
      else { width = Math.round(width * maxSize / height); height = maxSize; }
    }
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
    canvas.toBlob(b => resolve(b ? new File([b], file.name, { type:'image/jpeg' }) : file), 'image/jpeg', quality);
  };
  img.onerror = () => resolve(file);
  img.src = url;
});

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: '.88rem', fontWeight: 700, color: '#3D2E0E', marginBottom: 2 }}>{label}</label>
      {hint && <p style={{ fontSize: '.75rem', color: '#9A8A6A', marginBottom: 6, fontWeight: 300 }}>{hint}</p>}
      {children}
      {error && <p style={{ color: '#C0392B', fontSize: '.75rem', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function Card({ children, premium, completo }: { children: React.ReactNode; premium?: boolean; completo?: boolean }) {
  return (
    <div style={{
      background: premium ? G.shine : '#FFFFFF',
      borderRadius: 22, padding: '28px 24px',
      border: `1px solid ${premium ? G.border : completo ? '#EDE0C4' : '#EEEAE0'}`,
      boxShadow: premium ? '0 8px 32px rgba(200,151,58,.25),inset 0 1px 0 rgba(255,255,255,.4)' : '0 2px 16px rgba(0,0,0,.04)',
      marginBottom: 20,
    }}>{children}</div>
  );
}

function SecTitle({ text, premium }: { text: string; premium?: boolean }) {
  return (
    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 700, color: premium ? '#2C1A00' : '#1C1A16', marginBottom: 20 }}>
      {text}
    </h3>
  );
}

function PremiumBadge() {
  return <span style={{ display:'inline-block', marginLeft:8, background:G.shine, borderRadius:50, padding:'2px 10px', fontSize:'.7rem', color:'#2C1A00', fontWeight:700, boxShadow:'0 2px 8px rgba(200,151,58,.3)', verticalAlign:'middle' }}>✨ Premium</span>;
}
function CompletoBadge() {
  return <span style={{ display:'inline-block', marginLeft:8, background:G.bg, borderRadius:50, padding:'2px 10px', fontSize:'.7rem', fontWeight:700, border:`1px solid ${G.border}`, color:G.accent, verticalAlign:'middle' }}>Completo+</span>;
}

/* ── Indicador de etapas ── */
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
      {[1, 2].map((s, i) => {
        const done    = step > s;
        const active  = step === s;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done || active ? G.shine : '#EEEAE0',
              boxShadow: done || active ? '0 3px 10px rgba(200,151,58,.35),inset 0 1px 0 rgba(255,255,255,.4)' : 'none',
              transition: 'all .3s',
            }}>
              {done
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C1A00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                : <span style={{ fontSize: '.82rem', fontWeight: 700, color: active ? '#2C1A00' : '#B0A890' }}>{s}</span>
              }
            </div>
            {i < 1 && (
              <div style={{ width: 60, height: 1, background: step >= 2 ? 'linear-gradient(90deg,#D4AF5A,#E8D898)' : '#EEEAE0', transition: 'all .3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Form ── */
const FormContent = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const router = useRouter() as any;
  const searchParams = useSearchParams();

  const [step, setStep]                 = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverFile, setCoverFile]       = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [fieldErrors, setFieldErrors]   = useState<FieldErrors>({});

  const [formData, setFormData] = useState<FormData>({
    plano: 'basico',
    nomeNoivo: '', nomeNoiva: '', dataCaramento: '', email: '',
    frase: '', historia: '',
    localCerimonia: '', endCerimonia: '', horarioCerimonia: '',
    localFesta: '', endFesta: '', horarioFesta: '', dressCode: '',
    presentes: [{ nome:'', link:'', pix:'' }], pixLuaDeMel: '',
    tema: 'champagne', musicaUrl: '',
  });

  useEffect(() => {
    const p = searchParams.get('plano');
    if (p === 'basico' || p === 'completo' || p === 'premium') setFormData(d => ({ ...d, plano: p }));
  }, [searchParams]);

  const isCompleto = formData.plano === 'completo' || formData.plano === 'premium';
  const isPremium  = formData.plano === 'premium';

  const input: React.CSSProperties = {
    width: '100%', padding: '11px 16px', marginTop: 6, background: '#FFFFFF', color: '#1C1A16',
    border: '1px solid #EEEAE0', borderRadius: 12, fontSize: '.95rem',
    fontFamily: "'Nunito',sans-serif", outline: 'none', transition: 'border-color .2s',
  };
  const inputErr:     React.CSSProperties = { ...input, border: '1px solid #E74C3C' };
  const inputPremium: React.CSSProperties = { ...input, border: '1px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.7)' };
  const btnGold: React.CSSProperties = {
    background: G.btn, color: '#fff', border: 'none', padding: '14px', borderRadius: 50,
    fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%',
    fontFamily: "'Nunito',sans-serif",
    boxShadow: '0 6px 22px rgba(200,151,58,.45),inset 0 1px 0 rgba(255,255,255,.35)',
    transition: 'all .3s',
  };

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    setFieldErrors(p => ({ ...p, [e.target.name]: undefined }));
  };

  const setPresente = (i: number, field: keyof Presente, val: string) =>
    setFormData(p => { const a = [...p.presentes]; a[i] = { ...a[i], [field]: val }; return { ...p, presentes: a }; });

  /* ── Validação etapa 1 ── */
  const validateStep1 = () => {
    const e: FieldErrors = {};
    if (!formData.nomeNoivo.trim())      e.nomeNoivo      = 'Obrigatório';
    if (!formData.nomeNoiva.trim())      e.nomeNoiva      = 'Obrigatório';
    if (!formData.dataCaramento)         e.dataCaramento  = 'Obrigatório';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'E-mail inválido';
    if (!formData.localCerimonia.trim()) e.localCerimonia = 'Obrigatório';
    if (!formData.horarioCerimonia)      e.horarioCerimonia = 'Obrigatório';
    if (!coverFile)                      e.coverFile      = 'Foto de capa obrigatória';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, k === 'presentes' ? JSON.stringify(v) : v as string));
      if (coverFile) data.append('fotoCapa', await compressImage(coverFile));
      if (galleryFiles) {
        const max = isPremium ? 30 : 10;
        for (let i = 0; i < Math.min(galleryFiles.length, max); i++)
          data.append('galeria', await compressImage(galleryFiles[i]));
      }
      const res  = await fetch('/api/create-checkout', { method: 'POST', body: data });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else throw new Error(json.error);
    } catch (err) { console.error(err); alert('Erro ao processar. Tente novamente.'); }
    finally { setIsSubmitting(false); }
  };

  const planPrice = formData.plano === 'basico' ? 'R$49' : formData.plano === 'completo' ? 'R$97' : 'R$147';

  /* ── Labels das etapas ── */
  const stepLabels = ['Dados essenciais', 'Detalhes & extras'];

  return (
    <div style={{ fontFamily: "'Nunito',sans-serif", background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,600&family=Nunito:wght@300;400;600;700&display=swap');
        input:focus, textarea:focus { border-color:${G.accent} !important; box-shadow:0 0 0 3px rgba(200,151,58,.15) !important; }
        .btn-gold:hover { box-shadow:0 10px 28px rgba(200,151,58,.6),inset 0 1px 0 rgba(255,255,255,.35) !important; transform:translateY(-2px); }
        .btn-back:hover { color:${G.accent} !important; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #F0EDE4', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => step === 2 ? (setStep(1), window.scrollTo({top:0,behavior:'smooth'})) : router.push('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: "'Nunito',sans-serif", color: '#7A7468', fontSize: '.88rem', transition: 'color .2s' }}
          className="btn-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
          {step === 2 ? 'Voltar à etapa 1' : 'Voltar ao início'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: G.shine, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(200,151,58,.35)' }}>
            <RingIcon size={12} color="#2C1A00" />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', fontWeight: 700, color: G.accent }}>WeddingTimee</span>
        </div>
      </nav>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: G.shine, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(200,151,58,.4),inset 0 1px 2px rgba(255,255,255,.6)' }}>
            <RingIcon size={26} color="#2C1A00" />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 700, color: '#1C1A16', margin: '0 0 6px' }}>
            {step === 1 ? 'Crie a página do casamento' : 'Quase lá!'}
          </h1>
          <p style={{ color: '#7A7468', fontSize: '.9rem', fontWeight: 300 }}>
            {step === 1 ? 'Etapa 1 de 2 — Dados essenciais' : 'Etapa 2 de 2 — Detalhes e extras'}
          </p>
        </div>

        {/* Indicador de progresso */}
        <StepIndicator step={step} />

        {/* ══════════════ ETAPA 1 ══════════════ */}
        {step === 1 && (
          <>
            {/* Seletor de plano */}
            <Card>
              <SecTitle text="Escolha seu plano" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {([
                  { id:'basico',   label:'Básico',  price:'R$49',  desc:'Página + QR' },
                  { id:'completo', label:'Completo', price:'R$97',  desc:'RSVP + Presentes' },
                  { id:'premium',  label:'Premium',  price:'R$147', desc:'Galeria + Domínio' },
                ] as { id: Plano; label: string; price: string; desc: string }[]).map(p => {
                  const active  = formData.plano === p.id;
                  const isPrem  = p.id === 'premium';
                  return (
                    <div key={p.id} onClick={() => setFormData(d => ({ ...d, plano: p.id }))}
                      style={{
                        background: isPrem && active ? G.shine : active ? G.bg : '#FFFFFF',
                        border: `1.5px solid ${active ? G.border : '#EEEAE0'}`,
                        borderRadius: 14, padding: '14px 10px', cursor: 'pointer', textAlign: 'center',
                        boxShadow: isPrem && active ? '0 4px 14px rgba(200,151,58,.3),inset 0 1px 0 rgba(255,255,255,.4)' : 'none',
                        transition: 'all .2s',
                      }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 700, color: isPrem && active ? '#2C1A00' : '#1C1A16' }}>{p.price}</div>
                      <div style={{ fontSize: '.82rem', fontWeight: 700, color: isPrem && active ? '#5C3D00' : G.accent }}>{p.label}</div>
                      <div style={{ fontSize: '.7rem', color: isPrem && active ? '#7A5410' : '#B0A890', fontWeight: 300 }}>{p.desc}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Dados do casal */}
            <Card>
              <SecTitle text="Dados do casal" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Nome do noivo *" error={fieldErrors.nomeNoivo}>
                  <input name="nomeNoivo" value={formData.nomeNoivo} onChange={set} placeholder="Ex: Rafael" style={fieldErrors.nomeNoivo ? inputErr : input} />
                </Field>
                <Field label="Nome da noiva *" error={fieldErrors.nomeNoiva}>
                  <input name="nomeNoiva" value={formData.nomeNoiva} onChange={set} placeholder="Ex: Ana" style={fieldErrors.nomeNoiva ? inputErr : input} />
                </Field>
              </div>
              <Field label="Data do casamento *" error={fieldErrors.dataCaramento}>
                <input type="date" name="dataCaramento" value={formData.dataCaramento} onChange={set} style={fieldErrors.dataCaramento ? inputErr : input} />
              </Field>
              <Field label="E-mail de contato *" error={fieldErrors.email} hint="Para receber o link após o pagamento">
                <input type="email" name="email" value={formData.email} onChange={set} placeholder="casal@email.com" style={fieldErrors.email ? inputErr : input} />
              </Field>
              <Field label="Foto de capa *" error={fieldErrors.coverFile} hint="Foto principal do casal — aparece no topo da página">
                <input type="file" accept="image/*" onChange={e => { setCoverFile(e.target.files?.[0] || null); setFieldErrors(p => ({ ...p, coverFile: undefined })); }} style={{ ...input, padding: '9px 16px' }} />
              </Field>
              <Field label="Frase / mensagem do casal" hint='Aparece em destaque na página'>
                <textarea name="frase" value={formData.frase} onChange={set} rows={2} placeholder='"Amor não é olhar um para o outro, mas olhar juntos na mesma direção."' style={{ ...input, resize: 'vertical' }} />
              </Field>
            </Card>

            {/* Evento */}
            <Card>
              <SecTitle text="Detalhes do evento" />
              <Field label="Local da cerimônia *" error={fieldErrors.localCerimonia}>
                <input name="localCerimonia" value={formData.localCerimonia} onChange={set} placeholder="Ex: Igreja Nossa Senhora das Graças" style={fieldErrors.localCerimonia ? inputErr : input} />
              </Field>
              <Field label="Endereço da cerimônia" hint="Usado para o mapa integrado">
                <input name="endCerimonia" value={formData.endCerimonia} onChange={set} placeholder="Rua, número, cidade — SP" style={input} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Horário da cerimônia *" error={fieldErrors.horarioCerimonia}>
                  <input type="time" name="horarioCerimonia" value={formData.horarioCerimonia} onChange={set} style={fieldErrors.horarioCerimonia ? inputErr : input} />
                </Field>
                <Field label="Dress code">
                  <input name="dressCode" value={formData.dressCode} onChange={set} placeholder="Ex: Esporte Fino" style={input} />
                </Field>
              </div>
              <Field label="Local da festa / recepção">
                <input name="localFesta" value={formData.localFesta} onChange={set} placeholder="Ex: Espaço Villa Verde" style={input} />
              </Field>
              <Field label="Endereço da festa" hint="Usado para o mapa integrado">
                <input name="endFesta" value={formData.endFesta} onChange={set} placeholder="Rua, número, cidade — SP" style={input} />
              </Field>
              <Field label="Horário da festa">
                <input type="time" name="horarioFesta" value={formData.horarioFesta} onChange={set} style={input} />
              </Field>
            </Card>

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '8px 0 24px' }} />

            {/* Botão próxima etapa */}
            <button onClick={goToStep2} className="btn-gold" style={btnGold}>
              Continuar para a etapa 2 →
            </button>
            <p style={{ textAlign: 'center', fontSize: '.78rem', color: '#B0A890', marginTop: 10, fontWeight: 300 }}>
              Você revisará tudo antes de pagar
            </p>
          </>
        )}

        {/* ══════════════ ETAPA 2 ══════════════ */}
        {step === 2 && (
          <>
            {/* Resumo do plano escolhido */}
            <div style={{ background: G.bg, borderRadius: 16, padding: '14px 20px', border: `1px solid ${G.border}`, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '.78rem', color: '#9A8A6A', fontWeight: 300 }}>Plano selecionado</span>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', fontWeight: 700, color: '#1C1A16' }}>
                  {formData.plano === 'basico' ? 'Básico' : formData.plano === 'completo' ? 'Completo' : 'Premium'} — {planPrice}
                </div>
              </div>
              <button onClick={() => setStep(1)}
                style={{ background: 'none', border: `1px solid ${G.border}`, color: G.accent, borderRadius: 50, padding: '6px 14px', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif" }}>
                Alterar
              </button>
            </div>

            {/* Nossa história — completo+ */}
            {isCompleto ? (
              <Card completo>
                <SecTitle text="Nossa história" /><CompletoBadge />
                <Field label="Como vocês se conheceram?" hint="Seção especial da página do casal">
                  <textarea name="historia" value={formData.historia} onChange={set} rows={5} placeholder="Era uma tarde de outubro quando…" style={{ ...input, resize: 'vertical', marginTop: 10 }} />
                </Field>
                <Field label={`Fotos da galeria`} hint={`Até ${isPremium ? 30 : 10} fotos do casal`}>
                  <input type="file" accept="image/*" multiple onChange={e => setGalleryFiles(e.target.files)} style={{ ...input, padding: '9px 16px' }} />
                </Field>
              </Card>
            ) : (
              <Card>
                <SecTitle text="Galeria de fotos" />
                <Field label="Fotos da galeria" hint="Até 5 fotos do casal">
                  <input type="file" accept="image/*" multiple onChange={e => setGalleryFiles(e.target.files)} style={{ ...input, padding: '9px 16px' }} />
                </Field>
              </Card>
            )}

            {/* Lista de presentes — completo+ */}
            {isCompleto && (
              <Card completo>
                <SecTitle text="Lista de presentes" /><CompletoBadge />
                {formData.presentes.map((p, i) => (
                  <div key={i} style={{ background: '#FAFAF8', borderRadius: 14, padding: 16, border: '1px solid #EEEAE0', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '.85rem', fontWeight: 700, color: G.accent }}>Presente {i + 1}</span>
                      {formData.presentes.length > 1 && (
                        <button onClick={() => setFormData(d => ({ ...d, presentes: d.presentes.filter((_, idx) => idx !== i) }))}
                          style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', fontSize: '.8rem', fontFamily: "'Nunito',sans-serif" }}>
                          ✕ Remover
                        </button>
                      )}
                    </div>
                    <input placeholder="Nome do presente (ex: Jogo de panelas)" value={p.nome} onChange={e => setPresente(i, 'nome', e.target.value)} style={{ ...input, marginBottom: 8 }} />
                    <input placeholder="Link de compra — opcional" value={p.link} onChange={e => setPresente(i, 'link', e.target.value)} style={{ ...input, marginBottom: 8 }} />
                    <input placeholder="Chave Pix — opcional" value={p.pix} onChange={e => setPresente(i, 'pix', e.target.value)} style={input} />
                  </div>
                ))}
                <button onClick={() => setFormData(d => ({ ...d, presentes: [...d.presentes, { nome:'', link:'', pix:'' }] }))}
                  style={{ background: 'none', border: `1.5px dashed ${G.border}`, color: G.accent, borderRadius: 14, padding: '10px', width: '100%', cursor: 'pointer', fontSize: '.88rem', fontFamily: "'Nunito',sans-serif" }}>
                  + Adicionar presente
                </button>
                <div style={{ marginTop: 16 }}>
                  <Field label="Pix — Contribuição Lua de Mel" hint="Chave Pix para a vaquinha da lua de mel">
                    <input name="pixLuaDeMel" value={formData.pixLuaDeMel} onChange={set} placeholder="Chave Pix (CPF, e-mail ou telefone)" style={input} />
                  </Field>
                </div>
              </Card>
            )}

            {/* Tema visual — premium */}
            {isPremium && (
              <Card premium>
                <SecTitle text="Tema visual" premium /><PremiumBadge />
                <p style={{ fontSize: '.82rem', color: '#7A5410', marginBottom: 16, fontWeight: 300 }}>Escolha a paleta de cores da sua página</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 10, marginBottom: 20 }}>
                  {TEMAS.map(t => {
                    const active = formData.tema === t.id;
                    return (
                      <div key={t.id} onClick={() => setFormData(d => ({ ...d, tema: t.id }))}
                        style={{ border: `2px solid ${active ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.3)'}`, borderRadius: 12, padding: '10px 8px', cursor: 'pointer', background: active ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.25)', textAlign: 'center', transition: 'all .2s' }}>
                        <div style={{ width: 24, height: 24, background: t.cor, borderRadius: '50%', margin: '0 auto 6px' }} />
                        <div style={{ fontSize: '.68rem', color: '#2C1A00', fontWeight: active ? 700 : 400 }}>{t.nome}</div>
                      </div>
                    );
                  })}
                </div>
                <Field label="Música de fundo (opcional)" hint="URL do YouTube para tocar suavemente na página">
                  <input name="musicaUrl" value={formData.musicaUrl} onChange={set} placeholder="https://www.youtube.com/watch?v=…" style={inputPremium} />
                </Field>
              </Card>
            )}

            {/* Plano básico — sem extras */}
            {!isCompleto && (
              <div style={{ background: '#FAFAF8', borderRadius: 16, padding: '20px 24px', border: '1px solid #EEEAE0', marginBottom: 20, textAlign: 'center' }}>
                <p style={{ color: '#7A7468', fontSize: '.9rem', fontWeight: 300 }}>
                  Quer adicionar RSVP, lista de presentes e galeria?{' '}
                  <button onClick={() => { setFormData(d => ({ ...d, plano: 'completo' })); setStep(1); }}
                    style={{ background: 'none', border: 'none', color: G.accent, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", fontSize: '.9rem' }}>
                    Upgrade para Completo →
                  </button>
                </p>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E8D898,transparent)', margin: '8px 0 24px' }} />

            {/* Botão finalizar */}
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-gold"
              style={{ ...btnGold, opacity: isSubmitting ? 0.75 : 1 }}>
              {isSubmitting ? 'Processando…' : `Ir para o pagamento — ${planPrice}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '.78rem', color: '#B0A890', marginTop: 10, fontWeight: 300 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#B0A890" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 4 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Pagamento seguro via Stripe · Você receberá o link por e-mail
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default function FormPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, background: G.shine, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(200,151,58,.35)' }}>
            <RingIcon size={22} color="#2C1A00" />
          </div>
          <p style={{ color: '#B0A890', fontFamily: 'Nunito,sans-serif', fontWeight: 300 }}>Carregando…</p>
        </div>
      </div>
    }>
      <FormContent />
    </Suspense>
  );
}