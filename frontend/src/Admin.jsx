import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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
      setErr('Failed to load botanical campus records');
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
      if (userForm.id) { await api.patch(`/users/${userForm.id}/`, payload); setMsg('Scholar / faculty record updated! 🌿'); }
      else { await api.post('/users/', payload); setMsg('New user enrolled into sanctuary! 🌿'); }
      setUserModal(false); loadAll();
    } catch { setErr('Failed to save user.'); }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Remove user ${u.username} from campus database?`)) return;
    try { await api.delete(`/users/${u.id}/`); setMsg('User record removed'); loadAll(); }
    catch { setErr('Failed to delete user'); }
  };

  const handleSaveClass = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      const payload = { ...classForm };
      if (!payload.teacher) payload.teacher = null;
      if (classForm.id) { await api.patch(`/classes/${classForm.id}/`, payload); setMsg('Classroom sanctuary updated! 🌿'); }
      else { await api.post('/classes/', payload); setMsg('New classroom sanctuary established! 🌿'); }
      setClassModal(false); loadAll();
    } catch { setErr('Failed to save class.'); }
  };

  const handleDeleteClass = async (c) => {
    if (!window.confirm(`Disband class ${c.name}?`)) return;
    try { await api.delete(`/classes/${c.id}/`); setMsg('Classroom deleted'); loadAll(); }
    catch { setErr('Failed to delete class'); }
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault(); setMsg(''); setErr('');
    try {
      const payload = { ...subjectForm };
      if (!payload.classroom) payload.classroom = null;
      if (subjectForm.id) { await api.patch(`/subjects/${subjectForm.id}/`, payload); setMsg('Curriculum field updated! 🌿'); }
      else { await api.post('/subjects/', payload); setMsg('New curriculum field added! 🌿'); }
      setSubjectModal(false); loadAll();
    } catch { setErr('Failed to save subject.'); }
  };

  const handleDeleteSubject = async (s) => {
    if (!window.confirm(`Remove subject ${s.name}?`)) return;
    try { await api.delete(`/subjects/${s.id}/`); setMsg('Subject removed'); loadAll(); }
    catch { setErr('Failed to delete subject'); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-forest-900">
        <div className="text-5xl animate-bounce mb-3">🌲</div>
        <p className="font-serif font-black text-xl text-forest-900">Loading principal analytics & campus sanctuary...</p>
      </div>
    );
  }

  const filteredStudents = (analytics?.per_student || [])
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.classroom.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a[sortField] < b[sortField] ? (sortAsc ? -1 : 1) : (a[sortField] > b[sortField] ? (sortAsc ? 1 : -1) : 0)));

  return (
    <div className="space-y-6">
      {/* Top Banner with Principal Botanical Dignity */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-forest-700/60 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-forest-800/80 text-lime-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-lime-400/30 mb-3 shadow-sm">
            <span>🌲</span>
            <span>Campus Principal Sanctuary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">Eco-Campus Governance & Analytics</h1>
          <p className="text-forest-200 text-xs sm:text-sm mt-1 max-w-xl">
            Complete institutional metrics across departments, subject fields, faculty assignments, and scholar health.
          </p>
        </div>

        <div className="relative z-10 bg-forest-950/80 backdrop-blur-md rounded-2xl px-5 py-3 border border-forest-700/60 text-center flex items-center space-x-3 shadow-inner">
          <span className="text-3xl">🌿</span>
          <div className="text-left">
            <span className="text-[10px] uppercase font-black text-forest-300 block tracking-widest">Campus Health</span>
            <span className="text-2xl font-black font-serif text-lime-300">{analytics?.totals?.overall_rate}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-forest-200/80 overflow-x-auto">
        {[
          ['analytics', '📊 Campus Analytics', '🌲'],
          ['users', '👥 User Registry', '🌱'],
          ['classes', '🏫 Classrooms', '🏡'],
          ['subjects', '📖 Curriculum Fields', '🍃']
        ].map(([t, label, icon]) => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`py-3.5 px-6 font-black text-sm rounded-t-3xl whitespace-nowrap transition flex items-center space-x-2 font-serif ${tab === t ? 'bg-white text-forest-950 border-t-2 border-forest-800 shadow-sm' : 'text-forest-700 hover:text-forest-950'}`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {msg && <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs rounded-2xl font-bold flex items-center space-x-2 shadow-sm"><span>🌱</span><span>{msg}</span></div>}
      {err && <div className="p-4 bg-rose-50 text-rose-950 border border-rose-300 text-xs rounded-2xl font-bold flex items-center space-x-2 shadow-sm"><span>⚠️</span><span>{err}</span></div>}

      {/* TAB 1: ANALYTICS */}
      {tab === 'analytics' && analytics && (
        <div className="space-y-6">
          {/* KPI Botanical Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ['Enrolled Scholars', analytics.totals.students, '🎓', 'bg-forest-50/70 border-forest-200 text-forest-950'],
              ['Faculty Naturalists', analytics.totals.teachers, '📚', 'bg-emerald-50/70 border-emerald-200 text-emerald-950'],
              ['Living Classrooms', analytics.totals.classes, '🏫', 'bg-teal-50/70 border-teal-200 text-teal-950'],
              ['Ecological Standing', `${analytics.totals.overall_rate}%`, '🌿', 'bg-lime-50/70 border-lime-300 text-lime-950']
            ].map(([l, v, icon, cardCls]) => (
              <div key={l} className={`p-5 rounded-3xl shadow-sm border text-center hover:scale-[1.02] transition backdrop-blur-sm ${cardCls}`}>
                <span className="text-3xl block mb-1">{icon}</span>
                <span className="text-xs font-black uppercase tracking-wider block">{l}</span>
                <span className="text-3xl font-black font-serif block mt-1.5">{v}</span>
              </div>
            ))}
          </div>

          {/* Charts Row 1: Trend & Class */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-3xl shadow-sm border border-forest-200/80">
              <h3 className="text-xs font-black uppercase tracking-wider text-forest-900 mb-4 flex items-center space-x-2">
                <span>📈</span>
                <span>30-Day Campus Attendance Footprint (%)</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#166534' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#166534' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0c2313', color: '#fff', borderRadius: '16px', border: '1px solid #276233' }} />
                    <Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#84cc16', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-3xl shadow-sm border border-forest-200/80">
              <h3 className="text-xs font-black uppercase tracking-wider text-forest-900 mb-4 flex items-center space-x-2">
                <span>🏫</span>
                <span>Classroom Comparative Presence (%)</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.per_class}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#166534' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#166534' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0c2313', color: '#fff', borderRadius: '16px', border: '1px solid #276233' }} />
                    <Bar dataKey="rate" fill="#15803d" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Subject-Wise Attendance Chart */}
          <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-3xl shadow-sm border border-forest-200/80">
            <h3 className="text-xs font-black uppercase tracking-wider text-forest-900 mb-4 flex items-center space-x-2">
              <span>🌿</span>
              <span>Curriculum Field Presence Across Campus (%)</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subject_stats || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#166534' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#166534' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0c2313', color: '#fff', borderRadius: '16px', border: '1px solid #276233' }} />
                  <Bar dataKey="rate" fill="#0d9488" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scholar Roster Table with Subject Breakdown Drilldown */}
          <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-3xl shadow-sm border border-forest-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black font-serif text-forest-950 flex items-center space-x-2">
                  <span>🎓</span>
                  <span>Scholar Academic Performance Roster</span>
                </h3>
                <p className="text-xs text-forest-700">Click any scholar to inspect their subject-by-subject attendance report.</p>
              </div>
              <input 
                type="text" 
                placeholder="Search by scholar or class..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full sm:w-64 p-3 rounded-2xl border border-forest-200 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/30 font-medium text-forest-950 shadow-sm" 
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-200 text-forest-800 text-xs font-black uppercase tracking-wider bg-forest-100/60 cursor-pointer">
                    <th onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }} className="py-3 px-3 rounded-l-2xl">Scholar Name ↕</th>
                    <th onClick={() => { setSortField('classroom'); setSortAsc(!sortAsc); }} className="py-3 px-3">Classroom ↕</th>
                    <th className="py-3 px-3 text-center">Present</th>
                    <th className="py-3 px-3 text-center">Absent</th>
                    <th className="py-3 px-3 text-center">Late</th>
                    <th className="py-3 px-3 text-center">Excused</th>
                    <th onClick={() => { setSortField('rate'); setSortAsc(!sortAsc); }} className="py-3 px-3 text-right">Standing ↕</th>
                    <th className="py-3 px-3 text-right rounded-r-2xl">Subject Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100/80">
                  {filteredStudents.map((s) => (
                    <tr 
                      key={s.id} 
                      className={`${s.rate < 75 ? 'bg-rose-50/70 hover:bg-rose-100/60' : 'hover:bg-forest-50/70'} transition cursor-pointer`}
                      onClick={() => setSelectedStudentDetail(s)}
                    >
                      <td className="py-3.5 px-3 font-bold text-forest-950 flex items-center space-x-2">
                        <span>🌱</span>
                        <span className="font-serif">{s.name}</span>
                        {s.rate < 75 && (
                          <span className="bg-rose-100 text-rose-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-rose-300 shadow-sm">
                            At risk
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-forest-800 font-semibold">{s.classroom}</td>
                      <td className="py-3.5 px-3 text-center text-forest-800 font-bold">{s.present}</td>
                      <td className="py-3.5 px-3 text-center text-rose-800 font-bold">{s.absent}</td>
                      <td className="py-3.5 px-3 text-center text-amber-800 font-bold">{s.late}</td>
                      <td className="py-3.5 px-3 text-center text-teal-800 font-bold">{s.excused}</td>
                      <td className={`py-3.5 px-3 text-right font-black font-serif text-base ${s.rate < 75 ? 'text-rose-700' : 'text-forest-700'}`}>
                        {s.rate}%
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setSelectedStudentDetail(s); }} 
                          className="px-3 py-1 bg-forest-100 hover:bg-forest-200 text-forest-950 font-black text-xs rounded-xl transition border border-forest-300 inline-flex items-center space-x-1.5 shadow-sm"
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
        <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-3xl shadow-sm border border-forest-200/80 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black font-serif text-forest-950">Campus Citizen Registry</h3>
              <p className="text-xs text-forest-700">Govern access credentials for scholars, faculty, and principals.</p>
            </div>
            <button 
              onClick={() => { 
                setUserForm({ id: null, username: '', first_name: '', last_name: '', email: '', role: 'student', classroom: '', password: '' }); 
                setUserModal(true); 
              }} 
              className="py-3 px-5 bg-gradient-to-r from-forest-800 to-forest-950 hover:from-forest-900 hover:to-forest-950 text-white font-black text-xs rounded-2xl transition shadow-md flex items-center space-x-1.5 border border-forest-700"
            >
              <span>+ Enroll Citizen</span>
              <span>🌿</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-200 text-forest-800 text-xs font-black uppercase tracking-wider bg-forest-100/60">
                  <th className="py-3 px-3 rounded-l-2xl">Name</th>
                  <th className="py-3 px-3">Username</th>
                  <th className="py-3 px-3">Role Designation</th>
                  <th className="py-3 px-3">Classroom Sanctuary</th>
                  <th className="py-3 px-3 text-right rounded-r-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-forest-50/70 transition">
                    <td className="py-3.5 px-3 font-bold text-forest-950 font-serif">
                      {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                    </td>
                    <td className="py-3.5 px-3 text-forest-700 font-mono text-xs">@{u.username}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${u.role === 'admin' ? 'bg-emerald-950 text-emerald-200 border-emerald-700' : u.role === 'teacher' ? 'bg-forest-900 text-lime-200 border-forest-700' : 'bg-lime-950 text-lime-300 border-lime-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-forest-800 font-medium">{u.classroom_name || 'None'}</td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button 
                        onClick={() => { 
                          setUserForm({ id: u.id, username: u.username, first_name: u.first_name, last_name: u.last_name, email: u.email, role: u.role, classroom: u.classroom || '', password: '' }); 
                          setUserModal(true); 
                        }} 
                        className="text-xs text-forest-700 font-extrabold hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteUser(u)} className="text-xs text-rose-700 font-extrabold hover:underline">Delete</button>
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
        <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-3xl shadow-sm border border-forest-200/80 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black font-serif text-forest-950">Campus Classrooms</h3>
              <p className="text-xs text-forest-700">Manage grade divisions and assigned faculty naturalists.</p>
            </div>
            <button 
              onClick={() => { setClassForm({ id: null, name: '', grade: '', teacher: '' }); setClassModal(true); }} 
              className="py-3 px-5 bg-gradient-to-r from-forest-800 to-forest-950 hover:from-forest-900 hover:to-forest-950 text-white font-black text-xs rounded-2xl transition shadow-md flex items-center space-x-1.5 border border-forest-700"
            >
              <span>+ Establish Classroom</span>
              <span>🏫</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-200 text-forest-800 text-xs font-black uppercase tracking-wider bg-forest-100/60">
                  <th className="py-3 px-3 rounded-l-2xl">Classroom Name</th>
                  <th className="py-3 px-3">Grade Level</th>
                  <th className="py-3 px-3">Faculty Advisor</th>
                  <th className="py-3 px-3 text-center">Enrolled Scholars</th>
                  <th className="py-3 px-3 text-right rounded-r-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100/80">
                {classes.map((c) => (
                  <tr key={c.id} className="hover:bg-forest-50/70 transition">
                    <td className="py-3.5 px-3 font-bold text-forest-950 font-serif flex items-center space-x-2">
                      <span>🏡</span>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3.5 px-3 text-forest-800 font-semibold">{c.grade}</td>
                    <td className="py-3.5 px-3 text-forest-900 font-semibold">{c.teacher_name || 'Unassigned'}</td>
                    <td className="py-3.5 px-3 text-center font-black font-serif text-forest-950">{c.student_count}</td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button 
                        onClick={() => { setClassForm({ id: c.id, name: c.name, grade: c.grade, teacher: c.teacher || '' }); setClassModal(true); }} 
                        className="text-xs text-forest-700 font-extrabold hover:underline"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteClass(c)} className="text-xs text-rose-700 font-extrabold hover:underline">Delete</button>
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
        <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-7 rounded-3xl shadow-sm border border-forest-200/80 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black font-serif text-forest-950">Curriculum Fields & Subjects</h3>
              <p className="text-xs text-forest-700">Define academic subjects and link them to classrooms for detailed attendance footprints.</p>
            </div>
            <button 
              onClick={() => { setSubjectForm({ id: null, name: '', code: '', classroom: '' }); setSubjectModal(true); }} 
              className="py-3 px-5 bg-gradient-to-r from-forest-800 to-forest-950 hover:from-forest-900 hover:to-forest-950 text-white font-black text-xs rounded-2xl transition shadow-md flex items-center space-x-1.5 border border-forest-700"
            >
              <span>+ Add Curriculum Field</span>
              <span>🍃</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-200 text-forest-800 text-xs font-black uppercase tracking-wider bg-forest-100/60">
                  <th className="py-3 px-3 rounded-l-2xl">Subject Title</th>
                  <th className="py-3 px-3">Curriculum Code</th>
                  <th className="py-3 px-3">Linked Sanctuary</th>
                  <th className="py-3 px-3 text-right rounded-r-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100/80">
                {subjects.map((sub) => {
                  const targetCls = classes.find((c) => c.id === sub.classroom);
                  return (
                    <tr key={sub.id} className="hover:bg-forest-50/70 transition">
                      <td className="py-3.5 px-3 font-bold text-forest-950 flex items-center space-x-2">
                        <span>🌿</span>
                        <span className="font-serif">{sub.name}</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-lg inline-block">
                        {sub.code}
                      </td>
                      <td className="py-3.5 px-3 text-forest-800 font-medium">{targetCls ? targetCls.name : 'Universal Campus'}</td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        <button 
                          onClick={() => { setSubjectForm({ id: sub.id, name: sub.name, code: sub.code, classroom: sub.classroom || '' }); setSubjectModal(true); }} 
                          className="text-xs text-forest-700 font-extrabold hover:underline"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteSubject(sub)} className="text-xs text-rose-700 font-extrabold hover:underline">Delete</button>
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
        <div className="fixed inset-0 bg-forest-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-forest-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-forest-100 pb-4 mb-5">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-forest-700">Subject Analytical Profile</span>
                <h3 className="text-2xl sm:text-3xl font-black font-serif text-forest-950 mt-1">{selectedStudentDetail.name}</h3>
                <span className="text-xs text-forest-600 font-bold">{selectedStudentDetail.classroom} • Total Recorded: {selectedStudentDetail.total || 0} sessions</span>
              </div>
              <button 
                onClick={() => setSelectedStudentDetail(null)}
                className="w-9 h-9 rounded-full bg-forest-100 hover:bg-forest-200 text-forest-950 font-black flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Overall Student Stats */}
            <div className="grid grid-cols-4 gap-2.5 mb-6">
              <div className="p-3.5 bg-forest-50 rounded-2xl text-center border border-forest-200">
                <span className="text-[10px] uppercase font-black text-forest-800 block">Overall Standing</span>
                <span className={`text-2xl font-black font-serif ${selectedStudentDetail.rate >= 75 ? 'text-forest-700' : 'text-rose-700'}`}>{selectedStudentDetail.rate}%</span>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-2xl text-center border border-emerald-200">
                <span className="text-[10px] uppercase font-black text-emerald-800 block">Present</span>
                <span className="text-2xl font-black font-serif text-emerald-950">{selectedStudentDetail.present}</span>
              </div>
              <div className="p-3.5 bg-rose-50 rounded-2xl text-center border border-rose-200">
                <span className="text-[10px] uppercase font-black text-rose-800 block">Absent</span>
                <span className="text-2xl font-black font-serif text-rose-950">{selectedStudentDetail.absent}</span>
              </div>
              <div className="p-3.5 bg-amber-50 rounded-2xl text-center border border-amber-200">
                <span className="text-[10px] uppercase font-black text-amber-800 block">Late/Exc</span>
                <span className="text-2xl font-black font-serif text-amber-950">{selectedStudentDetail.late + selectedStudentDetail.excused}</span>
              </div>
            </div>

            <h4 className="text-sm font-black text-forest-950 mb-3 flex items-center space-x-1.5 font-serif">
              <span>🌿</span>
              <span>Individual Subject Footprint</span>
            </h4>

            {(!selectedStudentDetail.subjects || selectedStudentDetail.subjects.length === 0) ? (
              <p className="text-center py-8 text-forest-600 text-sm">No subject breakdown recorded for this scholar.</p>
            ) : (
              <div className="space-y-3.5">
                {selectedStudentDetail.subjects.map((sub, idx) => {
                  const isAtRisk = sub.rate < 75;
                  return (
                    <div key={idx} className={`p-4.5 rounded-2xl border transition ${isAtRisk ? 'bg-rose-50/60 border-rose-200' : 'bg-forest-50/40 border-forest-200/80'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-extrabold text-sm text-forest-950 font-serif">{sub.subject}</span>
                          <span className="text-[10px] font-mono text-forest-800 font-bold ml-2 bg-forest-200/60 px-2 py-0.5 rounded-md">{sub.code}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAtRisk && <span className="text-[10px] font-bold bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full border border-rose-300">At Risk</span>}
                          <span className={`text-base font-black font-serif ${isAtRisk ? 'text-rose-700' : 'text-forest-700'}`}>{sub.rate}%</span>
                        </div>
                      </div>

                      {/* Organic progress bar */}
                      <div className="w-full bg-forest-200/60 rounded-full h-2.5 overflow-hidden mb-2">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${isAtRisk ? 'bg-rose-500' : 'bg-forest-600'}`}
                          style={{ width: `${sub.rate}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-forest-800 font-semibold">
                        <span>Present: <b className="text-forest-950">{sub.present}</b></span>
                        <span>Absent: <b className="text-rose-800">{sub.absent}</b></span>
                        <span>Late: <b className="text-amber-800">{sub.late}</b></span>
                        <span>Excused: <b className="text-teal-800">{sub.excused}</b></span>
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
                className="px-6 py-2.5 bg-forest-900 hover:bg-forest-950 text-white font-black rounded-2xl text-xs transition shadow"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: USER */}
      {userModal && (
        <div className="fixed inset-0 bg-forest-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-200">
            <h3 className="text-xl font-black font-serif text-forest-950 mb-4">{userForm.id ? 'Edit Citizen Profile' : 'Enroll New Citizen'}</h3>
            <form onSubmit={handleSaveUser} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-black text-forest-900 mb-1">Username</label>
                <input required type="text" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/20 font-bold text-forest-950" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-forest-900 mb-1">First Name</label>
                  <input type="text" value={userForm.first_name} onChange={(e) => setUserForm({ ...userForm, first_name: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/20 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-forest-900 mb-1">Last Name</label>
                  <input type="text" value={userForm.last_name} onChange={(e) => setUserForm({ ...userForm, last_name: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/20 font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-forest-900 mb-1">Email</label>
                <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/20 font-medium" />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-900 mb-1">Password {userForm.id && '(leave blank to keep unchanged)'}</label>
                <input type="password" required={!userForm.id} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/20 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-forest-900 mb-1">Role</label>
                  <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-bold text-forest-950">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {userForm.role === 'student' && (
                  <div>
                    <label className="block text-xs font-black text-forest-900 mb-1">Classroom</label>
                    <select value={userForm.classroom} onChange={(e) => setUserForm({ ...userForm, classroom: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-bold text-forest-950">
                      <option value="">None</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setUserModal(false)} className="px-5 py-2.5 border rounded-2xl text-forest-800 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-forest-900 hover:bg-forest-950 text-white font-black rounded-2xl shadow">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLASSROOM */}
      {classModal && (
        <div className="fixed inset-0 bg-forest-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-200">
            <h3 className="text-xl font-black font-serif text-forest-950 mb-4">{classForm.id ? 'Edit Classroom' : 'Create Classroom Sanctuary'}</h3>
            <form onSubmit={handleSaveClass} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-black text-forest-900 mb-1">Classroom Title</label>
                <input required type="text" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. Grade 8 - Redwood" className="w-full p-3 border border-forest-200 rounded-2xl font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-black text-forest-900 mb-1">Grade Level</label>
                  <input required type="text" value={classForm.grade} onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })} placeholder="8" className="w-full p-3 border border-forest-200 rounded-2xl font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-black text-forest-900 mb-1">Faculty Advisor</label>
                  <select value={classForm.teacher} onChange={(e) => setClassForm({ ...classForm, teacher: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl bg-white font-bold text-forest-950">
                    <option value="">None</option>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.first_name ? `${t.first_name} ${t.last_name}` : t.username}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setClassModal(false)} className="px-5 py-2.5 border rounded-2xl text-forest-800 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-forest-900 hover:bg-forest-950 text-white font-black rounded-2xl shadow">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBJECT */}
      {subjectModal && (
        <div className="fixed inset-0 bg-forest-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-200">
            <h3 className="text-xl font-black font-serif text-forest-950 mb-4">{subjectForm.id ? 'Edit Curriculum Field' : 'Add Curriculum Field'}</h3>
            <form onSubmit={handleSaveSubject} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-black text-forest-900 mb-1">Field / Subject Title</label>
                <input required type="text" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="e.g. Ecology & Botany" className="w-full p-3 border border-forest-200 rounded-2xl font-medium" />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-900 mb-1">Curriculum Code</label>
                <input required type="text" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} placeholder="e.g. ECO101" className="w-full p-3 border border-forest-200 rounded-2xl font-mono uppercase font-bold" />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-900 mb-1">Assigned Classroom</label>
                <select value={subjectForm.classroom} onChange={(e) => setSubjectForm({ ...subjectForm, classroom: e.target.value })} className="w-full p-3 border border-forest-200 rounded-2xl bg-white font-bold text-forest-950">
                  <option value="">Universal / All Campus</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setSubjectModal(false)} className="px-5 py-2.5 border rounded-2xl text-forest-800 font-bold">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-forest-900 hover:bg-forest-950 text-white font-black rounded-2xl shadow">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
