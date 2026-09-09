'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import Header from '../../components/Header';

export default function AdminHome() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      // RLS on the businesses table means this automatically returns only
      // rows where owner_id matches the logged-in user — no manual filter needed.
      const { data } = await supabase.from('businesses').select('id, name');
      const list = data || [];

      // Most owners have exactly one business — skip the picker entirely
      // and go straight to it. Only show a list when there's genuinely
      // more than one to choose from.
      if (list.length === 1) {
        router.replace(`/admin/${list[0].id}`);
        return;
      }

      setBusinesses(list);
    }

    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (!businesses) {
    return (
      <>
        <Header showLogout onLogout={handleLogout} />
        <div className="center-screen">Loading…</div>
      </>
    );
  }

  return (
    <>
      <Header showLogout onLogout={handleLogout} />
      <div className="dashboard">
        <h1>Your businesses</h1>
        <p className="subtitle">Pick one to edit.</p>

        {businesses.length === 0 && <p>No businesses linked to your account yet.</p>}

        <div className="business-list">
          {businesses.map((b) => (
            <Link href={`/admin/${b.id}`} className="business-card" key={b.id}>
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
