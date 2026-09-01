import React from "react";

const CONTACTS = [
  {
    key: "call",
    href: "tel:+919567359906",
    src: "/call.png",
    label: "Call OfferHub",
    external: false,
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/offer_hub_clct?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    src: "/insta.png",
    label: "OfferHub on Instagram",
    external: true,
  },
  {
    key: "whatsapp",
    href: "https://wa.me/9567359906",
    src: "/wtp.png",
    label: "Message OfferHub on WhatsApp",
    external: true,
  },
];

/**
 * Floating contact stack. Was a pile of inline styles with hover handlers that
 * mutated the DOM directly; it now sits in the stylesheet with the rest of the
 * design system and carries real accessible names.
 */
function Fixedblock() {
  return (
    <div className="contact-dock">
      {CONTACTS.map(({ key, href, src, label, external }) => (
        <a
          key={key}
          href={href}
          className={`contact-dock__item contact-dock__item--${key}`}
          aria-label={label}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          <img src={src} alt="" />
        </a>
      ))}
    </div>
  );
}

export default Fixedblock;
