import React from "react";
import { useCategories } from "../../../hooks/queries/categories";
import { useDispatch } from "react-redux";
import { setCategory } from "../../../redux/features/category/categorySlice";
import { useNavigate } from "react-router-dom";
import { CategoryRailSkeleton } from "../../../components/ui/Skeleton";
import ErrorState from "../../../components/ui/ErrorState";
import ProductImage from "../../../components/ui/ProductImage";
import { initialsFor, tintFor } from "../../../components/ui/initials";

function Category() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useCategories();

  const categories = data?.envelop?.data || [];

  const handleCategoryClick = (category) => {
    dispatch(setCategory(category?._id));
    navigate("/products", {
      state: {
        selectedCategory: { id: category._id, name: category.name },
      },
    });
  };

  if (!isLoading && !error && categories.length === 0) return null;

  return (
    <section className="rail-section category-section">
      <div className="rail-section__header">
        <h2 className="section-heading">
          Shop by <span>category</span>
        </h2>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} compact />
      ) : isLoading ? (
        <CategoryRailSkeleton />
      ) : (
        <ul className="categories">
          {categories.map((category) => (
            <li key={category._id}>
              <button
                type="button"
                className="category"
                onClick={() => handleCategoryClick(category)}
              >
                <span className="image-container">
                  <ProductImage
                    src={category.image}
                    alt=""
                    fit="cover"
                    // A category with no artwork gets its initials on a stable
                    // tint rather than a row of identical grey glyphs.
                    fallback={
                      <span
                        className="category__initials"
                        style={{
                          background: tintFor(category.name).bg,
                          color: tintFor(category.name).ink,
                        }}
                      >
                        {initialsFor(category.name)}
                      </span>
                    }
                  />
                </span>
                <span className="category__name">{category.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Category;
