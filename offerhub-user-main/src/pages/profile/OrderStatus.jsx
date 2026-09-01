import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { useUpdateOrderStatus } from "../../hooks/queries/order";
import ConfirmationModal from "../../components/confirmationModal";
import Button from "../../components/ui/Button";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const OrderStatus = ({ isOpen, onClose, order }) => {
  // Hooks run unconditionally: the early `if (!isOpen) return null` used to sit
  // above them, which violates the rules of hooks.
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const { mutate: updateOrderStatus, isPending } = useUpdateOrderStatus();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleConfirmCancelOrder = () => {
    updateOrderStatus(order._id);
    setIsConfirmationModalOpen(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-status-title"
    >
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="order-header">
          <h2 id="order-status-title">Order status</h2>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="order-body">
          <dl className="order-info">
            <div>
              <dt>Order</dt>
              <dd>#{order._id}</dd>
            </div>
            <div>
              <dt>Placed</dt>
              <dd>{new Date(order.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt>Expected delivery</dt>
              <dd>{new Date(order.expectedDelivery).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{order.paymentMethod}</dd>
            </div>
            <div className="order-info__total">
              <dt>Total</dt>
              <dd>{inr.format(order.totalAmount || 0)}</dd>
            </div>
          </dl>

          <ul className="order-products">
            {order?.products?.map((product, index) => (
              <li className="order-product-info" key={index}>
                <img
                  src={
                    product?.variantId
                      ? product?.variantId?.images?.[0]
                      : product?.productId?.images?.[0]
                  }
                  alt=""
                  loading="lazy"
                />
                <div>
                  <h3>{product?.productId?.name}</h3>
                  <p>Qty {product?.quantity}</p>
                </div>
                <p className="price">{inr.format(product.price || 0)}</p>
              </li>
            ))}
          </ul>

          <div className="track-order">
            <h3>Tracking</h3>
            <ul>
              <li>
                <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
                <span className={`status-tag ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
              </li>
            </ul>
          </div>

          <div className="delivery-address">
            <h3>Delivery address</h3>
            <address>
              {order?.deliveryAddress?.fullName}
              <br />
              {[
                order?.deliveryAddress?.houseNo,
                order?.deliveryAddress?.street,
                order?.deliveryAddress?.city,
                order?.deliveryAddress?.state,
                order?.deliveryAddress?.pincode,
              ]
                .filter(Boolean)
                .join(", ")}
              {order?.deliveryAddress?.phone && (
                <>
                  <br />
                  {order.deliveryAddress.phone}
                </>
              )}
            </address>
          </div>

          {order?.status === "pending" && (
            <div className="order-actions">
              <Button
                variant="destructive"
                onClick={() => setIsConfirmationModalOpen(true)}
                loading={isPending}
                loadingText="Cancelling"
              >
                Cancel order
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmCancelOrder}
        title="Cancel order"
        message="This order will be cancelled. You can place a new one at any time."
        confirmText="Cancel order"
        cancelText="Keep order"
        type="danger"
      />
    </div>
  );
};

export default OrderStatus;
