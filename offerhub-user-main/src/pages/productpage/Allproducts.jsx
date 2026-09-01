import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiSearch,
  FiPackage,
} from "react-icons/fi";
import Card from "../../components/Card";
import { useProducts } from "../../hooks/queries/products";
import { useCategories } from "../../hooks/queries/categories";
import debounce from "lodash/debounce";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../../components/error/ErrorFallback";
import { useLabels } from "../../hooks/queries/labels";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCategory } from "../../redux/features/category/categorySlice";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { ProductGridSkeleton } from "../../components/ui/Skeleton";

const MAX_PRICE_VALUE = 999999999;
const SLIDER_MAX = 100000;
const ITEMS_PER_PAGE = 10;

const DEFAULT_FILTERS = {
  categoryId: null,
  subcategoryId: null,
  priceRange: { min: 0, max: Infinity },
  labelId: null,
  sort: "newest",
};

function AllProductsContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    categories: true,
    highlights: true,
    priceRange: false,
  });
  const [expandedCategories, setExpandedCategories] = useState({});
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  const [selectedFilters, setSelectedFilters] = useState(DEFAULT_FILTERS);
  const [selectedNames, setSelectedNames] = useState({
    categoryName: "",
    subcategoryName: "",
    labelName: "",
  });

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts({
    categoryId: selectedFilters.categoryId,
    subcategoryId: selectedFilters.subcategoryId,
    minPrice: selectedFilters.priceRange.min,
    maxPrice:
      selectedFilters.priceRange.max === Infinity
        ? MAX_PRICE_VALUE
        : selectedFilters.priceRange.max,
    labelId: selectedFilters.labelId,
    sort: selectedFilters.sort,
    limit: ITEMS_PER_PAGE,
  });

  // Infinite scroll sentinel on the last rendered card.
  const observer = useRef();
  const lastProductElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  const { data: labelsData } = useLabels();

  const debouncedUpdateFilters = useCallback(
    debounce((newRange) => {
      setSelectedFilters((prev) => ({ ...prev, priceRange: newRange }));
    }, 500),
    []
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedFilters]);

  useEffect(() => () => debouncedUpdateFilters.cancel(), [
    debouncedUpdateFilters,
  ]);

  useEffect(() => () => dispatch(setCategory(null)), [dispatch]);

  // The filter drawer is a modal on mobile — lock the page behind it, and
  // always unlock on unmount so a stray navigation can't leave the body frozen.
  useEffect(() => {
    document.body.style.overflow = isFilterOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const categoryFromHeader = location.state?.selectedCategory;
    const labelFromHomePage = location.state?.selectedLabel;

    if (categoryFromHeader) {
      setSelectedFilters((prev) => ({
        ...prev,
        categoryId: categoryFromHeader.id,
      }));
      setSelectedNames((prev) => ({
        ...prev,
        categoryName: categoryFromHeader.name,
      }));
      window.history.replaceState({}, document.title);
    }

    if (labelFromHomePage) {
      setSelectedFilters((prev) => ({ ...prev, labelId: labelFromHomePage.id }));
      setSelectedNames((prev) => ({
        ...prev,
        labelName: labelFromHomePage.name,
      }));
    }
  }, [location.state]);

  const products = response?.pages?.flatMap((page) => page.data.products) || [];
  const totalProducts = response?.pages?.[0]?.data?.totalProducts || 0;
  const categories = categoriesData?.envelop?.data || [];
  const labels = labelsData?.envelop?.data || [];

  const toggleFilter = () => setIsFilterOpen((open) => !open);

  const toggleSection = (section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const toggleCategory = (categoryId) =>
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

  const formatPrice = (price) =>
    price === Infinity
      ? "Any"
      : price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleCategorySelect = (
    categoryId,
    subcategoryId = null,
    categoryName = "",
    subcategoryName = ""
  ) => {
    dispatch(setCategory(categoryId));
    setSelectedFilters((prev) => ({ ...prev, categoryId, subcategoryId }));
    setSelectedNames((prev) => ({ ...prev, categoryName, subcategoryName }));
    if (isFilterOpen) setIsFilterOpen(false);
  };

  const handleLabelSelect = (labelId, labelName) => {
    setSelectedFilters((prev) => ({
      ...prev,
      labelId: prev.labelId === labelId ? null : labelId,
    }));
    setSelectedNames((prev) => ({
      ...prev,
      labelName: prev.labelName === labelName ? "" : labelName,
    }));
    if (isFilterOpen) setIsFilterOpen(false);
  };

  const handlePriceInputChange = (e, type) => {
    let value = e.target.value.replace(/,/g, "");

    if (type === "max" && (value === "Any" || value === "")) {
      setPriceRange((prev) => ({ ...prev, max: Infinity }));
      debouncedUpdateFilters({ ...priceRange, max: MAX_PRICE_VALUE });
      return;
    }

    value = value.replace(/\D/g, "");
    if (value === "") value = type === "min" ? "0" : MAX_PRICE_VALUE.toString();

    const numValue = parseInt(value, 10);
    if (Number.isNaN(numValue)) return;

    setPriceRange((prev) => {
      const newRange = { ...prev, [type]: numValue };
      debouncedUpdateFilters(newRange);
      return newRange;
    });
  };

  const handleRangeChange = (e, type) => {
    const value = parseInt(e.target.value, 10);
    setPriceRange((prev) => {
      const newRange = {
        ...prev,
        [type]:
          type === "min"
            ? Math.min(value, prev.max === Infinity ? MAX_PRICE_VALUE : prev.max)
            : value === MAX_PRICE_VALUE
            ? Infinity
            : Math.max(value, prev.min),
      };

      debouncedUpdateFilters({
        ...newRange,
        max: newRange.max === Infinity ? MAX_PRICE_VALUE : newRange.max,
      });
      return newRange;
    });
  };

  const handleSortChange = (e) =>
    setSelectedFilters((prev) => ({ ...prev, sort: e.target.value }));

  const clearAllFilters = () => {
    setSelectedFilters(DEFAULT_FILTERS);
    setSelectedNames({ categoryName: "", subcategoryName: "", labelName: "" });
    setPriceRange({ min: 0, max: Infinity });
    dispatch(setCategory(null));
  };

  /** Applied filters as removable chips, so state is visible and reversible. */
  const activeChips = [];

  if (selectedFilters.categoryId && selectedNames.categoryName) {
    activeChips.push({
      key: "category",
      label: "Category",
      value: selectedNames.categoryName,
      onRemove: () => handleCategorySelect(null, null, "", ""),
    });
  }

  if (selectedFilters.subcategoryId && selectedNames.subcategoryName) {
    activeChips.push({
      key: "subcategory",
      label: "Subcategory",
      value: selectedNames.subcategoryName,
      onRemove: () =>
        handleCategorySelect(
          selectedFilters.categoryId,
          null,
          selectedNames.categoryName,
          ""
        ),
    });
  }

  if (selectedFilters.labelId && selectedNames.labelName) {
    activeChips.push({
      key: "label",
      label: "Highlight",
      value: selectedNames.labelName,
      onRemove: () =>
        handleLabelSelect(selectedFilters.labelId, selectedNames.labelName),
    });
  }

  if (priceRange.min > 0 || priceRange.max !== Infinity) {
    activeChips.push({
      key: "price",
      label: "Price",
      value:
        priceRange.max === Infinity
          ? `Above ₹${formatPrice(priceRange.min)}`
          : `₹${formatPrice(priceRange.min)} – ₹${formatPrice(priceRange.max)}`,
      onRemove: () => {
        setPriceRange({ min: 0, max: Infinity });
        setSelectedFilters((prev) => ({
          ...prev,
          priceRange: { min: 0, max: Infinity },
        }));
      },
    });
  }

  const getTrackStyle = () => {
    const percent1 = (Math.min(priceRange.min, SLIDER_MAX) / SLIDER_MAX) * 100;
    const percent2 =
      priceRange.max === Infinity
        ? 100
        : (Math.min(priceRange.max, SLIDER_MAX) / SLIDER_MAX) * 100;

    return {
      background: `linear-gradient(to right,
        var(--neutral-200) ${percent1}%,
        var(--color-primary) ${percent1}%,
        var(--color-primary) ${percent2}%,
        var(--neutral-200) ${percent2}%)`,
    };
  };

  // A filter change refetches with data already on screen — mark it stale
  // instead of tearing the grid down and flashing a loader.
  const isRevalidating = isFetching && !isLoading && !isFetchingNextPage;

  const filterPanel = (
    <div className="filter-sections">
      <div className="filter-section">
        <button
          type="button"
          className="section-header"
          onClick={() => toggleSection("categories")}
          aria-expanded={openSections.categories}
        >
          <h3>Categories</h3>
          {openSections.categories ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {openSections.categories &&
          (categoriesLoading ? (
            <div className="filter-skeletons">
              {Array.from({ length: 5 }, (_, i) => (
                <span className="skeleton skeleton--text" key={i} />
              ))}
            </div>
          ) : (
            <ul className="categories-list">
              {categories.map((category) => (
                <li
                  key={category._id}
                  className={
                    selectedFilters.categoryId === category._id ? "active" : ""
                  }
                >
                  <div className="category-header">
                    <button
                      type="button"
                      className="category-name"
                      onClick={() =>
                        handleCategorySelect(
                          category._id,
                          null,
                          category.name,
                          ""
                        )
                      }
                      aria-pressed={selectedFilters.categoryId === category._id}
                    >
                      <span>{category.name}</span>
                      {category.subcategories?.length > 0 && (
                        <span className="count">
                          {category.subcategories.length}
                        </span>
                      )}
                    </button>

                    {category.subcategories?.length > 0 && (
                      <button
                        type="button"
                        className="subcategory-toggle"
                        onClick={() => toggleCategory(category._id)}
                        aria-expanded={!!expandedCategories[category._id]}
                        aria-label={`${
                          expandedCategories[category._id] ? "Hide" : "Show"
                        } ${category.name} subcategories`}
                      >
                        <FiChevronDown
                          className={`subcategory-arrow ${
                            expandedCategories[category._id] ? "rotated" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {category.subcategories?.length > 0 &&
                    expandedCategories[category._id] && (
                      <ul className="subcategories-list">
                        {category.subcategories.map((sub) => (
                          <li
                            key={sub._id}
                            className={
                              selectedFilters.subcategoryId === sub._id
                                ? "active"
                                : ""
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleCategorySelect(
                                  category._id,
                                  sub._id,
                                  category.name,
                                  sub.name
                                )
                              }
                              aria-pressed={
                                selectedFilters.subcategoryId === sub._id
                              }
                            >
                              {sub.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          ))}
      </div>

      {labels.length > 0 && (
        <div className="filter-section">
          <button
            type="button"
            className="section-header"
            onClick={() => toggleSection("highlights")}
            aria-expanded={openSections.highlights}
          >
            <h3>Highlights</h3>
            {openSections.highlights ? <FiChevronUp /> : <FiChevronDown />}
          </button>

          {openSections.highlights && (
            <ul className="highlights-list">
              {labels.map((label) => (
                <li
                  key={label._id}
                  className={
                    selectedFilters.labelId === label._id ? "active" : ""
                  }
                >
                  <button
                    type="button"
                    onClick={() => handleLabelSelect(label._id, label.name)}
                    aria-pressed={selectedFilters.labelId === label._id}
                  >
                    {label.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="filter-section">
        <button
          type="button"
          className="section-header"
          onClick={() => toggleSection("priceRange")}
          aria-expanded={openSections.priceRange}
        >
          <h3>Price range</h3>
          {openSections.priceRange ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        {openSections.priceRange && (
          <div className="price-range">
            <div className="range-slider">
              <div className="slider-track" style={getTrackStyle()} />
              <input
                type="range"
                min="0"
                max={SLIDER_MAX}
                value={Math.min(priceRange.min, SLIDER_MAX)}
                className="slider-thumb left"
                onChange={(e) => handleRangeChange(e, "min")}
                aria-label="Minimum price"
              />
              <input
                type="range"
                min="0"
                max={SLIDER_MAX}
                value={
                  priceRange.max === Infinity
                    ? SLIDER_MAX
                    : Math.min(priceRange.max, SLIDER_MAX)
                }
                className="slider-thumb right"
                onChange={(e) => handleRangeChange(e, "max")}
                aria-label="Maximum price"
              />
            </div>

            <div className="price-inputs">
              <div className="price-input">
                <span aria-hidden="true">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Minimum price"
                  value={formatPrice(priceRange.min)}
                  onChange={(e) => handlePriceInputChange(e, "min")}
                  onBlur={() => {
                    if (
                      priceRange.min > priceRange.max &&
                      priceRange.max !== Infinity
                    ) {
                      setPriceRange((prev) => ({ ...prev, min: prev.max }));
                    }
                  }}
                />
              </div>
              <span className="price-inputs__dash" aria-hidden="true">
                –
              </span>
              <div className="price-input">
                <span aria-hidden="true">₹</span>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Maximum price"
                  placeholder="Any"
                  value={formatPrice(priceRange.max)}
                  onChange={(e) => handlePriceInputChange(e, "max")}
                  onBlur={() => {
                    if (priceRange.max < priceRange.min) {
                      setPriceRange((prev) => ({ ...prev, max: prev.min }));
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="product-page">
      <div className="product-section">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">All products</span>
        </nav>

        <div className="product-header">
          <div className="header-left">
            <h1>
              All products
              {!isLoading && <span>{totalProducts}</span>}
            </h1>
          </div>

          <div className="header-right">
            <div className="sort-section">
              <label htmlFor="product-sort" className="sort-text">
                Sort
              </label>
              <select
                id="product-sort"
                value={selectedFilters.sort}
                onChange={handleSortChange}
              >
                <option value="newest">Newest arrivals</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </div>

            <Button
              variant="secondary"
              className={`filter-btn ${isFilterOpen ? "active" : ""}`}
              onClick={toggleFilter}
              aria-expanded={isFilterOpen}
              leadingIcon={<FiFilter aria-hidden="true" />}
            >
              Filters
              {activeChips.length > 0 && (
                <span className="filter-btn__count">{activeChips.length}</span>
              )}
            </Button>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="active-filters" aria-label="Applied filters">
            {activeChips.map((chip) => (
              <span className="ui-chip" key={chip.key}>
                <span className="ui-chip__label">{chip.label}:</span>
                {chip.value}
                <button
                  type="button"
                  className="ui-chip__remove"
                  onClick={chip.onRemove}
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <FiX size={12} aria-hidden="true" />
                </button>
              </span>
            ))}
            <button type="button" className="clear-all" onClick={clearAllFilters}>
              Clear all
            </button>
          </div>
        )}

        <div className="product-content">
          <aside
            className={`filter-sidebar ${isFilterOpen ? "open" : ""}`}
            aria-label="Product filters"
          >
            <div className="filter-header">
              <h2>Filters</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
              >
                <FiX />
              </button>
            </div>
            {filterPanel}
          </aside>

          <div
            className={`filter-overlay ${isFilterOpen ? "open" : ""}`}
            onClick={() => setIsFilterOpen(false)}
            aria-hidden="true"
          />

          <div className="products-container">
            {isLoading ? (
              <ProductGridSkeleton count={10} />
            ) : error || categoriesError ? (
              <ErrorState
                error={error || categoriesError}
                onRetry={() => {
                  refetch();
                  refetchCategories();
                }}
                retrying={isFetching}
                title="We couldn't load these products"
              />
            ) : products.length === 0 ? (
              <EmptyState
                icon={activeChips.length > 0 ? <FiSearch /> : <FiPackage />}
                title={
                  activeChips.length > 0
                    ? "No products match these filters"
                    : "Nothing here yet"
                }
                description={
                  activeChips.length > 0
                    ? "Try widening your price range or clearing a filter to see more."
                    : "New stock is added regularly — check back soon."
                }
                action={
                  activeChips.length > 0 ? (
                    <Button onClick={clearAllFilters}>Clear all filters</Button>
                  ) : (
                    <Button onClick={() => navigate("/")}>Back to home</Button>
                  )
                }
              />
            ) : (
              <>
                <div
                  className={`product-grid ${
                    isRevalidating ? "is-revalidating" : ""
                  }`.trim()}
                >
                  {products.map((product, index) => (
                    <div
                      key={product._id}
                      ref={
                        index === products.length - 1
                          ? lastProductElementRef
                          : null
                      }
                    >
                      <Card product={product} eagerImage={index < 5} />
                    </div>
                  ))}
                </div>

                {isFetchingNextPage && (
                  <p className="rail-loader">
                    <Spinner /> Loading more products…
                  </p>
                )}

                {!hasNextPage && products.length >= ITEMS_PER_PAGE && (
                  <p className="catalog-end">You've reached the end</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AllProducts() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
      onError={(error, info) => {
        console.error("Error caught by boundary:", error, info);
      }}
    >
      <AllProductsContent />
    </ErrorBoundary>
  );
}

export default AllProducts;
