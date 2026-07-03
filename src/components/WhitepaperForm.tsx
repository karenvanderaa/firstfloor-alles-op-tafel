import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WhitepaperFormProps {
  /** Waar het formulier ingevuld werd — voor latere campagne-attributie */
  source?: string;
}

const WhitepaperForm = ({ source = "homepage" }: WhitepaperFormProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ naam: "", email: "", toestemming: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.toestemming) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("whitepaper_downloads").insert({
        naam: form.naam.trim(),
        email: form.email.trim(),
        toestemming: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(source ? ({ source } as any) : {}),
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Whitepaper submit error:", err);
      toast({
        title: "Er ging iets mis",
        description: "Je aanvraag kon niet verzonden worden. Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-md p-6 text-center">
        <p className="font-heading font-semibold text-foreground mb-1">
          ✅ Bedankt voor je aanvraag.
        </p>
        <p className="text-sm text-foreground/80">
          Je ontvangt de downloadlink voor de whitepaper binnen enkele minuten in je mailbox.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-xl p-6 md:p-8 space-y-4 shadow-lg"
      style={{ background: "linear-gradient(135deg, #315eff 0%, #1e3fcc 100%)" }}
    >
      <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#ffd23f] opacity-90" />
      <div className="pointer-events-none absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-[#ff8fa3] opacity-80" />

      <div className="relative">
        <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffd23f] mb-2">
          📄 Gratis whitepaper
        </span>
        <h4 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">
          Download de whitepaper
        </h4>
        <p className="text-sm text-white/85">
          Laat je gegevens achter, dan sturen we je de whitepaper per e-mail.
        </p>
      </div>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Voornaam & naam"
          value={form.naam}
          onChange={(e) => setForm({ ...form, naam: e.target.value })}
          className="w-full px-3 py-2.5 rounded-md border-0 bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ffd23f]"
        />
        <input
          required
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2.5 rounded-md border-0 bg-white text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ffd23f]"
        />
      </div>
      <label className="relative flex items-start gap-2 text-xs text-white/90 cursor-pointer">
        <input
          type="checkbox"
          checked={form.toestemming}
          onChange={(e) => setForm({ ...form, toestemming: e.target.checked })}
          required
          className="mt-0.5 accent-[#ffd23f]"
        />
        <span>Ik ga akkoord dat First Floor mij mag contacteren.</span>
      </label>
      <Button
        type="submit"
        disabled={loading || !form.toestemming}
        className="relative w-full bg-[#ffd23f] hover:bg-[#ffdd6b] text-[#1a2b7a] font-semibold shadow-md"
      >
        {loading ? "Verzenden…" : "📄 Download de whitepaper"}
      </Button>
    </form>
  );
};

export default WhitepaperForm;
