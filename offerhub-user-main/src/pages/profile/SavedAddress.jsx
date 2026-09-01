import React, { useState } from "react";
import { FiTrash2, FiPlus, FiMapPin } from "react-icons/fi";
import AddressModal from "../../components/cart/Addressmodal";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import userService from "../../api/services/userService";
import { setUser } from "../../redux/features/user/userSlice";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/confirmationModal";

const MAX_ADDRESSES = 3;

const SavedAddress = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const addresses = user?.address || [];
  const atLimit = addresses.length >= MAX_ADDRESSES;

  const confirmDelete = async () => {
    const id = pendingDeleteId;
    if (!id) return;

    setDeletingId(id);
    try {
      const response = await userService.deleteAddress(id);
      dispatch(setUser(response?.data));
      toast.success("Address removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't remove that address");
    } finally {
      setDeletingId(null);
      setPendingDeleteId(null);
    }
  };

  return (
    <section className="saved-address-section">
      <h2>Saved addresses</h2>
      <p className="subtitle">
        Save up to {MAX_ADDRESSES} addresses for faster checkout.
      </p>

      {addresses.length === 0 ? (
        <EmptyState
          compact
          icon={<FiMapPin />}
          title="No addresses saved yet"
          description="Add a delivery address now and checkout will be one step shorter."
          action={
            <Button
              onClick={() => setIsAddressModalOpen(true)}
              leadingIcon={<FiPlus aria-hidden="true" />}
            >
              Add an address
            </Button>
          }
        />
      ) : (
        <div className="addresses-grid">
          {addresses.map((addr) => (
            <article key={addr._id} className="address-card">
              <div className="card-header">
                {addr.label && (
                  <span className="ui-badge address-label">{addr.label}</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  className="delete-btn"
                  onClick={() => setPendingDeleteId(addr._id)}
                  loading={deletingId === addr._id}
                  aria-label={`Delete address for ${addr.fullName}`}
                >
                  <FiTrash2 aria-hidden="true" />
                </Button>
              </div>

              <div className="address-info">
                <h3>{addr?.fullName}</h3>
                <address>
                  {[addr?.houseNo, addr?.street, addr?.landmark]
                    .filter(Boolean)
                    .join(", ")}
                  <br />
                  {[addr?.city, addr?.state, addr?.pincode]
                    .filter(Boolean)
                    .join(", ")}
                  {addr?.phone && (
                    <>
                      <br />
                      {addr.phone}
                    </>
                  )}
                </address>
              </div>
            </article>
          ))}

          <button
            type="button"
            className="add-address-card"
            onClick={() => setIsAddressModalOpen(true)}
            disabled={atLimit}
          >
            <span className="plus-icon" aria-hidden="true">
              <FiPlus />
            </span>
            <span>
              {atLimit
                ? `Limit reached — remove one to add another`
                : "Add a new address"}
            </span>
          </button>
        </div>
      )}

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        mode="profile"
      />

      <ConfirmationModal
        isOpen={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete address"
        message="This address will be removed from your account."
        confirmText="Delete"
        cancelText="Keep"
        type="danger"
      />
    </section>
  );
};

export default SavedAddress;
