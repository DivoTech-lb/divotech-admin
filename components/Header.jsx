'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header({ breadcrumb, showLogout, onLogout }) {
  return (
    <header className="brand-header">
      <Link href="/" className="brand-logo-link">
        <Image src="/logo.png" alt="DivoTech" width={168} height={106} className="brand-logo" priority />
      </Link>

      {breadcrumb && <span className="brand-breadcrumb">{breadcrumb}</span>}

      {showLogout && (
        <button className="brand-logout" onClick={onLogout}>
          Log out
        </button>
      )}
    </header>
  );
}
