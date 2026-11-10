import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <div className="privacyPage">
      <div className="privacyTitleSection">
        <div className="privacyTitleBar">
          <h1 className="privacyPageTitle">Privacy Policy</h1>
        </div>
        <p className="privacyUpdated">Last updated: November 10, 2026</p>
      </div>

      <div className="privacyCard">
        <section className="privacySection">
          <h2>1. Introduction</h2>
          <p>
            This Privacy Policy explains how AniMap collects, stores, and uses
            personal information when you create and use an account on our
            website.
          </p>
          <p>
            We respect your privacy and aim to collect only the information
            necessary to provide our services.
          </p>
        </section>

        <section className="privacySection">
          <h2>2. Information We Collect</h2>
          <p>When you register an account, we collect the following information:</p>
          <ul>
            <li>
              <strong>Username:</strong> Used to identify your account on the
              website.
            </li>
            <li>
              <strong>Email address:</strong> Used for account identification
              and communication.
            </li>
            <li>
              <strong>Password hash:</strong> Your password is hashed before
              being stored in our database. We do not store your password in
              plain text.
            </li>
          </ul>
        </section>

        <section className="privacySection">
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information exclusively for:</p>
          <ul>
            <li>Creating and managing user accounts.</li>
            <li>Authenticating users when they log in.</li>
            <li>Maintaining the security of user accounts.</li>
            <li>
              Communicating with users regarding their accounts when necessary.
            </li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
        </section>

        <section className="privacySection">
          <h2>4. Data Storage and Security</h2>
          <p>
            Your information is stored in a database with appropriate security
            measures designed to protect it against unauthorized access,
            alteration, or disclosure.
          </p>
          <p>
            Passwords are stored as cryptographic hashes rather than plaintext
            passwords.
          </p>
        </section>

        <section className="privacySection">
          <h2>5. Data Retention</h2>
          <p>
            Your account information is retained for as long as your account
            remains active.
          </p>
          <p>
            When you delete your account, your associated personal information
            will be deleted, except where retention is required by law or
            necessary for legitimate purposes.
          </p>
        </section>

        <section className="privacySection">
          <h2>6. Your Rights</h2>
          <p>
            Under the General Data Protection Regulation (GDPR), you have the
            right to:
          </p>
          <ul>
            <li>Request access to your personal information.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your personal information.</li>
            <li>
              Request restriction of processing in applicable circumstances.
            </li>
            <li>
              Lodge a complaint with a data protection supervisory authority.
            </li>
          </ul>
          <p>
            To exercise these rights, contact us using the email address below.
          </p>
        </section>

        <section className="privacySection">
          <h2>7. Third-Party Services</h2>
          <p>
            AniMap may use third-party infrastructure providers to host and
            operate the website and database. These providers may process
            personal information on our behalf.
          </p>
          <p className="privacyNote">
          </p>
        </section>

        <section className="privacySection">
          <h2>8. Contact</h2>
          <p>
            If you have questions about this Privacy Policy or how your personal
            information is handled, contact:
          </p>
          <p className="privacyContact">
            Website:{" "}
            <a href="https://animap.sandertamm.eu">animap.sandertamm.eu</a>
            <br />
            Email: <a href="mailto:sander.tamm@voco.ee">sander.tamm@voco.ee</a>
          </p>
        </section>
      </div>

      <Link to="/map" className="privacyBackLink">
        Back to map
      </Link>
    </div>
  );
}

export default PrivacyPolicy;
