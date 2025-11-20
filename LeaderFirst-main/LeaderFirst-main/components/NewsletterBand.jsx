// src/components/NewsletterBand.jsx
import React, { useState } from "react";

const NewsletterBand = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || state === "loading") return;

    try {
      setState("loading");
      setMsg("");

      if (onSubmit) {
        await onSubmit(email);
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }

      setState("success");
      setMsg("You’re in. Check your inbox soon.");
      setEmail("");
    } catch {
      setState("error");
      setMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-14 md:py-16 bg-[#FBF9F6] ">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="rounded-3xl border border-gray-200 bg-white px-6 md:px-16 py-10 md:py-14 text-center shadow-sm transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-md">
          <h2 className="text-3xl md:text-[40px] font-semibold text-gray-900 tracking-tight mb-3">
            Subscribe to the Newsletter
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-8">
            For occasional updates, news and events.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-0 max-w-2xl"
          >
            <div className="flex-1">
              <div className="bg-white border border-gray-300 rounded-full flex items-center px-5 py-3 sm:py-4 shadow-sm">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent text-sm md:text-base text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={state === "loading"}
              className="sm:-ml-10 sm:mt-0 mt-1 inline-flex items-center justify-center px-8 md:px-10 py-3 sm:py-4 rounded-full bg-black text-sm md:text-base font-medium text-white shadow-md hover:bg-gray-900 disabled:opacity-60 transition-transform duration-200 ease-out hover:-translate-y-0.5"
            >
              {state === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {msg && (
            <p
              className={`mt-4 text-xs md:text-sm ${
                state === "error" ? "text-red-600" : "text-gray-600"
              }`}
            >
              {msg}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterBand;
