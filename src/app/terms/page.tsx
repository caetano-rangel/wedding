'use client';
import { useRouter } from 'next/navigation';

const G = { accent: '#C8973A', border: '#E8D898', bg: '#FFFDF5' };

export default function TermsPage() {
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
        <h1 className="cg" style={{ fontSize: '2.4rem', fontWeight: 700, color: '#1C1A16', marginBottom: 8 }}>Termos de Uso</h1>
        <p style={{ color: '#B0A890', fontSize: '.88rem', marginBottom: 40, fontWeight: 300 }}>Última atualização: março de 2026</p>

        {[
          ['1. Aceitação dos Termos', 'Ao utilizar o WeddingTimee, você concorda com estes termos de uso. Se não concordar com qualquer parte, não utilize o serviço.'],
          ['2. Descrição do Serviço', 'O WeddingTimee é uma plataforma que permite a criação de páginas digitais personalizadas para casamentos, incluindo convite digital, RSVP, lista de presentes e galeria de fotos.'],
          ['3. Pagamento', 'O serviço é cobrado mediante pagamento único, sem mensalidade. O acesso é liberado após a confirmação do pagamento via Stripe. Não realizamos reembolsos após a ativação da página.'],
          ['4. Conteúdo', 'Você é responsável pelo conteúdo publicado em sua página. É proibido publicar conteúdo ofensivo, ilegal ou que viole direitos de terceiros. O WeddingTimee reserva-se o direito de remover páginas que violem estas regras.'],
          ['5. Disponibilidade', 'Nos comprometemos a manter a página no ar pelo período contratado (permanente para todos os planos atuais). Eventuais manutenções serão comunicadas com antecedência.'],
          ['6. Privacidade', 'Os dados fornecidos são utilizados exclusivamente para a criação e manutenção da sua página. Não compartilhamos dados pessoais com terceiros, exceto os necessários para processamento do pagamento (Stripe).'],
          ['7. Propriedade Intelectual', 'O design e o código do WeddingTimee são de propriedade exclusiva da plataforma. O conteúdo (fotos, textos) publicado pelo usuário permanece de sua propriedade.'],
          ['8. Contato', 'Dúvidas sobre estes termos podem ser enviadas para contato@weddingtimee.com.br'],
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