import React, { useCallback, useEffect, useRef, useState } from "react";
import Card from "../../components/Card";
import { useSelector } from "react-redux";
import {
  FiChevronLeft,
  FiChevronRight,
  FiShare2,
  FiShoppingCart,
  FiMessageCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiImage,
  FiZoomIn,
} from "react-icons/fi";
import { useProductById, useProducts } from "../../hooks/queries/products";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../../components/error/ErrorFallback";
import { useAddToCart } from "../../hooks/queries/cart";
import RatingModal from "./RatingModal";
import { reviewService } from "../../api/services/reviewService";
import { toast } from "sonner";
import Button from "../../components/ui/Button";
import ErrorState from "../../components/ui/ErrorState";
import ProductImage from "../../components/ui/ProductImage";
import Avatar from "../../components/ui/Avatar";
import {
  ProductDetailsSkeleton,
  ProductRailSkeleton,
} from "../../components/ui/Skeleton";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const CalculateDiscount = (price, offerPrice) => {
  if (!price || price <= offerPrice) return 0;
  const discount = ((price - offerPrice) / price) * 100;
  return Number.isInteger(discount) ? discount : Number(discount.toFixed(0));
};

// ---------------------------------------------------------------------------
// Image Gallery sub-component
// Handles: auto-slideshow, arrow nav, dot indicators, thumbnails, lightbox
// ---------------------------------------------------------------------------
function ImageGallery({ images = [], productName, onPreview }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [fade, setFade] = useState(true);
  const intervalRef = useRef(null);

  const total = images.length;

  // Keep activeIndex in bounds when images array changes (e.g. variant switch)
  useEffect(() => {
    setActiveIndex(0);
    setFade(true);
  }, [images]);

  // Cross-fade helper
  const goTo = useCallback(
    (index) => {
      if (index === activeIndex) return;
      setFade(false);
      setTimeout(() => {
        setActiveIndex((index + total) % total);
        setFade(true);
      }, 180);
    },
    [activeIndex, total]
  );

  const goPrev = useCallback(
    () => goTo((activeIndex - 1 + total) % total),
    [goTo, activeIndex, total]
  );
  const goNext = useCallback(
    () => goTo((activeIndex + 1) % total),
    [goTo, activeIndex, total]
  );

  // Auto-slideshow — 2.8 s, paused on hover
  useEffect(() => {
    if (total <= 1 || isHovered) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(goNext, 2800);
    return () => clearInterval(intervalRef.current);
  }, [total, isHovered, goNext]);

  const currentSrc = images[activeIndex];

  return (
    <div className="pd-gallery">
      {/* ---- Main image area ---- */}
      <div
        className="pd-gallery__main"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div
          className="pd-gallery__img-wrap"
          role="button"
          tabIndex={0}
          aria-label="View larger image"
          onClick={() => currentSrc && onPreview(currentSrc)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              currentSrc && onPreview(currentSrc);
            }
          }}
        >
          {currentSrc ? (
            <img
              key={currentSrc}
              src={currentSrc}
              alt={productName}
              className={`pd-gallery__img${fade ? " is-visible" : ""}`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          ) : (
            <span className="pd-gallery__fallback" aria-hidden="true">
              <FiImage />
            </span>
          )}

          {/* Zoom hint */}
          <span className="pd-gallery__zoom" aria-hidden="true">
            <FiZoomIn />
          </span>
        </div>

        {/* Left / right arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              className="pd-gallery__arrow pd-gallery__arrow--prev"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
            >
              <FiChevronLeft />
            </button>
            <button
              type="button"
              className="pd-gallery__arrow pd-gallery__arrow--next"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
            >
              <FiChevronRight />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="pd-gallery__dots" role="tablist" aria-label="Image navigation">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Image ${i + 1}`}
                className={`pd-gallery__dot${i === activeIndex ? " active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---- Thumbnail strip ---- */}
      {total > 1 && (
        <div className="pd-gallery__thumbs" role="list">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              role="listitem"
              className={`pd-gallery__thumb${i === activeIndex ? " active" : ""}`}
              aria-label={`View image ${i + 1} of ${total}`}
              aria-pressed={i === activeIndex}
              onClick={() => goTo(i)}
            >
              <img src={img} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
function ProductDetailsContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const sliderRef = useRef(null);
  const isLoggedIn = useSelector((state) => state?.user?.isLoggedIn);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { id } = useParams();

  const {
    data: product,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useProductById(id);

  const { data: response, isLoading: isLoadingRelated } = useProducts();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    setSelectedVariant(null);
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
    setReviews(product?.ratings || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product, id]);

  // Close lightbox on Escape
  useEffect(() => {
    if (!previewImage) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPreviewImage(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [previewImage]);

  if (isLoading) return <ProductDetailsSkeleton />;

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        retrying={isFetching}
        title="We couldn't load this product"
      />
    );
  }

  if (!product) {
    return (
      <ErrorState
        title="Product not found"
        description="This item may have been removed or the link is out of date."
        onRetry={() => navigate("/products")}
        retryLabel="Browse all products"
      />
    );
  }

  const activeStock = selectedVariant ? selectedVariant?.stock : product?.stock;
  const isOutOfStock = activeStock <= 0;
  const isLowStock = !isOutOfStock && activeStock <= 5;
  const activePrice = selectedVariant?.price ?? product?.price;
  const activeOfferPrice = selectedVariant?.offerPrice ?? product?.offerPrice;
  const discountPercent = CalculateDiscount(activePrice, activeOfferPrice);

  const galleryImages = selectedVariant
    ? selectedVariant.images || []
    : product?.images || [];

  const relatedProducts =
    response?.pages
      ?.flatMap((page) => page.data.products)
      ?.filter((item) => item._id !== product._id) || [];

  const visibleReviews = showAllReviews ? reviews : reviews?.slice(0, 2);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const amount = sliderRef.current.clientWidth * 0.8;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    addToCart({
      productId: product._id,
      variantId: selectedVariant?._id || null,
      quantity: 1,
    });
  };

  const handleBuyNow = () => {
    const name = selectedVariant
      ? `${product?.name} (${selectedVariant?.attributes?.title})`
      : product?.name;
    const message = `🛒 *Product Details*\n\n*Name:* ${name}\n*Price:* ₹${activeOfferPrice}\n\n🔗 ${window.location.href}`;
    window.open(
      `https://wa.me/+919567359906?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleSubmitReview = async (reviewData) => {
    const formData = new FormData();
    formData.append("rating", reviewData.rating);
    formData.append("review", reviewData.review);
    formData.append("image", reviewData.media);
    formData.append("productId", reviewData.productId);

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview(formData);
      setIsRatingModalOpen(false);
      refetch();
      toast.success("Thanks — your review is live");
    } catch (submitError) {
      toast.error(
        submitError.response?.data?.message || "Couldn't submit your review"
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const description = selectedVariant
    ? selectedVariant?.attributes?.description
    : product?.description;

  const words = description?.split(" ") || [];
  const isTruncatable = words.length > 100;
  const shownDescription =
    isTruncatable && !showFullDescription
      ? `${words.slice(0, 100).join(" ")}…`
      : description;

  const handleShare = async () => {
    const shareData = {
      title: product?.name,
      text: `Check out ${product?.name} on OfferHub`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const buyButtons = (
    <div className="buy-buttons">
      <Button
        variant="secondary"
        size="lg"
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        leadingIcon={<FiMessageCircle aria-hidden="true" />}
      >
        Buy on WhatsApp
      </Button>
      <Button
        size="lg"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        loading={isAddingToCart}
        loadingText="Adding"
        leadingIcon={<FiShoppingCart aria-hidden="true" />}
      >
        {isOutOfStock ? "Out of stock" : "Add to cart"}
      </Button>
    </div>
  );

  return (
    <div className="product-details">
      <div className="product-details__inner">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link to="/products">All products</Link>
          {product?.category?.name && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{product.category.name}</span>
            </>
          )}
        </nav>

        {/* Two-column grid */}
        <div className="product-container">
          {/* ---- Gallery ---- */}
          <ImageGallery
            images={galleryImages}
            productName={product?.name}
            onPreview={setPreviewImage}
          />

          {/* ---- Buy box ---- */}
          <div className="product-info">
            <div className="product-info-header">
              {product?.category?.name && (
                <span className="product-category">{product.category.name}</span>
              )}
              <button
                type="button"
                className="share-btn"
                onClick={handleShare}
                aria-label="Share this product"
              >
                <FiShare2 aria-hidden="true" />
              </button>
            </div>

            <h1 className="product-title">
              {selectedVariant
                ? `${product?.name} (${selectedVariant?.attributes?.title})`
                : product?.name}
            </h1>

            {product?.totalRatings > 0 && (
              <div className="rating-summary">
                <span
                  className="stars"
                  role="img"
                  aria-label={`Rated ${product.averageRating} out of 5`}
                >
                  <span aria-hidden="true">
                    {"★".repeat(Math.round(product.averageRating))}
                    {"☆".repeat(
                      Math.max(0, 5 - Math.round(product.averageRating))
                    )}
                  </span>
                </span>
                <span className="rating">{product?.averageRating}</span>
                <a href="#reviews" className="reviews">
                  {product?.totalRatings} reviews
                </a>
              </div>
            )}

            <div className="section price">
              <div className="price-info">
                <span className="current">{inr.format(activeOfferPrice || 0)}</span>
                {discountPercent > 0 && (
                  <>
                    <span className="original">{inr.format(activePrice)}</span>
                    <span className="discount">{discountPercent}% off</span>
                  </>
                )}
              </div>

              <p className="stock-status">
                {isOutOfStock ? (
                  <span className="ui-badge ui-badge--error">
                    <FiAlertCircle aria-hidden="true" /> Out of stock
                  </span>
                ) : isLowStock ? (
                  <span className="ui-badge ui-badge--warning">
                    Only {activeStock} left
                  </span>
                ) : (
                  <span className="ui-badge ui-badge--success">
                    <FiCheckCircle aria-hidden="true" /> In stock
                  </span>
                )}
              </p>

              {buyButtons}
            </div>

            {product?.variants?.length > 0 && (
              <div className="section variants">
                <h2>Variants</h2>
                <div className="type-buttons" role="group" aria-label="Variants">
                  {product.variants.map((variant) => (
                    <button
                      type="button"
                      key={variant._id}
                      className={`type-btn ${selectedVariant?._id === variant._id ? "active" : ""
                        }`}
                      onClick={() => {
                        setSelectedVariant(variant);
                      }}
                      aria-pressed={selectedVariant?._id === variant._id}
                    >
                      <span className="variant-image">
                        <ProductImage src={variant?.images?.[0]} alt="" />
                      </span>
                      <span className="light-info">
                        <span className="variant-title">
                          {variant?.attributes?.title}
                        </span>
                        <span className="temp">
                          {inr.format(variant?.offerPrice || 0)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {description && (
              <div className="section description">
                <h2>Description</h2>
                <p>
                  {shownDescription}
                  {isTruncatable && (
                    <button
                      type="button"
                      className="read-more"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? "Show less" : "Read more"}
                    </button>
                  )}
                </p>
              </div>
            )}

            <div className="section reviews" id="reviews">
              <div className="reviews-header">
                <h2>Ratings &amp; reviews</h2>
                {isLoggedIn && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsRatingModalOpen(true)}
                  >
                    Rate this product
                  </Button>
                )}
              </div>

              {product?.totalRatings > 0 ? (
                <>
                  <div className="rating-container">
                    <div className="average-rating">
                      <span className="number">{product?.averageRating}</span>
                      <span className="stars" aria-hidden="true">
                        {"★".repeat(Math.round(product.averageRating))}
                      </span>
                      <span className="total-reviews">
                        {product?.totalRatings} reviews
                      </span>
                    </div>

                    <div className="rating-stats">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = product?.ratingDistribution?.[star] || 0;
                        const pct = product?.totalRatings
                          ? (count / product.totalRatings) * 100
                          : 0;
                        return (
                          <div className="rating-bar" key={star}>
                            <span>{star}★</span>
                            <span className="bar">
                              <span
                                className="fill"
                                style={{ width: `${pct}%` }}
                              />
                            </span>
                            <span className="count">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="reviews-list">
                    {visibleReviews?.map((review) => (
                      <article key={review?._id} className="review-item">
                        <div className="review-header">
                          <div className="user-info">
                            <Avatar
                              src={review?.userId?.image}
                              name={review?.userId?.username || "Customer"}
                              className="user-avatar"
                            />
                            <div className="user-details">
                              <span className="username">
                                {review.userId?.username || "Customer"}
                              </span>
                              <span className="date">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span
                            className="review-rating"
                            role="img"
                            aria-label={`${review?.rating} out of 5`}
                          >
                            <span aria-hidden="true">
                              {"★".repeat(review?.rating)}
                              {"☆".repeat(5 - review?.rating)}
                            </span>
                          </span>
                        </div>

                        {review?.image && (
                          <button
                            type="button"
                            className="review-image"
                            onClick={() => setPreviewImage(review.image)}
                            aria-label="View review photo"
                          >
                            <img src={review.image} alt="" loading="lazy" />
                          </button>
                        )}

                        <p className="review-comment">{review?.review}</p>
                      </article>
                    ))}

                    {reviews?.length > 2 && (
                      <button
                        type="button"
                        className="show-more"
                        onClick={() => setShowAllReviews(!showAllReviews)}
                      >
                        {showAllReviews
                          ? "Show fewer reviews"
                          : `Show all ${reviews.length} reviews`}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="reviews-empty">
                  No reviews yet.
                  {isLoggedIn
                    ? " Be the first to rate this product."
                    : " Log in to leave the first review."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        <section className="top-picks-section">
          <div className="section-header">
            <h2 className="section-heading">
              Top picks <span>for you</span>
            </h2>
            <div className="view-controls">
              <button
                type="button"
                className="view-all"
                onClick={() => navigate("/products")}
              >
                View all
              </button>
              <div className="navigation-buttons">
                <button
                  type="button"
                  className="nav-btn prev"
                  onClick={() => scroll("left")}
                  aria-label="Scroll left"
                >
                  <FiChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="nav-btn next"
                  onClick={() => scroll("right")}
                  aria-label="Scroll right"
                >
                  <FiChevronRight aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {isLoadingRelated ? (
            <ProductRailSkeleton />
          ) : relatedProducts.length > 0 ? (
            <div className="products-slider" ref={sliderRef}>
              {relatedProducts.map((related) => (
                <Card key={related._id} product={related} />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {/* Sticky mobile buy bar */}
      <div className="mobile-fixed-buttons">{buyButtons}</div>

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleSubmitReview}
        productId={product?._id}
        isSubmitting={isSubmittingReview}
      />

      {/* Lightbox */}
      {previewImage && (
        <div
          className="image-preview-overlay"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div className="image-preview-container">
            <img
              src={previewImage}
              alt=""
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              className="close-preview"
              onClick={() => setPreviewImage(null)}
              aria-label="Close preview"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetails() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={(error, info) => {
        console.error("Error caught by boundary:", error, info);
      }}
    >
      <ProductDetailsContent />
    </ErrorBoundary>
  );
}

export default ProductDetails;
