import React, { useState, useEffect } from 'react';
import api from './api';

const statusPills = {
  present: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold',
  absent: 'bg-rose-100 text-rose-950 border-rose-300 font-extrabold',
  late: 'bg-amber-100 text-amber-950 border-amber-300 font-extrabold',
  excused: 'bg-teal-100 text-teal-950 border-teal-300 font-extrabold',
  pending: 'bg-stone-100 text-stone-800 border-stone-300 font-extrabold',
  approved: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold',
  rejected: 'bg-rose-100 text-rose-950 border-rose-300 font-extrabold',
};

export default function Teacher() {
  const [tab, setTab] = useState('attendance');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([api.get('/classes/'), api.get('/subjects/')])
      .then(([clsRes, subRes]) => {
        setClasses(clsRes.data);
        setSubjects(subRes.data);
        if (clsRes.data.length > 0) setSelectedClass(clsRes.data[0].id.toString());
      })
      .catch(() => setErr('Failed to load faculty classrooms or subjects'))
      .finally(() => setLoading(false));
  }, []);

  const classSubjects = subjects.filter((s) => !s.classroom || s.classroom === parseInt(selectedClass));

  useEffect(() => {
    if (classSubjects.length > 0 && !selectedSubject) {
      setSelectedSubject(classSubjects[0].id.toString());
    }
  }, [classSubjects, selectedSubject]);

  useEffect(() => {
    if (!selectedClass) return;
    setMsg(''); setErr('');
    const subQuery = selectedSubject ? `&subject=${selectedSubject}` : '';
    Promise.all([
      api.get(`/users/?role=student&classroom=${selectedClass}`),
      api.get(`/attendance/?classroom=${selectedClass}&date=${date}${subQuery}`)
    ]).then(([studRes, attRes]) => {
      setStudents(studRes.data);
      const map = {};
      studRes.data.forEach((s) => { map[s.id] = 'present'; });
      attRes.data.forEach((a) => { map[a.student] = a.status; });
      setAttendanceMap(map);
    }).catch(() => setErr('Failed to load student roster or session marks'));
  }, [selectedClass, date, selectedSubject]);

  const loadLeaves = () => api.get('/leaves/').then((res) => setLeaves(res.data)).catch(() => setErr('Failed to load leave petitions'));
  useEffect(() => { if (tab === 'leaves') loadLeaves(); }, [tab]);

  const handleMarkAll = (st) => {
    const updated = {};
    students.forEach((s) => { updated[s.id] = st; });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    setSaving(true); setMsg(''); setErr('');
    const records = Object.entries(attendanceMap).map(([s, st]) => ({ student: parseInt(s), status: st }));
    try {
      await api.post('/attendance/bulk/', { 
        classroom: parseInt(selectedClass), 
        subject: selectedSubject ? parseInt(selectedSubject) : null,
        date, 
        records 
      });
      setMsg(`Saved attendance footprint for ${records.length} scholars! 🌿`);
    } catch { 
      setErr('Failed to record attendance session'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleLeaveAction = async (id, status) => {
    try { 
      await api.patch(`/leaves/${id}/`, { status }); 
      setMsg(`Petition marked as ${status}. Automatic attendance synced! 🍃`);
      loadLeaves(); 
    } catch { 
      setErr('Failed to update leave petition'); 
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-forest-900">
        <div className="text-5xl animate-bounce mb-3">🌿</div>
        <p className="font-serif font-black text-xl text-forest-900">Opening faculty roster sanctuary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Botanical Forest Styling */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-forest-700/60 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-forest-800/80 text-lime-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-lime-400/30 mb-3 shadow-sm">
            <span>🌿</span>
            <span>Faculty Botanist Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">Classroom Roster & Session Log</h1>
          <p className="text-forest-200 text-xs sm:text-sm mt-1 max-w-xl">
            Log subject-specific attendance and review official student absence petitions.
          </p>
        </div>

        <div className="relative z-10 bg-forest-950/80 backdrop-blur-md rounded-2xl px-5 py-3 border border-forest-700/60 text-center flex items-center space-x-3 shadow-inner">
          <span className="text-3xl">🌳</span>
          <div className="text-left">
            <span className="text-[10px] uppercase font-black text-forest-300 block tracking-widest">Active Classrooms</span>
            <span className="text-2xl font-black font-serif text-lime-300">{classes.length} Rooms</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-forest-200/80">
        <button 
          onClick={() => setTab('attendance')} 
          className={`py-3.5 px-6 font-black text-sm rounded-t-3xl transition flex items-center space-x-2.5 font-serif ${tab === 'attendance' ? 'bg-white text-forest-950 border-t-2 border-forest-800 shadow-sm' : 'text-forest-700 hover:text-forest-950'}`}
        >
          <span>📋</span>
          <span>Mark Subject Attendance</span>
        </button>
        <button 
          onClick={() => setTab('leaves')} 
          className={`py-3.5 px-6 font-black text-sm rounded-t-3xl transition flex items-center space-x-2.5 font-serif ${tab === 'leaves' ? 'bg-white text-forest-950 border-t-2 border-forest-800 shadow-sm' : 'text-forest-700 hover:text-forest-950'}`}
        >
          <span>✉️</span>
          <span>Review Leave Petitions</span>
        </button>
      </div>

      {msg && <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs rounded-2xl font-bold flex items-center space-x-2 shadow-sm"><span>🌱</span><span>{msg}</span></div>}
      {err && <div className="p-4 bg-rose-50 text-rose-950 border border-rose-300 text-xs rounded-2xl font-bold flex items-center space-x-2 shadow-sm"><span>⚠️</span><span>{err}</span></div>}

      {/* TAB 1: ATTENDANCE */}
      {tab === 'attendance' && (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-sm border border-forest-200/80 p-6 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-forest-50/60 p-4.5 rounded-2xl border border-forest-200/70">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-900 mb-1.5 flex items-center space-x-1">
                <span>🏫</span>
                <span>Classroom</span>
              </label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)} 
                className="w-full p-2.5 rounded-2xl border border-forest-200 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-bold text-forest-950 shadow-sm"
              >
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-900 mb-1.5 flex items-center space-x-1">
                <span>📖</span>
                <span>Subject / Field</span>
              </label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)} 
                className="w-full p-2.5 rounded-2xl border border-forest-200 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-bold text-forest-950 shadow-sm"
              >
                <option value="">General Class Session</option>
                {classSubjects.map((sb) => <option key={sb.id} value={sb.id}>{sb.name} ({sb.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-900 mb-1.5 flex items-center space-x-1">
                <span>📅</span>
                <span>Date</span>
              </label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full p-2.5 rounded-2xl border border-forest-200 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-bold text-forest-950 shadow-sm" 
              />
            </div>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={() => handleMarkAll('present')} 
                className="flex-1 py-2.5 px-3 bg-forest-100 hover:bg-forest-200 text-forest-950 font-black text-xs rounded-2xl transition border border-forest-300 shadow-sm"
              >
                All Present 🌿
              </button>
              <button 
                type="button" 
                disabled={saving || students.length === 0} 
                onClick={handleSave} 
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-forest-800 to-forest-950 hover:from-forest-900 hover:to-forest-950 text-white font-black text-xs rounded-2xl transition shadow-md disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Roster'}
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-center py-12 text-forest-600 text-sm">No scholars assigned to this classroom.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-200 text-forest-800 text-xs font-black uppercase tracking-wider bg-forest-100/60">
                    <th className="py-3 px-3 rounded-l-2xl">Scholar Name</th>
                    <th className="py-3 px-3">Campus Identifier</th>
                    <th className="py-3 px-3 text-right rounded-r-2xl">Attendance Marker</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100/80">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-forest-50/70 transition">
                      <td className="py-3.5 px-3 font-bold text-forest-950 flex items-center space-x-2">
                        <span>🌱</span>
                        <span className="font-serif text-base">{s.first_name ? `${s.first_name} ${s.last_name}` : s.username}</span>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-forest-700 font-mono">@{s.username}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex rounded-2xl bg-forest-100/60 p-1 space-x-1.5 border border-forest-200">
                          {['present', 'late', 'excused', 'absent'].map((st) => {
                            const act = attendanceMap[s.id] === st;
                            const btnCls = {
                              present: act ? 'bg-forest-700 text-white shadow-sm' : 'text-forest-800 hover:text-forest-950',
                              late: act ? 'bg-amber-500 text-white shadow-sm' : 'text-forest-800 hover:text-amber-800',
                              excused: act ? 'bg-teal-600 text-white shadow-sm' : 'text-forest-800 hover:text-teal-800',
                              absent: act ? 'bg-rose-600 text-white shadow-sm' : 'text-forest-800 hover:text-rose-800',
                            };
                            return (
                              <button 
                                key={st} 
                                type="button" 
                                onClick={() => setAttendanceMap({ ...attendanceMap, [s.id]: st })} 
                                className={`px-3 py-1 rounded-xl text-xs font-black capitalize transition ${btnCls[st]}`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LEAVES */}
      {tab === 'leaves' && (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-sm border border-forest-200/80 p-6 sm:p-7">
          <div className="mb-4">
            <h2 className="text-xl font-black font-serif text-forest-950 flex items-center space-x-2">
              <span>🍃</span>
              <span>Scholar Absence Petitions</span>
            </h2>
            <p className="text-xs text-forest-700 font-medium">Review and verify medical/educational leave with attached documentation.</p>
          </div>

          {leaves.length === 0 ? (
            <p className="text-center py-12 text-forest-600 text-sm">No absence petitions found for your classes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-200 text-forest-800 text-xs font-black uppercase tracking-wider bg-forest-100/60">
                    <th className="py-3 px-3 rounded-l-2xl">Scholar</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Explanation</th>
                    <th className="py-3 px-3">Excuse Document</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right rounded-r-2xl">Faculty Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100/80">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-forest-50/70 transition">
                      <td className="py-3.5 px-3 font-bold text-forest-950 font-serif">{l.student_name}</td>
                      <td className="py-3.5 px-3 text-forest-800 font-mono text-xs font-bold">{l.date}</td>
                      <td className="py-3.5 px-3 text-forest-900 font-medium">{l.reason}</td>
                      <td className="py-3.5 px-3">
                        {l.document ? (
                          <a href={l.document} target="_blank" rel="noreferrer" className="text-forest-700 hover:text-forest-900 underline font-extrabold text-xs inline-flex items-center space-x-1.5 bg-forest-50 px-2.5 py-1 rounded-xl border border-forest-200">
                            <span>Inspect Document</span>
                            <span>📄</span>
                          </a>
                        ) : (
                          <span className="text-forest-400 text-xs italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-3 py-1 rounded-full text-xs border capitalize shadow-sm ${statusPills[l.status] || ''}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        {l.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleLeaveAction(l.id, 'approved')} 
                              className="px-3 py-1 bg-forest-700 hover:bg-forest-800 text-white font-black text-xs rounded-xl transition shadow-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleLeaveAction(l.id, 'rejected')} 
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-forest-600 font-bold italic">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
