import karenPhoto from "@/assets/facilitator-karen.png";

const FacilitatorsSection = () => (
  <section id="facilitators" className="py-12 md:py-16 bg-card">
    <div className="container max-w-5xl mx-auto px-6">
      <p className="text-primary font-heading text-xs font-semibold uppercase tracking-[0.2em] mb-3">
        Facilitators
      </p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
        Karen aan tafel, telkens met een expert tafelgast
      </h2>
      <p className="text-foreground/80 font-body leading-relaxed max-w-3xl">
        Elke Ronde Tafel wordt geleid door Karen. Per editie schuift een tafelgast mee aan, een expert met een scherpe invalshoek op het thema. Zo blijft elke tafel actueel, en de dialoog nooit voorspelbaar.
      </p>
      <div className="mt-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          <img
            src={karenPhoto}
            alt="Karen Van der Aa"
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover object-top flex-shrink-0"
          />
          <div>
            <h3 className="font-heading text-lg font-bold text-foreground mb-2">
              Karen Van der Aa
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              Met 20 jaar ervaring in HR, bedrijfsvoering en psychotherapie ziet Karen wat er écht speelt achter structuren en plannen. Ze kijkt niet alleen naar rollen of processen, maar naar gedrag dat prestaties aanstuurt. In 2018 richtte ze{" "}
              <a href="https://firstfloortalent.be/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">First Floor</a>
              {" "}op. Vandaag is ze een strategische partner voor CEO's en leiders die hun organisatie willen laten werken in de praktijk. Auteur van het boek{" "}
              <a href="https://degeneratieconfrontatie.be/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline transition-colors">
                "De generatieconfrontatie"
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FacilitatorsSection;
