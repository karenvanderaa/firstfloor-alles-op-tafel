import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RondeTafelCard, { useSeatsAvailable } from "@/components/RondeTafelCard";
import FacilitatorsSection from "@/components/FacilitatorsSection";
import PhotoSlider from "@/components/PhotoSlider";
import AboutSection from "@/components/AboutSection";
import AanmeldenSection from "@/components/AanmeldenSection";
import Footer from "@/components/Footer";
import KeepMePostedDialog from "@/components/KeepMePostedDialog";
import ellenPhoto from "@/assets/facilitator-ellen.jpeg";
import ankeAsset from "@/assets/tafelgast-anke.png.asset.json";
import saskiaAsset from "@/assets/tafelgast-saskia.jpg.asset.json";
import pelckmansLocatieAsset from "@/assets/pelckmans-locatie.jpeg.asset.json";
import pelckmansBoekenAsset from "@/assets/pelckmans-boeken.jpeg.asset.json";
import pelckmansLogoAsset from "@/assets/pelckmans-logo.png.asset.json";


type Theme =
  | "Verandering staat op de agenda. Draagvlak niet."
  | "Generaties: geen probleem maar een welkom signaal";

const VERANDERING_THEMA = "Verandering staat op de agenda. Draagvlak niet.";
const VERANDERING_MOMENT = "Ochtendsessie — do 27/8 (8u - 10u)";

const GENERATIES_THEMA = "Generaties: geen probleem maar een welkom signaal";
const GENERATIES_MOMENT = "Ochtendsessie — ma 21/9 (8u - 10u)";

const tafel1Body = [
  "AI zit plots overal in het gesprek. Maar in veel organisaties blijft de vraag dezelfde: wat verandert er nu echt, en wat niet?",
  "HR voelt dat er iets beweegt. Rollen verschuiven, verwachtingen veranderen en de druk om \"iets met AI te doen\" neemt toe. Tegelijk is er veel onduidelijkheid. Waar kan AI vandaag echt waarde toevoegen? Wat vraagt nog altijd menselijke inschatting? En hoe zorg je ervoor dat technologie werk slimmer maakt, zonder extra ruis, weerstand of versnippering te creëren?",
  "Tijdens deze ronde tafel gaan we daar eerlijk over in gesprek.",
];

const tafel2Body: React.ReactNode[] = [
  "In veel organisaties volgen veranderingen elkaar snel op. Nieuwe prioriteiten, nieuwe structuren, nieuwe verwachtingen. Op papier klopt het vaak. Maar in de praktijk blijft de beweging uit. Teams haken af, leidinggevenden botsen op weerstand en wie de verandering moet dragen, trekt aan initiatieven die onvoldoende landen.",
  "Want daar wringt het vaak: verandering wordt wel beslist, maar niet echt gedragen. Zonder draagvlak blijft impact beperkt.",
  "Tijdens deze ronde tafel gaan we daar eerlijk over in gesprek. Hoe wordt verandering vandaag écht beleefd? Waar stokt het? En wat is er nodig om mensen mee te krijgen, in plaats van enkel iets uit te rollen?",
  <span key="pelckmans-note" className="block mt-5 pt-4 border-t border-border/60 text-sm italic text-muted-foreground">
    <span className="not-italic text-accent-pink mr-1.5">◆</span>
    We zijn te gast bij Uitgeverij Pelckmans, dus het wordt een gesprek met uitzicht op de ochtend-skyline van Antwerpen.
  </span>,
];

const aiTakeaways = [
  {
    title: "AI-agents staan al op je organigram, alleen behandelt niemand ze zo",
    body: "De scherpste observatie aan tafel: AI-agents zijn feitelijk nieuwe medewerkers, met taken, input, output en begeleiding nodig. Bijna geen enkele organisatie kadert het zo.",
  },
  {
    title: "Iedereen automatiseert de buitenste schil. De winst zit drie lagen dieper.",
    body: "De meeste AI-energie gaat naar persoonlijke productiviteit: teksten, samenvattingen, mailtjes. Nuttig, maar oppervlakkig. De structurele winst zit in processen, systemen en het ERP, waar bijna niemand kijkt.",
  },
  {
    title: "\"Als je AI niet gebruikt, heb je hier eigenlijk geen plek.\"",
    body: "Eén deelnemer trok de lijn hard door. Tegelijk bleek uit een ander traject dat meer dan de helft van een populatie het potentieel miste om mee te groeien na automatisering. Ambitie en realiteit botsen hier.",
  },
];

