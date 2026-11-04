import React, { useState, useEffect } from 'react';
import api from './api';

const statusPills = {
  present: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  absent: 'bg-rose-100 text-rose-800 border-rose-300',
  late: 'bg-amber-100 text-amber-800 border-amber-300',
  excused: 'bg-sky-100 text-sky-800 border-sky-300',
  pending: 'bg-slate-100 text-slate-800 border-slate-300',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-rose-100 text-rose-800 border-rose-300',
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
      .catch(() => setErr('Failed to load classes or subjects'))
      .finally(() => setLoading(false));
  }, []);

  // Filter subjects for the selected class
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
    }).catch(() => setErr('Failed to load roster or attendance records'));
  }, [selectedClass, date, selectedSubject]);

  const loadLeaves = () => api.get('/leaves/').then((res) => setLeaves(res.data)).catch(() => setErr('Failed to load leave requests'));
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
      setMsg(`Successfully recorded attendance for ${records.length} students! 🌿`);
    } catch { 
      setErr('Failed to save attendance records'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleLeaveAction = async (id, status) => {
    try { 
      await api.patch(`/leaves/${id}/`, { status }); 
      setMsg(`Leave request marked as ${status}.`);
      loadLeaves(); 
    } catch { 
      setErr('Failed to update leave request'); 
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-forest-800">
        <div className="text-4xl animate-bounce mb-3">🍃</div>
        <p className="font-bold text-base">Opening faculty attendance roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-950 text-white rounded-3xl p-6 shadow-md border border-forest-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-lime-400/20 text-lime-300 text-xs font-bold px-3 py-1 rounded-full border border-lime-400/30 mb-2">
            <span>🌿</span>
            <span>Faculty Instruction Portal</span>
          </div>
          <h1 className="text-2xl font-black font-serif">Classroom Roster & Attendance</h1>
          <p className="text-forest-200 text-xs mt-1">Mark subject-wise sessions and review student absence petitions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-forest-200">
        <button 
          onClick={() => setTab('attendance')} 
          className={`py-3 px-6 font-black text-sm rounded-t-2xl transition flex items-center space-x-2 ${tab === 'attendance' ? 'bg-white text-forest-900 border-t-2 border-forest-800 shadow-sm' : 'text-slate-500 hover:text-forest-800'}`}
        >
          <span>📋</span>
          <span>Mark Subject Attendance</span>
        </button>
        <button 
          onClick={() => setTab('leaves')} 
          className={`py-3 px-6 font-black text-sm rounded-t-2xl transition flex items-center space-x-2 ${tab === 'leaves' ? 'bg-white text-forest-900 border-t-2 border-forest-800 shadow-sm' : 'text-slate-500 hover:text-forest-800'}`}
        >
          <span>✉️</span>
          <span>Review Leave Petitions</span>
        </button>
      </div>

      {msg && <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs rounded-2xl font-bold flex items-center space-x-2"><span>✅</span><span>{msg}</span></div>}
      {err && <div className="p-3.5 bg-rose-50 text-rose-900 border border-rose-200 text-xs rounded-2xl font-bold flex items-center space-x-2"><span>⚠️</span><span>{err}</span></div>}

      {tab === 'attendance' && (
        <div className="bg-white rounded-3xl shadow-sm border border-forest-100 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end bg-forest-50/40 p-4 rounded-2xl border border-forest-100">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-800 mb-1">Classroom</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-semibold"
              >
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-800 mb-1">Subject</label>
              <select 
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-semibold"
              >
                <option value="">General Classroom</option>
                {classSubjects.map((sb) => <option key={sb.id} value={sb.id}>{sb.name} ({sb.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-800 mb-1">Session Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-white font-semibold" 
              />
            </div>
            <div className="flex space-x-2">
              <button 
                type="button" 
                onClick={() => handleMarkAll('present')} 
                className="flex-1 py-2.5 px-3 bg-forest-100 hover:bg-forest-200 text-forest-900 font-black text-xs rounded-xl transition border border-forest-300"
              >
                All Present 🌿
              </button>
              <button 
                type="button" 
                disabled={saving || students.length === 0} 
                onClick={handleSave} 
                className="flex-1 py-2.5 px-3 bg-forest-800 hover:bg-forest-900 text-white font-black text-xs rounded-xl transition shadow disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Session'}
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm">No students assigned to this classroom.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-100 text-slate-400 text-xs uppercase tracking-wider bg-forest-50/40">
                    <th className="py-2.5 px-3 rounded-l-xl">Student Name</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3 text-right rounded-r-xl">Status Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-forest-50/50 transition">
                      <td className="py-3 px-3 font-bold text-forest-950">
                        {s.first_name ? `${s.first_name} ${s.last_name}` : s.username}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500 font-mono">@{s.username}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex rounded-xl bg-slate-100/80 p-1 space-x-1 border border-slate-200">
                          {['present', 'late', 'excused', 'absent'].map((st) => {
                            const act = attendanceMap[s.id] === st;
                            const btnCls = {
                              present: act ? 'bg-forest-700 text-white shadow-sm' : 'text-slate-600 hover:text-forest-700',
                              late: act ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-amber-700',
                              excused: act ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-sky-700',
                              absent: act ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-rose-700',
                            };
                            return (
                              <button 
                                key={st} 
                                type="button" 
                                onClick={() => setAttendanceMap({ ...attendanceMap, [s.id]: st })} 
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${btnCls[st]}`}
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

      {tab === 'leaves' && (
        <div className="bg-white rounded-3xl shadow-sm border border-forest-100 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-black text-forest-950 flex items-center space-x-2">
              <span>🍃</span>
              <span>Classroom Leave Petitions</span>
            </h2>
            <p className="text-xs text-slate-500">Approving an absence automatically logs the session as excused in the database.</p>
          </div>

          {leaves.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm">No leave requests found for your classes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-100 text-slate-400 text-xs uppercase tracking-wider bg-forest-50/40">
                    <th className="py-2.5 px-3 rounded-l-xl">Student</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Excuse Document</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-forest-50/50 transition">
                      <td className="py-3 px-3 font-bold text-forest-950">{l.student_name}</td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">{l.date}</td>
                      <td className="py-3 px-3 text-slate-600">{l.reason}</td>
                      <td className="py-3 px-3">
                        {l.document ? (
                          <a href={l.document} target="_blank" rel="noreferrer" className="text-forest-700 hover:text-forest-900 underline font-bold text-xs inline-flex items-center space-x-1">
                            <span>Inspect File</span>
                            <span>📄</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">None</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusPills[l.status] || ''}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {l.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => handleLeaveAction(l.id, 'approved')} 
                              className="px-3 py-1 bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs rounded-xl transition shadow-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleLeaveAction(l.id, 'rejected')} 
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Reviewed</span>
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
