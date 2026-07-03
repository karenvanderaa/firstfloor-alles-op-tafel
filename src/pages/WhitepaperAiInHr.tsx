import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import WhitepaperForm from "@/components/WhitepaperForm";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import ellenPhoto from "@/assets/facilitator-ellen.jpeg";
import shareImageAsset from "@/assets/whitepaper-ai-hr-share.png.asset.json";

const CANONICAL = "https://allesoptafel.firstfloortalent.be/whitepaper/ai-in-hr";
const SHARE_IMAGE = `https://allesoptafel.firstfloortalent.be${shareImageAsset.url}`;

const takeaways = [
  {
    title: "AI-agents staan al op je organigram, alleen behandelt niemand ze zo",
    body: "AI-agents zijn feitelijk nieuwe medewerkers — met taken, input, output en begeleiding nodig. Bijna geen enkele organisatie kadert het zo.",
  },
  {
    title: "Iedereen automatiseert de buitenste schil. De winst zit drie lagen dieper.",
    body: "De meeste AI-energie gaat naar persoonlijke productiviteit. De structurele winst zit in processen, systemen en het ERP — waar bijna niemand kijkt.",
  },
  {
    title: "\"Als je AI niet gebruikt, heb je hier eigenlijk geen plek.\"",
    body: "Eén deelnemer trok de lijn hard door. Tegelijk bleek dat meer dan de helft van een populatie het potentieel miste om mee te groeien na automatisering. Ambitie en realiteit botsen hier.",
  },
];

const WhitepaperAiInHr = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Whitepaper: AI in HR — wat betekent dat nu écht? | Alles op Tafel</title>
        <meta
          name="description"
          content="Download de gratis whitepaper 'AI in HR: wat betekent dat nu écht?' — inzichten uit de Ronde Tafel van First Floor met HR-leiders en Ellen Poppe."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:title" content="Whitepaper: AI in HR — wat betekent dat nu écht?" />
        <meta
          property="og:description"
          content="Gratis whitepaper met inzichten uit de Ronde Tafel over AI in HR. Download hem hier."
        />
        <meta property="og:image" content={SHARE_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Whitepaper: AI in HR — wat betekent dat nu écht?" />
        <meta
          name="twitter:description"
          content="Gratis whitepaper met inzichten uit de Ronde Tafel over AI in HR."
        />
        <meta name="twitter:image" content={SHARE_IMAGE} />
      </Helmet>

      {/* Compacte header — geen volledige navbar */}
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

      {/* Hero */}
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <div className="container max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-primary font-heading text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                📄 Gratis whitepaper
              </p>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5 leading-tight">
                AI in HR: wat betekent dat nu écht?
              </h1>
              <p className="text-foreground/80 font-body leading-relaxed mb-4">
                Tijdens een Ronde Tafel met HR-leiders en gastexpert Ellen Poppe gingen we
                eerlijk in gesprek over AI in HR. Waar voegt het vandaag echt waarde toe?
                Wat vraagt nog menselijke inschatting? En hoe voorkom je dat "iets met AI
                doen" vooral extra ruis creëert?
              </p>
              <p className="text-foreground/80 font-body leading-relaxed mb-8">
                De whitepaper bundelt de scherpste inzichten uit dat gesprek — bruikbaar,
                zonder hype.
              </p>

              <div className="space-y-3 mb-8">
                {takeaways.map((t, i) => (
                  <div
                    key={i}
                    className="bg-muted rounded-md p-4 border-l-2 border-accent-pink"
                  >
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
                src={SHARE_IMAGE}
                alt="Whitepaper: AI in HR — wat betekent dat nu écht?"
                className="w-full rounded-xl shadow-2xl"
                loading="eager"
              />
              <WhitepaperForm source="landing-ai-in-hr" />
            </div>
          </div>
        </section>

        {/* Tafelgast — social proof */}
        <section className="py-12 md:py-16 bg-muted/40 border-y border-border/60">
          <div className="container max-w-4xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={ellenPhoto}
                alt="Ellen Poppe"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover object-top flex-shrink-0 shadow-md"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] font-heading font-semibold text-accent-pink mb-1">
                  Tafelgast
                </p>
                <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-2">
                  Ellen Poppe
                </h2>
                <p className="text-foreground/80 leading-relaxed">
                  Ellen bracht als gastexpert de brug tussen strategie en technologie mee
                  naar de tafel. Met meer dan 20 jaar ervaring in digitale transformatie
                  en organisatieverandering leidde ze ERP-implementaties, bouwde ze
                  AI-gedreven HR-platformen en stuurde ze digitale trajecten in België,
                  Nederland en Marokko. Haar invalshoek: technologie werkt pas als de
                  organisatie eromheen mee verandert.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Over + CTA */}
        <section className="py-12 md:py-16">
          <div className="container max-w-3xl mx-auto px-6 text-center">
            <p className="text-primary font-heading text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Alles op Tafel
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ronde Tafels van First Floor
            </h2>
            <p className="text-foreground/80 leading-relaxed mb-6">
              Kleine tafels, scherpe gesprekken, geen powerpoint. We brengen HR-leiders
              samen rond thema's die er écht toe doen — en delen de inzichten met wie er
              niet bij was.
            </p>
            <Link
              to="/#edities"
              className="inline-flex items-center gap-2 text-primary font-heading font-semibold hover:underline"
            >
              Ontdek de volgende ronde tafels →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default WhitepaperAiInHr;
