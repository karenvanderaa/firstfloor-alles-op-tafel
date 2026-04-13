import aboutPhoto from "@/assets/photo-about.jpg";

const AboutSection = () => (
  <section className="bg-primary py-20">
    <div className="container max-w-5xl mx-auto px-6">
      <div className="flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-1">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-6">
            Over First Floor
          </h2>
          <p className="text-primary-foreground/90 font-body text-lg leading-relaxed">
            First Floor is een strategische partner voor bedrijfsleiders en HR-eindverantwoordelijken
            die hun organisatie van binnenuit willen versterken. Geen klassieke HR-dienstverlener.
            Geen quick-fix coaching. Wij helpen leiders structuur geven aan wat onderhuids al beweegt
            — en blijven tot en met de implementatie.
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
