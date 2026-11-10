import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./PrivacyConsent.css";

const STORAGE_KEY = "animap_privacy_acknowledged";

function PrivacyConsent() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== "true";
    } catch {
      return true;
    }
  });

  const isPrivacyPage = location.pathname.startsWith("/privacy");
  const isVisible = isOpen && !isPrivacyPage;

  useEffect(() => {
    if (!isVisible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (error) {
      console.error("Unable to save privacy acknowledgement:", error);
    }
    setIsOpen(false);
  };

  if (!isVisible) return null;

  return (
    <div className="privacyConsentOverlay">
      <div
        className="privacyConsentBox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-consent-title"
      >
        <h2 id="privacy-consent-title">Privacy &amp; your data</h2>

        <p>
          Welcome to AniMap. Before you continue, here is a quick overview of
          how we handle your personal information.
        </p>

        <ul>
          <li>
            When you register we collect your <strong>username</strong>,{" "}
            <strong>email address</strong>, and a <strong>password hash</strong>{" "}
            (never your plain-text password).
          </li>
          <li>
            This information is used only to create and manage your account,
            authenticate you, and keep your account secure.
          </li>
          <li>We never sell your personal information to third parties.</li>
          <li>
            Under the GDPR you can request access to, correction of, or deletion
            of your personal data at any time.
          </li>
        </ul>

        <p>
          By continuing you acknowledge that you have read our Privacy Policy.
        </p>

        <div className="privacyConsentButtons">
          <Link to="/privacy" className="privacyConsentSecondary">
            Read full policy
          </Link>
          <button
            type="button"
            className="privacyConsentAccept"
            onClick={handleAccept}
          >
            Accept &amp; continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyConsent;
