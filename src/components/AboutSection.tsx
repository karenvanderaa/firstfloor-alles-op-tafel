import aboutPhoto from "@/assets/photo-about.jpg";

const AboutSection = () => (
  <section id="over" className="bg-primary py-20">
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
            <a href="https://firstfloortalent.be/" target="_blank" rel="noopener noreferrer" className="hover:underline">First Floor</a> begeleidt bedrijfsleiders en HR-eindverantwoordelijken bij de vraagstukken die je niet oplost met een rapport of een training. We helpen structuur geven aan wat onderhuids al speelt en blijven tot en met de implementatie.
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
