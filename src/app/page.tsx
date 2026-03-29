'use client';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fadeUp    = (d = 0): Variants => ({ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: d } } });
const fadeLeft  = (d = 0): Variants => ({ hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE, delay: d } } });
const fadeRight = (d = 0): Variants => ({ hidden: { opacity: 0, x: 40  }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE, delay: d } } });

/* ── Paleta dourada metálica ── */
const G = {
  shine:  'linear-gradient(135deg,#F5E6A3 0%,#D4AF5A 30%,#F0D98C 50%,#B8922A 70%,#E8CC6A 100%)',
  txt:    'linear-gradient(135deg,#A07820,#D4AF5A,#A07820)',
  btn:    'linear-gradient(135deg,#EDD87A,#C8973A,#F0D870,#B8882A)',
  border: '#E8D898',
  bg:     '#FFFDF5',
  accent: '#C8973A',
};

const cardBase: React.CSSProperties = {
  background: '#FFFFFF', borderRadius: 22, padding: '28px 22px',
  border: '1px solid #EEEAE0', boxShadow: '0 2px 16px rgba(0,0,0,.04)',
};
const btnMain: React.CSSProperties = {
  background: G.btn, color: '#fff', border: 'none', padding: '15px 34px',
  borderRadius: 50, fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
  fontFamily: "'Nunito',sans-serif",
  boxShadow: '0 6px 22px rgba(200,151,58,.45),inset 0 1px 0 rgba(255,255,255,.35)',
  transition: 'all .3s',
};

function GoldBadge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-block', background: G.bg, borderRadius: 50, padding: '5px 18px', border: `1px solid ${G.border}`, marginBottom: 14 }}>
      <span style={{ fontSize: '.82rem', fontWeight: 700, background: G.txt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {children}
      </span>
    </div>
  );
}

