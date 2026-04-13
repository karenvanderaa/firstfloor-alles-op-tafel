import logoFirstFloor from "@/assets/logo-firstfloor.png";

const Navbar = () => (
  <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
    <div className="container max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
      {/* Logo + Ronde Tafels */}
      <div className="flex items-center gap-3">
        <img src={logoFirstFloor} alt="First Floor" className="h-8" />
        <span className="text-primary font-heading font-semibold text-sm tracking-wide">Ronde Tafels</span>
      </div>

      {/* Navigation */}
      <div className="hidden md:flex items-center gap-6 text-sm font-body text-foreground/70">
        <a href="#edities" className="hover:text-primary transition-colors">Edities</a>
        <a href="#facilitators" className="hover:text-primary transition-colors">Facilitators</a>
        <a href="#over" className="hover:text-primary transition-colors">Over ons</a>
        <a
          href="#aanmelden"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-semibold hover:bg-primary/90 transition-colors"
        >
          Aanmelden
        </a>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden text-foreground"
        onClick={() => {
          const menu = document.getElementById("mobile-nav");
          menu?.classList.toggle("hidden");
        }}
        aria-label="Menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>

    {/* Mobile nav */}
    <div id="mobile-nav" className="hidden md:hidden border-t border-border bg-card px-6 py-4 space-y-3 text-sm font-body">
      <a href="#edities" className="block text-foreground/70 hover:text-primary">Edities</a>
      <a href="#facilitators" className="block text-foreground/70 hover:text-primary">Facilitators</a>
      <a href="#over" className="block text-foreground/70 hover:text-primary">Over ons</a>
      <a href="#aanmelden" className="block text-primary font-semibold">Aanmelden</a>
    </div>
  </nav>
);

export default Navbar;
