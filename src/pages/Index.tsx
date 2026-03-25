import { motion } from "framer-motion";
import { ArrowRight, Store, Palette, ShoppingCart, MessageCircle, BarChart3, Zap, ChefHat, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Store,
    title: "Multi-Tenant",
    description: "Cada restaurante com seu cardápio exclusivo, URL única e marca personalizada.",
  },
  {
    icon: Palette,
    title: "White Label Total",
    description: "Logo, cores, banner — tudo customizável para a identidade de cada cliente.",
  },
  {
    icon: ShoppingCart,
    title: "Carrinho Inteligente",
    description: "Variações, adicionais e observações por item. Experiência completa de pedido.",
  },
  {
    icon: MessageCircle,
    title: "Pedidos via WhatsApp",
    description: "Pedido formatado e enviado direto para o WhatsApp do restaurante.",
  },
  {
    icon: BarChart3,
    title: "Painel Administrativo",
    description: "Gerencie produtos, categorias, pedidos e configurações em um só lugar.",
  },
  {
    icon: Zap,
    title: "Tempo Real",
    description: "Atualizações instantâneas. Produtos e status de pedidos sempre sincronizados.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <span className="font-display text-xl font-bold italic tracking-tight text-primary">
            MenuLab
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-foreground hover:text-primary" onClick={() => navigate("/login")}>
              Entrar
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => navigate("/login")}>
              Criar Cardápio
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container max-w-4xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
              <ChefHat className="h-4 w-4 text-primary" />
              <span className="text-primary text-sm font-medium">Plataforma White Label Premium</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-tight">
              Cardápio digital
              <br />
              <span className="text-primary italic">com a sua marca</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Crie cardápios digitais personalizados para cada restaurante.
              Logo, cores, produtos e pedidos via WhatsApp — tudo em uma plataforma elegante.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-base px-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={() => navigate("/login")}>
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-10 border-border text-foreground hover:bg-secondary hover:text-foreground" onClick={() => navigate("/r/demo")}>
                <Smartphone className="mr-2 h-5 w-5" />
                Ver Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-border">
        <div className="container max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground italic">
              Tudo que você precisa
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Uma plataforma completa para gerenciar cardápios digitais premium.
            </p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 italic">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground italic">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Crie seu primeiro cardápio digital em minutos.
          </p>
          <Button size="lg" className="mt-8 text-base px-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={() => navigate("/login")}>
            Criar Meu Cardápio
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <span className="font-display font-bold italic text-primary">
            MenuLab
          </span>
          {" · "}© {new Date().getFullYear()} Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
