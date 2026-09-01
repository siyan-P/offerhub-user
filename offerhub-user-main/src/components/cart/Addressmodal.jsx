import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useUpdateUser } from "../../hooks/queries/user";
import { toast } from "sonner";
import userService from "../../api/services/userService";
import { setUser } from "../../redux/features/user/userSlice";
import apiClient from "../../api/client";
import RenderRazorpay from "../Razorpay/RenderRazorpay";
import { useNavigate } from "react-router-dom";
import { useClearCart } from "../../hooks/queries/cart";
import Button from "../ui/Button";
import Input from "../ui/Input";

const EMPTY_FORM = {
  fullName: "",
  building: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  saveAddress: false,
};

const MAX_SAVED_ADDRESSES = 3;

// Per-field rules, so errors sit next to the input that caused them instead of
// arriving one at a time as a toast.
const FIELD_RULES = {
  fullName: (v) =>
    !v || v.trim().length < 2 ? "Enter the recipient's full name" : "",
  building: (v) =>
    !v || v.trim().length < 3 ? "Enter the house or apartment name" : "",
  street: (v) => (!v || v.trim().length < 3 ? "Enter the street address" : ""),
  city: (v) => (!v || v.trim().length < 2 ? "Enter the city" : ""),
  state: (v) => (!v || v.trim().length < 2 ? "Enter the state" : ""),
  pincode: (v) => (/^\d{6}$/.test(v || "") ? "" : "Pincode must be 6 digits"),
};

const validateForm = (form) =>
  Object.fromEntries(
    Object.entries(FIELD_RULES)
      .map(([field, rule]) => [field, rule(form[field])])
      .filter(([, message]) => message)
  );

