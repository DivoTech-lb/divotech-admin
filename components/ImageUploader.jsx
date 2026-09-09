'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ImageUploader({ label, value, onChange, businessId }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const path = `${businessId}/${crypto.randomUUID()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('business-images')
      .upload(path, file, { upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('business-images').getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="field">
      <label>{label}</label>
      {value && (
        <img
          src={value}
          alt=""
          style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: '0.5rem' }}
        />
      )}
      <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} />
      {uploading && <p style={{ fontSize: '0.8rem', color: '#9a9fab', margin: '0.4rem 0 0' }}>Uploading…</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
