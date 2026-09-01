import React, { useEffect, useMemo, useState } from "react";
import { FiPackage, FiSearch } from "react-icons/fi";
import { useGetOrderHistory } from "../../hooks/queries/order";
import OrderStatus from "./OrderStatus";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const OrderHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOrderStatusOpen, setIsOrderStatusOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const { data, isLoading, isFetching, error, refetch } = useGetOrderHistory();
  const orders = useMemo(() => data?.orders || [], [data]);

  // Track the order by id rather than by value, so the open panel always shows
  // the freshest copy after a refetch instead of a stale snapshot.
  const selectedOrder =
    orders.find((order) => order?._id === selectedOrderId) || null;

  useEffect(() => {
    if (selectedOrderId && !selectedOrder) setIsOrderStatusOpen(false);
  }, [selectedOrderId, selectedOrder]);

  const term = searchQuery.trim().toLowerCase();
  const filteredOrders = term
    ? orders.filter((order) =>
        order.products.some((product) =>
          product?.productId?.name?.toLowerCase().includes(term)
        )
      )
    : orders;

  if (isLoading) {
    return (
      <div className="order-history-section">
        <Skeleton height="2rem" width="40%" />
        <div className="order-history-skeleton">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} height="6rem" radius="var(--radius-lg)" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
        retrying={isFetching}
        title="We couldn't load your orders"
        compact
      />
    );
  }

  return (
    <>
      <section className="order-history-section">
        <div className="header-section">
          <div className="title-section">
            <h2>Your orders</h2>
            <p className="subtitle">
              Track what's on the way and revisit past purchases.
            </p>
          </div>

          {orders.length > 0 && (
            <div className="search-section">
              <label className="visually-hidden" htmlFor="order-search">
                Search orders by product name
              </label>
              <input
                id="order-search"
                className="ui-input"
                type="search"
                placeholder="Search by product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <EmptyState
            compact
            icon={<FiPackage />}
            title="No orders yet"
            description="Once you place an order it'll show up here with live tracking."
          />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            compact
            icon={<FiSearch />}
            title="No matching orders"
            description={`Nothing in your history matches “${searchQuery.trim()}”.`}
            action={
              <Button variant="secondary" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <ul className="orders-list">
            {filteredOrders.map((order) => (
              <li key={order._id} className="order-row">
                <div className="order-row__products">
                  {order.products.map((product, index) => (
                    <div key={index} className="order-line">
                      <img
                        src={
                          product.variantId
                            ? product.variantId.images?.[0]
                            : product?.productId?.images?.[0]
                        }
                        alt=""
                        loading="lazy"
                      />
                      <div className="info">
                        <h3 title={product?.productId?.name}>
                          {product?.productId?.name}
                        </h3>
                        <p className="product-price">
                          {inr.format(product.price || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-row__meta">
                  <div>
                    <span className="label">Total</span>
                    <strong>{inr.format(order?.totalAmount || 0)}</strong>
                  </div>

                  <div>
                    <span className="label">Status</span>
                    <span className={`status-tag ${order?.status}`}>
                      {order?.status}
                    </span>
                    <span className="delivery-info">
                      {order?.status === "delivered"
                        ? "Delivered "
                        : "Expected "}
                      {new Date(order?.expectedDelivery).toLocaleDateString()}
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedOrderId(order._id);
                      setIsOrderStatusOpen(true);
                    }}
                  >
                    {order?.status === "delivered" ? "View" : "Track"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <OrderStatus
        isOpen={isOrderStatusOpen}
        onClose={() => setIsOrderStatusOpen(false)}
        order={selectedOrder}
      />
    </>
  );
};

export default OrderHistory;
