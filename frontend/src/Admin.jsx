import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from './api';

export default function Admin() {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [userModal, setUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ id: null, username: '', first_name: '', last_name: '', email: '', role: 'student', classroom: '', password: '' });
  const [classModal, setClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ id: null, name: '', grade: '', teacher: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadAll = async () => {
    try {
      const [anRes, uRes, cRes] = await Promise.all([api.get('/analytics/'), api.get('/users/'), api.get('/classes/')]);
      setAnalytics(anRes.data); setUsers(uRes.data); setClasses(cRes.data); setTeachers(uRes.data.filter((u) => u.role === 'teacher'));
    } catch { setErr('Failed to load administrative data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadAll(); }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      const payload = { ...userForm };
      if (!payload.password) delete payload.password;
      if (!payload.classroom) payload.classroom = null;
      if (userForm.id) { await api.patch(`/users/${userForm.id}/`, payload); setMsg('User updated!'); }
      else { await api.post('/users/', payload); setMsg('User created!'); }
      setUserModal(false); loadAll();
    } catch { setErr('Failed to save user.'); }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Delete user ${u.username}?`)) return;
    try { await api.delete(`/users/${u.id}/`); setMsg('User deleted'); loadAll(); }
    catch { setErr('Failed to delete user'); }
  };

  const handleSaveClass = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      const payload = { ...classForm };
      if (!payload.teacher) payload.teacher = null;
      if (classForm.id) { await api.patch(`/classes/${classForm.id}/`, payload); setMsg('Class updated!'); }
      else { await api.post('/classes/', payload); setMsg('Class created!'); }
      setClassModal(false); loadAll();
    } catch { setErr('Failed to save class.'); }
  };

  const handleDeleteClass = async (c) => {
    if (!window.confirm(`Delete class ${c.name}?`)) return;
    try { await api.delete(`/classes/${c.id}/`); setMsg('Class deleted'); loadAll(); }
    catch { setErr('Failed to delete class'); }
  };

  if (loading) return <div className="text-center p-12 text-slate-500 font-semibold">Loading admin portal...</div>;

  const filteredStudents = (analytics?.per_student || [])
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.classroom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortField] < b[sortField] ? (sortAsc ? -1 : 1) : (a[sortField] > b[sortField] ? (sortAsc ? 1 : -1) : 0)));

  return (
    <div className="space-y-6">
      <div className="flex border-b border-amber-200">
        {['analytics', 'users', 'classes'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`py-2.5 px-5 font-bold text-sm rounded-t-xl transition capitalize ${tab === t ? 'bg-white text-emerald-800 border-t-2 border-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
            {t === 'analytics' ? '📊 Analytics' : t === 'users' ? '👥 Users' : '🏫 Classes'}
          </button>
        ))}
      </div>
      {msg && <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm rounded-xl font-medium">{msg}</div>}
      {err && <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 text-sm rounded-xl font-medium">{err}</div>}
      {tab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[['Total Students', analytics.totals.students, 'slate'], ['Total Teachers', analytics.totals.teachers, 'slate'], ['Classrooms', analytics.totals.classes, 'slate'], ['Overall Rate', `${analytics.totals.overall_rate}%`, 'emerald']].map(([l, v, c]) => (
              <div key={l} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 text-center"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">{l}</span><span className={`text-3xl font-black block mt-1 text-${c}-700`}>{v}</span></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">30-Day Attendance Trend (%)</h3>
              <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={analytics.trend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} /><Tooltip /><Line type="monotone" dataKey="rate" stroke="#047857" strokeWidth={2.5} /></LineChart></ResponsiveContainer></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">Attendance Rate by Class (%)</h3>
              <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.per_class}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="rate" fill="#0d9488" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-800">Student Performance</h3>
              <input type="text" placeholder="Search student or class..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-64 p-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider cursor-pointer">
                  <th onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }} className="py-2.5 px-3">Student ↕</th>
                  <th onClick={() => { setSortField('classroom'); setSortAsc(!sortAsc); }} className="py-2.5 px-3">Class ↕</th>
                  <th className="py-2.5 px-3 text-center">Present</th><th className="py-2.5 px-3 text-center">Absent</th><th className="py-2.5 px-3 text-center">Late</th><th className="py-2.5 px-3 text-center">Excused</th>
                  <th onClick={() => { setSortField('rate'); setSortAsc(!sortAsc); }} className="py-2.5 px-3 text-right">Rate ↕</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className={s.rate < 75 ? 'bg-rose-50/70 hover:bg-rose-100/60' : 'hover:bg-amber-50/50'}>
                      <td className="py-2.5 px-3 font-semibold text-slate-700 flex items-center space-x-2"><span>{s.name}</span>{s.rate < 75 && <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-300">At risk</span>}</td>
                      <td className="py-2.5 px-3 text-slate-600">{s.classroom}</td>
                      <td className="py-2.5 px-3 text-center text-emerald-700 font-medium">{s.present}</td>
                      <td className="py-2.5 px-3 text-center text-rose-700 font-medium">{s.absent}</td>
                      <td className="py-2.5 px-3 text-center text-amber-700 font-medium">{s.late}</td>
                      <td className="py-2.5 px-3 text-center text-sky-700 font-medium">{s.excused}</td>
                      <td className={`py-2.5 px-3 text-right font-extrabold ${s.rate < 75 ? 'text-rose-700' : 'text-emerald-700'}`}>{s.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {tab === 'users' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 space-y-4">
          <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-slate-800">User Management</h3><button onClick={() => { setUserForm({ id: null, username: '', first_name: '', last_name: '', email: '', role: 'student', classroom: '', password: '' }); setUserModal(true); }} className="py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition">+ Add User</button></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider"><th className="py-2.5 px-3">Name</th><th className="py-2.5 px-3">Username</th><th className="py-2.5 px-3">Role</th><th className="py-2.5 px-3">Class</th><th className="py-2.5 px-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-xs">{u.username}</td>
                    <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>{u.role}</span></td>
                    <td className="py-2.5 px-3 text-slate-600">{u.classroom_name || '-'}</td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button onClick={() => { setUserForm({ id: u.id, username: u.username, first_name: u.first_name, last_name: u.last_name, email: u.email, role: u.role, classroom: u.classroom || '', password: '' }); setUserModal(true); }} className="text-xs text-blue-700 font-bold hover:underline">Edit</button>
                      <button onClick={() => handleDeleteUser(u)} className="text-xs text-rose-700 font-bold hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'classes' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 space-y-4">
          <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-slate-800">Classrooms</h3><button onClick={() => { setClassForm({ id: null, name: '', grade: '', teacher: '' }); setClassModal(true); }} className="py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition">+ Add Class</button></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider"><th className="py-2.5 px-3">Class Name</th><th className="py-2.5 px-3">Grade</th><th className="py-2.5 px-3">Teacher</th><th className="py-2.5 px-3 text-center">Students</th><th className="py-2.5 px-3 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{c.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.grade}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.teacher_name || 'None'}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">{c.student_count}</td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button onClick={() => { setClassForm({ id: c.id, name: c.name, grade: c.grade, teacher: c.teacher || '' }); setClassModal(true); }} className="text-xs text-blue-700 font-bold hover:underline">Edit</button>
                      <button onClick={() => handleDeleteClass(c)} className="text-xs text-rose-700 font-bold hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {userModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-amber-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{userForm.id ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-3 text-sm">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Username</label><input required type="text" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} className="w-full p-2 border border-slate-300 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">First Name</label><input type="text" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} className="w-full p-2 border border-slate-300 rounded-xl" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Last Name</label><input type="text" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} className="w-full p-2 border border-slate-300 rounded-xl" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Email</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full p-2 border border-slate-300 rounded-xl" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Password {userForm.id && '(blank to keep)'}</label><input type="password" required={!userForm.id} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full p-2 border border-slate-300 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Role</label><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full p-2 border border-slate-300 rounded-xl"><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></div>
                {userForm.role === 'student' && <div><label className="block text-xs font-bold text-slate-600 mb-1">Classroom</label><select value={userForm.classroom} onChange={(e) => setUserForm({ ...userForm, classroom: e.target.value })} className="w-full p-2 border border-slate-300 rounded-xl"><option value="">None</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
              </div>
              <div className="flex justify-end space-x-2 pt-3"><button type="button" onClick={() => setUserModal(false)} className="px-4 py-2 border rounded-xl text-slate-600">Cancel</button><button type="submit" className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl">Save</button></div>
            </form>
          </div>
        </div>
      )}
      {classModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-amber-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{classForm.id ? 'Edit Class' : 'Create Class'}</h3>
            <form onSubmit={handleSaveClass} className="space-y-3 text-sm">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Class Name</label><input required type="text" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. Grade 8 - Sunflower" className="w-full p-2 border border-slate-300 rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Grade</label><input required type="text" value={classForm.grade} onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })} placeholder="8" className="w-full p-2 border border-slate-300 rounded-xl" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">Teacher</label><select value={classForm.teacher} onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value })} className="w-full p-2 border border-slate-300 rounded-xl"><option value="">None</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name ? `${t.first_name} ${t.last_name}` : t.username}</option>)}</select></div>
              </div>
              <div className="flex justify-end space-x-2 pt-3"><button type="button" onClick={() => setClassModal(false)} className="px-4 py-2 border rounded-xl text-slate-600">Cancel</button><button type="submit" className="px-4 py-2 bg-emerald-800 text-white font-bold rounded-xl">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
