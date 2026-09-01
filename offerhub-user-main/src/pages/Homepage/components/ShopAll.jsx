import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useProducts } from "../../../hooks/queries/products";
import Card from "../../../components/Card";
import Button from "../../../components/ui/Button";
import ErrorState from "../../../components/ui/ErrorState";
import { ProductGridSkeleton } from "../../../components/ui/Skeleton";

const PREVIEW_COUNT = 12;

/**
 * The homepage's main body of stock.
 *
 * The three rails above it are all filtered by hard-coded label IDs, so when a
 * label has no products assigned every one of them renders nothing and the page
 * collapses to a category strip. This section is unfiltered, so the homepage
 * always leads with real products, and a grid fills the fold far better than a
 * fourth horizontal rail.
 */
function ShopAll() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useProducts({
    limit: PREVIEW_COUNT,
  });

  const products =
    data?.pages?.flatMap((page) => page.data.products)?.slice(0, PREVIEW_COUNT) ||
    [];

  if (!isLoading && !error && products.length === 0) return null;

  return (
    <section className="rail-section shop-all">
      <div className="rail-section__header">
        <div>
          <h2 className="section-heading">
            Shop <span>everything</span>
          </h2>
          <p className="rail-section__subtitle">
            Browse the full range, updated as new stock lands
          </p>
        </div>
        <button
          type="button"
          className="view-all desktop-view-all"
          onClick={() => navigate("/products")}
        >
          View all <FiArrowRight aria-hidden="true" />
        </button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} compact />
      ) : isLoading ? (
        <ProductGridSkeleton count={PREVIEW_COUNT} />
      ) : (
        <>
          <div className="home-product-grid">
            {products.map((product, index) => (
              <Card key={product._id} product={product} eagerImage={index < 4} />
            ))}
          </div>

          <div className="shop-all__footer">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/products")}
              trailingIcon={<FiArrowRight aria-hidden="true" />}
            >
              View all products
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

export default ShopAll;
