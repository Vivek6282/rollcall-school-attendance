import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import api from './api';

export default function Admin() {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals & Forms
  const [userModal, setUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ id: null, username: '', first_name: '', last_name: '', email: '', role: 'student', classroom: '', password: '' });
  const [classModal, setClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ id: null, name: '', grade: '', teacher: '' });
  const [subjectModal, setSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: null, name: '', code: '', classroom: '' });

  // Detail Modal for Student Subject Attendance
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadAll = async () => {
    try {
      const [anRes, uRes, cRes, sRes] = await Promise.all([
        api.get('/analytics/'),
        api.get('/users/'),
        api.get('/classes/'),
        api.get('/subjects/')
      ]);
      setAnalytics(anRes.data);
      setUsers(uRes.data);
      setClasses(cRes.data);
      setSubjects(sRes.data);
      setTeachers(uRes.data.filter((u) => u.role === 'teacher'));
    } catch {
      setErr('Failed to load administrative campus records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      const payload = { ...userForm };
      if (!payload.password) delete payload.password;
      if (!payload.classroom) payload.classroom = null;
      if (userForm.id) { await api.patch(`/users/${userForm.id}/`, payload); setMsg('User profile updated! 🌿'); }
      else { await api.post('/users/', payload); setMsg('New user created! 🌿'); }
      setUserModal(false); loadAll();
    } catch { setErr('Failed to save user.'); }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Delete user ${u.username}?`)) return;
    try { await api.delete(`/users/${u.id}/`); setMsg('User removed'); loadAll(); }
    catch { setErr('Failed to delete user'); }
  };

  const handleSaveClass = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      const payload = { ...classForm };
      if (!payload.teacher) payload.teacher = null;
      if (classForm.id) { await api.patch(`/classes/${classForm.id}/`, payload); setMsg('Classroom updated! 🌿'); }
      else { await api.post('/classes/', payload); setMsg('New class created! 🌿'); }
      setClassModal(false); loadAll();
    } catch { setErr('Failed to save class.'); }
  };

  const handleDeleteClass = async (c) => {
    if (!window.confirm(`Delete class ${c.name}?`)) return;
    try { await api.delete(`/classes/${c.id}/`); setMsg('Class deleted'); loadAll(); }
    catch { setErr('Failed to delete class'); }
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      const payload = { ...subjectForm };
      if (!payload.classroom) payload.classroom = null;
      if (subjectForm.id) { await api.patch(`/subjects/${subjectForm.id}/`, payload); setMsg('Subject updated! 🌿'); }
      else { await api.post('/subjects/', payload); setMsg('Subject registered! 🌿'); }
      setSubjectModal(false); loadAll();
    } catch { setErr('Failed to save subject.'); }
  };

  const handleDeleteSubject = async (s) => {
    if (!window.confirm(`Delete subject ${s.name}?`)) return;
    try { await api.delete(`/subjects/${s.id}/`); setMsg('Subject deleted'); loadAll(); }
    catch { setErr('Failed to delete subject'); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-forest-800">
        <div className="text-4xl animate-bounce mb-3">🍃</div>
        <p className="font-bold text-base">Loading campus analytics & administrative portal...</p>
      </div>
    );
  }

  const filteredStudents = (analytics?.per_student || [])
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.classroom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortField] < b[sortField] ? (sortAsc ? -1 : 1) : (a[sortField] > b[sortField] ? (sortAsc ? 1 : -1) : 0)));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-950 text-white rounded-3xl p-6 shadow-md border border-forest-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-lime-400/20 text-lime-300 text-xs font-bold px-3 py-1 rounded-full border border-lime-400/30 mb-2">
            <span>🌿</span>
            <span>Campus Principal & Analytics</span>
          </div>
          <h1 className="text-2xl font-black font-serif">Campus Oversight & Analytics</h1>
          <p className="text-forest-200 text-xs mt-1">Detailed subject-level analytics, at-risk alerts, user CRUD & classrooms.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-forest-200 overflow-x-auto">
        {[
          ['analytics', '📊 Campus Analytics'],
          ['users', '👥 User Registry'],
          ['classes', '🏫 Classrooms'],
          ['subjects', '📖 Academic Subjects']
        ].map(([t, label]) => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`py-3 px-5 font-black text-sm rounded-t-2xl whitespace-nowrap transition ${tab === t ? 'bg-white text-forest-900 border-t-2 border-forest-800 shadow-sm' : 'text-slate-500 hover:text-forest-800'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {msg && <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs rounded-2xl font-bold flex items-center space-x-2"><span>✅</span><span>{msg}</span></div>}
      {err && <div className="p-3.5 bg-rose-50 text-rose-900 border border-rose-200 text-xs rounded-2xl font-bold flex items-center space-x-2"><span>⚠️</span><span>{err}</span></div>}

      {/* TAB 1: ANALYTICS */}
      {tab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['Enrolled Students', analytics.totals.students, 'forest', '🎓'],
              ['Faculty Staff', analytics.totals.teachers, 'emerald', '📚'],
              ['Active Classrooms', analytics.totals.classes, 'teal', '🏫'],
              ['Campus Overall Rate', `${analytics.totals.overall_rate}%`, 'forest', '🌿']
            ].map(([l, v, c, icon]) => (
              <div key={l} className="bg-white p-5 rounded-3xl shadow-sm border border-forest-100 text-center hover:shadow transition">
                <span className="text-2xl block mb-1">{icon}</span>
                <span className="text-xs font-black uppercase tracking-wider text-forest-800">{l}</span>
                <span className={`text-3xl font-black block mt-1 text-${c}-800`}>{v}</span>
              </div>
            ))}
          </div>

          {/* Charts Row 1: Trend & Class */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-forest-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-forest-800 mb-4 flex items-center space-x-2">
                <span>📈</span>
                <span>30-Day Attendance Trend (%)</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#14532d', color: '#fff', borderRadius: '12px', border: 'none' }} />
                    <Line type="monotone" dataKey="rate" stroke="#15803d" strokeWidth={3} dot={{ fill: '#4ade80' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-forest-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-forest-800 mb-4 flex items-center space-x-2">
                <span>🏫</span>
                <span>Classroom Attendance Comparison (%)</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.per_class}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#14532d', color: '#fff', borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="rate" fill="#16a34a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Subject-Wise Attendance Chart */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-forest-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-forest-800 mb-4 flex items-center space-x-2">
              <span>🌿</span>
              <span>Subject-Wise Attendance Rates Across Campus (%)</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subject_stats || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#14532d', color: '#fff', borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="rate" fill="#0d9488" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Roster Table with Subject Breakdown Drilldown */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-forest-100 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-forest-950 flex items-center space-x-2">
                  <span>🎓</span>
                  <span>Student Performance & Subject Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500">Click any student to view their subject-by-subject attendance records.</p>
              </div>
              <input 
                type="text" 
                placeholder="Search student or class..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full sm:w-64 p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/20 font-medium" 
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-100 text-slate-400 text-xs uppercase tracking-wider bg-forest-50/40 cursor-pointer">
                    <th onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }} className="py-2.5 px-3 rounded-l-xl">Student Name ↕</th>
                    <th onClick={() => { setSortField('classroom'); setSortAsc(!sortAsc); }} className="py-2.5 px-3">Classroom ↕</th>
                    <th className="py-2.5 px-3 text-center">Present</th>
                    <th className="py-2.5 px-3 text-center">Absent</th>
                    <th className="py-2.5 px-3 text-center">Late</th>
                    <th className="py-2.5 px-3 text-center">Excused</th>
                    <th onClick={() => { setSortField('rate'); setSortAsc(!sortAsc); }} className="py-2.5 px-3 text-right">Overall ↕</th>
                    <th className="py-2.5 px-3 text-right rounded-r-xl">Subject Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr 
                      key={s.id} 
                      className={`${s.rate < 75 ? 'bg-rose-50/70 hover:bg-rose-100/60' : 'hover:bg-forest-50/50'} transition cursor-pointer`}
                      onClick={() => setSelectedStudentDetail(s)}
                    >
                      <td className="py-3 px-3 font-bold text-forest-950 flex items-center space-x-2">
                        <span>{s.name}</span>
                        {s.rate < 75 && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-300">
                            At risk
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">{s.classroom}</td>
                      <td className="py-3 px-3 text-center text-forest-700 font-bold">{s.present}</td>
                      <td className="py-3 px-3 text-center text-rose-700 font-bold">{s.absent}</td>
                      <td className="py-3 px-3 text-center text-amber-700 font-bold">{s.late}</td>
                      <td className="py-3 px-3 text-center text-sky-700 font-bold">{s.excused}</td>
                      <td className={`py-3 px-3 text-right font-black ${s.rate < 75 ? 'text-rose-700' : 'text-forest-700'}`}>
                        {s.rate}%
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setSelectedStudentDetail(s); }} 
                          className="px-2.5 py-1 bg-forest-100 hover:bg-forest-200 text-forest-900 font-bold text-xs rounded-lg transition border border-forest-300 inline-flex items-center space-x-1"
                        >
                          <span>Subjects ({s.subjects ? s.subjects.length : 0})</span>
                          <span>🔍</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER CRUD */}
      {tab === 'users' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-forest-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-forest-950">Campus User Management</h3>
              <p className="text-xs text-slate-500">Manage administrator, faculty, and student credentials.</p>
            </div>
            <button 
              onClick={() => { 
                setUserForm({ id: null, username: '', first_name: '', last_name: '', email: '', role: 'student', classroom: '', password: '' }); 
                setUserModal(true); 
              }} 
              className="py-2.5 px-4 bg-forest-800 hover:bg-forest-900 text-white font-black text-xs rounded-xl transition shadow flex items-center space-x-1"
            >
              <span>+ Add User</span>
              <span>🌿</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-100 text-slate-400 text-xs uppercase tracking-wider bg-forest-50/40">
                  <th className="py-2.5 px-3 rounded-l-xl">Name</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Classroom</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-forest-50/50 transition">
                    <td className="py-3 px-3 font-bold text-forest-950">{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-xs">@{u.username}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'teacher' ? 'bg-forest-100 text-forest-800' : 'bg-lime-100 text-lime-900'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">{u.classroom_name || '-'}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button 
                        onClick={() => { 
                          setUserForm({ id: u.id, username: u.username, first_name: u.first_name, last_name: u.last_name, email: u.email, role: u.role, classroom: u.classroom || '', password: '' }); 
                          setUserModal(true); 
                        }} 
                        className="text-xs text-forest-700 font-bold hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(u)} className="text-xs text-rose-700 font-bold hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLASSES CRUD */}
      {tab === 'classes' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-forest-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-forest-950">Campus Classrooms</h3>
              <p className="text-xs text-slate-500">Configure academic grades and assigned faculty advisors.</p>
            </div>
            <button 
              onClick={() => { setClassForm({ id: null, name: '', grade: '', teacher: '' }); setClassModal(true); }} 
              className="py-2.5 px-4 bg-forest-800 hover:bg-forest-900 text-white font-black text-xs rounded-xl transition shadow flex items-center space-x-1"
            >
              <span>+ Add Class</span>
              <span>🏫</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-100 text-slate-400 text-xs uppercase tracking-wider bg-forest-50/40">
                  <th className="py-2.5 px-3 rounded-l-xl">Class Name</th>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Faculty Advisor</th>
                  <th className="py-2.5 px-3 text-center">Students</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-forest-50/50 transition">
                    <td className="py-3 px-3 font-bold text-forest-950">{c.name}</td>
                    <td className="py-3 px-3 text-slate-600 font-semibold">{c.grade}</td>
                    <td className="py-3 px-3 text-forest-800 font-semibold">{c.teacher_name || 'Unassigned'}</td>
                    <td className="py-3 px-3 text-center font-black text-forest-900">{c.student_count}</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button 
                        onClick={() => { setClassForm({ id: c.id, name: c.name, grade: c.grade, teacher: c.teacher || '' }); setClassModal(true); }} 
                        className="text-xs text-forest-700 font-bold hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteClass(c)} className="text-xs text-rose-700 font-bold hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUBJECTS CRUD */}
      {tab === 'subjects' && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-forest-100 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-forest-950">Curriculum Subjects</h3>
              <p className="text-xs text-slate-500">Configure subjects and link them to classrooms for granular attendance tracking.</p>
            </div>
            <button 
              onClick={() => { setSubjectForm({ id: null, name: '', code: '', classroom: '' }); setSubjectModal(true); }} 
              className="py-2.5 px-4 bg-forest-800 hover:bg-forest-900 text-white font-black text-xs rounded-xl transition shadow flex items-center space-x-1"
            >
              <span>+ Add Subject</span>
              <span>📖</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-100 text-slate-400 text-xs uppercase tracking-wider bg-forest-50/40">
                  <th className="py-2.5 px-3 rounded-l-xl">Subject Name</th>
                  <th className="py-2.5 px-3">Subject Code</th>
                  <th className="py-2.5 px-3">Assigned Class</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const targetCls = classes.find((c) => c.id === sub.classroom);
                  return (
                    <tr key={sub.id} className="hover:bg-forest-50/50 transition">
                      <td className="py-3 px-3 font-bold text-forest-950 flex items-center space-x-2">
                        <span>🌿</span>
                        <span>{sub.name}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs font-bold text-forest-700">{sub.code}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{targetCls ? targetCls.name : 'Universal / All'}</td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button 
                          onClick={() => { setSubjectForm({ id: sub.id, name: sub.name, code: sub.code, classroom: sub.classroom || '' }); setSubjectModal(true); }} 
                          className="text-xs text-forest-700 font-bold hover:underline"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteSubject(sub)} className="text-xs text-rose-700 font-bold hover:underline">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL MODAL (Subject Breakdown) */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-forest-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-forest-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-forest-700">Subject-Wise Analytics</span>
                <h3 className="text-2xl font-black text-forest-950 mt-0.5">{selectedStudentDetail.name}</h3>
                <span className="text-xs text-slate-500 font-semibold">{selectedStudentDetail.classroom} • Total Logged: {selectedStudentDetail.total || 0} sessions</span>
              </div>
              <button 
                onClick={() => setSelectedStudentDetail(null)}
                className="w-8 h-8 rounded-full bg-forest-100 hover:bg-forest-200 text-forest-900 font-black flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Overall Student Stats */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="p-3 bg-forest-50 rounded-xl text-center border border-forest-100">
                <span className="text-[10px] uppercase font-bold text-forest-700 block">Overall Rate</span>
                <span className={`text-xl font-black ${selectedStudentDetail.rate >= 75 ? 'text-forest-700' : 'text-rose-600'}`}>{selectedStudentDetail.rate}%</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present</span>
                <span className="text-xl font-black text-emerald-800">{selectedStudentDetail.present}</span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-center border border-rose-100">
                <span className="text-[10px] uppercase font-bold text-rose-700 block">Absent</span>
                <span className="text-xl font-black text-rose-800">{selectedStudentDetail.absent}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Late/Exc</span>
                <span className="text-xl font-black text-amber-800">{selectedStudentDetail.late + selectedStudentDetail.excused}</span>
              </div>
            </div>

            <h4 className="text-sm font-black text-forest-950 mb-3 flex items-center space-x-1">
              <span>🌿</span>
              <span>Individual Subject Attendance Breakdown</span>
            </h4>

            {(!selectedStudentDetail.subjects || selectedStudentDetail.subjects.length === 0) ? (
              <p className="text-center py-8 text-slate-400 text-sm">No subject attendance records found for this student.</p>
            ) : (
              <div className="space-y-3">
                {selectedStudentDetail.subjects.map((sub, idx) => {
                  const isAtRisk = sub.rate < 75;
                  return (
                    <div key={idx} className={`p-4 rounded-2xl border transition ${isAtRisk ? 'bg-rose-50/50 border-rose-200' : 'bg-forest-50/30 border-forest-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-extrabold text-sm text-forest-950">{sub.subject}</span>
                          <span className="text-[10px] font-mono text-forest-700 font-bold ml-2 bg-forest-100 px-2 py-0.5 rounded">{sub.code}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAtRisk && <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">At Risk</span>}
                          <span className={`text-base font-black ${isAtRisk ? 'text-rose-700' : 'text-forest-700'}`}>{sub.rate}%</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${isAtRisk ? 'bg-rose-500' : 'bg-forest-600'}`}
                          style={{ width: `${sub.rate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Present: <b className="text-forest-800">{sub.present}</b></span>
                        <span>Absent: <b className="text-rose-700">{sub.absent}</b></span>
                        <span>Late: <b className="text-amber-700">{sub.late}</b></span>
                        <span>Excused: <b className="text-sky-700">{sub.excused}</b></span>
                        <span>Total: <b>{sub.total}</b></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button 
                type="button" 
                onClick={() => setSelectedStudentDetail(null)} 
                className="px-5 py-2.5 bg-forest-800 hover:bg-forest-900 text-white font-bold rounded-xl text-xs transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER */}
      {userModal && (
        <div className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-100">
            <h3 className="text-lg font-black text-forest-950 mb-4">{userForm.id ? 'Edit User Profile' : 'Register New Campus User'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-black text-forest-800 mb-1">Username</label>
                <input required type="text" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-forest-800 mb-1">First Name</label>
                  <input type="text" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-forest-800 mb-1">Last Name</label>
                  <input type="text" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-forest-800 mb-1">Email</label>
                <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-800 mb-1">Password {userForm.id && '(leave blank to keep unchanged)'}</label>
                <input type="password" required={!userForm.id} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-forest-800 mb-1">Role</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-semibold">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {userForm.role === 'student' && (
                  <div>
                    <label className="block text-xs font-black text-forest-800 mb-1">Classroom</label>
                    <select value={userForm.classroom} onChange={(e) => setUserForm({ ...userForm, classroom: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-semibold">
                      <option value="">None</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setUserModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white font-black rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLASSROOM */}
      {classModal && (
        <div className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-100">
            <h3 className="text-lg font-black text-forest-950 mb-4">{classForm.id ? 'Edit Class Details' : 'Create Classroom'}</h3>
            <form onSubmit={handleSaveClass} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-black text-forest-800 mb-1">Class Name</label>
                <input required type="text" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. Grade 8 - Redwood" className="w-full p-2.5 border border-slate-300 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-forest-800 mb-1">Grade</label>
                  <input required type="text" value={classForm.grade} onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })} placeholder="8" className="w-full p-2.5 border border-slate-300 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-black text-forest-800 mb-1">Faculty Advisor</label>
                  <select value={classForm.teacher} onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold">
                    <option value="">None</option>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name ? `${t.first_name} ${t.last_name}` : t.username}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setClassModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white font-black rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBJECT */}
      {subjectModal && (
        <div className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-100">
            <h3 className="text-lg font-black text-forest-950 mb-4">{subjectForm.id ? 'Edit Subject' : 'Add Academic Subject'}</h3>
            <form onSubmit={handleSaveSubject} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-black text-forest-800 mb-1">Subject Name</label>
                <input required type="text" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="e.g. Environmental Science" className="w-full p-2.5 border border-slate-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-800 mb-1">Subject Code</label>
                <input required type="text" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} placeholder="e.g. ENV101" className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase" />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-800 mb-1">Assigned Classroom</label>
                <select value={subjectForm.classroom} onChange={(e) => setSubjectForm({ ...subjectForm, classroom: e.target.value })} className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold">
                  <option value="">Universal / All</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setSubjectModal(false)} className="px-4 py-2 border rounded-xl text-slate-600 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-forest-800 hover:bg-forest-900 text-white font-black rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
