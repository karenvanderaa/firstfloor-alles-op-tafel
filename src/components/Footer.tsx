import rondeTafelsLogo from "@/assets/ronde-tafels-logo.svg";

const Footer = () => (
  <footer className="bg-foreground py-10">
    <div className="container max-w-5xl mx-auto px-6 text-center">
      <img src={rondeTafelsLogo} alt="Ronde Tafels logo" className="w-16 h-16 mx-auto mb-4 rounded-full shadow-lg" />
      <p className="text-sm text-background/70 font-body mb-2">
        © 2026 <a href="https://firstfloortalent.be/" target="_blank" rel="noopener noreferrer" className="hover:text-background/90 transition-colors">First Floor</a>
      </p>
      <p className="text-sm text-background/50 font-body italic mb-4">
        Schuren doet blinken. Als er verbinding is.
      </p>
      <a
        href="https://www.firstfloor.be"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-background/50 hover:text-background/80 transition-colors font-body"
      >
        www.firstfloor.be
      </a>
    </div>
  </footer>
);

export default Footer;
