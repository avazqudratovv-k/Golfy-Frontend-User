import React, { useState } from "react";
import FAQList from "./components/FAQList";
import ContactForm from "./components/ContactForm";
import "../../../css/helpPage.css";

export default function HelpPage() {
  const [tab, setTab] = useState<"faq" | "contact">("faq");

  return (
    <div className="help-page">
      <div className="help-tabs">
        <button
          className={tab === "faq" ? "tab active" : "tab"}
          onClick={() => setTab("faq")}
        >
          FAQ
        </button>
        <button
          className={tab === "contact" ? "tab active" : "tab"}
          onClick={() => setTab("contact")}
        >
          Contact
        </button>
      </div>

      {tab === "faq" ? (
        <FAQList />
      ) : (
        <>
          <div className="contact-info">
            <span>support@golfy.com</span>
            <span>+1 555 010 2938</span>
          </div>
          <ContactForm />
        </>
      )}
    </div>
  );
}
