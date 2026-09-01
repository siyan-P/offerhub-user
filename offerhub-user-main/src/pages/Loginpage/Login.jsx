import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useLogin } from "../../hooks/queries/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const validators = {
  email: (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "Enter your email or phone number";
    const isEmail = /\S+@\S+\.\S+/.test(trimmed);
    const isPhone = /^\d{10}$/.test(trimmed);
    if (!isEmail && !isPhone)
      return "Enter a valid email address or 10-digit phone number";
    return "";
  },
  password: (value) => (value ? "" : "Enter your password"),
};

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  // Only validate a field once the customer has left it, so the form doesn't
  // scold them mid-keystroke.
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: loginMutation, isPending } = useLogin();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validators[name](value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = {
      email: validators.email(formData.email),
      password: validators.password(formData.password),
    };

    setTouched({ email: true, password: true });
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    loginMutation(formData);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Log in to track orders and check out faster.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email or phone"
            name="email"
            type="text"
            autoComplete="username"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : ""}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ""}
            placeholder="Your password"
            required
            affix={
              <button
                type="button"
                className="ui-field__affix"
                onClick={() => setShowPassword((show) => !show)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            }
          />

          <Button
            type="submit"
            block
            size="lg"
            loading={isPending}
            loadingText="Logging in"
          >
            Continue
          </Button>

          <p className="terms-text">
            By continuing, you agree to our{" "}
            <Link to="/terms">Terms of Service</Link> and{" "}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </form>

        <div className="auth-alt">
          <span className="separator">New to OfferHub?</span>
          <Link to="/signup" className="ui-btn ui-btn--secondary ui-btn--block">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
