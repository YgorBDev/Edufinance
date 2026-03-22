import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck } from "lucide-react";

interface TermsDialogProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export function TermsDialog({ open, onAccept, onClose }: TermsDialogProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Termos de Responsabilidade</DialogTitle>
          </div>
          <DialogDescription>
            Leia e aceite os termos antes de continuar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-64 border rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
          <h3 className="font-semibold text-foreground mb-2">1. Natureza Educacional</h3>
          <p className="mb-3">
            A plataforma EduFinance é exclusivamente educacional. Todos os valores, simulações e operações de "compra e venda" de ativos são fictícios e utilizam dinheiro virtual. Nenhuma transação real é realizada.
          </p>

          <h3 className="font-semibold text-foreground mb-2">2. Não é Recomendação de Investimento</h3>
          <p className="mb-3">
            As informações, dados de mercado e conteúdos apresentados têm finalidade exclusivamente educativa. Nada aqui constitui aconselhamento financeiro, recomendação de investimento ou oferta de valores mobiliários.
          </p>

          <h3 className="font-semibold text-foreground mb-2">3. Dados de Mercado</h3>
          <p className="mb-3">
            Os dados de cotações exibidos podem ter atraso e são fornecidos por terceiros. A EduFinance não se responsabiliza pela precisão ou atualidade dessas informações.
          </p>

          <h3 className="font-semibold text-foreground mb-2">4. Risco de Investimentos Reais</h3>
          <p className="mb-3">
            Investimentos reais envolvem riscos, inclusive de perda total do capital. Antes de investir de verdade, consulte um profissional certificado (CPA, CEA, CNPI ou equivalente).
          </p>

          <h3 className="font-semibold text-foreground mb-2">5. Responsabilidade do Usuário</h3>
          <p className="mb-3">
            O usuário é inteiramente responsável por suas decisões financeiras fora da plataforma. A EduFinance não se responsabiliza por perdas decorrentes de decisões baseadas nos conteúdos apresentados.
          </p>

          <h3 className="font-semibold text-foreground mb-2">6. Privacidade</h3>
          <p>
            Seus dados pessoais são armazenados de forma segura e não são compartilhados com terceiros para fins comerciais.
          </p>
        </ScrollArea>

        <div className="flex items-start gap-3 mt-2">
          <Checkbox
            id="accept-terms"
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
          />
          <label htmlFor="accept-terms" className="text-sm cursor-pointer leading-snug">
            Li e aceito os Termos de Responsabilidade. Entendo que esta plataforma é exclusivamente educacional e que nenhuma operação envolve dinheiro real.
          </label>
        </div>

        <Button onClick={onAccept} disabled={!accepted} className="w-full mt-2">
          Aceitar e Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
