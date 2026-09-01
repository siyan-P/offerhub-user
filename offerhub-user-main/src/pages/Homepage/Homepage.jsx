import React, { useEffect } from "react";
import Carousel from "../../components/Carousel";
import Clearance from "./components/Clearance";
import Bestseller from "./components/Bestseller";
import Offer from "./components/Offer";
import Trending from "./components/Trending";
import { useBanners } from "../../hooks/queries/Banner";
import Category from "./components/Category";
import TrendingCollection from "./components/Trendingcollection";
import ShopAll from "./components/ShopAll";
import Fixedblock from "../../components/WhatsAppButton";

function Homepage() {
  const { allBanners, isLoading } = useBanners();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="homepage">
      <Carousel
        data={allBanners?.filter((banner) => banner?.bannerFor === "hero")}
        isLoading={isLoading}
        from="homepage"
      />

      <div className="homepage__sections">
        <Category />
        <TrendingCollection />
        <Clearance />
        <Bestseller />
        <Trending />
        {/* Unfiltered, so the page still leads with stock when the labelled
            rails above resolve to nothing. */}
        <ShopAll />
        <Offer />
      </div>

      <Fixedblock />
    </div>
  );
}

export default Homepage;
