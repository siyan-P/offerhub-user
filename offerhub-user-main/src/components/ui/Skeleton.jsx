import React from "react";

/**
 * Primitive shimmer block. Every loading placeholder in the app is built from
 * these so shapes match the real layout instead of showing a generic spinner.
 */
export function Skeleton({
  width,
  height,
  variant = "block",
  radius,
  className = "",
  style,
}) {
  return (
    <span
      className={`skeleton skeleton--${variant} ${className}`.trim()}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

/** One product card placeholder, matching `.product-card` box model. */
export function ProductCardSkeleton() {
  return (
    <div className="product-card-skeleton" aria-hidden="true">
      <Skeleton className="product-card-skeleton__media" />
      <div className="product-card-skeleton__body">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="85%" height="1em" />
        <Skeleton variant="text" width="55%" height="1.1em" />
        <Skeleton height="2.25rem" radius="var(--radius-sm)" />
      </div>
    </div>
  );
}

/** Grid of card placeholders — used by the catalog on first load. */
export function ProductGridSkeleton({ count = 8, label = "Loading products" }) {
  return (
    <div className="product-grid-skeleton" role="status" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Horizontal rail of card placeholders — used by the homepage carousels. */
export function ProductRailSkeleton({ count = 5, label = "Loading products" }) {
  return (
    <div className="product-rail-skeleton" role="status" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Circular category tiles. */
export function CategoryRailSkeleton({ count = 6 }) {
  return (
    <div
      className="category-rail-skeleton"
      role="status"
      aria-label="Loading categories"
    >
      {Array.from({ length: count }, (_, i) => (
        <div className="category-rail-skeleton__item" key={i}>
          <Skeleton variant="circle" width="5.5rem" height="5.5rem" />
          <Skeleton variant="text" width="4rem" />
        </div>
      ))}
    </div>
  );
}

/** Product detail page: gallery on the left, buy box on the right. */
export function ProductDetailsSkeleton() {
  return (
    <div className="pdp-skeleton" role="status" aria-label="Loading product">
      <div className="pdp-skeleton__gallery">
        <Skeleton className="pdp-skeleton__main" />
        <div className="pdp-skeleton__thumbs">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="pdp-skeleton__thumb" />
          ))}
        </div>
      </div>
      <div className="pdp-skeleton__info">
        <Skeleton variant="text" width="30%" />
        <Skeleton height="2rem" width="80%" />
        <Skeleton variant="text" width="45%" />
        <Skeleton height="5rem" />
        <Skeleton height="2.5rem" width="60%" />
        <Skeleton height="3rem" />
      </div>
    </div>
  );
}

/** Cart: line items on the left, order summary on the right. */
export function CartSkeleton({ rows = 3 }) {
  return (
    <div className="cart-skeleton" role="status" aria-label="Loading your cart">
      <div className="cart-skeleton__items">
        {Array.from({ length: rows }, (_, i) => (
          <div className="cart-skeleton__row" key={i}>
            <Skeleton className="cart-skeleton__thumb" />
            <div className="cart-skeleton__lines">
              <Skeleton variant="text" width="70%" height="1em" />
              <Skeleton variant="text" width="40%" />
              <Skeleton height="2.25rem" width="7rem" radius="var(--radius-md)" />
            </div>
            <Skeleton variant="text" width="3.5rem" height="1em" />
          </div>
        ))}
      </div>
      <div className="cart-skeleton__summary">
        <Skeleton height="1.5rem" width="55%" />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="text" />
        ))}
        <Skeleton height="3rem" radius="var(--radius-md)" />
      </div>
    </div>
  );
}

export default Skeleton;
