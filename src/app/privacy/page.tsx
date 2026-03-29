'use client';
import { useRouter } from 'next/navigation';

const G = { accent: '#C8973A' };

export default function PrivacyPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const router = useRouter() as any;

  return (
    <div style={{ fontFamily: "'Nunito',sans-serif", background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Nunito:wght@300;400;700&display=swap'); .cg{font-family:'Cormorant Garamond',serif!important}`}</style>

      <nav style={{ background: 'rgba(255,255,255,.97)', borderBottom: '1px solid #F0EDE4', padding: '14px 28px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: "'Nunito',sans-serif" }}>
          <span style={{ fontSize: 18 }}>💍</span>
          <span className="cg" style={{ fontSize: '1.1rem', fontWeight: 700, color: G.accent }}>WeddingTimee</span>
          <span style={{ fontSize: '.82rem', color: '#B0A890', marginLeft: 4 }}>← Voltar</span>
        </button>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px' }}>
        <h1 className="cg" style={{ fontSize: '2.4rem', fontWeight: 700, color: '#1C1A16', marginBottom: 8 }}>Política de Privacidade</h1>
        <p style={{ color: '#B0A890', fontSize: '.88rem', marginBottom: 40, fontWeight: 300 }}>Última atualização: março de 2026</p>

        {[
          ['1. Dados Coletados', 'Coletamos os dados que você fornece ao criar sua página: nomes dos noivos, data do casamento, e-mail de contato, fotos e informações do evento. Também coletamos dados de confirmação de presença (RSVP) e mensagens enviadas pelos convidados.'],
          ['2. Uso dos Dados', 'Seus dados são utilizados exclusivamente para: (a) criar e exibir sua página de casamento; (b) enviar o link da página por e-mail; (c) processar o pagamento via Stripe. Não utilizamos seus dados para marketing ou publicidade.'],
          ['3. Compartilhamento', 'Compartilhamos apenas os dados necessários com: Stripe (processamento de pagamento) e Resend (envio de e-mail). Nenhum dado é vendido ou compartilhado com terceiros para fins comerciais.'],
          ['4. Armazenamento', 'Seus dados são armazenados com segurança no Supabase (infraestrutura em nuvem com criptografia em trânsito e em repouso). As fotos são armazenadas no Supabase Storage.'],
          ['5. Fotos e Imagens', 'As fotos enviadas são armazenadas em servidor seguro e exibidas apenas na sua página pública. Você mantém todos os direitos sobre as imagens enviadas.'],
          ['6. Acesso e Exclusão', 'Você pode solicitar a exclusão de sua página e todos os dados associados a qualquer momento pelo e-mail contato@weddingtimee.com.br. Atenderemos em até 5 dias úteis.'],
          ['7. Cookies', 'Utilizamos apenas cookies técnicos essenciais para o funcionamento do site. Não utilizamos cookies de rastreamento ou publicidade.'],
          ['8. Contato', 'Para dúvidas sobre privacidade ou para exercer seus direitos (acesso, correção, exclusão), entre em contato: contato@weddingtimee.com.br'],
        ].map(([title, body]) => (
          <div key={title as string} style={{ marginBottom: 32 }}>
            <h2 className="cg" style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1C1A16', marginBottom: 10 }}>{title}</h2>
            <p style={{ color: '#5A5040', lineHeight: 1.8, fontWeight: 300 }}>{body}</p>
          </div>
        ))}
      </div>

      <footer style={{ background: '#FAFAF8', borderTop: '1px solid #F0EDE4', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C0BAB0', fontSize: '.75rem' }}>© 2026 WeddingTimee · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}