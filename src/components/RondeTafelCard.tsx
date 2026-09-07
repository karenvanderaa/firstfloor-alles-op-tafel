import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import WhitepaperForm from "@/components/WhitepaperForm";
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
  takeaways?: Takeaway[];
  tafelgast?: Tafelgast;
  anchorId?: string;
  whitepaperPending?: boolean;
  whitepaperKey?: "ai-in-hr" | "change-adoption";
  whitepaperTitle?: string;
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
  whitepaperPending,
  whitepaperKey,
  whitepaperTitle,
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

    {takeaways && takeaways.length > 0 && (
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
    )}

    <div className="mt-8">
      {whitepaperPending ? (
        <div className="rounded-md border border-dashed border-border bg-muted/50 p-5">
          <p className="font-heading font-semibold text-foreground mb-1">Whitepaper volgt binnenkort</p>
          <p className="text-sm text-muted-foreground">
            We bundelen de inzichten van deze editie. De whitepaper verschijnt hier zodra ze klaar is.
          </p>
        </div>
      ) : (
        <WhitepaperForm
          whitepaper={whitepaperKey}
          title={whitepaperTitle}
          source={anchorId || "homepage"}
        />
      )}
    </div>

    {tafelgast && <TafelgastBlock tafelgast={tafelgast} />}

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

/* Whitepaper-form is nu een eigenstandige component (src/components/WhitepaperForm.tsx) */



/* ───────────────────  Live schaarste-teller (helper)  ────────────────── */
export const useSeatsAvailable = (thema: string, moment: string, capacity = 6) => {
  const [taken, setTaken] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data, error } = await supabase.rpc("get_seats_taken", {
        _thema: thema,
        _moment: moment,
      });
      if (!active) return;
      if (error) {
        console.error("get_seats_taken error:", error);
        return;
      }
      setTaken(typeof data === "number" ? data : 0);
    };

    load();

    // Realtime: werkt enkel als de bezoeker SELECT-rechten heeft.
    // Voor anonieme bezoekers vangen we dat op met polling + visibility refresh.
    const channel = supabase
      .channel(`seats-${thema}-${moment}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        () => load(),
      )
      .subscribe();

    const interval = window.setInterval(load, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      supabase.removeChannel(channel);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [thema, moment, capacity]);

  const available = taken === null ? null : Math.max(0, capacity - taken);
  return { available, taken, capacity, loading: taken === null };
};

export default RondeTafelCard;
