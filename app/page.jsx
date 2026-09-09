import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'DivoTech Admin — Manage your site',
};

export default function LandingPage() {
  return (
    <>
      <section className="landing-hero">
        <Image src="/logo.png" alt="DivoTech" width={220} height={139} className="brand-logo-large" priority />
        <h1>Your website, edited by you.</h1>
        <p>Update your menu, prices, hours, and photos in seconds — your live site rebuilds itself automatically.</p>
        <Link href="/login" className="landing-cta">Log in to your dashboard</Link>
      </section>

      <div className="landing-features">
        <div className="landing-feature-card">
          <div className="icon">⚡</div>
          <h3>Instant updates</h3>
          <p>Change a price or add a photo, hit save, and your live site updates within seconds — no waiting, no developer needed.</p>
        </div>
        <div className="landing-feature-card">
          <div className="icon">🔒</div>
          <h3>Only you can edit it</h3>
          <p>Your dashboard is private to your account — nobody else can see or change your business's content.</p>
        </div>
        <div className="landing-feature-card">
          <div className="icon">🖼️</div>
          <h3>Add your own photos</h3>
          <p>Upload photos straight from your phone or computer — they show up on your site automatically.</p>
        </div>
      </div>

      <div className="landing-how">
        <h2>How it works</h2>

        <div className="landing-step">
          <div className="num">1</div>
          <div>
            <h4>Log in</h4>
            <p>Use the email and password DivoTech set up for you.</p>
          </div>
        </div>

        <div className="landing-step">
          <div className="num">2</div>
          <div>
            <h4>Edit your info</h4>
            <p>Update your menu, services, hours, or photos in a simple form built specifically for your business.</p>
          </div>
        </div>

        <div className="landing-step">
          <div className="num">3</div>
          <div>
            <h4>Save</h4>
            <p>Your live website rebuilds itself automatically — no need to contact anyone or wait days for a change.</p>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        <p>DivoTech — websites, NFC cards, and point-of-sale for local businesses.</p>
        <div className="footer-links">
          <a href="mailto:divotech.lb@gmail.com">divotech.lb@gmail.com</a>
          <a href="tel:71154647">71 154 647</a>
        </div>
      </footer>
    </>
  );
}
