import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import rondeTafelsLogo from "@/assets/ronde-tafels-logo.svg";

export interface Takeaway {
  title: string;
  body: string;
}

export interface Tafelgast {
  photo: string;
  name: string;
  bio: string;
  bookTitle?: string;
  bookUrl?: string;
}

export interface Partner {
  name: string;
  logoUrl?: string; // optional — placeholder-slot leeg indien niet aangeleverd
}

export interface UpcomingSession {
  label: string; // bv. "📅 Ochtendsessie: do 27/8 — 8u tot 10u"
  volzet?: boolean;
}

export interface UpcomingVariantProps {
  variant?: "upcoming";
  editieLabel: string;
  title: string;
  body: React.ReactNode[];
  borderColor: string;
  tafelName: string;
  onSelectTheme?: (theme: string) => void;
  sessions: UpcomingSession[];
  locationLine: React.ReactNode;
  capacityLabel?: React.ReactNode; // vervangt "Max. 6 deelnemers" pill in het praktisch-blok
  partner?: Partner;
  heroImage?: string;
  secondaryImage?: { src: string; alt: string };
  tafelgast?: Tafelgast;
}

export interface PastWhitepaperVariantProps {
  variant: "past-whitepaper";
  editieLabel: string;
  title: string;
  body: React.ReactNode[];
  borderColor: string;
  tafelName: string;
  takeaways: Takeaway[];
  tafelgast: Tafelgast;
  anchorId?: string;
}

export type RondeTafelCardProps = UpcomingVariantProps | PastWhitepaperVariantProps;

const RondeTafelCard = (props: RondeTafelCardProps) => {
  if (props.variant === "past-whitepaper") return <PastWhitepaperCard {...props} />;
  return <UpcomingCard {...props} />;
};

