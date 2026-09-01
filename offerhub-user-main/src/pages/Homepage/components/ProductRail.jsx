import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Card from "../../../components/Card";
import ErrorState from "../../../components/ui/ErrorState";
import { ProductRailSkeleton } from "../../../components/ui/Skeleton";

/**
 * Shared horizontal product rail.
 *
 * Clearance, Bestsellers and Trending were three near-identical copies of this
 * with their own scroll maths and their own (full-screen) loading treatment.
 * They now share one component: skeleton while loading, retryable error state,
 * nothing rendered when a section is genuinely empty, and arrows that disable
 * themselves at the ends of the track instead of scrolling into a wall.
 */
function ProductRail({
  title,
  accent,
  subtitle,
  products = [],
  isLoading,
  error,
  onRetry,
  onViewAll,
  railClassName = "",
  sectionClassName = "",
}) {
  const scrollRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const syncEdges = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const maxScroll = node.scrollWidth - node.clientWidth;
    setEdges({
      start: node.scrollLeft <= 4,
      end: node.scrollLeft >= maxScroll - 4,
    });
  }, []);

  useEffect(() => {
    syncEdges();
    const node = scrollRef.current;
    if (!node) return undefined;

    node.addEventListener("scroll", syncEdges, { passive: true });
    window.addEventListener("resize", syncEdges);
    return () => {
      node.removeEventListener("scroll", syncEdges);
      window.removeEventListener("resize", syncEdges);
    };
  }, [syncEdges, products.length]);

  const scroll = (direction) => {
    const node = scrollRef.current;
    if (!node) return;
    // Scroll by most of a viewport width so cards land on a boundary.
    const amount = node.clientWidth * 0.85;
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // A section with no products is not an error — it just isn't shown.
  if (!isLoading && !error && products.length === 0) return null;

  const header = (
    <div className="rail-section__header">
      <div>
        <h2 className="section-heading">
          {title} {accent && <span>{accent}</span>}
        </h2>
        {subtitle && <p className="rail-section__subtitle">{subtitle}</p>}
      </div>
      {onViewAll && !error && (
        <button
          type="button"
          className="view-all desktop-view-all"
          onClick={onViewAll}
        >
          View all <FiArrowRight aria-hidden="true" />
        </button>
      )}
    </div>
  );

  return (
    <section className={`rail-section ${sectionClassName}`.trim()}>
      {header}

      {error ? (
        <ErrorState error={error} onRetry={onRetry} compact />
      ) : isLoading ? (
        <ProductRailSkeleton label={`Loading ${title}`} />
      ) : (
        <div className="rail-section__body">
          <button
            type="button"
            className="scroll-button scroll-left"
            onClick={() => scroll("left")}
            disabled={edges.start}
            aria-label={`Scroll ${title} left`}
          >
            <FiArrowLeft aria-hidden="true" />
          </button>

          <div className={railClassName} ref={scrollRef}>
            {products.map((product, index) => (
              <Card
                key={product._id || index}
                product={product}
                eagerImage={index < 3}
              />
            ))}
          </div>

          <button
            type="button"
            className="scroll-button scroll-right"
            onClick={() => scroll("right")}
            disabled={edges.end}
            aria-label={`Scroll ${title} right`}
          >
            <FiArrowRight aria-hidden="true" />
          </button>
        </div>
      )}

      {onViewAll && !error && !isLoading && (
        <button
          type="button"
          className="view-all mobile-view-all"
          onClick={onViewAll}
        >
          View all <FiArrowRight aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

export default ProductRail;
