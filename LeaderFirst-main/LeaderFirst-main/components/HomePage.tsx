import React from "react";
import Insights from "./Insights";
import CtaSection from "./CtaSection";
import { Post } from "../data/posts";

interface HomePageProps {
  posts: Post[];
  currentUser?: any;
}

const HomePage: React.FC<HomePageProps> = ({ posts, currentUser }) => {
  return (
    <main>
      <Insights posts={posts} />
      <CtaSection currentUser={currentUser} />
    </main>
  );
};

export default HomePage;
