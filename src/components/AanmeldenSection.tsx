import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
            Erbij zijn?
          </h2>
          <p className="text-foreground/80 font-body leading-relaxed max-w-3xl mb-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground">
            <p>📍 <a href="https://firstfloortalent.be/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">First Floor</a>, Prins Boudewijnlaan 24C, 2550 Kontich</p>
            <p>🕐 ± 2 uur</p>
            <p>🗓 Ochtendsessie &amp; avondsessie per thema</p>
            <p>📅 Datum: <span className="text-muted-foreground">[DATUM VOLGT]</span></p>
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const listTag = form.thema.includes("AI") ? "ronde-tafel-ai-hr" : "ronde-tafel-verandering";

    try {
      const apiKey = import.meta.env.VITE_BREVO_API_KEY;
      if (apiKey) {
        await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify({
            email: form.email,
            attributes: {
              FIRSTNAME: form.voornaam.split(" ")[0],
              LASTNAME: form.voornaam.split(" ").slice(1).join(" "),
              COMPANY: form.bedrijf,
              FUNCTION: form.functie,
              PHONE: form.telefoon,
              SESSIE: form.moment,
              TAFEL: form.thema,
              TOELICHTING: form.toelichting,
            },
            listIds: [61],
            updateEnabled: true,
            ext_id: listTag,
          }),
        });
      }
    } catch {
      // silently handle
    }

    setLoading(false);
    setSubmitted(true);
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
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="moment" value="Ochtendsessie" checked={form.moment === "Ochtendsessie"} onChange={handleChange} className="accent-[#315eff]" required />
            Ochtendsessie
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="radio" name="moment" value="Avondsessie" checked={form.moment === "Avondsessie"} onChange={handleChange} className="accent-[#315eff]" />
            Avondsessie
          </label>
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

    try {
      const apiKey = import.meta.env.VITE_BREVO_API_KEY;
      if (apiKey) {
        await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": apiKey },
          body: JSON.stringify({
            email: form.email,
            attributes: {
              FIRSTNAME: form.naam.split(" ")[0],
              LASTNAME: form.naam.split(" ").slice(1).join(" "),
            },
            listIds: [60],
            updateEnabled: true,
            ext_id: "ronde-tafel-updates",
          }),
        });
      }
    } catch {
      // silently handle
    }

    setLoading(false);
    setSubmitted(true);
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
