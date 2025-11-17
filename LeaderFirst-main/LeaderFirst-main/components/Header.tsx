import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MenuIcon, CloseIcon } from "./icons/Icons";
import { api } from "../lib/api";

const Header = ({ currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const navigate = useNavigate();

  // Auth state: prefer prop, fallback to token so header is correct on refresh
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isAuthed = !!currentUser || !!token;

  const userFromStorage = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const email = currentUser?.email || userFromStorage?.email || null;

  const adminEmails = [
    "admin101@example.com",
    "admin102@example.com",
    "admin103@example.com",
    "admin104@example.com",
    "admin105@example.com",
    "admin1@example.com",
    "admin2@example.com",
    "admin3@example.com",
    "admin4@example.com",
    "admin5@example.com",
  ];
  const isUserAdmin = !!email && adminEmails.includes(email);

  // Reconcile plan flags with server to avoid false 'Plan active'
  React.useEffect(() => {
    let cancelled = false;
    const t = localStorage.getItem("token");
    if (!t) {
      localStorage.removeItem("plan_active");
      localStorage.removeItem("plan_name");
      return;
    }

    // Only check when we have a user context
    (async () => {
      try {
        const me = await api("/api/auth/me", { token: t });
        if (cancelled) return;
        const info = me?.data?.data;
        if (info?.planStatus === "active") {
          localStorage.setItem("plan_active", "true");
          if (info?.planName) localStorage.setItem("plan_name", info.planName);
        } else {
          localStorage.removeItem("plan_active");
          localStorage.removeItem("plan_name");
        }
      } catch {
        if (cancelled) return;
        localStorage.removeItem("plan_active");
        localStorage.removeItem("plan_name");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Read flags for display (after reconciliation)
  const planActive =
    isAuthed && JSON.parse(localStorage.getItem("plan_active") || "false");
  const planNameRaw = isAuthed ? localStorage.getItem("plan_name") : null;
  const planName =
    planNameRaw === "core"
      ? "Core Group"
      : planNameRaw === "contributor"
      ? "Contributor"
      : null;

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (category) => {
    setIsMenuOpen(false);
    navigate(`/blog?category=${category}`);
  };

  const navLinks = (
    <>
      <button
        onClick={() => handleCategoryClick("Leadership")}
        className="py-2 hover:text-gray-500 transition-colors cursor-pointer bg-none border-none text-brand-dark font-medium"
      >
        Leadership
      </button>
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

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    // ensure flags cleared on logout
    localStorage.removeItem("plan_active");
    localStorage.removeItem("plan_name");
    onLogout();
  };

  const rightSideDesktop = (
    <div className="hidden lg:flex items-center space-x-4">
      {isAuthed && (
        <div className="flex items-center space-x-2">
          {planActive && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
              Plan active
            </span>
          )}
          {planName && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
              {planName}
            </span>
          )}
        </div>
      )}

      {isUserAdmin && (
        <>
          <Link
            to="/upload-article"
            className="text-brand-dark hover:text-gray-500 font-medium transition-colors"
          >
            Upload Article
          </Link>
          <Link
            to="/rephrase"
            className="text-brand-dark hover:text-gray-500 font-medium transition-colors"
          >
            Rephraser
          </Link>
          <Link
            to="/pricing-page"
            className="text-brand-dark hover:text-gray-500 font-medium  "
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
        </>
      )}

      {isAuthed ? (
        <button
          onClick={handleLogoutClick}
          className="bg-black text-white px-6 py-2 rounded-md transition-colors font-semibold text-sm"
        >
          Logout
        </button>
      ) : (
        <Link
          to="/login"
          className="bg-black text-white px-6 py-2 rounded-md transition-colors font-semibold text-sm"
        >
          Login
        </Link>
      )}
    </div>
  );

  const authLinksMobile = isAuthed ? (
    <>
      <div className="flex items-center gap-2 pt-2">
        {planActive && (
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
            Plan active
          </span>
        )}
        {planName && (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
            {planName}
          </span>
        )}
      </div>
      <Link
        to="/upload-article"
        className="text-brand-dark hover:text-gray-500 font-medium pt-4"
        onClick={() => setIsMenuOpen(false)}
      >
        Upload Article
      </Link>
      {isUserAdmin && (
        <>
          <Link
            to="/upload-article"
            className="text-brand-dark hover:text-gray-500 font-medium pt-4"
            onClick={() => setIsMenuOpen(false)}
          >
            Upload Article
          </Link>
          <Link
            to="/rephrase"
            className="text-brand-dark hover:text-gray-500 font-medium"
            onClick={() => setIsMenuOpen(false)}
          >
            Rephraser
          </Link>
        </>
      )}
      <button
        onClick={handleLogoutClick}
        className="bg-brand-dark text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-semibold mt-3 w-full"
      >
        Logout
      </button>
    </>
  ) : (
    <Link
      to="/login"
      onClick={() => setIsMenuOpen(false)}
      className="bg-brand-dark text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-semibold mt-2 w-full text-center"
    >
      Login
    </Link>
  );

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

          {rightSideDesktop}

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
