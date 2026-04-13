import heroImage from "@/assets/hero-roundtable.jpg";

const Hero = () => (
  <section className="bg-background py-20 md:py-28">
    <div className="container max-w-5xl mx-auto px-6">
      <div className="mb-10 rounded-2xl overflow-hidden max-h-[420px]">
        <img
          src={heroImage}
          alt="Een intiem ronde tafel gesprek bij First Floor"
          className="w-full h-full object-cover object-bottom"
        />
      </div>
      <p className="text-primary font-heading text-xs font-semibold uppercase tracking-[0.2em] mb-6">
        Ronde Tafels — Mei 2026
      </p>
      <h1 className="font-heading text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl mb-6">
        Een open gesprek met de mensen die er écht toe doen.
      </h1>
      <p className="text-foreground/80 text-lg md:text-xl leading-relaxed max-w-2xl mb-10">
        Twee keer per jaar brengt First Floor een kleine groep bedrijfsleiders en
        HR-eindverantwoordelijken samen. Geen grote zaal. Geen PowerPoint. Twee uur lang
        een eerlijk, scherp gesprek over wat vandaag écht speelt in organisaties.
      </p>
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
