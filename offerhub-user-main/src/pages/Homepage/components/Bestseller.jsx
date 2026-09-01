import React from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/queries/products";
import ProductRail from "./ProductRail";

const BESTSELLER_LABEL_ID = "6861041552e359bb43921d33";

function Bestseller() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useProducts({
    labelId: BESTSELLER_LABEL_ID,
    limit: 10,
  });

  const products = data?.pages?.flatMap((page) => page.data.products) || [];

  return (
    <ProductRail
      title="Best sellers"
      accent="loved by thousands"
      products={products}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      railClassName="bestseller-products"
      sectionClassName="bestseller-container"
      onViewAll={() =>
        navigate("/products", {
          state: {
            selectedLabel: { id: BESTSELLER_LABEL_ID, name: "Best Sellers" },
          },
        })
      }
    />
  );
}

export default Bestseller;
