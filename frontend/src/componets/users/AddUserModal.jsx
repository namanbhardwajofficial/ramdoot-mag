import { useState } from 'react';
import Modal from '@/componets/ui/modal';

export default function AddUserModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'User' });

  function update(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: '', email: '', phone: '', role: 'User' });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add New User</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required placeholder="Enter full name"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="Enter email"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 XXXXXXXXXX"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select value={form.role} onChange={(e) => update('role', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-slate-300 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-slate-900 text-white hover:bg-slate-800">Add User</button>
        </div>
      </form>
    </Modal>
  );
}
