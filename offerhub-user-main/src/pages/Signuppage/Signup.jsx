import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";
import { useSignup } from "../../hooks/queries/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const validators = {
  fullname: (value) =>
    value.trim().length < 3 ? "Full name must be at least 3 characters" : "",
  phonenumber: (value) =>
    /^\d{10}$/.test(value) ? "" : "Enter a 10-digit phone number",
  email: (value) =>
    /\S+@\S+\.\S+/.test(value) ? "" : "Enter a valid email address",
  password: (value) =>
    value.length < 8 ? "Password must be at least 8 characters" : "",
};

const EMPTY = {
  fullname: "",
  phonenumber: "",
  email: "",
  password: "",
};

function Signup() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signupMutation, isPending } = useSignup();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
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

    const nextErrors = Object.fromEntries(
      Object.entries(validators).map(([field, validate]) => [
        field,
        validate(values[field]),
      ])
    );

    setTouched({
      fullname: true,
      phonenumber: true,
      email: true,
      password: true,
    });
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    signupMutation(
      {
        username: values.fullname.trim(),
        phonenumber: values.phonenumber,
        email: values.email.trim(),
        password: values.password,
      },
      {
        onSuccess: () => setValues(EMPTY),
        onError: (error) => {
          toast.error(error.response?.data?.message || "Signup failed");
        },
      }
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          It takes a minute, and checkout gets a lot faster.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Full name"
            name="fullname"
            autoComplete="name"
            value={values.fullname}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.fullname ? errors.fullname : ""}
            placeholder="Your name"
            required
          />

          <Input
            label="Phone number"
            name="phonenumber"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            value={values.phonenumber}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phonenumber ? errors.phonenumber : ""}
            hint="We'll only use this for order updates."
            placeholder="10-digit number"
            required
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
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
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ""}
            hint="At least 8 characters."
            placeholder="Create a password"
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
            loadingText="Creating account"
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
          <span className="separator">Already have an account?</span>
          <Link to="/login" className="ui-btn ui-btn--secondary ui-btn--block">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
