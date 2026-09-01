import React from "react";
import { useCategoryBanners } from "../../../hooks/queries/Banner";
import { setCategory } from "../../../redux/features/category/categorySlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ErrorState from "../../../components/ui/ErrorState";
import ProductImage from "../../../components/ui/ProductImage";
import { Skeleton } from "../../../components/ui/Skeleton";

function TrendingCollection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allCategoryBanners, isLoading, error } = useCategoryBanners();

  const collections = allCategoryBanners || [];

  const handleCategoryClick = (category) => {
    if (!category?._id) return;
    dispatch(setCategory(category._id));
    navigate("/products", {
      state: {
        selectedCategory: { id: category._id, name: category.name },
      },
    });
  };

  if (!isLoading && !error && collections.length === 0) return null;

  return (
    <section className="rail-section trending-collections">
      <div className="rail-section__header">
        <h2 className="section-heading">
          Trending <span>collections</span>
        </h2>
      </div>

      {error ? (
        <ErrorState error={error} compact />
      ) : isLoading ? (
        <div className="collections-grid">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} height="14rem" radius="var(--radius-lg)" />
          ))}
        </div>
      ) : (
        <div className="collections-grid">
          {collections.map((collection, index) => (
            <button
              type="button"
              className="collection-item"
              key={collection?._id || index}
              onClick={() => handleCategoryClick(collection?.category)}
              aria-label={
                collection?.category?.name
                  ? `Shop ${collection.category.name}`
                  : "Shop this collection"
              }
            >
              <ProductImage
                src={collection?.image}
                alt=""
                ratio="16 / 9"
                fit="cover"
              />
              {collection?.category?.name && (
                <span className="collection-item__label">
                  {collection.category.name}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default TrendingCollection;
