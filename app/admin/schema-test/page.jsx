'use client';

import { useState } from 'react';
import SchemaForm from '../../../components/SchemaForm';

// Schema 1: mirrors Joe's real menu shape — a list of categories,
// each containing a list of items. Two levels of nesting.
const restaurantSchema = {
  fields: [
    { key: 'name', label: 'Restaurant name', type: 'text' },
    {
      key: 'menu',
      label: 'Menu categories',
      type: 'list',
      itemFields: [
        { key: 'category', label: 'Category name', type: 'text' },
        {
          key: 'items',
          label: 'Items',
          type: 'list',
          itemFields: [
            { key: 'name', label: 'Item name', type: 'text' },
            { key: 'price', label: 'Price', type: 'number' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ],
        },
      ],
    },
  ],
};

const restaurantData = {
  name: "Joe's Trattoria",
  menu: [
    {
      category: 'Starters',
      items: [{ name: 'Burrata & Charred Fig', price: 12, description: 'Whipped burrata, charred figs' }],
    },
  ],
};

// Schema 2: a barber shop — deliberately flat, single-level, completely
// different field names and shape. Proves the renderer isn't secretly
// tied to "menu"-shaped data.
const barberSchema = {
  fields: [
    { key: 'shopName', label: 'Shop name', type: 'text' },
    {
      key: 'services',
      label: 'Services',
      type: 'list',
      itemFields: [
        { key: 'service', label: 'Service', type: 'text' },
        { key: 'duration', label: 'Duration (min)', type: 'number' },
        { key: 'price', label: 'Price', type: 'number' },
      ],
    },
  ],
};

const barberData = {
  shopName: "Tony's Barber",
  services: [{ service: 'Haircut', duration: 30, price: 15 }],
};

export default function SchemaTestPage() {
  const [which, setWhich] = useState('restaurant');
  const [restaurant, setRestaurant] = useState(restaurantData);
  const [barber, setBarber] = useState(barberData);

  const current = which === 'restaurant'
    ? { schema: restaurantSchema, data: restaurant, setData: setRestaurant }
    : { schema: barberSchema, data: barber, setData: setBarber };

  return (
    <div className="dashboard">
      <h1>Schema renderer test</h1>
      <p className="subtitle">
        Same component, two unrelated schemas — proving the form is genuinely generic before we wire it to real data.
      </p>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={which === 'restaurant' ? 'primary' : ''}
          style={{ padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer' }}
          onClick={() => setWhich('restaurant')}
        >
          Restaurant schema
        </button>
        <button
          className={which === 'barber' ? 'primary' : ''}
          style={{ padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer' }}
          onClick={() => setWhich('barber')}
        >
          Barber schema
        </button>
      </div>

      <SchemaForm schema={current.schema} data={current.data} onChange={current.setData} />

      <h2 style={{ fontSize: '0.95rem', color: '#9a9fab', marginTop: '2rem' }}>
        Live data state (proves edits are captured correctly):
      </h2>
      <pre style={{
        background: '#0f1013',
        padding: '1rem',
        borderRadius: 8,
        fontSize: '0.8rem',
        overflowX: 'auto',
      }}>
        {JSON.stringify(current.data, null, 2)}
      </pre>
    </div>
  );
}
