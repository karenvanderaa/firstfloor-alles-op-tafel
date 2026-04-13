import { useState } from "react";
import { Button } from "@/components/ui/button";
import RegistrationForm from "./RegistrationForm";

interface RondeTafelCardProps {
  editieLabel: string;
  title: string;
  body: string[];
  borderColor: string;
  tafelName: string;
}

const RondeTafelCard = ({ editieLabel, title, body, borderColor, tafelName }: RondeTafelCardProps) => {
  const [sessie, setSessie] = useState<"ochtend" | "avond">("ochtend");
  const [showForm, setShowForm] = useState(false);

  return (
    <div
      className="bg-card rounded-lg p-8 md:p-10 shadow-sm"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <p className="text-xs font-heading font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
        {editieLabel}
      </p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-5">{title}</h2>
      {body.map((p, i) => (
        <p key={i} className="text-foreground/80 font-body leading-relaxed mb-4">
          {p}
        </p>
      ))}

      {/* Practical info */}
      <div className="bg-muted rounded-md p-5 my-6 space-y-2 text-sm text-foreground">
        <p>📅 Datum: <span className="text-muted-foreground">[DATUM VOLGT]</span></p>
        <p>📍 Locatie: <span className="text-muted-foreground">[LOCATIE VOLGT]</span></p>
        <p>🕐 Duur: 2 uur</p>
        <p>👥 Max. 6 deelnemers</p>
      </div>

      {/* Session toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSessie("ochtend")}
          className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
            sessie === "ochtend"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          Ochtendsessie
        </button>
        <button
          onClick={() => setSessie("avond")}
          className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
            sessie === "avond"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          Avondsessie
        </button>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)} size="lg">
          Schrijf je in voor deze tafel →
        </Button>
      ) : (
        <RegistrationForm tafel={tafelName} defaultSessie={sessie} />
      )}
    </div>
  );
};

export default RondeTafelCard;
