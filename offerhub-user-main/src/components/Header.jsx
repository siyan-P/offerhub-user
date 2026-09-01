import React, { useState, useRef, useEffect } from "react";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiX,
  FiMenu,
  FiChevronRight,
  FiMapPin,
  FiHeadphones,
  FiLogOut,
} from "react-icons/fi";
import { Drawer } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/features/user/userSlice";
import { useCategories } from "../hooks/queries/categories";
import { useSearchProducts } from "../hooks/queries/products";
import { setCategory } from "../redux/features/category/categorySlice";
import { setCart } from "../redux/features/cart/cartSlice";
import { useCart } from "../hooks/queries/cart";
import { storeRedirectPath } from "../utils/redirectUtils";
import Spinner from "./ui/Spinner";
import Avatar from "./ui/Avatar";

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart.cart);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const user = useSelector((state) => state.user.user);
  const activeCategory = useSelector((state) => state.category.category);

  useCart(); // keeps the Redux cart mirror in sync for the badge

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileCatOpen, setIsMobileCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.envelop?.data || [];

  // Debounce so keystrokes don't each fire a request.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchData, isFetching: isSearching } =
    useSearchProducts(debouncedQuery);

  const searchResults = debouncedQuery ? searchData?.data?.products || [] : [];

  const cartCount = isLoggedIn ? cart?.items?.length || 0 : 0;

  // Move focus into the mobile search field as soon as it opens.
  useEffect(() => {
    if (isSearchOpen) mobileSearchRef.current?.focus();
  }, [isSearchOpen]);

  // Escape closes whichever overlay is open.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setIsUserMenuOpen(false);
      setIsSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close the account menu on outside click.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUserMenu = () => {
    if (isLoggedIn) {
      setIsUserMenuOpen((open) => !open);
    } else {
      navigate("/login");
    }
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    localStorage.removeItem("user-auth-token");
    try {
      localStorage.removeItem("redirectAfterLogin");
    } catch (error) {
      console.error("Error clearing redirect path on logout:", error);
    }
    dispatch(logout());
    dispatch(setCart([]));
    navigate("/login");
  };

  const handleCategoryClick = (category) => {
    dispatch(setCategory(category?._id || "all"));
    setIsMobileCatOpen(false);
    navigate("/products", {
      state: {
        selectedCategory: { id: category._id, name: category.name },
      },
    });
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    closeSearch();
  };

  const handleCartNavigation = () => {
    const token = localStorage.getItem("user-auth-token");
    if (!token || token === "undefined" || token === "") {
      storeRedirectPath("/cart");
      navigate("/login");
    } else {
      navigate("/cart");
    }
  };

  const renderResults = (variant) => {
    if (!debouncedQuery) return null;

    if (isSearching) {
      return (
        <div className={`search-results search-results--${variant}`}>
          <p className="search-results__status">
            <Spinner /> Searching…
          </p>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className={`search-results search-results--${variant}`}>
          <p className="search-results__status">
            No matches for “{debouncedQuery}”
          </p>
        </div>
      );
    }

    return (
      <div
        className={`search-results search-results--${variant}`}
        role="listbox"
        aria-label="Search results"
      >
        {searchResults.map((product) => (
          <button
            type="button"
            role="option"
            aria-selected="false"
            key={product?._id}
            className="search-result-item"
            onClick={() => handleProductClick(product?._id)}
          >
            <img
              className="search-result-image"
              src={product?.mainImage}
              alt=""
              loading="lazy"
            />
            <span className="search-result-name">{product?.name}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {/* Header and category rail stick as one unit, so the rail can't drift
          out of alignment with a header whose height changes. */}
      <div className="header-shell">
        <header className="header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-hamburger"
              onClick={() => setIsMobileCatOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={22} aria-hidden="true" />
            </button>

            <Link to="/" className="header-logo" aria-label="OfferHub home">
              <img
                src="/logo/OfferHub.png"
                alt="OfferHub"
                className="header-logo-img"
              />
            </Link>
          </div>

          <div className="header-search desktop-search">
            <div className="search-container">
              <FiSearch className="search-icon" aria-hidden="true" />
              <label className="visually-hidden" htmlFor="header-search">
                Search products
              </label>
              <input
                id="header-search"
                type="search"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                ref={searchRef}
                className="search-input"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <FiX aria-hidden="true" />
                </button>
              )}
            </div>
            {renderResults("desktop")}
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-actions-item mobile-search-icon"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <FiSearch className="icon" aria-hidden="true" />
            </button>

            <div
              className="header-actions-item user-menu-container desktop-only"
              ref={userMenuRef}
            >
              <button
                type="button"
                className="user-menu-item"
                onClick={toggleUserMenu}
                aria-expanded={isLoggedIn ? isUserMenuOpen : undefined}
                aria-haspopup={isLoggedIn ? "menu" : undefined}
              >
                <FiUser className="icon" aria-hidden="true" />
                <span className="user-menu-item-text">
                  <strong>{isLoggedIn ? "Account" : "Log in"}</strong>
                  <span>{isLoggedIn ? user?.username : "Get started"}</span>
                </span>
              </button>

              {isUserMenuOpen && isLoggedIn && (
                <div className="user-menu active" role="menu">
                  <Link
                    to="/profile?tab=personal-info"
                    className="user-menu-header"
                    onClick={() => setIsUserMenuOpen(false)}
                    role="menuitem"
                  >
                    <Avatar name={user?.username} className="user-avatar" />
                    <span className="user-info">
                      <strong>{user?.username}</strong>
                      <span>{user?.email}</span>
                    </span>
                    <FiChevronRight className="arrow-icon" aria-hidden="true" />
                  </Link>

                  <div className="user-menu-items">
                    <Link
                      to="/profile?tab=saved-address"
                      className="menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <FiMapPin className="menu-icon" aria-hidden="true" />
                      <span>Saved addresses</span>
                    </Link>
                    <Link
                      to="/profile?tab=help-support"
                      className="menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                      role="menuitem"
                    >
                      <FiHeadphones className="menu-icon" aria-hidden="true" />
                      <span>Help &amp; support</span>
                    </Link>
                    <button
                      type="button"
                      className="menu-item logout"
                      onClick={handleLogout}
                      role="menuitem"
                    >
                      <FiLogOut className="menu-icon" aria-hidden="true" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="header-actions-item cart-button"
              onClick={handleCartNavigation}
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            >
              <span className="cart-icon-item">
                <FiShoppingCart className="icon" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="cart-badge" aria-hidden="true">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Mobile search overlay */}
          <div
            className={`mobile-search-overlay ${isSearchOpen ? "active" : ""}`}
          >
            <div className="mobile-search-container">
              <FiSearch className="search-icon" aria-hidden="true" />
              <label className="visually-hidden" htmlFor="mobile-search">
                Search products
              </label>
              <input
                id="mobile-search"
                ref={mobileSearchRef}
                type="search"
                placeholder="Search products"
                className="mobile-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className="mobile-search-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <FiX className="icon" aria-hidden="true" />
              </button>
            </div>
            {renderResults("mobile")}
          </div>
        </header>

        {categories.length > 0 && (
          <nav className="header-cat" aria-label="Categories">
            <button
              type="button"
              onClick={() => handleCategoryClick("all")}
              className={activeCategory === "all" ? "header-cat-active" : ""}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category?._id}
                onClick={() => handleCategoryClick(category)}
                className={
                  activeCategory === category?._id ? "header-cat-active" : ""
                }
              >
                {category?.name}
              </button>
            ))}
          </nav>
        )}
      </div>

      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setIsMobileCatOpen(false)}
        open={isMobileCatOpen}
        width={300}
        styles={{
          body: { padding: 16 },
          header: { borderBottom: "1px solid #e7e9ec", padding: "16px 20px" },
        }}
      >
        <div className="mobile-drawer-content">
          <div className="mobile-account-section">
            {isLoggedIn ? (
              <button
                type="button"
                className="mobile-user-info"
                onClick={() => {
                  navigate("/profile?tab=personal-info");
                  setIsMobileCatOpen(false);
                }}
              >
                <Avatar
                  name={user?.username}
                  size="2.75rem"
                  className="mobile-user-avatar"
                />
                <span className="mobile-user-details">
                  <strong>{user?.username}</strong>
                  <span>{user?.email}</span>
                </span>
                <FiChevronRight aria-hidden="true" />
              </button>
            ) : (
              <div className="mobile-login-prompt">
                <FiUser className="login-icon" aria-hidden="true" />
                <div>
                  <strong>Welcome</strong>
                  <p>Log in to track orders and save addresses</p>
                </div>
                <button
                  type="button"
                  className="ui-btn ui-btn--primary ui-btn--sm mobile-login-btn"
                  onClick={() => {
                    setIsMobileCatOpen(false);
                    navigate("/login");
                  }}
                >
                  Log in
                </button>
              </div>
            )}
          </div>

          <div className="mobile-categories-section">
            <h3>Categories</h3>
            <div className="mobile-categories-list">
              <button
                type="button"
                className={`category-list-item ${
                  activeCategory === "all" ? "active" : ""
                }`}
                onClick={() => handleCategoryClick("all")}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category?._id}
                  className={`category-list-item ${
                    activeCategory === category?._id ? "active" : ""
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category?.name}
                </button>
              ))}
            </div>
          </div>

          {isLoggedIn && (
            <div className="mobile-logout-section">
              <button
                type="button"
                className="mobile-logout-link"
                onClick={() => {
                  setIsMobileCatOpen(false);
                  handleLogout();
                }}
              >
                <FiLogOut className="logout-icon" aria-hidden="true" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
}
