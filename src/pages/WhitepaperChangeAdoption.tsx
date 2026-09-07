import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import WhitepaperForm from "@/components/WhitepaperForm";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import ankeAsset from "@/assets/tafelgast-anke.png.asset.json";
import shareImageAsset from "@/assets/pelckmans-locatie.jpeg.asset.json";

const CANONICAL = "https://allesoptafel.firstfloortalent.be/whitepaper/change-adoption";
const SHARE_IMAGE = `https://allesoptafel.firstfloortalent.be${shareImageAsset.url}`;

const takeaways = [
  {
    title: "Tien principes uit de praktijk",
    body: "Geen theoretisch changemodel, wel wat opvallend vaak terugkwam aan tafel — in elke sector en bij elke schaal.",
  },
  {
    title: "Het CARRP-framework",
    body: "Een werkbaar kader voor weerstand, alignment, communicatie en echte adoptie, met praktijkvoorbeelden.",
  },
  {
    title: "Een change-check van tien vragen",
    body: "Toets meteen af of jouw organisatie ingericht is om de verandering ook effectief te dragen.",
  },
];

const WhitepaperChangeAdoption = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Whitepaper: Change &amp; Adoption | Alles op Tafel</title>
        <meta
          name="description"
          content="Download de gratis whitepaper 'Change & Adoption' — veranderen zonder je organisatie onderweg kwijt te raken. Tien principes, het CARRP-framework en een change-check."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:title" content="Whitepaper: Change & Adoption" />
        <meta
          property="og:description"
          content="Veranderen zonder je organisatie onderweg kwijt te raken. Inzichten uit de Ronde Tafel van First Floor."
        />
        <meta property="og:image" content={SHARE_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Whitepaper: Change & Adoption" />
        <meta
          name="twitter:description"
          content="Veranderen zonder je organisatie onderweg kwijt te raken. Gratis whitepaper van First Floor."
        />
        <meta name="twitter:image" content={SHARE_IMAGE} />
      </Helmet>

      <header className="border-b border-border/60 bg-background">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" aria-label="Naar de homepage">
            <Logo />
          </Link>
          <Link
            to="/#edities"
            className="text-sm font-heading font-semibold text-foreground/70 hover:text-primary transition-colors"
          >
            Ronde Tafels →
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-primary font-heading text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                📄 Gratis whitepaper
              </p>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
                Change &amp; Adoption: veranderen zonder je organisatie onderweg kwijt te raken
              </h1>
              <p className="text-foreground/80 font-body leading-relaxed mb-4">
                Verandering is niet nieuw. De hoeveelheid verandering wel. Digitalisering, AI,
                overnames, nieuwe structuren: terwijl de ene verandering nog niet geland is,
                staat de volgende al klaar.
              </p>
              <p className="text-foreground/80 font-body leading-relaxed mb-8">
                Aan onze Ronde Tafel brachten leiders uit retail, industrie, publishing, staffing
                en juridische dienstverlening hun ervaringen samen. Deze whitepaper bundelt wat
                telkens terugkwam — over weerstand, alignment, communicatie en echte adoptie.
              </p>

              <div className="space-y-3 mb-8">
                {takeaways.map((t, i) => (
                  <div key={i} className="bg-muted rounded-md p-4 border-l-2 border-accent-pink">
                    <p className="font-heading font-semibold text-foreground mb-1 text-sm">
                      {t.title}
                    </p>
                    <p className="text-sm text-foreground/75 leading-relaxed">{t.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-8 space-y-6">
              <img
                src={shareImageAsset.url}
                alt="Whitepaper Change & Adoption van First Floor"
                className="w-full rounded-xl shadow-2xl"
                loading="eager"
              />
              <WhitepaperForm
                source="landing-change-adoption"
                whitepaper="change-adoption"
                title="Download de whitepaper"
                description="Laat je gegevens achter, dan sturen we je 'Change & Adoption' per e-mail."
              />
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/40 border-y border-border/60">
          <div className="container max-w-4xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={ankeAsset.url}
                alt="Anke Ulens, tafelgast"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover object-top flex-shrink-0"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-heading font-semibold text-accent-pink mb-1">
                  Tafelgast
                </p>
                <h2 className="font-heading text-lg md:text-xl font-bold text-foreground mb-2">
                  Anke Ulens
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Groei begint bij mensen, dat is de rode draad doorheen de loopbaan van Anke
                  Ulens. Ze was jarenlang CEO van Copus (voorheen Vivaldis) en is vandaag actief
                  in advies- en bestuursraden. Haar invalshoek aan tafel: waarom groei zonder
                  draagvlak vastloopt, en wat daar écht voor nodig is.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WhitepaperChangeAdoption;
