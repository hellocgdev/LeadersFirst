import React, { useEffect, useState } from "react";
import Insights from "./Insights";
import CtaSection from "./CtaSection";

const HomePage = ({ posts, currentUser }) => {
  return (
    <main>
      <Insights posts={posts} />
      <CtaSection currentUser={currentUser} />
    </main>
  );
};

export default HomePage;
