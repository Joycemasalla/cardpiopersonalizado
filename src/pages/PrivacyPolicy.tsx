import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur-md">
        <div className="container py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-display font-semibold text-foreground">Política de Privacidade</h1>
        </div>
      </header>
      <main className="container max-w-3xl py-10 prose prose-sm dark:prose-invert">
        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">1. Coleta de Informações</h2>
        <p className="text-muted-foreground">
          Coletamos apenas as informações necessárias para o processamento do seu pedido: nome, telefone (WhatsApp) e
          endereço de entrega. Esses dados são utilizados exclusivamente para a finalização e entrega do seu pedido.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">2. Armazenamento Local</h2>
        <p className="text-muted-foreground">
          Salvamos suas informações de contato no armazenamento local do seu navegador (localStorage) para facilitar
          pedidos futuros. Esses dados permanecem apenas no seu dispositivo e podem ser apagados a qualquer momento
          limpando o cache do navegador.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">3. Compartilhamento de Dados</h2>
        <p className="text-muted-foreground">
          Seus dados são compartilhados apenas com a equipe do restaurante para o cumprimento do pedido. Não vendemos,
          alugamos ou cedemos suas informações a terceiros para fins de marketing.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">4. Seus Direitos (LGPD)</h2>
        <p className="text-muted-foreground">
          De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a acessar, corrigir, excluir e
          portar seus dados. Para exercer esses direitos, entre em contato pelo WhatsApp do restaurante.
        </p>

        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">5. Cookies</h2>
        <p className="text-muted-foreground">
          Utilizamos cookies técnicos essenciais ao funcionamento do site. Não utilizamos cookies de rastreamento
          publicitário.
        </p>

        <p className="text-xs text-muted-foreground mt-10">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </main>
    </div>
  );
}