const AddressModal = ({
  isOpen,
  onClose,
  mode = "cart",
  cartItems = [],
  totalAmount = 0,
}) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const [selectedAddress, setSelectedAddress] = useState({});
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [orderDetails, setOrderDetails] = useState({});
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [isSelectingPayment, setIsSelectingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [onOrderPending, setOnOrderPending] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  const { mutate: clearCart } = useClearCart();
  const { mutate: updateUser, isPending: isUpdatePending } = useUpdateUser();

  const savedAddresses = user?.address || [];
  const hasSelection = Object.keys(selectedAddress).length > 0;
  const atSaveLimit = savedAddresses.length >= MAX_SAVED_ADDRESSES;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await userService.getAuthUser();
        if (!cancelled) dispatch(setUser(response.user));
      } catch {
        // Fall back to the persisted user; not worth blocking checkout.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const closeModal = useCallback(() => {
    onClose();
    setIsSelectingPayment(false);
    setSelectedAddress({});
    setErrors({});
    setTouched({});
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    document.body.classList.add("modal-open");
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeModal]);

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    const nextValue = name === "saveAddress" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));

    if (touched[name] && FIELD_RULES[name]) {
      setErrors((prev) => ({ ...prev, [name]: FIELD_RULES[name](nextValue) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!FIELD_RULES[name]) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: FIELD_RULES[name](value) }));
  };

  const markAllTouched = () =>
    setTouched(
      Object.fromEntries(Object.keys(FIELD_RULES).map((field) => [field, true]))
    );

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
    setTouched({});
  };

  /** Profile mode: save a new address to the account. */
  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validateForm(formData);
    markAllTouched();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateUser(
      { ...user, address: formData },
      {
        onSuccess: () => {
          toast.success("Address saved");
          resetForm();
          onClose();
        },
        onError: (error) => {
          toast.error(
            error.response?.data?.message || "Couldn't save that address"
          );
        },
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === "") {
      toast.warning("Choose a payment method to continue");
      return;
    }

    setOnOrderPending(true);
    try {
      const nextErrors = hasSelection ? {} : validateForm(formData);
      if (Object.keys(nextErrors).length > 0) {
        markAllTouched();
        setErrors(nextErrors);
        toast.warning("Select an address or complete every required field");
        setIsSelectingPayment(false);
        return;
      }

      if (paymentMethod === "online") {
        const response = await apiClient.post(`/order/paymentIntent`);
        if (response?.data?.order_id) {
          setOrderDetails({
            orderId: response.data.order_id,
            currency: response.data.currency,
            amount: response.data.amount,
          });
          setDisplayRazorpay(true);
        }
      } else {
        const response = await apiClient.post(`/order/placeOrder`, {
          address: hasSelection ? selectedAddress : formData,
          paymentMethod,
          amount: orderDetails.amount,
        });

        if (response?.data?.success) {
          navigate("/payment-success");
          onClose();
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setOnOrderPending(false);
      setIsSelectingPayment(false);
    }
  };

  /** Cart mode: hand the order off to WhatsApp and clear the basket. */
  const handleAddressSelection = () => {
    const nextErrors = hasSelection ? {} : validateForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      markAllTouched();
      setErrors(nextErrors);
      toast.warning("Select a saved address or complete every field");
      return;
    }

    setIsContinuing(true);

    const address = hasSelection ? selectedAddress : formData;

    const addressText = `
Name: ${address?.fullName}
Address: ${address?.building || ""}, ${address?.street}, ${address?.landmark || ""}
${address?.city}, ${address?.state} - ${address?.pincode}
    `.trim();

    const productLines = cartItems
      .map(
        (item) =>
          `${item.product.name} x ${item.quantity}\n      \n      product id :${item.product._id}`
      )
      .join("\n");

    const message = `
🛒 *New Order*

📦 *Products*:
${productLines}


💰 *Total*: ₹${totalAmount}

🏠 *Delivery Address*:
${addressText}
    `.trim();

    window.open(
      `https://wa.me/+919567359906?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );

    clearCart();
    setIsContinuing(false);
    onClose();
  };

  const fieldProps = (name, label, extra = {}) => ({
    label,
    name,
    value: formData[name],
    onChange: handleInputChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : "",
    disabled: hasSelection,
    ...extra,
  });

  return (
    <div className={`address-modal ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="address-modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="address-modal-title">
              {isSelectingPayment ? "Payment" : "Delivery address"}
            </h2>
            {mode === "cart" && (
              <ol className="checkout-steps" aria-label="Checkout progress">
                <li className={!isSelectingPayment ? "current" : "done"}>
                  <span className="checkout-steps__marker">
                    {isSelectingPayment ? <FiCheck aria-hidden="true" /> : 1}
                  </span>
                  Address
                </li>
                <li className={isSelectingPayment ? "current" : ""}>
                  <span className="checkout-steps__marker">2</span>
                  Confirm
                </li>
              </ol>
            )}
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={closeModal}
            aria-label="Close"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          {isSelectingPayment && mode === "cart" ? (
            <>
              <p className="subtitle">How would you like to pay?</p>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className="payment-option__body">
                  <strong>Cash on delivery</strong>
                  <span>Cash, UPI and cards are accepted on delivery</span>
                </span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                <span className="payment-option__body">
                  <strong>Pay online</strong>
                  <span>UPI, net banking, debit or credit card</span>
                  <span className="ui-badge ui-badge--success">
                    Extra 5% off
                  </span>
                </span>
              </label>
            </>
          ) : (
            <>
              {mode === "cart" && savedAddresses.length > 0 && (
                <>
                  <p className="subtitle">
                    Pick a saved address, or enter a new one below.
                  </p>

                  <div className="address-options">
                    {savedAddresses.map((addr) => {
                      const isChosen = selectedAddress?._id === addr?._id;
                      return (
                        <label
                          key={addr?._id}
                          className={`address-option ${isChosen ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={addr?._id}
                            checked={isChosen}
                            onChange={() => {
                              // Re-picking the chosen address clears it, which
                              // re-enables the manual form below.
                              setSelectedAddress(isChosen ? {} : addr);
                              resetForm();
                            }}
                            onClick={() => {
                              if (isChosen) setSelectedAddress({});
                            }}
                          />
                          <span className="address-details">
                            <strong>{addr?.fullName}</strong>
                            <address>
                              {[addr?.building, addr?.street, addr?.landmark]
                                .filter(Boolean)
                                .join(", ")}
                              <br />
                              {[addr?.city, addr?.state, addr?.pincode]
                                .filter(Boolean)
                                .join(", ")}
                            </address>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="divider">
                    <span>or</span>
                  </div>
                </>
              )}

              <h3 className="manual-entry-title">
                {mode === "profile" ? "New address" : "Enter a new address"}
              </h3>

              <form className="address-form" onSubmit={handleSubmit} noValidate>
                <Input {...fieldProps("fullName", "Full name")} required />
                <Input
                  {...fieldProps("building", "House / apartment")}
                  required
                />
                <Input {...fieldProps("street", "Street address")} required />
                <Input {...fieldProps("landmark", "Landmark (optional)")} />

                <div className="form-row">
                  <Input {...fieldProps("city", "City")} required />
                  <Input {...fieldProps("state", "State")} required />
                </div>

                <Input
                  {...fieldProps("pincode", "Pincode", {
                    inputMode: "numeric",
                    maxLength: 6,
                  })}
                  required
                />
              </form>
            </>
          )}
        </div>

        <div className="modal-footer">
          {mode === "cart" && !isSelectingPayment && (
            <label className="save-address">
              <input
                type="checkbox"
                name="saveAddress"
                checked={formData.saveAddress}
                onChange={handleInputChange}
                disabled={atSaveLimit || hasSelection}
              />
              {atSaveLimit
                ? `You've saved ${MAX_SAVED_ADDRESSES} addresses — remove one in your profile to save another`
                : "Save this address for next time"}
            </label>
          )}

          {mode === "cart" && !isSelectingPayment && (
            <Button
              block
              size="lg"
              className="proceed-btn"
              onClick={handleAddressSelection}
              loading={isContinuing}
              loadingText="Opening WhatsApp"
            >
              Continue
            </Button>
          )}

          {mode === "profile" && !isSelectingPayment && (
            <Button
              block
              size="lg"
              className="proceed-btn"
              onClick={handleSubmit}
              loading={isUpdatePending}
              loadingText="Saving"
            >
              Save address
            </Button>
          )}

          {isSelectingPayment && (
            <Button
              block
              size="lg"
              className="proceed-btn"
              onClick={handlePlaceOrder}
              loading={onOrderPending}
              loadingText="Placing order"
              disabled={!paymentMethod}
            >
              Confirm payment
            </Button>
          )}
        </div>
      </div>

      {displayRazorpay && (
        <RenderRazorpay
          orderId={orderDetails.orderId}
          keyId={import.meta.env.VITE_RAZORPAY_KEY_ID}
          keySecret={import.meta.env.VITE_RAZORPAY_KEY_SECRET}
          currency={orderDetails.currency}
          amount={orderDetails.amount}
          address={hasSelection ? selectedAddress : formData}
          setDisplayRazorpay={setDisplayRazorpay}
          onCancel={() => {
            setDisplayRazorpay(false);
            setIsSelectingPayment(false);
            setOnOrderPending(false);
          }}
        />
      )}
    </div>
  );
};

export default AddressModal;
