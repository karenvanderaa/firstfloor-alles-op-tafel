import Logo from "./Logo";

const Navbar = () => (
  <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
    <div className="container max-w-5xl mx-auto px-6 py-4">
      <Logo />
    </div>
  </nav>
);

export default Navbar;
