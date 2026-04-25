import { useState, useEffect } from "react";
import rondeTafelsLogo from "@/assets/ronde-tafels-logo.svg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Theme = "AI in HR: wat betekent dat nu écht?" | "Verandering staat op de agenda. Draagvlak niet.";

interface AanmeldenSectionProps {
  preselectedTheme?: Theme;
}

const AanmeldenSection = ({ preselectedTheme }: AanmeldenSectionProps) => {
  return (
    <section id="aanmelden" className="bg-secondary py-12 md:py-16">
      <div className="container max-w-5xl mx-auto px-6 space-y-12">
        {/* 3A — Intro */}
        <div>
          <p className="text-[#315eff] font-heading text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Aanmelden
          </p>
          <div className="flex items-center gap-3 mb-4">
            <img src={rondeTafelsLogo} alt="" className="w-12 h-12" aria-hidden="true" />
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Erbij zijn?
            </h2>
          </div>
          <p className="text-foreground/80 font-body leading-relaxed mb-6">
            We werken met een kleine, zorgvuldig samengestelde groep. Geen open inschrijving: we kijken naar je rol, je sector en de relevantie van het thema voor jouw organisatie. Zo blijft het gesprek scherp en waardevol.
          </p>
          <div className="flex flex-wrap gap-3">
            <InfoPill text="4–6 deelnemers" />
            <InfoPill text="Deelname op uitnodiging" />
            <InfoPill text="Persoonlijk bevestigd" />
          </div>
        </div>

        {/* 3B — Praktisch */}
        <div className="bg-card rounded-xl p-6 md:p-8">
          <div className="space-y-4 text-sm text-foreground">
            <p>📍 <a href="https://firstfloortalent.be/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">First Floor</a>, Prins Boudewijnlaan 24C, 2550 Kontich</p>
            <div>
              <p className="font-semibold mb-1">AI in HR: wat betekent dat nu écht?</p>
              <p>📅 Avondsessie: don 28/5 — 16u tot 18u</p>
              <p>📅 Ochtendsessie: vrij 29/5 — 8u tot 10u</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Verandering staat op de agenda. Draagvlak niet.</p>
              <p>📅 Avondsessie: di 9/6 — 16u tot 18u</p>
              <p>📅 Ochtendsessie: do 18/6 — 8u tot 10u</p>
            </div>
            <p>🥂 Snacks en drankjes voorzien</p>
          </div>
        </div>

        {/* 3C — Formulier */}
        <RegistrationFormFull preselectedTheme={preselectedTheme} />

        {/* 3D — Secundaire CTA */}
        <KeepMePosted />
      </div>
    </section>
  );
};

const InfoPill = ({ text }: { text: string }) => (
  <span className="bg-card px-4 py-2 rounded-full text-sm font-body text-foreground shadow-sm border border-border">
    {text}
  </span>
);

