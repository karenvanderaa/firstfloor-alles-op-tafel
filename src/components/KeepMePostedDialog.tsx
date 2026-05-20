import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "keepPostedDismissedAt";
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const AUTO_DELAY_MS = 15_000;

export const OPEN_KEEP_POSTED_EVENT = "open-keep-posted";

export const openKeepPostedDialog = () => {
  window.dispatchEvent(new CustomEvent(OPEN_KEEP_POSTED_EVENT));
};

const canAutoShow = () => {
  try {
    const last = localStorage.getItem(STORAGE_KEY);
    if (!last) return true;
    return Date.now() - Number(last) > COOLDOWN_MS;
  } catch {
    return true;
  }
};

const markDismissed = () => {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
};

const KeepMePostedDialog = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ naam: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Listen for manual triggers (navbar button etc.) — bypasses cooldown
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_KEEP_POSTED_EVENT, handler);
    return () => window.removeEventListener(OPEN_KEEP_POSTED_EVENT, handler);
  }, []);

  // Auto-trigger: timer + exit-intent (only if cooldown passed)
  useEffect(() => {
    if (!canAutoShow()) return;
    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setOpen(true);
      cleanup();
    };

    const timer = window.setTimeout(trigger, AUTO_DELAY_MS);

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener("mouseleave", onMouseLeave);

    function cleanup() {
      window.clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
    }

    return cleanup;
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && !submitted) markDismissed();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const voornaam = form.naam.split(" ")[0];
    const achternaam = form.naam.split(" ").slice(1).join(" ");

    try {
      // Save to Lovable Cloud — DB trigger handles Brevo sync server-side
      const { error: dbError } = await supabase.from("subscribers").insert({
        email: form.email,
        voornaam: voornaam || null,
        achternaam: achternaam || null,
      });
      if (dbError && !dbError.message.toLowerCase().includes("duplicate")) {
        throw dbError;
      }

      setSubmitted(true);
      markDismissed();
    } catch (err) {
      console.error("Keep me posted error:", err);
      toast({
        title: "Er ging iets mis",
        description: "Je aanmelding kon niet verzonden worden. Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Kan je er niet bij zijn? Niet het juiste thema?
          </DialogTitle>
          <DialogDescription className="font-body text-sm leading-relaxed pt-1">
            Blijf op de hoogte van de tafels en ontvang als eerste de key insights van elke editie.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <p className="text-foreground font-heading font-semibold text-center py-4">
            ✅ Goed zo. We houden je op de hoogte na elke editie.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="kp-naam" className="block text-sm font-body font-medium text-foreground mb-1">
                Voornaam & naam *
              </label>
              <input
                id="kp-naam"
                type="text"
                required
                value={form.naam}
                onChange={(e) => setForm({ ...form, naam: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="kp-email" className="block text-sm font-body font-medium text-foreground mb-1">
                E-mail *
              </label>
              <input
                id="kp-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#315eff] hover:bg-[#315eff]/90 text-white"
            >
              {loading ? "Verzenden…" : "Houd me op de hoogte"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default KeepMePostedDialog;
