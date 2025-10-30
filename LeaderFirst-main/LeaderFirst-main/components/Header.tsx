import React from "react";
import { Link } from "react-router-dom";
import { MenuIcon, CloseIcon } from "./icons/Icons";

// Only keep admin logic if you need special admin links
const adminEmails = ["abcd@gmail.com", "defg@gmail.com"];

const Header = ({ currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const adminEmails = [
    "admin1@example.com",
    "admin2@example.com",
    "admin3@example.com",
    "admin4@example.com",
    "admin5@example.com",
  ];
  const isUserAdmin = currentUser && adminEmails.includes(currentUser.email);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Main navigation links (always visible)
  const navLinks = (
    <>
      <Link
        to="/blog?category=Leadership"
        className="py-2 hover:text-gray-500 transition-colors"
      >
        Leadership
      </Link>
      <Link
        to="/community"
        className="py-2 hover:text-gray-500 transition-colors"
      >
        Community
      </Link>
      <Link to="/perks" className="py-2 hover:text-gray-500 transition-colors">
        Perks
      </Link>
      <Link to="/blog" className="py-2 hover:text-gray-500 transition-colors">
        Blog
      </Link>
      <Link to="/faq" className="py-2 hover:text-gray-500 transition-colors">
        FAQ
      </Link>
    </>
  );

  // Auth links logic: Only show Logout if logged in
  const authLinksDesktop = currentUser ? (
    <div className="hidden lg:flex items-center space-x-6">
      {isUserAdmin && (
        <Link
          to="/upload-article"
          className="text-brand-dark hover:text-gray-500 font-medium transition-colors"
        >
          Upload Article
        </Link>
      )}
      <button
        onClick={onLogout}
        className="bg-brand-dark text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors font-semibold text-sm"
      >
        Logout
      </button>
    </div>
  ) : null;

  const authLinksMobile = currentUser ? (
    <>
      {isUserAdmin && (
        <Link
          to="/upload-article"
          className="text-brand-dark hover:text-gray-500 font-medium pt-4"
        >
          Upload Article
        </Link>
      )}
      <button
        onClick={onLogout}
        className="bg-brand-dark text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-semibold mt-2"
      >
        Logout
      </button>
    </>
  ) : null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "border-b border-gray-200"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold text-brand-dark font-serif cursor-pointer"
          >
            The Leaders First
          </Link>
          <nav className="hidden lg:flex items-center space-x-8 text-brand-dark font-medium">
            {navLinks}
          </nav>
          {authLinksDesktop}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brand-dark"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg">
          <nav className="flex flex-col items-center space-y-4 px-6 py-8 text-brand-dark font-medium">
            {navLinks}
            {authLinksMobile}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
