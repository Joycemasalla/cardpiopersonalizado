import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScrollToTopButtonProps {
  hasCart?: boolean;
}

export const ScrollToTopButton = ({ hasCart }: ScrollToTopButtonProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={`fixed z-40 h-10 w-10 rounded-full shadow-lg bg-muted hover:bg-muted/80 text-foreground ${
        hasCart ? "bottom-20 left-4" : "bottom-6 left-4"
      }`}
      aria-label="Voltar ao topo"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
};