function GT({ children }: { children: React.ReactNode }) {
  return <span style={{ background: G.txt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{children}</span>;
}

/* ── Ícone DiamondRing — IconPark ── */
function RingIcon({ size = 22, color = '#2C1A00' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="25" cy="29" r="15" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 8L21 4H25.1339H29.0536L32 8L25 14L18 8Z" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PhoneMock() {
  return (
    <div style={{ background: '#1E1B14', borderRadius: 36, padding: '10px 7px', width: 200, boxShadow: '0 24px 60px rgba(0,0,0,.18),0 0 0 1px rgba(232,210,152,.35)' }}>
      <div style={{ background: '#FFFFFF', borderRadius: 28, padding: 14, minHeight: 378, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 50, height: 50, background: G.shine, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(200,151,58,.45),inset 0 1px 2px rgba(255,255,255,.6)' }}>
          <RingIcon size={22} color="#2C1A00" />
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem', fontWeight: 700, textAlign: 'center' }}><GT>Ana &amp; Rafael</GT></div>
        <div style={{ fontSize: '.58rem', color: '#B0A890', letterSpacing: '.06em', textAlign: 'center' }}>15 de Novembro de 2025</div>
        <div style={{ background: '#FAFAF8', borderRadius: 12, padding: '8px 14px', textAlign: 'center', border: '1px solid #EDEBE3', width: '100%' }}>
          <div style={{ fontSize: '.58rem', color: '#B0A890' }}>Casamento em</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontWeight: 700 }}><GT>127 dias</GT></div>
          <div style={{ fontSize: '.56rem', color: '#B0A890' }}>✨</div>
        </div>
        {[
          { t: 'Cerimônia · Igreja N. S. Graças', s: '16h00 · Ver no mapa →' },
          { t: 'Recepção · Espaço Villa Verde',   s: '19h00 · Esporte fino'  },
        ].map(row => (
          <div key={row.t} style={{ background: '#fff', borderRadius: 10, padding: '7px 10px', width: '100%', display: 'flex', alignItems: 'center', gap: 7, border: '1px solid #EDEBE3' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: G.shine, flexShrink: 0, boxShadow: '0 0 4px rgba(200,151,58,.5)' }} />
            <div>
              <div style={{ fontSize: '.63rem', fontWeight: 700, color: '#1C1A16' }}>{row.t}</div>
              <div style={{ fontSize: '.55rem', color: '#B0A890' }}>{row.s}</div>
            </div>
          </div>
        ))}
        <div style={{ background: '#FAFAF8', borderRadius: 10, padding: '7px 10px', width: '100%', fontSize: '.6rem', color: '#B0A890', textAlign: 'center', fontStyle: 'italic', border: '1px solid #EDEBE3' }}>
          &quot;Confirme sua presença ✨&quot;
        </div>
        <button style={{ background: G.btn, border: 'none', borderRadius: 50, padding: '7px 14px', fontSize: '.62rem', color: '#fff', fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: "'Nunito',sans-serif", boxShadow: '0 3px 10px rgba(200,151,58,.4)' }}>
          Confirmar presença →
        </button>
      </div>
    </div>
  );
}

function StepCard({ emoji, num, title, desc, delay }: { emoji: string; num: string; title: string; desc: string; delay: number }) {
  return (
    <motion.div variants={fadeUp(delay)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }} style={{ ...cardBase, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{emoji}</div>
      <div style={{ width: 26, height: 26, background: G.shine, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: '.78rem', fontWeight: 700, color: '#fff', boxShadow: '0 2px 8px rgba(200,151,58,.4),inset 0 1px 0 rgba(255,255,255,.4)' }}>{num}</div>
      <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: '#1C1A16', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: '.84rem', color: '#7A7468', lineHeight: 1.6, fontWeight: 300, margin: 0 }}>{desc}</p>
    </motion.div>
  );
}

function FeatCard({ emoji, title, desc, premium, delay }: { emoji: string; title: string; desc: string; premium?: boolean; delay: number }) {
  return (
    <motion.div variants={fadeUp(delay)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }} style={cardBase}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{emoji}</div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1C1A16', marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: '.88rem', color: '#7A7468', lineHeight: 1.65, fontWeight: 300, margin: 0 }}>{desc}</p>
      {premium && (
        <div style={{ display: 'inline-block', marginTop: 10, background: G.bg, borderRadius: 50, padding: '3px 12px', border: `1px solid ${G.border}` }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, background: G.txt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✨ Premium</span>
        </div>
      )}
    </motion.div>
  );
}

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const router = useRouter() as any;
  const planItems = (items: [boolean, string][]) => items.map(([ok, label]) => (
    <div key={label} style={{ fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: ok ? '#374151' : '#C0BAB0', fontWeight: ok ? 400 : 300 }}>
      <span style={{ color: ok ? G.accent : '#D0CCC4' }}>{ok ? '✓' : '✕'}</span> {label}
    </div>
  ));

  return (
    <div style={{ fontFamily: "'Nunito',sans-serif", background: '#FFFFFF', color: '#1C1A16', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,600&family=Nunito:wght@300;400;600;700&display=swap');
        .cg { font-family:'Cormorant Garamond',Georgia,serif !important; }
        .btn-h:hover { transform:translateY(-3px) !important; box-shadow:0 12px 32px rgba(200,151,58,.65),inset 0 1px 0 rgba(255,255,255,.35) !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #F0EDE4', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: G.shine, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(200,151,58,.35),inset 0 1px 2px rgba(255,255,255,.6)' }}>
            <RingIcon size={14} color="#2C1A00" />
          </div>
          <span className="cg" style={{ fontSize: '1.25rem', fontWeight: 700, color: G.accent }}>WeddingTimee</span>
        </div>
        <button onClick={() => router.push('/form')} className="btn-h" style={{ ...btnMain, padding: '10px 22px', fontSize: '.84rem' }}>
          Criar a página do casamento
        </button>
      </nav>

      {/* HERO */}
      <section style={{ background: '#FFFFFF', padding: '80px 24px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 300, top: -80, right: -100, background: 'radial-gradient(circle,rgba(212,175,90,.1),transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 300, bottom: -60, left: -80, background: 'radial-gradient(circle,rgba(212,175,90,.07),transparent 70%)', borderRadius: '50%', pointerEvents: 'none', filter: 'blur(40px)' }} />
        
        <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 48, justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div variants={fadeLeft(0)} initial="hidden" animate="show" style={{ flex: '1 1 320px', maxWidth: 500 }}>
            <GoldBadge>O convite digital do seu casamento</GoldBadge>
            <h1 className="cg" style={{ fontSize: 'clamp(2.2rem,5vw,3.3rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: 18, color: '#1C1A16' }}>
              A Página <GT><em style={{ fontStyle: 'italic' }}>Perfeita</em></GT><br />para o Grande Dia
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#7A7468', lineHeight: 1.75, marginBottom: 32, fontWeight: 300 }}>
              Crie uma página elegante com convite digital, contagem regressiva, confirmação de presença, lista de presentes e galeria colaborativa.
              Um <strong style={{ color: '#1C1A16', fontWeight: 700 }}>link único</strong> que fica vivo para sempre.
            </p>
            <button onClick={() => router.push('/form')} className="btn-h" style={btnMain}>Criar a página agora</button>
            <p style={{ fontSize: '.82rem', color: '#B0A890', marginTop: 12 }}>Pronto em menos de 15 minutos · Sem mensalidade</p>
          </motion.div>
          <motion.div variants={fadeRight(0.15)} initial="hidden" animate="show" style={{ flexShrink: 0 }}>
            <PhoneMock />
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ padding: '80px 24px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <motion.div variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <GoldBadge>✨ Simples assim</GoldBadge>
            <h2 className="cg" style={{ fontSize: '2.2rem', color: '#1C1A16', fontWeight: 700 }}>Como Funciona?</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(185px,1fr))', gap: 18 }}>
            <StepCard emoji="📋" num="1" title="Preencha os dados"  desc="Nomes, data, local e informações do casamento em menos de 15 minutos." delay={0}   />
            <StepCard emoji="👀" num="2" title="Veja o preview"     desc="Visualize como a página vai ficar antes de pagar. Sem surpresas."         delay={0.1} />
            <StepCard emoji="💳" num="3" title="Pague uma vez"      desc="Básico R$49, Completo R$97 ou Premium R$147. Sem mensalidade."             delay={0.2} />
            <StepCard emoji="🔗" num="4" title="Página no ar!"      desc="Link + QR Code prontos para compartilhar com todos os convidados."         delay={0.3} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '80px 24px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <motion.div variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <GoldBadge>✦ Tudo incluído</GoldBadge>
            <h2 className="cg" style={{ fontSize: '2.2rem', color: '#1C1A16', fontWeight: 700 }}>Tudo que o casal merece</h2>
            <p style={{ color: '#7A7468', marginTop: 8, fontSize: '.95rem', fontWeight: 300 }}>Uma página completa, elegante e permanente</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
            <FeatCard emoji="⏳" title="Contagem regressiva"  desc="Contador ao vivo com dias, horas e minutos até o grande dia."                      delay={0}   />
            <FeatCard emoji="💌" title="Convite digital"      desc="Substitui o convite físico com mapa integrado, horário e dress code."               delay={0.1} />
            <FeatCard emoji="✅" title="RSVP — Confirmação"  desc="Botão de confirmar presença com lista de convidados para os noivos."                 delay={0.2} />
            <FeatCard emoji="🎁" title="Lista de presentes"   desc="Presentes com link ou Pix. Vaquinha da lua de mel integrada."                       delay={0}   />
            <FeatCard emoji="💒" title="Nossa história"       desc="Seção especial contando como o casal se conheceu, com fotos."                       delay={0.1} />
            <FeatCard emoji="📱" title="QR Code exclusivo"    desc="Para imprimir nos convites físicos e nas mesas da festa."                           delay={0.2} />
            <FeatCard emoji="📸" title="Galeria colaborativa" desc="Convidados enviam fotos do dia. Álbum permanente do casamento." premium              delay={0}   />
            <FeatCard emoji="💬" title="Livro de mensagens"   desc="Convidados deixam recados. Memorial permanente de amor do casal." premium            delay={0.1} />
            <FeatCard emoji="🎨" title="Tema visual"          desc="Paletas elegantes para personalizar toda a identidade da página." premium            delay={0.2} />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '80px 24px', background: '#FAFAF8' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <motion.div variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <GoldBadge>💰 Investimento único</GoldBadge>
            <h2 className="cg" style={{ fontSize: '2.2rem', color: '#1C1A16', fontWeight: 700 }}>Escolha seu Plano</h2>
            <p style={{ color: '#7A7468', marginTop: 8, fontSize: '.95rem', fontWeight: 300 }}>Pague uma vez. A página fica no ar para sempre.</p>
          </motion.div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>

            {/* Básico */}
            <motion.div variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ y: -6, transition: { duration: 0.3 } }} style={{ flex: '1 1 260px', maxWidth: 300 }}>
              <div style={{ ...cardBase, height: '100%' }}>
                <p style={{ fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, background: G.txt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Básico</p>
                <p className="cg" style={{ fontSize: '2.8rem', fontWeight: 700, color: '#1C1A16', margin: 0 }}>R$49</p>
                <p style={{ fontSize: '.82rem', color: '#B0A890', marginBottom: 4, fontWeight: 300 }}>pagamento único · permanente</p>
                <div style={{ height: 1, margin: '14px 0 20px', background: 'linear-gradient(90deg,transparent,#E8D898,transparent)' }} />
                {planItems([[true,'Página do casal'],[true,'Contagem regressiva'],[true,'QR Code exclusivo'],[false,'RSVP'],[false,'Lista de presentes'],[false,'Galeria colaborativa'],[false,'Livro de mensagens']])}
                <button onClick={() => router.push('/form?plano=basico')} className="btn-h" style={{ ...btnMain, width: '100%', marginTop: 24, fontSize: '.95rem', padding: '14px' }}>
                  Começar no básico
                </button>
              </div>
            </motion.div>

            {/* Completo — borda metálica */}
            <motion.div variants={fadeUp(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ y: -6, transition: { duration: 0.3 } }} style={{ flex: '1 1 260px', maxWidth: 300, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 22, padding: 1.5, background: 'linear-gradient(135deg,#F5E6A3,#D4AF5A,#FFFFFF,#D4AF5A,#F0D870,#B8922A,#E8CC6A)', WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: G.btn, borderRadius: 50, padding: '4px 18px', whiteSpace: 'nowrap', fontSize: '.76rem', fontWeight: 700, color: '#fff', boxShadow: '0 3px 12px rgba(200,151,58,.45),inset 0 1px 0 rgba(255,255,255,.3)' }}>Mais escolhido</div>
              <div style={{ ...cardBase, padding: '42px 22px 28px', boxShadow: '0 8px 40px rgba(200,151,58,.18)', height: '100%' }}>
                <p style={{ fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, background: G.txt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Completo</p>
                <p className="cg" style={{ fontSize: '2.8rem', fontWeight: 700, color: '#1C1A16', margin: 0 }}>R$97</p>
                <p style={{ fontSize: '.82rem', color: '#B0A890', marginBottom: 4, fontWeight: 300 }}>pagamento único · permanente</p>
                <div style={{ height: 1, margin: '14px 0 20px', background: 'linear-gradient(90deg,transparent,#D4AF5A,transparent)' }} />
                {['Tudo do Básico','RSVP com confirmações','Lista de presentes','Mapa da cerimônia e festa','Nossa história do casal','Galeria de fotos do casal'].map(f => (
                  <div key={f} style={{ fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#374151' }}>
                    <span style={{ color: G.accent }}>✓</span> {f}
                  </div>
                ))}
                <button onClick={() => router.push('/form?plano=completo')} className="btn-h" style={{ ...btnMain, width: '100%', marginTop: 24, fontSize: '.95rem', padding: '14px' }}>
                  Quero o Completo
                </button>
              </div>
            </motion.div>

            {/* Premium — fundo dourado metálico */}
            <motion.div variants={fadeUp(0.2)} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ y: -6, transition: { duration: 0.3 } }} style={{ flex: '1 1 260px', maxWidth: 300 }}>
              <div style={{ background: G.shine, borderRadius: 22, padding: '28px 22px', height: '100%', boxShadow: '0 8px 40px rgba(200,151,58,.35),inset 0 1px 0 rgba(255,255,255,.4)' }}>
                <p style={{ fontSize: '.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, color: '#5C3D00' }}>Premium</p>
                <p className="cg" style={{ fontSize: '2.8rem', fontWeight: 700, color: '#2C1A00', margin: 0 }}>R$147</p>
                <p style={{ fontSize: '.82rem', color: '#7A5410', marginBottom: 4, fontWeight: 400 }}>pagamento único · domínio próprio</p>
                <div style={{ height: 1, margin: '14px 0 20px', background: 'rgba(255,255,255,.45)' }} />
                {['Tudo do Completo','Galeria colaborativa','Livro de mensagens','Tema visual personalizado','Música de fundo','Domínio próprio (nomes.com.br)'].map(f => (
                  <div key={f} style={{ fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: '#2C1A00', fontWeight: 600 }}>
                    <span style={{ color: '#5C3D00', fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
                <button onClick={() => router.push('/form?plano=premium')}
                  style={{ background: '#2C1A00', color: '#F0D870', border: 'none', padding: '14px', borderRadius: 50, fontFamily: "'Nunito',sans-serif", fontSize: '.95rem', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: 24, boxShadow: '0 4px 16px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.1)', transition: 'all .3s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1A0E00'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#2C1A00'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  Quero o Premium
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '88px 24px', background: '#FFFFFF', textAlign: 'center' }}>
        <motion.div variants={fadeUp(0)} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, background: G.shine, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 6px 20px rgba(200,151,58,.4),inset 0 1px 2px rgba(255,255,255,.6)' }}>
            <RingIcon size={28} color="#2C1A00" />
          </div>
          <h2 className="cg" style={{ fontSize: '2rem', fontWeight: 700, color: '#1C1A16', marginBottom: 14 }}>
            O grande dia merece<br />ser lembrado para sempre
          </h2>
          <p style={{ fontSize: '1rem', color: '#7A7468', lineHeight: 1.7, marginBottom: 30, fontWeight: 300 }}>
            Crie agora a página do casamento, compartilhe com os convidados e cole o QR Code nos convites físicos.
          </p>
          <button onClick={() => router.push('/form')} className="btn-h" style={btnMain}>Criar a página agora</button>
          <p style={{ marginTop: 14, fontSize: '.8rem', color: '#B0A890' }}>Pagamento seguro · Suporte em português</p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#FAFAF8', borderTop: '1px solid #F0EDE4', padding: '44px 24px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, background: G.shine, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 3px 10px rgba(200,151,58,.3)' }}>
          <RingIcon size={18} color="#2C1A00" />
        </div>
        <div className="cg" style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 8, background: G.txt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>WeddingTimee</div>
        <p style={{ color: '#B0A890', fontSize: '.88rem', marginBottom: 20, fontWeight: 300 }}>A página do seu casamento — para sempre.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 18 }}>
          {[['Termos de uso', '/terms'], ['Privacidade', '/privacy']].map(([label, path]) => (
            <button key={path} onClick={() => router.push(path)}
              style={{ background: 'none', border: 'none', color: '#B0A890', fontSize: '.83rem', cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = G.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = '#B0A890')}
            >{label}</button>
          ))}
        </div>
        <p style={{ color: '#C0BAB0', fontSize: '.75rem' }}>Copyright © 2026 WeddingTimee · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}