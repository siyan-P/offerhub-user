import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiCompass } from "react-icons/fi";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

/**
 * Dedicated 404. Previously an unknown URL fell through to the generic crash
 * screen with a raw "Page Not Found" Error object.
 */
function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <EmptyState
        icon={<FiCompass />}
        title="We can't find that page"
        description="The link may be out of date, or the page may have moved. Here's the way back."
        action={<Button onClick={() => navigate("/products")}>Shop all products</Button>}
        secondaryAction={
          <Link to="/" className="ui-btn ui-btn--secondary">
            Back to home
          </Link>
        }
      />
    </div>
  );
}

export default NotFound;
