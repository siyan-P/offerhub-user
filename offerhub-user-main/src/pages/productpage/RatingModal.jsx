import React, { useEffect, useRef, useState } from "react";
import { FiX, FiCamera } from "react-icons/fi";
import Button from "../../components/ui/Button";

const RatingModal = ({ isOpen, onClose, onSubmit, productId, isSubmitting }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [media, setMedia] = useState(null);
  const fileInputRef = useRef(null);

  // Escape closes, and the page behind stops scrolling while the dialog is up.
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

  const resetForm = () => {
    setRating(0);
    setHoveredRating(0);
    setReview("");
    setMedia(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ rating, review, media, productId });
    resetForm();
  };

  const activeRating = hoveredRating || rating;

  return (
    <div
      className="rating-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-modal-title"
    >
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="close-button"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX aria-hidden="true" />
        </button>

        <h2 id="rating-modal-title">Add a review</h2>
        <p className="description">
          Tell other shoppers how the item worked out for you.
        </p>

        <form onSubmit={handleSubmit}>
          <fieldset className="stars-container">
            <legend className="visually-hidden">Your rating</legend>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`star-button ${activeRating >= star ? "active" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onFocus={() => setHoveredRating(star)}
                onBlur={() => setHoveredRating(0)}
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                aria-pressed={rating === star}
              >
                <span aria-hidden="true">★</span>
              </button>
            ))}
            {rating > 0 && (
              <button
                type="button"
                className="clear-rating"
                onClick={() => setRating(0)}
              >
                Clear
              </button>
            )}
          </fieldset>

          <div className="form-group">
            <label htmlFor="review-body">
              Your review <span className="required">*</span>
            </label>
            <textarea
              id="review-body"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think?"
              rows={4}
              required
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leadingIcon={<FiCamera aria-hidden="true" />}
          >
            Attach a photo
          </Button>
          <input
            ref={fileInputRef}
            id="media-upload"
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMedia(e.target.files[0])}
            className="visually-hidden"
          />
          {media && <p className="media-preview">{media.name}</p>}

          <Button
            type="submit"
            block
            className="submit-button"
            disabled={!rating || !review.trim()}
            loading={isSubmitting}
            loadingText="Submitting"
          >
            Submit review
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