/* ── 3C: Main registration form ── */
const RegistrationFormFull = ({ preselectedTheme }: { preselectedTheme?: Theme }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    voornaam: "",
    bedrijf: "",
    functie: "",
    email: "",
    telefoon: "",
    thema: preselectedTheme || "" as string,
    moment: "" as string,
    toelichting: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preselectedTheme) {
      setForm((f) => ({ ...f, thema: preselectedTheme }));
    }
  }, [preselectedTheme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "thema") {
      setForm({ ...form, thema: value, moment: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const listTag = form.thema.includes("AI") ? "ronde-tafel-ai-hr" : "ronde-tafel-verandering";

    try {
      // Save to Lovable Cloud (admin dashboard)
      const { error: dbError } = await supabase.from("registrations").insert({
        voornaam: form.voornaam,
        bedrijf: form.bedrijf,
        functie: form.functie,
        email: form.email,
        telefoon: form.telefoon || null,
        thema: form.thema,
        moment: form.moment,
        toelichting: form.toelichting || null,
      });
      if (dbError) console.error("DB save error:", dbError);

      const brevoAttributes: Record<string, unknown> = {
        FIRSTNAME: form.voornaam.split(" ")[0],
        LASTNAME: form.voornaam.split(" ").slice(1).join(" "),
        BEDRIJF: form.bedrijf,
        JOB_TITLE: form.functie,
      };
      if (form.telefoon) {
        brevoAttributes.SMS = form.telefoon;
        brevoAttributes.WHATSAPP = form.telefoon;
      }

      // Pass thema/moment/toelichting along — the edge function decides what Brevo accepts.
      // Dashboard already has the canonical copy, so any Brevo loss is non-fatal.
      const { data, error } = await supabase.functions.invoke("brevo-contact", {
        body: {
          email: form.email,
          attributes: brevoAttributes,
          listIds: [61],
          updateEnabled: true,
          ext_id: listTag,
          sendConfirmation: true,
          confirmation: { thema: form.thema, moment: form.moment },
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Registration error:", err);
      toast({
        title: "Er ging iets mis",
        description: "Je aanvraag kon niet verzonden worden. Probeer het later opnieuw of neem contact op.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-8 text-center">
        <p className="text-lg font-heading font-semibold text-foreground">
          ✅ Bedankt voor je aanvraag. We laten je snel weten of deze ronde tafel de juiste match is.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-sm p-6 md:p-8 space-y-5">
      <h3 className="font-heading text-xl font-bold text-foreground">Vraag je deelname aan</h3>
      <p className="text-sm text-muted-foreground">
        Laat je gegevens achter. We nemen persoonlijk contact op om te bevestigen of deze ronde tafel voor jou de juiste match is.
      </p>

      <Field label="Voornaam & naam" name="voornaam" value={form.voornaam} onChange={handleChange} required />
      <Field label="Bedrijf" name="bedrijf" value={form.bedrijf} onChange={handleChange} required />
      <Field label="Functie" name="functie" value={form.functie} onChange={handleChange} required placeholder="bv. HR Director, CEO, Talent Lead…" />
      <Field label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} required />
      <Field label="Telefoonnummer" name="telefoon" value={form.telefoon} onChange={handleChange} helperText="Voor snelle afstemming indien nodig" />

      {/* Thema */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-body font-medium text-foreground">Voor welk thema? *</legend>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" name="thema" value="AI in HR: wat betekent dat nu écht?" checked={form.thema === "AI in HR: wat betekent dat nu écht?"} onChange={handleChange} className="accent-[#315eff]" required />
          AI in HR: wat betekent dat nu écht?
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" name="thema" value="Verandering staat op de agenda. Draagvlak niet." checked={form.thema === "Verandering staat op de agenda. Draagvlak niet."} onChange={handleChange} className="accent-[#315eff]" />
          Verandering staat op de agenda. Draagvlak niet.
        </label>
      </fieldset>

      {/* Moment */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-body font-medium text-foreground">Voorkeur moment *</legend>
        <div className="flex flex-col gap-2">
          {form.thema.includes("AI") ? (
            <>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="moment" value="Avondsessie — don 28/5 (16u - 18u)" checked={form.moment === "Avondsessie — don 28/5 (16u - 18u)"} onChange={handleChange} className="accent-[#315eff]" required />
                Avondsessie — don 28/5 (16u - 18u)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="moment" value="Ochtendsessie — vrij 29/5 (8u - 10u)" checked={form.moment === "Ochtendsessie — vrij 29/5 (8u - 10u)"} onChange={handleChange} className="accent-[#315eff]" />
                Ochtendsessie — vrij 29/5 (8u - 10u)
              </label>
            </>
          ) : form.thema.includes("Verandering") ? (
            <>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="moment" value="Avondsessie — di 9/6 (16u - 18u)" checked={form.moment === "Avondsessie — di 9/6 (16u - 18u)"} onChange={handleChange} className="accent-[#315eff]" required />
                 Avondsessie — di 9/6 (16u - 18u)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="moment" value="Ochtendsessie — do 18/6 (8u - 10u)" checked={form.moment === "Ochtendsessie — do 18/6 (8u - 10u)"} onChange={handleChange} className="accent-[#315eff]" />
                 Ochtendsessie — do 18/6 (8u - 10u)
              </label>
            </>
          ) : (
            <>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="moment" value="Avondsessie" checked={form.moment === "Avondsessie"} onChange={handleChange} className="accent-[#315eff]" required />
                Avondsessie (16u - 18u)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="moment" value="Ochtendsessie" checked={form.moment === "Ochtendsessie"} onChange={handleChange} className="accent-[#315eff]" />
                Ochtendsessie (8u - 10u)
              </label>
            </>
          )}
        </div>
      </fieldset>

      {/* Toelichting */}
      <div>
        <label htmlFor="toelichting" className="block text-sm font-body font-medium text-foreground mb-1">
          Korte toelichting
        </label>
        <textarea
          id="toelichting"
          name="toelichting"
          value={form.toelichting}
          onChange={handleChange}
          placeholder="Wat speelt er vandaag binnen jouw organisatie rond dit thema?"
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-[#315eff] hover:bg-[#315eff]/90 text-white">
        {loading ? "Verzenden…" : "Stuur mijn aanvraag"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Je inschrijving is geen automatische bevestiging. We laten je persoonlijk weten of deze ronde tafel de juiste match is.
      </p>

      <div className="text-center pt-2">
        <a
          href="https://calendly.com/karenvda/letstalk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#315eff] hover:underline font-body"
        >
          Twijfel je of dit relevant is voor jouw situatie? Plan een korte call, 15 min. →
        </a>
      </div>
    </form>
  );
};

/* ── Field helper ── */
const Field = ({
  label, name, value, onChange, type = "text", required, placeholder, helperText,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; required?: boolean; placeholder?: string; helperText?: string;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-body font-medium text-foreground mb-1">
      {label} {required && "*"}
    </label>
    <input
      id={name} name={name} type={type} value={value} onChange={onChange} required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
    {helperText && <p className="text-xs text-muted-foreground mt-1">{helperText}</p>}
  </div>
);

/* ── 3D: Keep me posted ── */
const KeepMePosted = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ naam: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const voornaam = form.naam.split(" ")[0];
    const achternaam = form.naam.split(" ").slice(1).join(" ");

    try {
      // Save to Lovable Cloud
      const { error: dbError } = await supabase.from("subscribers").insert({
        email: form.email,
        voornaam: voornaam || null,
        achternaam: achternaam || null,
      });
      // Ignore unique-violation (already subscribed) — still send to Brevo
      if (dbError && !dbError.message.toLowerCase().includes("duplicate")) {
        console.error("DB subscribe error:", dbError);
      }

      const { data, error } = await supabase.functions.invoke("brevo-contact", {
        body: {
          email: form.email,
          attributes: { FIRSTNAME: voornaam, LASTNAME: achternaam },
          listIds: [60],
          updateEnabled: true,
          ext_id: "ronde-tafel-updates",
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSubmitted(true);
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
    <div className="bg-card rounded-xl shadow-sm p-6 md:p-8 max-w-[600px] mx-auto text-center">
      <h3 className="font-heading text-xl font-bold text-foreground mb-3">Kan je er niet bij zijn?</h3>
      <p className="text-foreground/80 font-body text-sm leading-relaxed mb-5">
        Maar wil je wel mee zijn met wat er aan tafel leeft? Meld je aan en ontvang na de editie een kort verslag met de belangrijkste inzichten en gesprekken.
      </p>

      {submitted ? (
        <p className="text-foreground font-heading font-semibold">
          ✅ Goed zo. We houden je op de hoogte na elke editie.
        </p>
      ) : !open ? (
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="border-[#315eff] text-[#315eff] hover:bg-[#315eff]/5"
        >
          Houd me op de hoogte
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <Field label="Voornaam & naam" name="naam" value={form.naam} onChange={handleChange} required />
          <Field label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Button type="submit" disabled={loading} className="w-full bg-[#315eff] hover:bg-[#315eff]/90 text-white">
            {loading ? "Verzenden…" : "Meld me aan"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default AanmeldenSection;
