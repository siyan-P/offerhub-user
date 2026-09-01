import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOfferBanner } from "../../../hooks/queries/offerBanner";
import { Skeleton } from "../../../components/ui/Skeleton";
import ProductImage from "../../../components/ui/ProductImage";

const DESCRIPTION_LIMIT = 260;

function Offer() {
  const { offerBanner, isLoading, error } = useOfferBanner();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const banners = offerBanner || [];

  useEffect(() => {
    if (isPaused || banners.length < 2) return undefined;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  // Guard against the index outliving a shorter refetched list.
  useEffect(() => {
    if (currentIndex > banners.length - 1) setCurrentIndex(0);
  }, [banners.length, currentIndex]);

  if (isLoading) {
    return (
      <section className="rail-section offer-container">
        <div className="offer-content">
          <div className="offer-text">
            <Skeleton height="2rem" width="60%" />
            <Skeleton variant="text" width="40%" />
            <Skeleton height="5rem" />
            <Skeleton height="2.75rem" width="9rem" radius="var(--radius-md)" />
          </div>
          <Skeleton height="16rem" radius="var(--radius-lg)" />
        </div>
      </section>
    );
  }

  // A missing promo isn't worth an error banner on the homepage — the section
  // simply steps aside.
  if (error || banners.length === 0) return null;

  const banner = banners[currentIndex] || banners[0];
  const fullDescription = banner.description || "";
  const needsTruncation = fullDescription.length > DESCRIPTION_LIMIT;

  return (
    <section
      className="rail-section offer-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="offer-content">
        <div className="offer-text" key={currentIndex}>
          {banner.offerValue && (
            <span className="ui-badge ui-badge--brand offer-flag">
              Flat {banner.offerValue}
              {banner.offerType === "percentage" ? "%" : "₹"} off
            </span>
          )}

          <h2>{banner.title}</h2>
          {banner.subtitle && <h3>{banner.subtitle}</h3>}

          {fullDescription && (
            <p>
              {isExpanded || !needsTruncation
                ? fullDescription
                : `${fullDescription.slice(0, DESCRIPTION_LIMIT)}…`}
              {needsTruncation && (
                <button
                  type="button"
                  className="read-more"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Read less" : "Read more"}
                </button>
              )}
            </p>
          )}

          {banner.link && (
            <Link to={banner.link} className="ui-btn ui-btn--primary explore-btn">
              Explore the offer
            </Link>
          )}
        </div>

        <div className="offer-image">
          <ProductImage
            src={banner.image}
            alt={banner.title || "Offer"}
            ratio="4 / 3"
            fit="cover"
          />
        </div>
      </div>

      {banners.length > 1 && (
        <div className="slider-dots" role="tablist" aria-label="Offers">
          {banners.map((item, index) => (
            <button
              type="button"
              key={item?._id || index}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Offer ${index + 1} of ${banners.length}`}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => {
                setCurrentIndex(index);
                setIsExpanded(false);
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Offer;
