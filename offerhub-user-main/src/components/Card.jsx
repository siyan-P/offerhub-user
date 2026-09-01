import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAddToCart } from "../hooks/queries/cart";
import ProductImage from "./ui/ProductImage";
import Button from "./ui/Button";

/** `12%` / `12` / `₹200 off` all arrive from the API — normalise for display. */
function formatDiscountTag(discount) {
  if (discount === null || discount === undefined || discount === "") return null;
  const raw = String(discount).trim();
  return /^\d+(\.\d+)?$/.test(raw) ? `${raw}% OFF` : raw;
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function Stars({ rating }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <span
      className="product-card__stars"
      role="img"
      aria-label={`Rated ${Number(rating).toFixed(1)} out of 5`}
    >
      <span aria-hidden="true">
        {"★".repeat(rounded)}
        {"☆".repeat(Math.max(0, 5 - rounded))}
      </span>
    </span>
  );
}

function Card({ product, eagerImage = false }) {
  const navigate = useNavigate();
  const { mutate: addToCart, isPending: isAddingToCart } = useAddToCart();

  if (!product) return null;

  const {
    mainImage,
    category,
    name,
    offerPrice,
    price,
    averageRating = 0,
    discount,
    _id,
    variants = [],
    stock,
  } = product;

  const isOutOfStock = stock === 0;
  const hasSaving = Number(price) > Number(offerPrice);
  const discountTag = formatDiscountTag(discount);
  const goToProduct = () => navigate(`/products/${_id}`);

  const handleQuickAdd = (event) => {
    // The whole card is clickable; the quick-add must not also open the PDP.
    event.stopPropagation();
    addToCart({
      productId: _id,
      variantId: variants[0]?._id || null,
      quantity: 1,
    });
  };

  return (
    <article
      className={`product-card ${isOutOfStock ? "is-out-of-stock" : ""}`.trim()}
    >
      <div className="product-card__media">
        <ProductImage
          src={mainImage}
          alt={name}
          eager={eagerImage}
          className="product-card__image"
        />

        {discountTag && !isOutOfStock && (
          <span className="product-card__discount">{discountTag}</span>
        )}

        {isOutOfStock && (
          <span className="product-card__stock-veil">Out of stock</span>
        )}

        {!isOutOfStock && (
          <Button
            variant="primary"
            size="sm"
            className="product-card__quick-add"
            onClick={handleQuickAdd}
            loading={isAddingToCart}
            aria-label={`Add ${name} to cart`}
            leadingIcon={<FiShoppingCart aria-hidden="true" />}
          >
            Add
          </Button>
        )}
      </div>

      <div className="product-card__body">
        {category?.name && (
          <span className="product-card__category">{category.name}</span>
        )}

        {/* The heading link is the card's single accessible name and the
            keyboard target; the ::after below stretches it over the card. */}
        <h3 className="product-card__title">
          <a
            href={`/products/${_id}`}
            onClick={(event) => {
              event.preventDefault();
              goToProduct();
            }}
            title={name}
          >
            {name}
          </a>
        </h3>

        <div className="product-card__price">
          <span className="product-card__price-now">{inr.format(offerPrice ?? 0)}</span>
          {hasSaving && (
            <span className="product-card__price-was">{inr.format(price)}</span>
          )}
        </div>

        <div className="product-card__meta">
          {averageRating > 0 ? (
            <>
              <Stars rating={averageRating} />
              <span className="product-card__rating-value">
                {Number(averageRating).toFixed(1)}
              </span>
            </>
          ) : (
            <span className="product-card__rating-empty">No reviews yet</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default Card;
