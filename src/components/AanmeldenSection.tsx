import { useState, useEffect } from "react";
import rondeTafelsLogo from "@/assets/ronde-tafels-logo.svg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Theme =
  | "Verandering staat op de agenda. Draagvlak niet."
  | "Generaties: geen probleem maar een welkom signaal";

interface AanmeldenSectionProps {
  preselectedTheme?: Theme;
}

const AanmeldenSection = ({ preselectedTheme }: AanmeldenSectionProps) => {
  const scrollToAI = () => {
    const el = document.getElementById("tafel-ai-in-hr");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (window.location.hash === "#tafel-ai-in-hr") {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.hash = "#tafel-ai-in-hr";
    }
  };

  const scrollToVerandering = () => {
    const el = document.getElementById("tafel-verandering");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (window.location.hash === "#tafel-verandering") {
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    } else {
      window.location.hash = "#tafel-verandering";
    }
  };


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
            <div>
              <p className="font-semibold mb-1">AI in HR: wat betekent dat nu écht?</p>
              <p>
                📄 <button onClick={scrollToAI} className="text-primary hover:underline">Bekijk de whitepaper bij de afgelopen editie.</button>
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Verandering staat op de agenda. Draagvlak niet.</p>
              <p className="text-muted-foreground">Deze editie (27/8) is afgelopen — de whitepaper volgt binnenkort.</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Successie: continuïteit vraagt meer dan een opvolger</p>
              <p>📅 Ochtendsessie: ma 21/9 — 8u tot 10u</p>
              <p>📍 Pelckmans Uitgevers, Mechelsesteenweg 271, 2018 Antwerpen (WATT-toren)</p>
            </div>
            <p>🥂 Snacks en drankjes voorzien</p>
          </div>
        </div>

        {/* 3C — Formulier */}
        <RegistrationFormFull preselectedTheme={preselectedTheme} onSelectAI={scrollToAI} />

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
const RegistrationFormFull = ({
  preselectedTheme,
  onSelectAI,
}: {
  preselectedTheme?: Theme;
  onSelectAI: () => void;
}) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    voornaam: "",
    bedrijf: "",
    functie: "",
    email: "",
    telefoon: "",
    thema: (preselectedTheme || "") as string,
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
    try {
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
      if (dbError) throw dbError;
      setSubmitted(true);
    } catch (err) {
      console.error("Registration error:", err);
      toast({
        title: "Inschrijving niet opgeslagen",
        description: "Je aanvraag kon niet bewaard worden. Probeer het later opnieuw of neem contact op via karen@firstfloortalent.be.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-8 space-y-4">
        <p className="text-lg font-heading font-semibold text-foreground text-center">
          ✅ Bedankt voor je aanvraag. We laten je snel weten of deze ronde tafel de juiste match is.
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Je ontvangt binnen enkele minuten een bevestiging in je mailbox.
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

      {/* AI teaser — geen formulier-optie meer, verwijst naar whitepaper-kaart */}
      <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 text-sm">
          <p className="font-semibold text-foreground mb-0.5">Zoek je "AI in HR"?</p>
          <p className="text-foreground/70">Deze editie is afgelopen. Download de whitepaper met de belangrijkste inzichten.</p>
        </div>
        <Button type="button" variant="outline" onClick={onSelectAI} className="border-primary text-primary hover:bg-primary/10">
          Bekijk de whitepaper →
        </Button>
      </div>

      {/* Thema */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-body font-medium text-foreground">Voor welk thema? *</legend>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="thema"
            value="Generaties: geen probleem maar een welkom signaal"
            checked={form.thema === "Generaties: geen probleem maar een welkom signaal"}
            onChange={handleChange}
            className="accent-[#315eff]"
            required
          />
          Successie: continuïteit vraagt meer dan een opvolger
        </label>
      </fieldset>



      {form.thema.includes("Generaties") && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-body font-medium text-foreground">Voorkeur moment *</legend>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="moment"
                value="Ochtendsessie — ma 21/9 (8u - 10u)"
                checked={form.moment === "Ochtendsessie — ma 21/9 (8u - 10u)"}
                onChange={handleChange}
                className="accent-[#315eff]"
                required
              />
              Ochtendsessie — ma 21/9 (8u - 10u)
            </label>
          </div>
        </fieldset>
      )}

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
      const { error: dbError } = await supabase.from("subscribers").insert({
        email: form.email,
        voornaam: voornaam || null,
        achternaam: achternaam || null,
      });
      if (dbError && !dbError.message.toLowerCase().includes("duplicate")) {
        throw dbError;
      }
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
