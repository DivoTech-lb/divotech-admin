'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import SchemaForm from '../../../components/SchemaForm';
import Header from '../../../components/Header';

export default function BusinessAdminPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.businessId;

  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [schema, setSchema] = useState(null);
  const [content, setContent] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/business?businessId=${businessId}`, {
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
      });

      if (res.status === 403) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      const { business, content } = await res.json();
      setBusinessName(business.name);
      setSchema(business.schema);
      setContent(content);
      setLoading(false);
    }

    load();
  }, [businessId, router]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();

    const res = await fetch('/api/update-business', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify({ businessId, content }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(`Save failed: ${body.detail || body.error || res.status}`);
      return;
    }

    setSavedMessage(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <>
        <Header showLogout onLogout={handleLogout} />
        <div className="center-screen">Loading…</div>
      </>
    );
  }

  if (notAllowed) {
    return (
      <>
        <Header showLogout onLogout={handleLogout} />
        <div className="center-screen">
          <p>This business doesn't exist, or isn't linked to your account.</p>
        </div>
      </>
    );
  }

  if (!schema) {
    return (
      <>
        <Header showLogout onLogout={handleLogout} />
        <div className="center-screen">
          <p>This business doesn't have a schema set up yet.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header breadcrumb={businessName} showLogout onLogout={handleLogout} />
      <div className="dashboard">
        <h1>{businessName}</h1>
        <p className="subtitle">Edit your info below, then save — this updates the live site.</p>

        <SchemaForm schema={schema} data={content} onChange={setContent} businessId={businessId} />

        <div className="save-row">
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {savedMessage && <span className="saved-msg">Saved — the live site is rebuilding now.</span>}
          {error && <span className="error-text">{error}</span>}
        </div>
      </div>
    </>
  );
}
