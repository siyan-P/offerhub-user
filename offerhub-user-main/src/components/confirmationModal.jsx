import React, { useEffect } from "react";
import { FiX, FiAlertTriangle, FiInfo } from "react-icons/fi";
import Button from "./ui/Button";

const VARIANT_BUTTON = {
  danger: "destructive",
  warning: "primary",
  info: "primary",
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  isConfirming = false,
}) => {
  // Escape dismisses, and the page behind holds still while the dialog is up.
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="confirmation-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="close-button"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>

        <div className="modal-content">
          <span className={`modal-icon ${type}`} aria-hidden="true">
            {type === "info" ? <FiInfo /> : <FiAlertTriangle />}
          </span>

          <h2 id="confirm-title">{title}</h2>
          <p id="confirm-message">{message}</p>

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              variant={VARIANT_BUTTON[type] || "primary"}
              loading={isConfirming}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
