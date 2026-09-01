import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiUser, FiMapPin, FiHeadphones } from "react-icons/fi";
import SavedAddress from "./SavedAddress";
import HelpandSupport from "./HelpandSupport";
import { useDispatch, useSelector } from "react-redux";
import userService from "../../api/services/userService";
import { setUser } from "../../redux/features/user/userSlice";
import { toast } from "sonner";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const TABS = [
  { id: "personal-info", label: "Personal info", icon: <FiUser /> },
  { id: "saved-address", label: "Saved addresses", icon: <FiMapPin /> },
  { id: "help-support", label: "Help & support", icon: <FiHeadphones /> },
];

const Profile = () => {
  const user = useSelector((state) => state.user.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("personal-info");
  const [formData, setFormData] = useState({
    name: user?.username || "",
    phone: user?.phonenumber || "",
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await userService.getAuthUser();
        if (!cancelled) dispatch(setUser(response.user));
      } catch {
        // The persisted user is still shown; a refresh failure isn't fatal here.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && TABS.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Keep the form in step with the user record once it refreshes.
  useEffect(() => {
    setFormData({
      name: user?.username || "",
      phone: user?.phonenumber || "",
    });
  }, [user?.username, user?.phonenumber]);

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!/^\d{10}$/.test(formData.phone || ""))
      next.phone = "Enter a 10-digit phone number";
    return next;
  };

  const isUnchanged =
    formData.name.trim() === (user?.username || "") &&
    formData.phone.trim() === (user?.phonenumber || "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (isUnchanged) {
      toast.info("Nothing to save — no changes made");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await userService.updateUser({
        username: formData.name.trim(),
        phonenumber: formData.phone.trim(),
      });
      dispatch(setUser(updated));
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't save your profile");
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal-info":
        return (
          <section className="personal-info-section">
            <h2>
              Welcome, <span className="username">{user?.username}</span>
            </h2>
            <p className="subtitle">
              Keep your contact details current so we can reach you about orders.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <Input
                label="Name"
                required
                value={formData.name}
                error={errors.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <Input
                label="Phone number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={formData.phone}
                error={errors.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              {user?.email && (
                <Input
                  label="Email address"
                  value={user.email}
                  disabled
                  hint="Contact support to change your email."
                  readOnly
                />
              )}

              <div className="form-footer">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setFormData({
                      name: user?.username || "",
                      phone: user?.phonenumber || "",
                    })
                  }
                  disabled={isUnchanged}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSaving}
                  loadingText="Saving"
                  disabled={isUnchanged}
                >
                  Save changes
                </Button>
              </div>
            </form>
          </section>
        );

      case "saved-address":
        return <SavedAddress />;

      case "help-support":
        return <HelpandSupport />;

      default:
        return null;
    }
  };

  return (
    <div className="profile-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">My account</span>
      </nav>

      <div className="profile-container">
        <nav className="sidebar" aria-label="Account sections">
          <ul>
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  className={activeTab === tab.id ? "active" : ""}
                  onClick={() => selectTab(tab.id)}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="profile-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Profile;
