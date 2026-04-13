import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RondeTafelCard from "@/components/RondeTafelCard";
import FacilitatorsSection from "@/components/FacilitatorsSection";
import PhotoSlider from "@/components/PhotoSlider";
import AboutSection from "@/components/AboutSection";
import AanmeldenSection from "@/components/AanmeldenSection";
import Footer from "@/components/Footer";

type Theme = "AI in HR: wat betekent dat nu écht?" | "Verandering staat op de agenda. Draagvlak niet.";

const tafel1Body = [
  "AI zit plots overal in het gesprek. Maar in veel organisaties blijft de vraag dezelfde: wat verandert er nu echt, en wat niet?",
  "HR voelt dat er iets beweegt. Rollen verschuiven, verwachtingen veranderen en de druk om \"iets met AI te doen\" neemt toe. Tegelijk is er veel onduidelijkheid. Waar kan AI vandaag echt waarde toevoegen? Wat vraagt nog altijd menselijke inschatting? En hoe zorg je ervoor dat technologie werk slimmer maakt, zonder extra ruis, weerstand of versnippering te creëren?",
  "Tijdens deze ronde tafel gaan we daar eerlijk over in gesprek.",
];

const tafel2Body = [
  "In veel organisaties volgen veranderingen elkaar snel op. Nieuwe prioriteiten, nieuwe structuren, nieuwe verwachtingen. Op papier klopt het vaak. Maar in de praktijk blijft de beweging uit. Teams haken af, leidinggevenden botsen op weerstand en HR trekt aan initiatieven die onvoldoende landen.",
  "Want daar wringt het vaak: verandering wordt wel beslist, maar niet echt gedragen. Zonder draagvlak blijft impact beperkt.",
  "Tijdens deze ronde tafel gaan we daar eerlijk over in gesprek. Hoe wordt verandering vandaag écht beleefd? Waar stokt het? En wat is er nodig om mensen mee te krijgen, in plaats van enkel iets uit te rollen?",
];

const Index = () => {
  const [preselectedTheme, setPreselectedTheme] = useState<Theme | undefined>(undefined);

  const handleSelectTheme = useCallback((title: string) => {
    if (title.includes("AI")) {
      setPreselectedTheme("AI in HR: wat betekent dat nu écht?");
    } else {
      setPreselectedTheme("Verandering staat op de agenda. Draagvlak niet.");
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />

      <div className="flex justify-center gap-3 py-4 bg-background">
        <div className="w-12 h-1 rounded-full bg-primary" />
        <div className="w-12 h-1 rounded-full bg-accent-cyan" />
        <div className="w-12 h-1 rounded-full bg-accent-pink" />
        <div className="w-12 h-1 rounded-full bg-accent-yellow" />
      </div>

      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-5xl mx-auto px-6 space-y-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Komende edities</h2>
          <RondeTafelCard
            editieLabel="Editie 2 | Mei 2026"
            title="AI in HR: wat betekent dat nu écht?"
            body={tafel1Body}
            borderColor="#315eff"
            tafelName="AI in HR"
            onSelectTheme={handleSelectTheme}
          />
          <RondeTafelCard
            editieLabel="Editie 3 | Mei 2026"
            title="Verandering staat op de agenda. Draagvlak niet."
            body={tafel2Body}
            borderColor="#04c9ff"
            tafelName="Verandering & Draagvlak"
            onSelectTheme={handleSelectTheme}
          />
        </div>
      </section>

      <FacilitatorsSection />
      <PhotoSlider />
      <AanmeldenSection preselectedTheme={preselectedTheme} />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
