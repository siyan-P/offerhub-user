import React, { useEffect, useState } from "react";
import {
  FiMinus,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiShoppingBag,
  FiTag,
  FiAlertCircle,
} from "react-icons/fi";
import AddressModal from "../../components/cart/Addressmodal";
import {
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
} from "../../hooks/queries/cart";
import { toast } from "sonner";
import ConfirmationModal from "../../components/confirmationModal";
import { Link, useNavigate } from "react-router-dom";
import {
  useApplyCoupon,
  useGetCoupons,
  useRemoveCoupon,
} from "../../hooks/queries/coupon";
import cartService from "../../api/services/cartService";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import ProductImage from "../../components/ui/ProductImage";
import { CartSkeleton } from "../../components/ui/Skeleton";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function Cartpage() {
  const [couponCode, setCouponCode] = useState("");
  const [showCoupons, setShowCoupons] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [cart, setCart] = useState([]);
  const [couponDetails, setCouponDetails] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [gst] = useState(0);
  const [total, setTotal] = useState(0);
  // Which line is mid-flight, so only that row shows a pending treatment
  // instead of the whole page swapping to a loader.
  const [pendingItemId, setPendingItemId] = useState(null);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  const navigate = useNavigate();
  const { data: cartData, isLoading, isFetching, error, refetch } = useCart();
  const { mutate: updateQuantity } = useUpdateCartQuantity();
  const { mutate: removeFromCart, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: applyCoupon, isPending: isApplyingCoupon } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: isRemovingCoupon } =
    useRemoveCoupon();

  const {
    data: couponsData,
    isLoading: isCouponsLoading,
    error: couponsError,
  } = useGetCoupons();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (cartData?.data?.couponDetails) {
      setSelectedCoupon(cartData.data.couponDetails);
      setCouponCode(cartData.data.couponDetails.code);
    }
  }, [cartData?.data?.couponDetails]);

  useEffect(() => {
    if (cartData?.data) {
      setCart(cartData?.data?.formattedCart?.items || []);
      setCouponDetails(cartData?.data?.couponDetails || null);
      setSubtotal(cartData?.data?.formattedCart?.subTotal || 0);
      setDeliveryCharges(cartData?.data?.deliveryCharges || 0);
      setTotal(
        cartData?.data?.finalAmount ||
          cartData?.data?.formattedCart?.totalPrice ||
          0
      );
    }
    if (couponsData) {
      setAvailableCoupons(couponsData.coupons || []);
    }
  }, [cartData, couponsData]);

  // --- states ---------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="cart-page">
        <CartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <ErrorState
          error={error}
          onRetry={refetch}
          retrying={isFetching}
          title="We couldn't load your cart"
          description="Your items are safe. Retry and we'll fetch them again."
        />
      </div>
    );
  }

  // --- handlers -------------------------------------------------------------

  const handleQuantityUpdate = (productId, variantId, action, quantity) => {
    // Stepping below one is a removal, and removals get a confirmation.
    if (action === "decrement" && quantity === 1) {
      setItemToRemove({ productId, variantId });
      setShowConfirmModal(true);
      return;
    }

    setPendingItemId(productId);
    updateQuantity(
      { productId, variantId, action },
      { onSettled: () => setPendingItemId(null) }
    );
  };

  const handleRemoveItem = (productId, variantId) => {
    setItemToRemove({ productId, variantId });
    setShowConfirmModal(true);
  };

  const confirmRemoveItem = () => {
    if (!itemToRemove) return;
    setPendingItemId(itemToRemove.productId);
    removeFromCart(
      {
        productId: itemToRemove.productId,
        variantId: itemToRemove.variantId,
      },
      { onSettled: () => setPendingItemId(null) }
    );
  };

  const handleCouponSelect = (coupon) => {
    if (!Object.keys(couponDetails || {}).length) {
      setSelectedCoupon(coupon);
      setCouponCode(coupon.code);
    }
  };

  const handleApplyCoupon = () => {
    if (!selectedCoupon) {
      toast.error("Pick a coupon first");
      return;
    }
    applyCoupon(selectedCoupon?._id);
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
    setCouponCode("");
    removeCoupon();
  };

  const handleCheckAvailableStock = async () => {
    setIsCheckingStock(true);
    try {
      const response = await cartService.checkStock();
      if (response.success) {
        setIsAddressModalOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check stock");
    } finally {
      setIsCheckingStock(false);
    }
  };

  // --- empty ----------------------------------------------------------------

  if (!cartData?.data?.formattedCart?.items?.length) {
    return (
      <div className="cart-page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Cart</span>
        </nav>
        <EmptyState
          icon={<FiShoppingBag />}
          title="Your cart is empty"
          description="Browse the latest clearance deals and bestsellers, and anything you add will show up here."
          action={
            <Button onClick={() => navigate("/products")}>
              Continue shopping
            </Button>
          }
        />
      </div>
    );
  }

  const isCouponApplied =
    couponDetails && Object.keys(couponDetails).length > 0;

  return (
    <div className="cart-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Cart</span>
      </nav>

      <h1 className="cart-header">
        Shopping <span className="cart-header_span">Cart</span>
        <span className="cart-header_count">
          {cart?.length} {cart?.length === 1 ? "item" : "items"}
        </span>
      </h1>

      <div className="cart-container">
        <ul className="cart-items">
          {cart?.map((item) => {
            const productId = item?.product?._id;
            const isPending = pendingItemId === productId;
            const isSoldOut = item?.product?.stock === 0;

            return (
              <li
                key={`${productId}-${item?.variant?._id || "base"}`}
                className={`cart-item ${isPending ? "is-pending" : ""}`.trim()}
              >
                <Link
                  className="item-image"
                  to={`/products/${productId}`}
                  aria-label={item?.product?.name}
                >
                  <ProductImage
                    src={item?.product?.mainImage}
                    alt={item?.product?.name}
                  />
                </Link>

                <div className="item-details">
                  <h2 className="item-name">
                    <Link to={`/products/${productId}`}>
                      {item?.product?.name}
                    </Link>
                  </h2>

                  {item?.variant?.attributes?.title && (
                    <p className="item-variant">
                      {item.variant.attributes.title}
                    </p>
                  )}

                  {isSoldOut && (
                    <p className="ui-badge ui-badge--error item-stock">
                      <FiAlertCircle aria-hidden="true" /> Out of stock
                    </p>
                  )}

                  <div
                    className="quantity-controls"
                    role="group"
                    aria-label={`Quantity for ${item?.product?.name}`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityUpdate(
                          productId,
                          item?.variant?._id,
                          "decrement",
                          item?.quantity
                        )
                      }
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={14} aria-hidden="true" />
                    </button>
                    <span aria-live="polite">{item?.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityUpdate(
                          productId,
                          item?.variant?._id,
                          "increment",
                          item?.quantity
                        )
                      }
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="price-actions">
                  <div className="item-price">
                    {inr.format((item?.offerPrice || 0) * (item?.quantity || 1))}
                  </div>
                  {item?.quantity > 1 && (
                    <div className="item-unit-price">
                      {inr.format(item?.offerPrice || 0)} each
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    className="remove-item"
                    onClick={() =>
                      handleRemoveItem(productId, item?.variant?._id)
                    }
                    disabled={isRemoving && isPending}
                    aria-label={`Remove ${item?.product?.name} from cart`}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="order-summary" aria-label="Order summary">
          <div className="summary-details">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{inr.format(subtotal)}</span>
            </div>

            {isCouponApplied && (
              <div className="summary-row discount">
                <span>Discount</span>
                <span className="orange-text">
                  &minus; {inr.format(couponDetails?.discountAmount || 0)}
                  {couponDetails?.discountType === "percentage" && (
                    <span className="discount-percentage">
                      (
                      {(
                        (couponDetails?.discountAmount /
                          couponDetails?.originalAmount) *
                        100
                      ).toFixed(0)}
                      %)
                    </span>
                  )}
                </span>
              </div>
            )}

            <div className="summary-row">
              <span>Delivery</span>
              <span>
                {deliveryCharges === 0 ? "Free" : inr.format(deliveryCharges)}
              </span>
            </div>

            <div className="summary-row">
              <span>GST</span>
              <span>{inr.format(gst)}</span>
            </div>

            {isCouponApplied && (
              <div className="summary-row coupon-applied">
                <span>
                  Coupon <span className="coupon-code">{couponDetails?.code}</span>
                </span>
                <span className="savings">
                  You saved {inr.format(couponDetails?.savings || 0)}
                </span>
              </div>
            )}

            <div className="summary-row total">
              <span>Total</span>
              <span>{inr.format(total)}</span>
            </div>

            <Button
              block
              size="lg"
              className="proceed-btn"
              onClick={handleCheckAvailableStock}
              loading={isCheckingStock}
              loadingText="Checking stock"
            >
              Proceed to checkout
            </Button>
          </div>

          {isCouponsLoading && (
            <p className="inline-loader">Loading coupons…</p>
          )}

          {couponsError && (
            <p className="ui-field__error">
              <FiAlertCircle aria-hidden="true" />
              Coupons are unavailable right now.
            </p>
          )}

          {availableCoupons.length > 0 && (
            <>
              <div className="coupon-section">
                <h3>
                  <FiTag aria-hidden="true" /> Apply a coupon
                </h3>
                <div className="coupon-input">
                  <label className="visually-hidden" htmlFor="cart-coupon-code">
                    Selected coupon code
                  </label>
                  <input
                    id="cart-coupon-code"
                    className="ui-input"
                    type="text"
                    placeholder="Select a coupon below"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!isCouponApplied}
                    readOnly
                  />
                  {isCouponApplied ? (
                    <Button
                      variant="secondary"
                      onClick={handleRemoveCoupon}
                      loading={isRemovingCoupon}
                      loadingText="Removing"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode}
                      loading={isApplyingCoupon}
                      loadingText="Applying"
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>

              <div className="available-coupons">
                <button
                  type="button"
                  className="coupon-header"
                  onClick={() => setShowCoupons(!showCoupons)}
                  aria-expanded={showCoupons}
                  aria-controls="cart-coupon-list"
                >
                  <h3 className="coupon-header_title">
                    Available coupons ({availableCoupons.length})
                  </h3>
                  {showCoupons ? (
                    <FiChevronUp aria-hidden="true" />
                  ) : (
                    <FiChevronDown aria-hidden="true" />
                  )}
                </button>

                <div
                  id="cart-coupon-list"
                  className={`coupon-list ${showCoupons ? "show" : ""}`}
                  hidden={!showCoupons}
                >
                  {availableCoupons.map((coupon) => {
                    const lockedOut =
                      !!isCouponApplied && couponDetails?._id !== coupon?._id;

                    return (
                      <div
                        className={`coupon-item ${
                          couponDetails?._id === coupon?._id ? "applied" : ""
                        } ${lockedOut ? "is-disabled" : ""}`.trim()}
                        key={coupon?._id}
                      >
                        <label htmlFor={coupon?._id}>
                          <div className="coupon-item__head">
                            <input
                              type="radio"
                              name="coupon"
                              id={coupon?._id}
                              checked={selectedCoupon?._id === coupon?._id}
                              onChange={() => handleCouponSelect(coupon)}
                              disabled={lockedOut}
                            />
                            <strong>{coupon?.code}</strong>
                            {couponDetails?._id === coupon?._id && (
                              <span className="ui-badge ui-badge--success">
                                Applied
                              </span>
                            )}
                          </div>
                          <p>{coupon?.description}</p>
                          {coupon?.terms && (
                            <p className="terms">{coupon.terms}</p>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        cartItems={cart}
        totalAmount={total}
      />

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmRemoveItem}
        title="Remove item"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        cancelText="Keep"
        type="danger"
      />

      {/* Sticky mobile checkout bar — total stays visible while scrolling. */}
      <div className="cart-mobile-bar">
        <div className="cart-mobile-bar__total">
          <span>Total</span>
          <strong>{inr.format(total)}</strong>
        </div>
        <Button
          className="cart-mobile-bar__cta"
          onClick={handleCheckAvailableStock}
          loading={isCheckingStock}
          loadingText="Checking"
        >
          Proceed
        </Button>
      </div>
    </div>
  );
}

export default Cartpage;