const ellenTafelgast = {
  photo: ellenPhoto,
  name: "Ellen Poppe",
  bio: "Ellen bracht als gastexpert de brug tussen strategie en technologie mee naar de tafel. Met meer dan 20 jaar ervaring in digitale transformatie en organisatieverandering leidde ze ERP-implementaties, bouwde ze AI-gedreven HR-platformen en stuurde ze digitale trajecten in België, Nederland en Marokko. Haar invalshoek voor deze sessie: technologie werkt pas als de organisatie eromheen mee verandert.",
};

const ankeTafelgast = {
  photo: ankeAsset.url,
  name: "Anke Ulens",
  bio: "Groei begint bij mensen, dat is de rode draad doorheen de loopbaan van Anke Ulens. Ze was jarenlang CEO van Copus (voorheen Vivaldis) en is vandaag actief in advies- en bestuursraden bij onder meer Copus en Rising You. Ze bouwde mee aan USG HR Forces en startte haar carrière bij Randstad en SD Worx. Haar invalshoek voor deze sessie: waarom groei zonder draagvlak vastloopt, en wat daar écht voor nodig is.",
  bookTitle: "De meeste mensen willen werken",
  bookUrl: "https://www.pelckmansuitgevers.be/de-meeste-mensen-willen-werken.html",
};

const tafel3Body: React.ReactNode[] = [
  "Wie neemt straks het roer over? Continuïteit vraagt meer dan het aanduiden van een opvolger. Het vraagt een open blik op leiderschap, kennis, vertrouwen en de toekomst van de organisatie.",
  "Net daar komen ook spanningen tussen generaties naar boven. Wat wil de ene generatie behouden? Wat vindt de volgende generatie noodzakelijk om te veranderen? Wanneer wordt ervaring een stevig fundament, en wanneer dreigt ze vernieuwing af te remmen? Die spanning is geen probleem dat zo snel mogelijk weggewerkt moet worden. Ze maakt zichtbaar wat uitgesproken, herbekeken en zorgvuldig overgedragen moet worden.",
  "Tijdens deze ronde tafel gaan we daar eerlijk over in gesprek. Hoe bereid je een organisatie voor op een volgende generatie? Hoe draag je verantwoordelijkheid, kennis en leiderschap over zonder alles bij het oude te laten? En hoe zorg je dat verschillende generaties niet tegenover elkaar komen te staan, maar samen bouwen aan continuïteit? Eentje met respect voor het verleden die ook morgen nog werkt?",
  <span key="pelckmans-note-3" className="block mt-5 pt-4 border-t border-border/60 text-sm italic text-muted-foreground">
    <span className="not-italic text-accent-pink mr-1.5">◆</span>
    Opnieuw te gast bij Uitgeverij Pelckmans, met uitzicht op de ochtend-skyline van Antwerpen.
  </span>,
];

const saskiaTafelgast = {
  photo: saskiaAsset.url,
  name: "Saskia Van Uffelen",
  bio: "Saskia Van Uffelen werkt al meer dan 25 jaar in de ICT- en telecombusiness. Ze is aangesteld als 'Digital Champion' voor België bij de Europese Commissie. Saskia is een rolmodel: als topmanager en digitaal ambassadeur, maar ook als vrouwelijke ondernemer die een drukke job combineert met een gezin van vijf kinderen. Ze pleit voor een nieuwe manier van werken waarbij de kwaliteiten van alle generaties — van babyboomers tot Gen Z — ten volle aan bod komen.",
};

