const bookSchemaFields = [
  { key: "name", label: "Book Name", type: "string", required: true },
  { key: "title", label: "Title", type: "string", required: true },
  { key: "price", label: "Price (₹)", type: "number", required: true },
  { key: "category", label: "Category", type: "enum", options: ["Free", "Paid"], required: true },
  { key: "image_url", label: "Image URL", type: "url", required: false },
  { key: "website", label: "Website URL", type: "url", required: false },
];

function SchemaCard({ data }) {
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-blue-400 shadow-md my-3">
      <h3 className="font-bold text-blue-500 mb-3 text-sm">📖 New Book Preview</h3>
      <div className="space-y-2">
        {bookSchemaFields.map(field => {
          const value = data[field.key];
          const isFilled = value !== undefined && value !== null && value !== "";
          return (
            <div key={field.key} className="flex justify-between items-center text-xs">
              <span className="text-gray-600 dark:text-gray-400">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </span>
              <span className={`font-mono ${isFilled ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                {isFilled ? String(value) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SchemaCard;
