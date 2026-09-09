'use client';

import ImageUploader from './ImageUploader';

// A schema is just: { fields: [ { key, label, type, itemFields? }, ... ] }
// Supported types: 'text', 'textarea', 'number', 'image', 'list', 'group'
// A 'list' field's itemFields is itself a field array — this is what
// lets a list contain items that are objects with their own fields,
// and lets one of those fields be another list (arbitrary nesting).
// A 'group' field is like 'list' but for exactly one fixed nested object
// instead of a repeatable array — e.g. a price that's always { lbp, usd }.

export default function SchemaForm({ schema, data, onChange, businessId }) {
  function updateField(key, value) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="schema-form">
      {schema.fields.map((field) => (
        <FieldRenderer
          key={field.key}
          field={field}
          value={data ? data[field.key] : undefined}
          onChange={(v) => updateField(field.key, v)}
          businessId={businessId}
        />
      ))}
    </div>
  );
}

function FieldRenderer({ field, value, onChange, businessId }) {
  switch (field.type) {
    case 'text':
      return (
        <div className="field">
          <label>{field.label}</label>
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case 'textarea':
      return (
        <div className="field">
          <label>{field.label}</label>
          <textarea
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        </div>
      );

    case 'number':
      return (
        <div className="field">
          <label>{field.label}</label>
          <input
            type="number"
            value={value ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );

    case 'image':
      return (
        <ImageUploader
          label={field.label}
          value={value}
          onChange={onChange}
          businessId={businessId}
        />
      );

    case 'group':
      return (
        <div className="group-field">
          <label>{field.label}</label>
          <div className="group-box">
            <SchemaForm
              schema={{ fields: field.itemFields }}
              data={value || {}}
              onChange={onChange}
              businessId={businessId}
            />
          </div>
        </div>
      );

    case 'list':
      return (
        <ListField
          field={field}
          items={value || []}
          onChange={onChange}
          businessId={businessId}
        />
      );

    default:
      return (
        <p style={{ color: '#e2564f', fontSize: '0.85rem' }}>
          Unknown field type: {field.type}
        </p>
      );
  }
}

function ListField({ field, items, onChange, businessId }) {
  function updateItem(index, updatedItemData) {
    const next = items.map((item, i) => (i === index ? updatedItemData : item));
    onChange(next);
  }

  function addItem() {
    const blank = {};
    field.itemFields.forEach((f) => {
      if (f.type === 'list') blank[f.key] = [];
      else if (f.type === 'group') {
        blank[f.key] = {};
        f.itemFields.forEach((sf) => { blank[f.key][sf.key] = sf.type === 'number' ? 0 : ''; });
      } else if (f.type === 'number') blank[f.key] = 0;
      else blank[f.key] = '';
    });
    onChange([...items, blank]);
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="list-field">
      <label>{field.label}</label>

      {items.map((item, index) => (
        <div className="list-item" key={index}>
          <SchemaForm
            schema={{ fields: field.itemFields }}
            data={item}
            onChange={(updated) => updateItem(index, updated)}
            businessId={businessId}
          />
          <button type="button" className="remove-btn" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" className="add-btn" onClick={addItem}>
        + Add {field.label}
      </button>
    </div>
  );
}
