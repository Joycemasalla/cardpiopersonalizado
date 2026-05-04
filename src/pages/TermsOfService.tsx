import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur-md">
        <div className="container py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-display font-semibold text-foreground">Termos de Uso</h1>
        </div>
      </header>
      <main className="container max-w-3xl py-10">
        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">1. Aceitação dos Termos</h2>
        <p className="text-muted-foreground">
          Ao utilizar este cardápio digital, você concorda com estes termos. Caso não concorde, por favor não utilize
          o serviço.
        </p>
        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">2. Pedidos</h2>
        <p className="text-muted-foreground">
          Os pedidos são finalizados via WhatsApp diretamente com o restaurante. A confirmação, prazo de preparo e
          entrega são de responsabilidade do estabelecimento.
        </p>
        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">3. Pagamento</h2>
        <p className="text-muted-foreground">
          O pagamento é realizado conforme as opções disponibilizadas (PIX, cartão, dinheiro). Não armazenamos dados
          de pagamento.
        </p>
        <h2 className="text-2xl font-display font-semibold mt-6 mb-3 text-foreground">4. Limitação de Responsabilidade</h2>
        <p className="text-muted-foreground">
          Somos uma plataforma para apresentação do cardápio. A qualidade dos produtos e o cumprimento dos pedidos
          são de responsabilidade exclusiva do restaurante.
        </p>
        <p className="text-xs text-muted-foreground mt-10">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>
      </main>
    </div>
  );
}