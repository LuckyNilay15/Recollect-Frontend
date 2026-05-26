import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";

function AdminDashboard({ section }) {
  const user = JSON.parse(localStorage.getItem("Users"));
  const token = user?.token;

  const [roleConfigs, setRoleConfigs] = useState({});
  const [toggleableTools, setToggleableTools] = useState([]);
  const [adminToggleableTools, setAdminToggleableTools] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ name: "", title: "", price: 0, category: "", image_url: "", website: "" });
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchAuditLogs();
    fetchBooks();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get("http://localhost:4002/admin/config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoleConfigs(res.data.configs);
      setToggleableTools(res.data.toggleableTools);
      setAdminToggleableTools(res.data.adminToggleableTools || []);
    } catch (err) {
      console.error("Failed to fetch config", err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await axios.get("http://localhost:4002/admin/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:4002/admin/books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books", err);
    }
  };

  const handleToggle = async (tool, currentlyEnabled) => {
    setConfigLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4002/admin/config/toggle",
        { targetRole: "User", tool, enabled: !currentlyEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoleConfigs(res.data.configs);
      fetchAuditLogs();
    } catch (err) {
      alert("Toggle failed");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleToggleAdmin = async (tool, currentlyEnabled) => {
    setConfigLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4002/admin/config/toggle",
        { targetRole: "Admin", tool, enabled: !currentlyEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoleConfigs(res.data.configs);
      fetchAuditLogs();
    } catch (err) {
      alert("Toggle failed");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleCreateBook = async () => {
    if (!newBook.name && !newBook.title) return alert("Name or title required");
    try {
      await axios.post("http://localhost:4002/admin/books", newBook, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewBook({ name: "", title: "", price: 0, category: "", image_url: "", website: "" });
      fetchBooks();
      fetchAuditLogs();
    } catch (err) {
      alert("Failed to create book");
    }
  };

  const handleDeleteBook = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      await axios.delete(`http://localhost:4002/admin/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
      fetchAuditLogs();
    } catch (err) {
      alert("Failed to delete book");
    }
  };

  return (
    <div className="dark:bg-slate-900 dark:text-white min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-screen-2xl container mx-auto md:px-20 px-4 mt-28">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Book Management */}
        {(section === "books" || !section) && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-500">Book Management</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <input placeholder="Name" value={newBook.name} onChange={e => setNewBook({...newBook, name: e.target.value})} className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600 text-sm" />
              <input placeholder="Title" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600 text-sm" />
              <input placeholder="Price" type="number" value={newBook.price} onChange={e => setNewBook({...newBook, price: Number(e.target.value)})} className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600 text-sm" />
              <input placeholder="Category (Free/Paid)" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600 text-sm" />
              <input placeholder="Image URL" value={newBook.image_url} onChange={e => setNewBook({...newBook, image_url: e.target.value})} className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600 text-sm" />
              <input placeholder="Website URL" value={newBook.website} onChange={e => setNewBook({...newBook, website: e.target.value})} className="p-2 rounded border dark:bg-slate-700 dark:border-slate-600 text-sm" />
            </div>
            <button onClick={handleCreateBook} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm mb-4">
              Add Book
            </button>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {books.map(book => (
                <div key={book._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <span className="font-semibold text-sm">{book.title || book.name}</span>
                    <span className="text-xs text-gray-500 ml-2">₹{book.price} • {book.category}</span>
                  </div>
                  <button onClick={() => handleDeleteBook(book._id)} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded">
                    Delete
                  </button>
                </div>
              ))}
              {books.length === 0 && <p className="text-sm text-gray-500">No books yet.</p>}
            </div>
          </div>
        )}

        {/* Tool Management */}
        {(section === "tools" || !section) && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-red-500">User Tool Access Control</h2>
            <p className="text-sm text-gray-500 mb-4">Toggle which AI tools are available to Users (changes propagate within 30s):</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {toggleableTools.map(tool => {
                const enabled = roleConfigs["User"]?.includes(tool);
                return (
                  <button
                    key={tool}
                    onClick={() => handleToggle(tool, enabled)}
                    disabled={configLoading}
                    className={`p-3 rounded-lg text-xs font-mono border transition-all ${
                      enabled
                        ? "bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {tool}
                    <span className="block mt-1 font-bold">{enabled ? "✓ ON" : "✗ OFF"}</span>
                  </button>
                );
              })}
            </div>

            {/* Admin's Own Tools */}
            <h3 className="text-md font-semibold mt-6 mb-2 text-orange-500">Admin Tools (your own chat tools)</h3>
            <p className="text-sm text-gray-500 mb-3">Toggle which AI tools are available to you in the chat:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {adminToggleableTools.map(tool => {
                const enabled = roleConfigs["Admin"]?.includes(tool);
                return (
                  <button
                    key={`admin-${tool}`}
                    onClick={() => handleToggleAdmin(tool, enabled)}
                    disabled={configLoading}
                    className={`p-3 rounded-lg text-xs font-mono border transition-all ${
                      enabled
                        ? "bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {tool}
                    <span className="block mt-1 font-bold">{enabled ? "✓ ON" : "✗ OFF"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {(section === "audit" || !section) && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-purple-500">Audit Logs</h2>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {auditLogs.map(log => (
                <div key={log._id} className="text-xs p-3 bg-slate-50 dark:bg-slate-700 rounded flex justify-between">
                  <span>
                    <span className="font-semibold">{log.adminId?.fullname || "Admin"}</span>
                    {" → "}{log.action}{" "}
                    <span className="font-mono">{log.details?.tool || log.details?.action || ""}</span>
                    {log.details?.role && <span className="text-pink-500"> ({log.details.role})</span>}
                  </span>
                  <span className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-sm text-gray-500">No audit logs yet.</p>}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboard;
