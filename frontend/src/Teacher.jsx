import React, { useState, useEffect } from 'react';
import api from './api';

const statusPills = {
  present: 'bg-emerald-100 text-emerald-800 border-emerald-200', absent: 'bg-rose-100 text-rose-800 border-rose-200',
  late: 'bg-amber-100 text-amber-800 border-amber-200', excused: 'bg-sky-100 text-sky-800 border-sky-200',
  pending: 'bg-slate-100 text-slate-800 border-slate-200', approved: 'bg-emerald-100 text-emerald-800 border-emerald-200', rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function Teacher() {
  const [tab, setTab] = useState('attendance');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/classes/').then((res) => {
      setClasses(res.data);
      if (res.data.length > 0) setSelectedClass(res.data[0].id.toString());
    }).catch(() => setErr('Failed to load classes')).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setMsg(''); setErr('');
    Promise.all([api.get(`/users/?role=student&classroom=${selectedClass}`), api.get(`/attendance/?classroom=${selectedClass}&date=${date}`)]).then(([studRes, attRes]) => {
      setStudents(studRes.data);
      const map = {};
      studRes.data.forEach((s) => { map[s.id] = 'present'; });
      attRes.data.forEach((a) => { map[a.student] = a.status; });
      setAttendanceMap(map);
    }).catch(() => setErr('Failed to load roster or attendance'));
  }, [selectedClass, date]);

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
      await api.post('/attendance/bulk/', { classroom: parseInt(selectedClass), date, records });
      setMsg(`Saved attendance for ${records.length} students!`);
    } catch { setErr('Failed to save attendance'); }
    finally { setSaving(false); }
  };

  const handleLeaveAction = async (id, status) => {
    try { await api.patch(`/leaves/${id}/`, { status }); loadLeaves(); }
    catch { setErr('Failed to update leave request'); }
  };

  if (loading) return <div className="text-center p-12 text-slate-500 font-semibold">Loading teacher dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex border-b border-amber-200">
        <button onClick={() => setTab('attendance')} className={`py-2.5 px-5 font-bold text-sm rounded-t-xl transition ${tab === 'attendance' ? 'bg-white text-emerald-800 border-t-2 border-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>📋 Mark Attendance</button>
        <button onClick={() => setTab('leaves')} className={`py-2.5 px-5 font-bold text-sm rounded-t-xl transition ${tab === 'leaves' ? 'bg-white text-emerald-800 border-t-2 border-emerald-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>✉️ Review Leaves</button>
      </div>
      {msg && <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm rounded-xl font-medium">{msg}</div>}
      {err && <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 text-sm rounded-xl font-medium">{err}</div>}
      {tab === 'attendance' && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Classroom</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none">{classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>)}</select></div>
            <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
            <div className="flex space-x-2">
              <button type="button" onClick={() => handleMarkAll('present')} className="flex-1 py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition">Mark All Present</button>
              <button type="button" disabled={saving || students.length === 0} onClick={handleSave} className="flex-1 py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition shadow disabled:opacity-50">{saving ? 'Saving...' : 'Save Attendance'}</button>
            </div>
          </div>
          {students.length === 0 ? <p className="text-center py-8 text-slate-400 text-sm">No students assigned to this classroom.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider"><th className="py-2.5 px-3">Student Name</th><th className="py-2.5 px-3 text-right">Attendance Status</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-amber-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{s.first_name ? `${s.first_name} ${s.last_name}` : s.username}<span className="text-xs text-slate-400 font-normal ml-2">(@{s.username})</span></td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 space-x-1">
                          {['present', 'late', 'excused', 'absent'].map((st) => {
                            const act = attendanceMap[s.id] === st;
                            const btnCls = { present: act ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-emerald-700', late: act ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-amber-700', excused: act ? 'bg-sky-500 text-white' : 'text-slate-600 hover:text-sky-700', absent: act ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-rose-700' };
                            return <button key={st} type="button" onClick={() => setAttendanceMap({ ...attendanceMap, [s.id]: st })} className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${btnCls[st]}`}>{st}</button>;
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
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Student Leave Requests</h2>
          {leaves.length === 0 ? <p className="text-center py-8 text-slate-400 text-sm">No leave requests found for your classes.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider"><th className="py-2.5 px-3">Student</th><th className="py-2.5 px-3">Date</th><th className="py-2.5 px-3">Reason</th><th className="py-2.5 px-3">Document</th><th className="py-2.5 px-3">Status</th><th className="py-2.5 px-3 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-amber-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{l.student_name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{l.date}</td>
                      <td className="py-2.5 px-3 text-slate-600">{l.reason}</td>
                      <td className="py-2.5 px-3">{l.document ? <a href={l.document} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold text-xs">View File 📄</a> : <span className="text-slate-300 text-xs">None</span>}</td>
                      <td className="py-2.5 px-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusPills[l.status] || ''}`}>{l.status}</span></td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        {l.status === 'pending' ? (
                          <>
                            <button onClick={() => handleLeaveAction(l.id, 'approved')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition">Approve</button>
                            <button onClick={() => handleLeaveAction(l.id, 'rejected')} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition">Reject</button>
                          </>
                        ) : <span className="text-xs text-slate-400 capitalize">Reviewed</span>}
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