const VeranderingCard = ({ onSelectTheme }: { onSelectTheme: (t: string) => void }) => {
  const { available, capacity, loading } = useSeatsAvailable(VERANDERING_THEMA, VERANDERING_MOMENT, 6);
  const volzet = !loading && available === 0;


  const capacityLabel = loading ? (
    <>👥 Max. {capacity} deelnemers</>
  ) : volzet ? (
    <span className="inline-flex items-center gap-2">
      👥
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider border border-red-200">
        Volzet
      </span>
    </span>
  ) : (
    <>👥 Nog {available} van {capacity} plekken vrij</>
  );

  return (
    <RondeTafelCard
      variant="upcoming"
      editieLabel="Editie | Augustus 2026"
      title="Verandering staat op de agenda. Draagvlak niet."
      body={tafel2Body}
      borderColor="#04c9ff"
      tafelName="Verandering & Draagvlak"
      onSelectTheme={onSelectTheme}
      sessions={[{ label: "📅 Ochtendsessie: do 27/8 — 8u tot 10u", volzet }]}
      locationLine={
        <>
          📍 Pelckmans Uitgevers, Mechelsesteenweg 271, 2018 Antwerpen (WATT-toren)
        </>
      }
      capacityLabel={capacityLabel}
      partner={{ name: "Pelckmans Uitgevers", logoUrl: pelckmansLogoAsset.url }}
      heroImage={pelckmansLocatieAsset.url}
      secondaryImage={{ src: pelckmansBoekenAsset.url, alt: "Pelckmans boekenkast" }}
      tafelgast={ankeTafelgast}
    />
  );
};

const GeneratiesCard = ({ onSelectTheme }: { onSelectTheme: (t: string) => void }) => {
  const { available, capacity, loading } = useSeatsAvailable(GENERATIES_THEMA, GENERATIES_MOMENT, 6);
  const volzet = !loading && available === 0;

  const capacityLabel = loading ? (
    <>👥 Max. {capacity} deelnemers</>
  ) : volzet ? (
    <span className="inline-flex items-center gap-2">
      👥
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider border border-red-200">
        Volzet
      </span>
    </span>
  ) : (
    <>👥 Nog {available} van {capacity} plekken vrij</>
  );

  return (
    <RondeTafelCard
      variant="upcoming"
      editieLabel="Editie | September 2026"
      title="Successie: continuïteit vraagt meer dan een opvolger"
      body={tafel3Body}
      borderColor="#ff6b9d"
      tafelName="Generaties"
      onSelectTheme={onSelectTheme}
      sessions={[{ label: "📅 Ochtendsessie: ma 21/9 — 8u tot 10u", volzet }]}
      locationLine={
        <>📍 Pelckmans Uitgevers, Mechelsesteenweg 271, 2018 Antwerpen (WATT-toren)</>
      }
      capacityLabel={capacityLabel}
      partner={{ name: "Pelckmans Uitgevers", logoUrl: pelckmansLogoAsset.url }}
      heroImage={pelckmansLocatieAsset.url}
      secondaryImage={{ src: pelckmansBoekenAsset.url, alt: "Pelckmans boekenkast" }}
      tafelgast={saskiaTafelgast}
    />
  );
};

const Index = () => {
  const [preselectedTheme, setPreselectedTheme] = useState<Theme | undefined>(undefined);

  const handleSelectTheme = useCallback((title: string) => {
    if (title.includes("Verandering")) {
      setPreselectedTheme("Verandering staat op de agenda. Draagvlak niet.");
    } else if (title.includes("Successie") || title.includes("Generaties")) {
      setPreselectedTheme("Generaties: geen probleem maar een welkom signaal");
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />

      <div className="flex justify-center py-4 bg-background">
        <div className="w-24 h-[2px] rounded-full bg-accent-pink" />
      </div>

      <section id="edities" className="py-12 md:py-16 bg-background">
        <div className="container max-w-5xl mx-auto px-6 space-y-10">
          <p className="text-primary font-heading text-xs font-semibold uppercase tracking-[0.2em]">Onze edities</p>

          <RondeTafelCard
            variant="past-whitepaper"
            anchorId="tafel-ai-in-hr"
            editieLabel="Editie | Mei 2026"
            title="AI in HR: wat betekent dat nu écht?"
            body={tafel1Body}
            borderColor="#315eff"
            tafelName="AI in HR"
            takeaways={aiTakeaways}
            tafelgast={ellenTafelgast}
          />

          <VeranderingCard onSelectTheme={handleSelectTheme} />

          <GeneratiesCard onSelectTheme={handleSelectTheme} />
        </div>
      </section>

      <FacilitatorsSection />
      <PhotoSlider />
      <AanmeldenSection key={preselectedTheme || "default"} preselectedTheme={preselectedTheme} />
      <AboutSection />
      <Footer />
      <KeepMePostedDialog />
    </div>
  );
};

export default Index;
