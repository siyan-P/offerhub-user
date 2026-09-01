import React from "react";
import { FaInstagram } from "react-icons/fa";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { useCategories } from "../hooks/queries/categories";
import { setCategory } from "../redux/features/category/categorySlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLabels } from "../hooks/queries/labels";

const INSTAGRAM_URL =
  "https://www.instagram.com/offer_hub_clct?igsh=ZXU5a2Rud3ZiZHY2&utm_source=qr";
const SUPPORT_EMAIL = "offerhub3110@gmail.com";

function Footer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: categoriesData } = useCategories();
  const { data: labelsData } = useLabels();

  const categories = categoriesData?.envelop?.data || [];
  const labels = labelsData?.envelop?.data || [];

  const handleCategoryClick = (category) => {
    dispatch(setCategory(category?._id || "all"));
    navigate("/products", {
      state: {
        selectedCategory: { id: category._id, name: category.name },
      },
    });
  };

  const handleLabelClick = (label) => {
    navigate("/products", {
      state: { selectedLabel: { id: label._id, name: label.name } },
    });
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <img src="/logo/OfferHub.png" alt="OfferHub" />
          <p>Everyday deals on the brands you already shop.</p>
          <div className="social-links">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OfferHub on Instagram"
            >
              <FaInstagram aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="footer-links-group">
          {categories.length > 0 && (
            <nav className="footer-section" aria-label="Shop by category">
              <h2>Categories</h2>
              <ul>
                {categories.map((category) => (
                  <li key={category._id}>
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {labels.length > 0 && (
            <nav className="footer-section" aria-label="Highlights">
              <h2>Highlights</h2>
              <ul>
                {labels.map((label) => (
                  <li key={label._id}>
                    <button type="button" onClick={() => handleLabelClick(label)}>
                      {label.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="footer-section">
            <h2>Contact</h2>
            <ul>
              <li className="address">
                <FiMapPin className="contact-icon" aria-hidden="true" />
                <address>
                  Busthan Offer Hub, Muriyanal
                  <br />
                  Kunnamangalam
                  <br />
                  Calicut, Kerala 673571
                </address>
              </li>
              <li>
                <FiMail className="contact-icon" aria-hidden="true" />
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </li>
              <li>
                <FiPhone className="contact-icon" aria-hidden="true" />
                <a href="tel:+919567359906">9567359906</a>
                <span aria-hidden="true">,</span>
                <a href="tel:+914952519906">0495-2519906</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} OfferHub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
