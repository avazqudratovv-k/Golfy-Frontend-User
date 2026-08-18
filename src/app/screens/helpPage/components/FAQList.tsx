import React, { useState } from "react";

const faqs = [
  {
    q: "How do I book a golf zone?",
    a: "Go to Venues, pick a zone, choose a date and hour, then pay to confirm.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Contact support and we'll help cancel it before the start time.",
  },
  {
    q: "What payment methods are accepted?",
    a: "Visa, Mastercard, PayPal, and Western Union are supported.",
  },
  {
    q: "Is my card information safe?",
    a: "We never store full card numbers, only the last 4 digits for your records.",
  },
];

export default function FAQList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {faqs.map((item, i) => (
        <div key={i} className="faq-item">
          <div
            className="faq-question"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {item.q}
            <span>{openIndex === i ? "−" : "+"}</span>
          </div>
          {openIndex === i && <div className="faq-answer">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}
