import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";

const SUPPORT_PHONE = "9567359906";
const SUPPORT_EMAIL = "offerhub3110@gmail.com";

const HelpandSupport = () => {
  const handleWhatsAppChat = () => {
    const message = "Hi, I need help with my order";
    window.open(
      `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="help-support-section">
      <div className="support-content">
        <h2>Need a hand?</h2>
        <p>
          Our team answers fastest on WhatsApp — usually within a few minutes
          during business hours.
        </p>

        <button
          type="button"
          className="ui-btn ui-btn--success whatsapp-btn"
          onClick={handleWhatsAppChat}
        >
          <FaWhatsapp aria-hidden="true" />
          Chat on WhatsApp
        </button>

        <ul className="support-channels">
          <li>
            <FiPhone aria-hidden="true" />
            <a href={`tel:+91${SUPPORT_PHONE}`}>+91 {SUPPORT_PHONE}</a>
          </li>
          <li>
            <FiMail aria-hidden="true" />
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default HelpandSupport;
