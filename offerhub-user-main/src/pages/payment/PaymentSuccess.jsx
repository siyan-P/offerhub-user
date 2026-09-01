import React, { useEffect } from "react";
import Animation from "../../components/paymentsuccessanimation/success.json";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCart } from "../../redux/features/cart/cartSlice";
import Button from "../../components/ui/Button";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCart([]));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dispatch]);

  return (
    <div className="payment-success-container">
      <div className="payment-success-icon" aria-hidden="true">
        <Lottie
          animationData={Animation}
          style={{ height: "12rem", width: "12rem" }}
          autoplay
          loop={false}
        />
      </div>

      <h1 className="payment-success-h2">Order confirmed</h1>
      <p className="payment-success-p">
        Thank you for your purchase. We've emailed your receipt and will let you
        know as soon as your order ships.
      </p>

      <div className="payment-success-buttons">
        <Button onClick={() => navigate("/products")}>Continue shopping</Button>
        <Button variant="secondary" onClick={() => navigate("/")}>
          Back to home
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
