import aboutPhoto from "@/assets/photo-about.jpg";

const AboutSection = () => (
  <section id="over" className="bg-primary py-12 md:py-16">
    <div className="container max-w-5xl mx-auto px-6">
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-6">
            Over <a href="https://firstfloortalent.be/" target="_blank" rel="noopener noreferrer" className="hover:underline">First Floor</a>
          </h2>
          <p className="text-primary-foreground/90 font-body text-lg leading-relaxed mb-4">
            De Ronde Tafels zijn een verlengstuk van hoe wij werken: eerlijk, scherp en dicht op wat er écht beweegt in organisaties. Echte gesprekken tussen mensen die elkaar in de ogen kijken: "been there, felt that".
          </p>
          <p className="text-primary-foreground/90 font-body text-lg leading-relaxed mb-4">
            Organisaties versterken doe je niet op papier, maar in de praktijk. Daarom vertrekt <a href="https://firstfloortalent.be/" target="_blank" rel="noopener noreferrer" className="hover:underline">First Floor</a> altijd vanuit het interne fundament: bedrijfsstrategie, prioriteiten, gedrag, verantwoordelijkheden, en de juiste tools en processen.
          </p>
          <p className="text-primary-foreground/90 font-body text-lg leading-relaxed mb-4">
            We werken als change-partner van vooruitstrevende bedrijven binnen het domein van people & organisation. Dat betekent: diepgaand analyseren, meeschrijven aan de toekomst en pas stoppen wanneer alles geïntegreerd is in de dagelijkse werking. Zooming out om de juiste oplossing voor de juiste uitdagingen te bouwen.
          </p>
          <p className="text-primary-foreground/90 font-body text-lg leading-relaxed">
            Vanaf 2026 kiezen we bewust voor een nog exclusiever formaat: maximaal zes deelnemers per tafel. Omdat de beste inzichten ontstaan wanneer iedereen écht aan het woord komt.
          </p>
        </div>
        <div className="w-full md:w-[320px] flex-shrink-0 rounded-xl overflow-hidden">
          <img
            src={aboutPhoto}
            alt="Geanimeerd gesprek tijdens een First Floor sessie"
            className="w-full h-[280px] object-cover"
          />
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
