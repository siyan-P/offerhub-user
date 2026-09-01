import React from "react";
import { useNavigate } from "react-router-dom";
import { useProducts } from "../../../hooks/queries/products";
import ProductRail from "./ProductRail";

const CLEARANCE_LABEL_ID = "6861042052e359bb43921d37";

function Clearance() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useProducts({
    labelId: CLEARANCE_LABEL_ID,
  });

  const products = data?.pages?.flatMap((page) => page.data.products) || [];

  return (
    <ProductRail
      title="Clearance"
      accent="sale"
      subtitle="Last-chance prices while stock lasts"
      products={products}
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      railClassName="clearance-products"
      sectionClassName="clearance-container"
      onViewAll={() =>
        navigate("/products", {
          state: {
            selectedLabel: { id: CLEARANCE_LABEL_ID, name: "Clearance" },
          },
        })
      }
    />
  );
}

export default Clearance;
