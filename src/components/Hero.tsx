import heroImage from "@/assets/hero-roundtable.jpg";
import rondeTafelsLogo from "@/assets/ronde-tafels-logo.svg";

const Hero = () => (
  <section className="bg-background py-20 md:py-28">
    <div className="container max-w-5xl mx-auto px-6">
      <div className="mb-10 rounded-2xl overflow-hidden h-[300px] md:h-[420px] relative">
        <img
          src={heroImage}
          alt="Een intiem ronde tafel gesprek bij First Floor"
          className="w-full h-full object-cover object-bottom"
        />
        <img
          src={rondeTafelsLogo}
          alt="Ronde Tafels - Alles op tafel"
          className="absolute bottom-4 right-4 w-20 h-20 md:w-28 md:h-28 drop-shadow-lg"
        />
      </div>
      <p className="text-primary font-heading text-xs font-semibold uppercase tracking-[0.2em] mb-6">
        Ronde Tafels | Mei 2026
      </p>
      <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl mb-6">
        Een open gesprek met de mensen die er écht toe doen.
      </h1>
      <div className="text-foreground/80 text-lg md:text-xl leading-relaxed mb-10 space-y-4">
        <p>De beste gesprekken vinden niet plaats in grote zalen. Ze vinden plaats aan een tafel, met mensen die begrijpen wat jij meemaakt, of net de scherpe buitenstaandersblik meebrengen die je intern mist.</p>
        <p>Wij geloven in de kracht van een klein, goed samengesteld gezelschap. Geen netwerkevent. Geen kennissessie met slides. Twee uur lang een open, eerlijk gesprek met maximaal zes professionals, zorgvuldig geselecteerd op complementariteit en betrokkenheid.</p>
        <p className="font-semibold text-foreground">Dat is onze Ronde Tafel.</p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Pill icon="🕐" text="2 uur" />
        <Pill icon="👥" text="Max. 6 deelnemers" />
        <Pill icon="✅" text="Deelname op uitnodiging" />
      </div>
    </div>
  </section>
);

const Pill = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full text-sm font-body text-foreground shadow-sm border border-border">
    <span>{icon}</span>
    <span>{text}</span>
  </div>
);

export default Hero;
