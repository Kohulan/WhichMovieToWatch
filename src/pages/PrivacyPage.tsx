import { Link } from 'react-router';

/**
 * PrivacyPage — Full-page privacy policy at /privacy route.
 *
 * Comprehensive policy covering data collection, third-party services,
 * analytics (Simple Analytics), cookies, and user rights.
 * Styled with claymorphism design tokens.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-clay-base py-8 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-clay-text-muted hover:text-clay-text transition-colors duration-200 mb-6"
        >
          <span aria-hidden="true">←</span>
          <span>Back to home</span>
        </Link>

        {/* Main content card */}
        <div className="bg-clay-elevated rounded-3xl shadow-clay-lg border border-white/[0.08] p-6 sm:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="text-3xl sm:text-4xl font-heading text-clay-text mb-2"
              style={{ fontFamily: "'Righteous', var(--font-heading, sans-serif)" }}
            >
              Privacy Policy
            </h1>
            <p className="text-sm text-clay-text-muted">
              Last updated: February 4, 2025
            </p>
          </div>

          {/* Introduction */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Introduction</h2>
            <p className="text-clay-text-muted leading-relaxed">
              Welcome to Which Movie To Watch. We respect your privacy and are committed to protecting your personal data.
              This privacy policy explains how we handle information when you use our app. We believe in radical transparency:
              we collect as little as possible, and what we do collect is described here in plain language.
            </p>
          </section>

          {/* Data Collection */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Data Collection</h2>
            <p className="text-clay-text-muted leading-relaxed mb-3">
              This app does not collect personal data. There are no accounts, no authentication, and no user profiles.
              All your preferences — watched movies, loved films, genre preferences, streaming service selections, and
              theme settings — are stored exclusively in your browser's localStorage on your own device.
            </p>
            <p className="text-clay-text-muted leading-relaxed">
              This data never leaves your device and is never transmitted to any server. You can clear it at any time
              through your browser's settings or by clearing your localStorage.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Third-Party Services</h2>
            <p className="text-clay-text-muted leading-relaxed mb-3">
              To provide movie information and streaming data, we integrate with the following external services:
            </p>
            <ul className="list-disc list-outside ml-5 space-y-2 text-clay-text-muted">
              <li>
                <span className="text-clay-text font-medium">The Movie Database (TMDB) API</span> — movie metadata,
                posters, and streaming provider availability. Subject to{' '}
                <a
                  href="https://www.themoviedb.org/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  TMDB's privacy policy
                </a>
                .
              </li>
              <li>
                <span className="text-clay-text font-medium">OMDB API</span> — IMDb and Rotten Tomatoes ratings.
              </li>
              <li>
                <span className="text-clay-text font-medium">IPInfo.io</span> — anonymous geolocation to detect your
                country so we can show relevant regional streaming services. No personal data is stored.
              </li>
              <li>
                <span className="text-clay-text font-medium">Simple Analytics</span> — anonymous, cookieless page view
                tracking (described below).
              </li>
            </ul>
          </section>

          {/* Analytics */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Analytics</h2>
            <p className="text-clay-text-muted leading-relaxed mb-3">
              We use{' '}
              <a
                href="https://simpleanalytics.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Simple Analytics
              </a>{' '}
              for anonymous, cookieless page view tracking. No personal information is collected. No cookies are set.
              Data cannot be traced to individual users.
            </p>
            <p className="text-clay-text-muted leading-relaxed">
              Simple Analytics collects only: page URLs, referrer domain (no full URL), browser name and version,
              operating system, screen size (broad category), and country (from IP — the IP itself is never stored).
              You can review Simple Analytics' full privacy commitment at{' '}
              <a
                href="https://simpleanalytics.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                simpleanalytics.com/privacy
              </a>
              .
            </p>
          </section>

          {/* Cookies */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Cookies</h2>
            <p className="text-clay-text-muted leading-relaxed">
              This app does not use cookies. All user preferences are stored in browser localStorage on your own device
              and are never transmitted to any server. Simple Analytics, our analytics provider, is likewise cookieless
              by design.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Third-Party Links</h2>
            <p className="text-clay-text-muted leading-relaxed">
              This app provides links to streaming services (Netflix, Disney+, Amazon Prime Video, Max, Apple TV+, and
              others), YouTube, and other external websites. When you click these links, you leave our app and enter
              their platforms. We are not responsible for the privacy practices of these third-party services. We
              encourage you to review their privacy policies before using them.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Children's Privacy</h2>
            <p className="text-clay-text-muted leading-relaxed">
              This app is not directed to children under the age of 13. We do not knowingly collect any personal
              information from children under 13. If you believe a child under 13 has provided personal information
              through our service, please contact us and we will take appropriate action.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Your Rights</h2>
            <p className="text-clay-text-muted leading-relaxed mb-3">
              Since we do not collect personal data, there is no user account data for us to provide, delete, or
              export. However, you have full control over locally stored data:
            </p>
            <ul className="list-disc list-outside ml-5 space-y-2 text-clay-text-muted">
              <li>Clear your preferences at any time via your browser's developer tools or settings.</li>
              <li>Opt out of Simple Analytics by using a content blocker or browser privacy features.</li>
              <li>Deny location access when your browser requests it — the app will use a default region.</li>
            </ul>
          </section>

          {/* Changes */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Changes to This Policy</h2>
            <p className="text-clay-text-muted leading-relaxed">
              We may update this privacy policy from time to time to reflect changes in our practices or for legal
              reasons. Any changes will be reflected on this page with an updated date. We encourage you to review this
              policy periodically.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-2">
            <h2 className="text-xl font-semibold text-clay-text mb-3">Contact</h2>
            <p className="text-clay-text-muted leading-relaxed">
              If you have questions or concerns about this privacy policy, please open an issue or start a discussion
              on our{' '}
              <a
                href="https://github.com/Kohulan/WhichMovieToWatch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub repository
              </a>
              .
            </p>
          </section>
        </div>

        {/* Bottom back link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-clay-text-muted hover:text-clay-text transition-colors duration-200"
          >
            ← Back to Which Movie To Watch
          </Link>
        </div>
      </div>
    </div>
  );
}
