import React from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/queries/products";
import ProductRail from "./ProductRail";

const TRENDING_LABEL_ID = "67e3f8b437db8d10f8e5f341";

function Trending() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useProducts({
    labelId: TRENDING_LABEL_ID,
  });

  // `useProducts` is an infinite query, so results live under `pages`. The old
  // code read `data.data.products`, which is always undefined here — the rail
  // rendered its empty state permanently.
  const products = data?.pages?.flatMap((page) => page.data.products) || [];

  return (
    <ProductRail
      title="Trending"
      accent="this week"
      subtitle="What other shoppers are picking up right now"
      products={products}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      railClassName="trending-products"
      sectionClassName="trending-container"
      onViewAll={() =>
        navigate("/products", {
          state: { selectedLabel: { id: TRENDING_LABEL_ID, name: "Trending" } },
        })
      }
    />
  );
}

export default Trending;
