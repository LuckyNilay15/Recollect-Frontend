import { useState, useEffect } from "react";
import axios from "axios";

const DEFAULT_FIELDS = [
  { key: "name", label: "Name", type: "string", required: true },
  { key: "title", label: "Title", type: "string", required: true },
  { key: "price", label: "Price", type: "number", required: true },
  { key: "category", label: "Category", type: "enum", options: ["Free", "Paid"], required: true },
  { key: "image_url", label: "Image URL", type: "url", required: false },
  { key: "website", label: "Website", type: "url", required: false },
];

function SchemaCard({ entity, data, onConfirm, onCancel }) {
  const [schema, setSchema] = useState(null);
  const [editedData, setEditedData] = useState(data || {});

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("Users"))?.token;
    axios.get(`http://localhost:4002/admin/schema/${entity}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSchema(res.data))
      .catch(() => setSchema({ fields: DEFAULT_FIELDS }));
  }, [entity]);

  useEffect(() => {
    setEditedData(data || {});
  }, [data]);

  const fields = schema?.fields || DEFAULT_FIELDS;

  const handleChange = (key, value, type) => {
    setEditedData(prev => ({
      ...prev,
      [key]: type === "number" ? Number(value) : value,
    }));
  };

  if (!data) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-blue-400 shadow-md my-3">
      <h3 className="font-bold text-blue-500 mb-3 text-sm">
        📋 New {entity?.charAt(0).toUpperCase() + entity?.slice(1)} — Edit & Confirm
      </h3>
      <div className="space-y-2">
        {fields.map(field => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            {field.type === "enum" ? (
              <select
                value={editedData[field.key] || ""}
                onChange={e => handleChange(field.key, e.target.value, field.type)}
                className="p-1.5 text-xs rounded border dark:bg-slate-700 dark:border-slate-600"
              >
                <option value="">Select...</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === "number" ? "number" : "text"}
                value={editedData[field.key] ?? ""}
                onChange={e => handleChange(field.key, e.target.value, field.type)}
                className="p-1.5 text-xs rounded border dark:bg-slate-700 dark:border-slate-600"
                placeholder={field.label}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onConfirm && onConfirm(editedData)}
          className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2 rounded-lg"
        >
          ✓ Confirm & Create
        </button>
        <button
          onClick={() => onCancel && onCancel()}
          className="bg-slate-400 hover:bg-slate-500 text-white text-xs px-4 py-2 rounded-lg"
        >
          ✗ Cancel
        </button>
      </div>
    </div>
  );
}

export default SchemaCard;
