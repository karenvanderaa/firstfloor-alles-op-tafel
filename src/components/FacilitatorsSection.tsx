import karenPhoto from "@/assets/facilitator-karen.png";
import ellenPhoto from "@/assets/facilitator-ellen.jpeg";

const facilitators = [
  {
    name: "Karen Van der Aa",
    photo: karenPhoto,
    bio: "Met 20 jaar ervaring in HR, bedrijfsvoering en psychotherapie ziet Karen wat er écht speelt achter structuren en plannen. Ze kijkt niet alleen naar rollen of processen, maar naar gedrag dat prestaties aanstuurt. In 2018 richtte ze First Floor op. Vandaag is ze een strategische partner voor CEO's en leiders die hun organisatie willen laten werken in de praktijk.",
    bookTitle: "De generatieconfrontatie",
    bookUrl: "https://degeneratieconfrontatie.be/",
  },
  {
    name: "Ellen Poppe",
    photo: ellenPhoto,
    bio: "Met meer dan 10 jaar ervaring in digitale transformatie en organisatieverandering brengt Ellen de brug tussen strategie en technologie. Ze leidde ERP-implementaties, bouwde AI-gedreven HR-platformen en stuurde digitale trajecten in België, Nederland en Marokko. Haar focus: verandering laten landen. Via adoptie, samenwerking en concrete toepassingen.",
  },
];

const FacilitatorsSection = () => (
  <section id="facilitators" className="py-16 md:py-24 bg-card">
    <div className="container max-w-5xl mx-auto px-6">
      <p className="text-primary font-heading text-xs font-semibold uppercase tracking-[0.2em] mb-3">
        Facilitators
      </p>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
        Begeleid door facilitators die zelf in de praktijk staan
      </h2>
      <div className="mt-10 space-y-10">
        {facilitators.map((f) => (
          <div
            key={f.name}
            className="flex flex-col md:flex-row gap-6 md:gap-10 items-start"
          >
            <img
              src={f.photo}
              alt={f.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover object-top flex-shrink-0"
            />
            <div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                {f.name}
              </h3>
              <p className="text-foreground/80 leading-relaxed">
                {f.bio.split("First Floor").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <a href="https://firstfloortalent.be/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">First Floor</a>
                    )}
                  </span>
                ))}
                {f.bookTitle && (
                  <>
                    {" "}Auteur van het boek{" "}
                    <a
                      href={f.bookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline hover:text-primary/80 transition-colors"
                    >
                      "{f.bookTitle}"
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FacilitatorsSection;
