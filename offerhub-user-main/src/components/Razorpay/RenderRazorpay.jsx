import { useEffect, useRef } from "react";
import apiClient from "../../api/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// Function to load script and append in DOM tree.
const loadScript = (src) =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      console.log("razorpay loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.log("error in loading razorpay");
      resolve(false);
    };
    document.body.appendChild(script);
  });

const RenderRazorpay = ({
  orderId,
  keyId,
  keySecret,
  currency,
  amount,
  address,
  setDisplayRazorpay,
  onCancel,
}) => {
  const navigate = useNavigate();
  const paymentId = useRef(null);
  const paymentMethod = useRef(null);

  // To load razorpay checkout modal script.
  const displayRazorpay = async (options) => {
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      console.log("Razorpay SDK failed to load. Are you online?");
      return;
    }
    // All information is loaded in options which we will discuss later.
    const rzp1 = new window.Razorpay(options);

    // If you want to retreive the chosen payment method.
    rzp1.on("payment.submit", (response) => {
      paymentMethod.current = response.method;
    });

    // To get payment id in case of failed transaction.
    rzp1.on("payment.failed", (response) => {
      paymentId.current = response.error.metadata.payment_id;
    });

    // to open razorpay checkout modal.
    rzp1.open();
  };

  // informing server about payment
  const handlePayment = async (status, orderDetails) => {
    if (status === "succeeded") {
      try {
        toast.success("Order placed successfully!");
        navigate("/payment-success");
        // Handle successful order (e.g., redirect to order confirmation)
      } catch (e) {
        toast.error("Payment verification failed");
        onCancel();
        // Handle verification failure
      }
    } else if (status === "failed") {
      toast.error("payment failed");
      setDisplayRazorpay(false);
    } else if (status === "cancelled") {
      toast.error("payment cancelled");
      setDisplayRazorpay(false);
      onCancel();
    }
  };

  // we will be filling this object in next step.
  const options = {
    key: keyId, // key id from props
    amount, // Amount in lowest denomination from props
    currency, // Currency from props.
    name: "Mill Store", // Title for your organization to display in checkout modal
    // image, // custom logo  url
    order_id: orderId, // order id from props
    // This handler menthod is always executed in case of succeeded payment
    handler: async (response) => {
      paymentId.current = response.razorpay_payment_id;

      const verificationResponse = await apiClient.post(
        "/order/paymentVerify",
        {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          address: address,
          amount: amount / 100,
        }
      );

      if (verificationResponse.data.success) {
        handlePayment("succeeded", response);
      } else {
        handlePayment("failed", response);
      }
    },
    modal: {
      confirm_close: true, // this is set to true, if we want confirmation when clicked on cross button.
      // This function is executed when checkout modal is closed
      // There can be 3 reasons when this modal is closed.
      ondismiss: async (reason) => {
        const {
          reason: paymentReason,
          field,
          step,
          code,
        } = reason && reason.error ? reason.error : {};
        // Reason 1 - when payment is cancelled. It can happend when we click cross icon or cancel any payment explicitly.
        if (reason === undefined) {
          handlePayment("cancelled");
        } else if (reason === "timeout") {
          handlePayment("timedout");
        } else {
          handlePayment("failed", {
            paymentReason,
            field,
            step,
            code,
          });
        }
      },
    },
    // This property allows to enble/disable retries.
    // This is enabled true by default.

    timeout: 900, // Time limit in Seconds
    theme: {
      color: "#ffb64a", // Custom color for your checkout modal.
    },
  };

  useEffect(() => {
    displayRazorpay(options);
  }, []);

  return null;
};

export default RenderRazorpay;
