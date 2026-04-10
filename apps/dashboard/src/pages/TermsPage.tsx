import { ArrowLeft } from 'lucide-react';
import logoImg from '../assets/logo.png';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => window.history.back()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={logoImg} alt="ImovDigital" className="h-10 object-contain" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Termos de Uso e Política de Privacidade</h1>
          <p className="text-sm text-gray-400 mb-8">Última atualização: Abril de 2026</p>

          <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao criar uma conta na plataforma ImovDigital, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso e com nossa Política de Privacidade. Se você não concordar com qualquer disposição, não utilize a plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
              <p>
                A ImovDigital é uma plataforma SaaS (Software como Serviço) que oferece às imobiliárias e corretores de imóveis:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Criação e personalização de site próprio para a imobiliária;</li>
                <li>Cadastro e gestão de imóveis com fotos, descrições e informações detalhadas;</li>
                <li>Captação e gerenciamento de leads (contatos de interessados);</li>
                <li>Editor visual para personalização do layout, cores, fontes e seções do site;</li>
                <li>Configuração de domínio próprio ou subdomínio gratuito;</li>
                <li>Otimização de SEO para mecanismos de busca;</li>
                <li>Integrações com WhatsApp para notificações de leads;</li>
                <li>Gestão de equipe e permissões de acesso.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Cadastro e Conta</h2>
              <p>
                Para utilizar a plataforma, é necessário criar uma conta fornecendo informações verdadeiras e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.
              </p>
              <p className="mt-2">
                Cada conta pode gerenciar uma ou mais organizações (imobiliárias). O titular da conta é responsável por todas as organizações vinculadas.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Planos e Pagamentos</h2>
              <p>
                A ImovDigital oferece um período de teste gratuito de 7 dias com funcionalidades limitadas. Após o período de teste, é necessário assinar um plano pago para continuar utilizando a plataforma.
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Os valores dos planos estão disponíveis na página de assinatura;</li>
                <li>A cobrança é recorrente (mensal ou anual) via cartão de crédito;</li>
                <li>O cancelamento pode ser feito a qualquer momento, sem multa;</li>
                <li>Após o cancelamento, o acesso é mantido até o final do período pago;</li>
                <li>Conforme o Art. 49 do Código de Defesa do Consumidor, o reembolso integral é garantido em até 7 dias após a contratação.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Conteúdo e Responsabilidades do Usuário</h2>
              <p>
                O usuário é integralmente responsável por todo o conteúdo publicado em seu site, incluindo:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Fotos, vídeos e imagens dos imóveis;</li>
                <li>Descrições, valores e informações dos anúncios;</li>
                <li>Dados de contato e informações da imobiliária;</li>
                <li>Conformidade com a legislação vigente, incluindo o Código de Defesa do Consumidor e legislação imobiliária aplicável.</li>
              </ul>
              <p className="mt-2">
                A ImovDigital não se responsabiliza pela veracidade, legalidade ou precisão do conteúdo publicado pelos usuários. É proibido publicar conteúdo ilegal, fraudulento, ofensivo, discriminatório ou que viole direitos de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Propriedade Intelectual</h2>
              <p>
                A plataforma ImovDigital, incluindo seu código-fonte, design, funcionalidades e marca, são propriedade exclusiva da ImovDigital. O conteúdo publicado pelo usuário (fotos, textos, dados de imóveis) permanece de propriedade do usuário.
              </p>
              <p className="mt-2">
                Ao publicar conteúdo na plataforma, o usuário concede à ImovDigital uma licença não exclusiva para exibir, armazenar e distribuir esse conteúdo exclusivamente para a prestação do serviço contratado.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Armazenamento e Backup</h2>
              <p>
                As imagens e arquivos enviados são armazenados em servidores seguros na nuvem. Após o cancelamento da conta, os dados são mantidos por 30 dias e em seguida removidos permanentemente.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Política de Privacidade</h2>
              <p>
                A ImovDigital coleta e processa os seguintes dados pessoais:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Dados do titular da conta:</strong> nome, e-mail, telefone;</li>
                <li><strong>Dados da imobiliária:</strong> nome, endereço, CRECI, redes sociais;</li>
                <li><strong>Dados de leads:</strong> nome, e-mail, telefone e mensagem dos visitantes que preenchem formulários nos sites dos clientes;</li>
                <li><strong>Dados de uso:</strong> logs de acesso, páginas visitadas, ações realizadas na plataforma.</li>
              </ul>
              <p className="mt-2">
                Esses dados são utilizados exclusivamente para:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Prestação do serviço contratado;</li>
                <li>Comunicações sobre a conta e a plataforma;</li>
                <li>Melhorias no serviço e suporte ao cliente;</li>
                <li>Cumprimento de obrigações legais.</li>
              </ul>
              <p className="mt-2">
                A ImovDigital não vende, compartilha ou cede dados pessoais a terceiros, exceto quando necessário para a prestação do serviço (processador de pagamentos, serviço de e-mail) ou por determinação legal.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Proteção de Dados (LGPD)</h2>
              <p>
                Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o usuário tem direito a:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Acessar seus dados pessoais armazenados;</li>
                <li>Solicitar correção de dados incompletos ou inexatos;</li>
                <li>Solicitar a exclusão de seus dados pessoais;</li>
                <li>Revogar o consentimento para o tratamento de dados;</li>
                <li>Solicitar a portabilidade dos dados.</li>
              </ul>
              <p className="mt-2">
                Para exercer esses direitos, entre em contato pelo e-mail contato@imovdigital.com.br.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Disponibilidade do Serviço</h2>
              <p>
                A ImovDigital se compromete a manter a plataforma disponível 24 horas por dia, 7 dias por semana, ressalvadas as hipóteses de manutenção programada, falhas técnicas ou eventos de força maior. Não garantimos disponibilidade ininterrupta do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Limitação de Responsabilidade</h2>
              <p>
                A ImovDigital não se responsabiliza por:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Negociações imobiliárias realizadas entre o usuário e seus clientes;</li>
                <li>Perdas financeiras decorrentes da utilização ou indisponibilidade da plataforma;</li>
                <li>Conteúdo publicado pelos usuários nos sites gerados pela plataforma;</li>
                <li>Ações de terceiros que acessem os sites publicados.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Rescisão</h2>
              <p>
                A ImovDigital reserva-se o direito de suspender ou encerrar a conta de qualquer usuário que viole estes Termos de Uso, sem aviso prévio e sem direito a reembolso, especialmente nos casos de:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Publicação de conteúdo ilegal ou fraudulento;</li>
                <li>Uso abusivo da plataforma;</li>
                <li>Inadimplência persistente;</li>
                <li>Violação de direitos de terceiros.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Alterações nos Termos</h2>
              <p>
                A ImovDigital poderá alterar estes Termos a qualquer momento, notificando os usuários por e-mail ou por aviso na plataforma. O uso continuado da plataforma após a notificação constitui aceitação das alterações.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Foro</h2>
              <p>
                Fica eleito o foro da comarca de Jaraguá do Sul, Estado de Santa Catarina, para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Contato</h2>
              <p>
                Em caso de dúvidas sobre estes Termos de Uso ou nossa Política de Privacidade, entre em contato:
              </p>
              <ul className="list-none space-y-1 mt-2">
                <li><strong>E-mail:</strong> contato@imovdigital.com.br</li>
                <li><strong>WhatsApp:</strong> (47) 99255-8338</li>
                <li><strong>Site:</strong> https://imovdigital.com.br</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