/* ─────────────────────────  UPCOMING (booking)  ───────────────────────── */
const UpcomingCard = ({
  editieLabel,
  title,
  body,
  borderColor,
  onSelectTheme,
  sessions,
  locationLine,
  capacityLabel,
  partner,
  heroImage,
  secondaryImage,
  tafelgast,
}: UpcomingVariantProps) => {
  const allFull = sessions.length > 0 && sessions.every((s) => s.volzet);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelectTheme?.(title);
    document.getElementById("aanmelden")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="bg-card rounded-lg p-6 md:p-10 shadow-sm relative overflow-hidden"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      {/* Hero image + secondary */}
      {heroImage && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={secondaryImage ? "md:col-span-2" : "md:col-span-3"}>
            <img
              src={heroImage}
              alt="Locatie"
              className="w-full h-56 md:h-72 object-cover rounded-md"
            />
          </div>
          {secondaryImage && (
            <img
              src={secondaryImage.src}
              alt={secondaryImage.alt}
              className="w-full h-56 md:h-72 object-cover rounded-md"
            />
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <p className="text-xs font-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {editieLabel}
        </p>
        {partner && (
          <Badge className="bg-accent-pink/10 text-accent-pink border-accent-pink text-[10px] uppercase tracking-wider">
            In samenwerking met {partner.name}
          </Badge>
        )}
        {partner?.logoUrl && (
          <img src={partner.logoUrl} alt={partner.name} className="h-12 md:h-14 w-auto" />
        )}
      </div>

      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-5 pr-24">{title}</h2>

      {body.map((p, i) => (
        <p key={i} className="text-foreground/80 font-body leading-relaxed mb-4">{p}</p>
      ))}

      <div className="bg-muted rounded-md p-5 my-6 space-y-2 text-sm text-foreground">
        {sessions.map((s, i) => (
          <p key={i} className="flex items-center gap-2">
            {s.label}
            {s.volzet && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider border border-red-200">
                Volzet
              </span>
            )}
          </p>
        ))}
        <p>{locationLine}</p>
        {capacityLabel !== undefined ? (
          <p>{capacityLabel}</p>
        ) : (
          <p>👥 Max. 6 deelnemers</p>
        )}
      </div>

      <Button size="lg" onClick={handleClick} disabled={allFull}>
        {allFull ? "Volzet" : "Meld je aan voor deze tafel →"}
      </Button>

      {tafelgast && <TafelgastBlock tafelgast={tafelgast} />}

      {!heroImage && (
        <img src={rondeTafelsLogo} alt="Ronde Tafels" className="absolute top-6 right-6 w-20 h-20 rounded-full shadow-md" />
      )}
    </div>
  );
};

/* ─────────────────────  PAST EDITION + WHITEPAPER  ───────────────────── */
const PastWhitepaperCard = ({
  editieLabel,
  title,
  body,
  borderColor,
  takeaways,
  tafelgast,
  anchorId,
}: PastWhitepaperVariantProps) => (
  <div
    id={anchorId}
    className="bg-card rounded-lg p-6 md:p-10 shadow-sm relative overflow-hidden"
    style={{ borderLeft: `4px solid ${borderColor}` }}
  >
    <div className="flex items-center gap-3 mb-3">
      <p className="text-xs font-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {editieLabel}
      </p>
      <Badge className="bg-muted text-muted-foreground border-border text-[10px] uppercase tracking-wider">
        Afgelopen editie
      </Badge>
    </div>

    <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-5 pr-24">{title}</h2>

    {body.map((p, i) => (
      <p key={i} className="text-foreground/80 font-body leading-relaxed mb-4 whitespace-pre-line">{p}</p>
    ))}

    <div className="mt-8">
      <h3 className="font-heading text-lg md:text-xl font-bold text-foreground mb-4">
        Wat er aan tafel naar boven kwam
      </h3>
      <div className="space-y-4">
        {takeaways.map((t, i) => (
          <div key={i} className="bg-muted rounded-md p-4">
            <p className="font-heading font-semibold text-foreground mb-1">{t.title}</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{t.body}</p>
          </div>
        ))}
      </div>
    </div>

    <WhitepaperForm />

    <TafelgastBlock tafelgast={tafelgast} />

    <img src={rondeTafelsLogo} alt="Ronde Tafels" className="absolute top-6 right-6 w-16 h-16 md:w-20 md:h-20 rounded-full shadow-md opacity-80" />
  </div>
);

/* ─────────────────────────────  Tafelgast  ───────────────────────────── */
const TafelgastBlock = ({ tafelgast }: { tafelgast: Tafelgast }) => (
  <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row gap-5 items-start">
    <img
      src={tafelgast.photo}
      alt={tafelgast.name}
      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-top flex-shrink-0"
    />
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] font-heading font-semibold text-accent-pink mb-1">
        Tafelgast
      </p>
      <h4 className="font-heading text-base md:text-lg font-bold text-foreground mb-2">
        {tafelgast.name}
      </h4>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {tafelgast.bio}
        {tafelgast.bookTitle && tafelgast.bookUrl && (
          <>
            {" "}Auteur van het boek{" "}
            <a
              href={tafelgast.bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              "{tafelgast.bookTitle}"
            </a>
          </>
        )}
      </p>
    </div>
  </div>
);

/* ────────────────────────  Whitepaper download form  ──────────────────── */
const WhitepaperForm = () => {
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
      <div className="mt-8 bg-primary/5 border border-primary/20 rounded-md p-6 text-center">
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
      className="mt-8 relative overflow-hidden rounded-xl p-6 md:p-8 space-y-4 shadow-lg"
      style={{ background: "linear-gradient(135deg, #315eff 0%, #1e3fcc 100%)" }}
    >
      {/* Decoratieve vormen — knipoog naar de whitepaper share image */}
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

/* ───────────────────  Live schaarste-teller (helper)  ────────────────── */
export const useSeatsAvailable = (thema: string, moment: string, capacity = 6) => {
  const [taken, setTaken] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { count } = await supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("thema", thema)
        .eq("moment", moment);
      if (active) setTaken(count ?? 0);
    };
    load();
    const channel = supabase
      .channel(`seats-${thema}-${moment}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        () => load(),
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [thema, moment, capacity]);

  const available = taken === null ? null : Math.max(0, capacity - taken);
  return { available, taken, capacity, loading: taken === null };
};

export default RondeTafelCard;
