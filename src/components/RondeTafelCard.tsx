import { Button } from "@/components/ui/button";

interface RondeTafelCardProps {
  editieLabel: string;
  title: string;
  body: string[];
  borderColor: string;
  tafelName: string;
  onSelectTheme?: (theme: string) => void;
}

const RondeTafelCard = ({ editieLabel, title, body, borderColor, onSelectTheme }: RondeTafelCardProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelectTheme?.(title);
    const el = document.getElementById("aanmelden");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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

      <div className="bg-muted rounded-md p-5 my-6 space-y-2 text-sm text-foreground">
        <p>📅 Datum: <span className="text-muted-foreground">[DATUM VOLGT]</span></p>
        <p>📍 Locatie: <span className="text-muted-foreground">[LOCATIE VOLGT]</span></p>
        <p>🕐 Duur: 2 uur</p>
        <p>👥 Max. 6 deelnemers</p>
      </div>

      <Button size="lg" onClick={handleClick}>
        Meld je aan voor deze tafel →
      </Button>
    </div>
  );
};

export default RondeTafelCard;
