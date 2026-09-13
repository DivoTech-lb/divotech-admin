'use client';

import { useEffect, useRef, useState } from 'react';
import ImageUploader from './ImageUploader';

// A schema is just: { fields: [ { key, label, type, itemFields? }, ... ] }
// Supported types: 'text', 'textarea', 'number', 'image', 'list', 'group'
// A 'list' field's itemFields is itself a field array — this is what
// lets a list contain items that are objects with their own fields,
// and lets one of those fields be another list (arbitrary nesting).
// A 'group' field is like 'list' but for exactly one fixed nested object
// instead of a repeatable array — e.g. a price that's always { lbp, usd }.
//
// `topLevel` is only ever passed `true` by the outermost call (the actual
// business edit page) — it turns on the sticky section nav. Nested
// recursive calls (list items, group contents) never pass it, so the nav
// only ever appears once, for the real top-level sections.

export default function SchemaForm({ schema, data, onChange, businessId, topLevel = false }) {
  const [activeKey, setActiveKey] = useState(schema.fields[0]?.key);
  const sectionRefs = useRef({});

  useEffect(() => {
    if (!topLevel || schema.fields.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveKey(entry.target.dataset.sectionKey);
        });
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [topLevel, schema.fields]);

  function updateField(key, value) {
    onChange({ ...data, [key]: value });
  }

  function scrollToSection(key) {
    sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (!topLevel || schema.fields.length < 2) {
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

  return (
    <>
      <nav className="schema-nav">
        {schema.fields.map((field) => (
          <button
            key={field.key}
            type="button"
            className={'schema-nav-pill' + (activeKey === field.key ? ' active' : '')}
            onClick={() => scrollToSection(field.key)}
          >
            {field.label}
          </button>
        ))}
      </nav>

      <div className="schema-form">
        {schema.fields.map((field) => (
          <div
            key={field.key}
            id={`schema-section-${field.key}`}
            data-section-key={field.key}
            ref={(el) => { sectionRefs.current[field.key] = el; }}
            className="schema-section"
          >
            <FieldRenderer
              field={field}
              value={data ? data[field.key] : undefined}
              onChange={(v) => updateField(field.key, v)}
              businessId={businessId}
            />
          </div>
        ))}
      </div>
    </>
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

function getItemLabel(item, itemFields, index) {
  const textField = itemFields.find((f) => f.type === 'text');
  if (textField && item[textField.key]) return String(item[textField.key]);

  const textareaField = itemFields.find((f) => f.type === 'textarea');
  if (textareaField && item[textareaField.key]) {
    const val = String(item[textareaField.key]);
    return val.length > 40 ? val.slice(0, 40) + '…' : val;
  }

  return `Item ${index + 1}`;
}

function getItemCount(item, itemFields) {
  const listField = itemFields.find((f) => f.type === 'list');
  if (!listField) return null;
  const arr = item[listField.key] || [];
  return `${arr.length} item${arr.length === 1 ? '' : 's'}`;
}

function ListField({ field, items, onChange, businessId }) {
  const [expanded, setExpanded] = useState(() => new Set());

  function toggleExpanded(index) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

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

    const newIndex = items.length;
    onChange([...items, blank]);
    setExpanded((prev) => new Set(prev).add(newIndex));
  }

  function removeItem(index) {
    if (!confirm('Remove this item?')) return;
    onChange(items.filter((_, i) => i !== index));
    setExpanded((prev) => {
      const next = new Set();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }

  return (
    <div className="list-field">
      <label>{field.label}</label>

      {items.map((item, index) => {
        const isOpen = expanded.has(index);
        const label = getItemLabel(item, field.itemFields, index);
        const count = getItemCount(item, field.itemFields);

        return (
          <div className="list-item" key={index}>
            <div className="list-item-header" onClick={() => toggleExpanded(index)}>
              <span className="list-item-label">{label}</span>
              {count && <span className="list-item-count">{count}</span>}
              <button
                type="button"
                className="remove-btn"
                onClick={(e) => { e.stopPropagation(); removeItem(index); }}
              >
                Remove
              </button>
              <span className="list-item-chevron">{isOpen ? '▾' : '▸'}</span>
            </div>

            {isOpen && (
              <div className="list-item-body">
                <SchemaForm
                  schema={{ fields: field.itemFields }}
                  data={item}
                  onChange={(updated) => updateItem(index, updated)}
                  businessId={businessId}
                />
              </div>
            )}
          </div>
        );
      })}

      <button type="button" className="add-btn" onClick={addItem}>
        + Add {field.label}
      </button>
    </div>
  );
}