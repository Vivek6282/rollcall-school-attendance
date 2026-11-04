import React, { useState, useEffect } from 'react';
import api from './api';

const statusPills = {
  present: 'bg-emerald-100 text-emerald-800 border-emerald-200', absent: 'bg-rose-100 text-rose-800 border-rose-200',
  late: 'bg-amber-100 text-amber-800 border-amber-200', excused: 'bg-sky-100 text-sky-800 border-sky-200',
  pending: 'bg-slate-100 text-slate-800 border-slate-200', approved: 'bg-emerald-100 text-emerald-800 border-emerald-200', rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function Student() {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [doc, setDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadData = async () => {
    try {
      const [attRes, leaveRes] = await Promise.all([api.get('/attendance/'), api.get('/leaves/')]);
      setAttendance(attRes.data); setLeaves(leaveRes.data);
    } catch { setErr('Failed to load student data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setMsg(''); setErr('');
    try {
      const fd = new FormData();
      fd.append('date', date); fd.append('reason', reason);
      if (doc) fd.append('document', doc);
      await api.post('/leaves/', fd);
      setMsg('Leave request submitted!'); setReason(''); setDoc(null); e.target.reset();
      const res = await api.get('/leaves/'); setLeaves(res.data);
    } catch { setErr('Failed to submit leave request'); }
    finally { setSubmitting(false); }
  };

  const counts = attendance.reduce((acc, cur) => { acc[cur.status] = (acc[cur.status] || 0) + 1; acc.total += 1; return acc; }, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });
  const rate = counts.total ? (((counts.present + counts.late + counts.excused) / counts.total) * 100).toFixed(1) : 0;
  if (loading) return <div className="text-center p-12 text-slate-500 font-semibold">Loading student portal...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="col-span-2 sm:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-amber-100 flex flex-col justify-center items-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Rate</span>
          <span className={`text-4xl font-extrabold mt-1 ${rate >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>{rate}%</span>
          <span className="text-xs text-slate-400 mt-1">{counts.total} total sessions</span>
        </div>
        {[['Present', counts.present, 'emerald'], ['Late', counts.late, 'amber'], ['Excused', counts.excused, 'sky'], ['Absent', counts.absent, 'rose']].map(([l, v, c]) => (
          <div key={l} className={`bg-white p-4 rounded-2xl shadow-sm border border-${c}-100 text-center`}>
            <span className={`text-xs font-bold uppercase tracking-wider text-${c}-600`}>{l}</span>
            <span className={`text-2xl font-black text-${c}-800 block mt-1`}>{v}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between"><span>Attendance History</span><span className="text-xs text-slate-400 font-normal">Last {attendance.length} records</span></h2>
          {attendance.length === 0 ? <p className="text-slate-400 text-center py-8 text-sm">No attendance records found.</p> : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider"><th className="py-2.5 px-3">Date</th><th className="py-2.5 px-3">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((a) => (
                    <tr key={a.id} className="hover:bg-amber-50/50">
                      <td className="py-2.5 px-3 font-medium text-slate-700">{a.date}</td>
                      <td className="py-2.5 px-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusPills[a.status] || ''}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Request Leave</h2>
          {msg && <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-xl font-medium">{msg}</div>}
          {err && <div className="mb-3 p-2.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-xl font-medium">{err}</div>}
          <form onSubmit={handleLeaveSubmit} className="space-y-3 text-sm">
            <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Date</label><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Reason</label><textarea required rows="2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Medical, family, etc." className="w-full p-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" /></div>
            <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Document (Optional)</label><input type="file" onChange={(e) => setDoc(e.target.files[0])} className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-emerald-50 file:text-emerald-700" /></div>
            <button type="submit" disabled={submitting} className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Request'}</button>
          </form>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">My Leave Requests</h2>
        {leaves.length === 0 ? <p className="text-slate-400 text-center py-6 text-sm">No leave requests submitted yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider"><th className="py-2 px-3">Date</th><th className="py-2 px-3">Reason</th><th className="py-2 px-3">Document</th><th className="py-2 px-3">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-amber-50/50">
                    <td className="py-2 px-3 font-medium text-slate-700">{l.date}</td>
                    <td className="py-2 px-3 text-slate-600">{l.reason}</td>
                    <td className="py-2 px-3">{l.document ? <a href={l.document} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold text-xs">View File 📄</a> : <span className="text-slate-300 text-xs">None</span>}</td>
                    <td className="py-2 px-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusPills[l.status] || ''}`}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
