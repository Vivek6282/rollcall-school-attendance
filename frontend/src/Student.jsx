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

export default function Student() {
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubFilter, setSelectedSubFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [doc, setDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const loadData = async () => {
    try {
      const [attRes, leaveRes, subRes] = await Promise.all([
        api.get('/attendance/'),
        api.get('/leaves/'),
        api.get('/subjects/')
      ]);
      setAttendance(attRes.data);
      setLeaves(leaveRes.data);
      setSubjects(subRes.data);
    } catch {
      setErr('Failed to load student portal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');
    setErr('');
    try {
      const fd = new FormData();
      fd.append('date', date);
      fd.append('reason', reason);
      if (doc) fd.append('document', doc);
      await api.post('/leaves/', fd);
      setMsg('Leave request successfully logged!');
      setReason('');
      setDoc(null);
      e.target.reset();
      const res = await api.get('/leaves/');
      setLeaves(res.data);
    } catch {
      setErr('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered attendance records by subject if selected
  const displayedAttendance = selectedSubFilter 
    ? attendance.filter((a) => a.subject === parseInt(selectedSubFilter))
    : attendance;

  const counts = displayedAttendance.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });

  const overallRate = counts.total ? (((counts.present + counts.late + counts.excused) / counts.total) * 100).toFixed(1) : 0;

  // Calculate subject-wise breakdown for student
  const subjectBreakdown = subjects.map((sub) => {
    const subRecords = attendance.filter((a) => a.subject === sub.id);
    const subTot = subRecords.length;
    const subPres = subRecords.filter((a) => a.status === 'present').length;
    const subLate = subRecords.filter((a) => a.status === 'late').length;
    const subExc = subRecords.filter((a) => a.status === 'excused').length;
    const subAb = subRecords.filter((a) => a.status === 'absent').length;
    const subRate = subTot > 0 ? (((subPres + subLate + subExc) / subTot) * 100).toFixed(1) : 0;
    return { ...sub, total: subTot, present: subPres, late: subLate, excused: subExc, absent: subAb, rate: subRate };
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-forest-800">
        <div className="text-4xl animate-bounce mb-3">🍃</div>
        <p className="font-bold text-base">Gathering your academic records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Eco-Student Greeting */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-900 to-forest-950 text-white rounded-3xl p-6 shadow-md border border-forest-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-lime-400/20 text-lime-300 text-xs font-bold px-3 py-1 rounded-full border border-lime-400/30 mb-2">
            <span>🌱</span>
            <span>Student Academic Dashboard</span>
          </div>
          <h1 className="text-2xl font-black font-serif">Welcome Back, Scholar</h1>
          <p className="text-forest-200 text-xs mt-1">Review your subject attendance, request excused leaves, and track progress.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-forest-200 block">Overall Standing</span>
          <span className={`text-3xl font-black ${overallRate >= 75 ? 'text-lime-300' : 'text-rose-300'}`}>{overallRate}%</span>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="col-span-2 sm:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-forest-100 flex flex-col justify-center items-center text-center">
          <span className="text-[11px] font-black uppercase tracking-wider text-forest-700">Attendance Rate</span>
          <span className={`text-3xl font-black mt-1 ${overallRate >= 75 ? 'text-forest-700' : 'text-rose-600'}`}>{overallRate}%</span>
          <span className="text-[11px] text-slate-400 mt-1">{counts.total} logged sessions</span>
        </div>
        {[
          ['Present', counts.present, 'emerald', '🌿'],
          ['Late', counts.late, 'amber', '⏳'],
          ['Excused', counts.excused, 'sky', '📝'],
          ['Absent', counts.absent, 'rose', '❌']
        ].map(([l, v, c, icon]) => (
          <div key={l} className={`bg-white p-4 rounded-2xl shadow-sm border border-${c}-100 text-center transition hover:shadow`}>
            <div className="flex items-center justify-center space-x-1">
              <span className="text-xs">{icon}</span>
              <span className={`text-[11px] font-black uppercase tracking-wider text-${c}-700`}>{l}</span>
            </div>
            <span className={`text-2xl font-black text-${c}-800 block mt-1`}>{v}</span>
          </div>
        ))}
      </div>

      {/* Subject-Wise Attendance Breakdown Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-forest-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-forest-100/80 gap-2">
          <div>
            <h2 className="text-lg font-black text-forest-950 flex items-center space-x-2">
              <span>🌿</span>
              <span>Subject-Wise Attendance Overview</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time breakdown of your presence per academic subject</p>
          </div>
          {subjects.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-semibold">Filter Table Below:</span>
              <select 
                value={selectedSubFilter} 
                onChange={(e) => setSelectedSubFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-forest-200 bg-forest-50/50 text-forest-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {subjectBreakdown.length === 0 ? (
          <p className="text-slate-400 text-center py-6 text-sm">No subjects registered for your class yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {subjectBreakdown.map((sb) => {
              const atRisk = sb.rate < 75 && sb.total > 0;
              return (
                <div key={sb.id} className={`p-4 rounded-2xl border transition ${atRisk ? 'bg-rose-50/40 border-rose-200' : 'bg-forest-50/30 border-forest-100 hover:border-forest-300'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-forest-950">{sb.name}</h3>
                      <span className="text-[10px] font-mono font-bold text-forest-700 bg-forest-100/80 px-2 py-0.5 rounded-md inline-block mt-0.5">{sb.code}</span>
                    </div>
                    <span className={`text-base font-black px-2 py-1 rounded-xl ${atRisk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {sb.rate}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200/80 rounded-full h-2 mt-3 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${atRisk ? 'bg-rose-500' : 'bg-forest-600'}`}
                      style={{ width: `${sb.rate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 font-medium">
                    <span>{sb.present} Present</span>
                    <span>{sb.late} Late</span>
                    <span>{sb.absent} Absent</span>
                    <span>{sb.total} Total</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Attendance History & Leave Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-forest-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-forest-950 flex items-center space-x-2">
                <span>📅</span>
                <span>Session Attendance Log</span>
              </h2>
              <span className="text-xs text-slate-400">
                {displayedAttendance.length} records {selectedSubFilter ? 'for selected subject' : ''}
              </span>
            </div>
            {selectedSubFilter && (
              <button 
                onClick={() => setSelectedSubFilter('')}
                className="text-xs text-forest-700 font-bold hover:underline"
              >
                Clear Filter ✕
              </button>
            )}
          </div>

          {displayedAttendance.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <span className="text-3xl block mb-2">🌿</span>
              No attendance logs found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-100 text-slate-400 text-xs uppercase tracking-wider bg-forest-50/40">
                    <th className="py-2.5 px-3 rounded-l-xl">Date</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-right rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-forest-50/50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{a.date}</td>
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {a.subject_name ? (
                          <span className="bg-forest-50 text-forest-900 border border-forest-200 px-2 py-0.5 rounded-lg text-xs font-bold">
                            {a.subject_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">General</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusPills[a.status] || ''}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Leave Request Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-forest-100 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xl">🍃</span>
              <h2 className="text-lg font-black text-forest-950">Request Excused Leave</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Submit official medical or educational absence with attached documentation.</p>

            {msg && <div className="mb-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl font-bold">{msg}</div>}
            {err && <div className="mb-3 p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl font-bold">{err}</div>}

            <form onSubmit={handleLeaveSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-black text-forest-800 uppercase tracking-wider mb-1">Absence Date</label>
                <input 
                  type="date" 
                  required 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/20 font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-800 uppercase tracking-wider mb-1">Reason for Absence</label>
                <textarea 
                  required 
                  rows="3" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Medical reason, educational field event, etc." 
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/20 font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-800 uppercase tracking-wider mb-1">Supporting Document (PDF/Image)</label>
                <input 
                  type="file" 
                  onChange={(e) => setDoc(e.target.files[0])} 
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-forest-100 file:text-forest-800 hover:file:bg-forest-200" 
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-2.5 bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-900 hover:to-forest-950 text-white font-black rounded-xl text-sm transition shadow disabled:opacity-50 flex items-center justify-center space-x-1"
              >
                <span>{submitting ? 'Transmitting Request...' : 'Submit Leave Request'}</span>
                <span>🌱</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Submitted Leaves Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-forest-100 p-6">
        <h2 className="text-lg font-black text-forest-950 mb-3 flex items-center space-x-2">
          <span>📜</span>
          <span>Submitted Leave Inquiries</span>
        </h2>
        {leaves.length === 0 ? (
          <p className="text-slate-400 text-center py-6 text-sm">No leave inquiries submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-100 text-slate-400 text-xs uppercase tracking-wider bg-forest-50/40">
                  <th className="py-2.5 px-3 rounded-l-xl">Target Date</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Document Attached</th>
                  <th className="py-2.5 px-3 rounded-r-xl">Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-forest-50/50 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{l.date}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">{l.reason}</td>
                    <td className="py-2.5 px-3">
                      {l.document ? (
                        <a href={l.document} target="_blank" rel="noreferrer" className="text-forest-700 hover:text-forest-900 font-bold underline text-xs inline-flex items-center space-x-1">
                          <span>View Document</span>
                          <span>📄</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">No Attachment</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${statusPills[l.status] || ''}`}>
                        {l.status}
                      </span>
                    </td>
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
