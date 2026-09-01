import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet, useLocation } from "react-router-dom";

function Userlayout() {
  const { pathname } = useLocation();

  // Route changes should start at the top, not halfway down the previous page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="app-shell">
      <Header />
      {/* Keyed so each route fades in rather than snapping between screens. */}
      <main id="main-content" className="app-main" key={pathname}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Userlayout;
