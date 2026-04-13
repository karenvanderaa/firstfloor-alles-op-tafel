import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RegistrationFormProps {
  tafel: string;
  defaultSessie: "ochtend" | "avond";
}

const RegistrationForm = ({ tafel, defaultSessie }: RegistrationFormProps) => {
  const [form, setForm] = useState({
    voornaam: "",
    achternaam: "",
    bedrijf: "",
    functie: "",
    email: "",
    sessie: defaultSessie,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const listTag = tafel === "AI in HR" ? "ronde-tafel-ai-hr" : "ronde-tafel-verandering";

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
              FIRSTNAME: form.voornaam,
              LASTNAME: form.achternaam,
              COMPANY: form.bedrijf,
              FUNCTION: form.functie,
              SESSIE: form.sessie,
              TAFEL: tafel,
            },
            listIds: [],
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
      <div className="mt-6 p-6 bg-background rounded-lg text-foreground">
        <p className="text-lg font-heading font-semibold">
          ✅ Bedankt voor je aanmelding. We nemen zo snel mogelijk contact met je op.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-6 bg-background rounded-lg space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Voornaam" name="voornaam" value={form.voornaam} onChange={handleChange} required />
        <Field label="Achternaam" name="achternaam" value={form.achternaam} onChange={handleChange} required />
      </div>
      <Field label="Bedrijf" name="bedrijf" value={form.bedrijf} onChange={handleChange} required />
      <Field label="Functie" name="functie" value={form.functie} onChange={handleChange} required />
      <Field label="E-mailadres" name="email" type="email" value={form.email} onChange={handleChange} required />

      <fieldset className="space-y-2">
        <legend className="text-sm font-body font-medium text-foreground">Voorkeur moment <span className="text-destructive">*</span></legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="sessie"
              value="ochtend"
              checked={form.sessie === "ochtend"}
              onChange={handleChange}
              className="accent-primary"
            />
            Ochtendsessie (8u - 10u)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="sessie"
              value="avond"
              checked={form.sessie === "avond"}
              onChange={handleChange}
              className="accent-primary"
            />
            Avondsessie (16u - 18u)
          </label>
        </div>
      </fieldset>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Verzenden…" : "Stuur mijn aanmelding"}
      </Button>

      <p className="text-xs text-muted-foreground">
        We bekijken elke aanmelding zorgvuldig. Je ontvangt van ons een bevestiging zodra je plaats is gereserveerd.
      </p>
    </form>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={name} className="block text-sm font-body font-medium text-foreground mb-1">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 rounded-md border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

export default RegistrationForm;
