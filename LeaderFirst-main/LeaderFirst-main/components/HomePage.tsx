import React, { useEffect, useState } from "react";
import Insights from "./Insights";
import CtaSection from "./CtaSection";
import OfferPopup from "./OfferPopUp";

const HomePage = ({ posts, currentUser }) => {
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    // Prevent repeat during the same tab session
    const dismissed = sessionStorage.getItem("offer:dismissed") === "1";
    if (dismissed) return;

    const t = setTimeout(() => setShowOffer(true), 2000); // show after 2s
    return () => clearTimeout(t);
  }, []);

  const handleCloseOffer = () => {
    sessionStorage.setItem("offer:dismissed", "1");
    setShowOffer(false);
  };

  const handleCtaOffer = () => {
    sessionStorage.setItem("offer:dismissed", "1");
    setShowOffer(false);
    // Add CTA flow (navigate, open modal, etc.)
    // e.g., window.location.href = "/subscribe";
  };

  return (
    <main>
      <Insights posts={posts} />
      <CtaSection currentUser={currentUser} />
      {showOffer && (
        <OfferPopup onClose={handleCloseOffer} onCtaClick={handleCtaOffer} />
      )}
    </main>
  );
};

export default HomePage;
