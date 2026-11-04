import React, { useState, useEffect } from 'react';
import api from './api';

const statusPills = {
  present: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold',
  absent: 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold',
  late: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
  excused: 'bg-teal-100 text-teal-900 border-teal-300 font-extrabold',
  pending: 'bg-stone-100 text-stone-800 border-stone-300 font-extrabold',
  approved: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold',
  rejected: 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold',
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
      setErr('Failed to load botanical student records');
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
      setMsg('Leave petition successfully submitted to nature faculty! 🍃');
      setReason('');
      setDoc(null);
      e.target.reset();
      const res = await api.get('/leaves/');
      setLeaves(res.data);
    } catch {
      setErr('Failed to submit leave petition');
    } finally {
      setSubmitting(false);
    }
  };

  const displayedAttendance = selectedSubFilter 
    ? attendance.filter((a) => a.subject === parseInt(selectedSubFilter))
    : attendance;

  const counts = displayedAttendance.reduce((acc, cur) => {
    acc[cur.status] = (acc[cur.status] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { present: 0, absent: 0, late: 0, excused: 0, total: 0 });

  const overallRate = counts.total ? (((counts.present + counts.late + counts.excused) / counts.total) * 100).toFixed(1) : 0;

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
      <div className="flex flex-col items-center justify-center p-20 text-forest-900">
        <div className="text-5xl animate-bounce mb-3">🍃</div>
        <p className="font-serif font-black text-xl text-forest-900">Gathering your forest academic logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Woodsy & Botanical Accents */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-forest-700/60 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-forest-800/80 text-lime-300 text-xs font-black px-3.5 py-1.5 rounded-full border border-lime-400/30 mb-3 shadow-sm">
            <span>🌱</span>
            <span>Naturalist Scholar Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">Your Academic Living Record</h1>
          <p className="text-forest-200 text-xs sm:text-sm mt-1 max-w-xl">
            Track daily presence across natural sciences and curriculum subjects. Submit verified excuses with digital storage.
          </p>
        </div>

        {/* Circular Progress Display */}
        <div className="relative z-10 bg-forest-950/80 backdrop-blur-md rounded-3xl p-5 border border-forest-700/70 text-center flex items-center space-x-4 shadow-inner">
          <div className="w-16 h-16 rounded-full bg-forest-900 border-4 border-lime-400/80 flex items-center justify-center text-2xl shadow-md">
            🌿
          </div>
          <div className="text-left">
            <span className="text-[10px] uppercase font-black tracking-widest text-forest-300 block">Overall Standing</span>
            <span className={`text-3xl font-black font-serif ${overallRate >= 75 ? 'text-lime-300' : 'text-rose-300'}`}>
              {overallRate}%
            </span>
            <span className="text-[10px] text-forest-300 block font-bold">{counts.total} logged sessions</span>
          </div>
        </div>
      </div>

      {/* KPI Botanical Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="col-span-2 sm:col-span-1 bg-white/90 backdrop-blur-sm p-5 rounded-3xl shadow-sm border border-forest-200/80 flex flex-col justify-center items-center text-center">
          <span className="text-[11px] font-black uppercase tracking-wider text-forest-800">Attendance Rate</span>
          <span className={`text-3xl font-black font-serif mt-1 ${overallRate >= 75 ? 'text-forest-700' : 'text-rose-700'}`}>{overallRate}%</span>
          <span className="text-[10px] text-forest-600 font-bold mt-1">Growth Quotient</span>
        </div>
        {[
          ['Present', counts.present, 'emerald', '🌿', 'bg-emerald-50/60 border-emerald-200 text-emerald-900'],
          ['Late', counts.late, 'amber', '⏳', 'bg-amber-50/60 border-amber-200 text-amber-900'],
          ['Excused', counts.excused, 'teal', '📝', 'bg-teal-50/60 border-teal-200 text-teal-900'],
          ['Absent', counts.absent, 'rose', '🍂', 'bg-rose-50/60 border-rose-200 text-rose-900']
        ].map(([l, v, c, icon, cardCls]) => (
          <div key={l} className={`p-4 rounded-3xl shadow-sm border text-center transition hover:scale-[1.02] backdrop-blur-sm ${cardCls}`}>
            <div className="flex items-center justify-center space-x-1.5">
              <span className="text-sm">{icon}</span>
              <span className="text-[11px] font-black uppercase tracking-wider">{l}</span>
            </div>
            <span className="text-3xl font-black font-serif block mt-1">{v}</span>
          </div>
        ))}
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-sm border border-forest-200/80 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-forest-100 gap-3">
          <div>
            <h2 className="text-xl font-black font-serif text-forest-950 flex items-center space-x-2">
              <span>🌿</span>
              <span>Subject-Wise Ecological Breakdown</span>
            </h2>
            <p className="text-xs text-forest-700/80 mt-0.5">Performance index per curriculum subject</p>
          </div>
          {subjects.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-forest-800 font-bold">Filter by Subject:</span>
              <select 
                value={selectedSubFilter} 
                onChange={(e) => setSelectedSubFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-forest-300 bg-forest-50/80 text-forest-950 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-sm"
              >
                <option value="">All Subjects (Campus)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {subjectBreakdown.length === 0 ? (
          <p className="text-forest-600 text-center py-8 text-sm">No curriculum subjects registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5 mt-5">
            {subjectBreakdown.map((sb) => {
              const atRisk = sb.rate < 75 && sb.total > 0;
              return (
                <div key={sb.id} className={`p-5 rounded-3xl border transition shadow-sm hover:shadow ${atRisk ? 'bg-rose-50/50 border-rose-200' : 'bg-forest-50/40 border-forest-200/70 hover:border-forest-400'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base">🍃</span>
                        <h3 className="font-black text-sm text-forest-950 font-serif">{sb.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-forest-800 bg-forest-200/60 px-2 py-0.5 rounded-md inline-block mt-1">
                        {sb.code}
                      </span>
                    </div>
                    <span className={`text-base font-black px-2.5 py-1 rounded-2xl border font-serif ${atRisk ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-emerald-100 text-emerald-950 border-emerald-300'}`}>
                      {sb.rate}%
                    </span>
                  </div>

                  {/* Organic leafy progress bar */}
                  <div className="w-full bg-forest-200/50 rounded-full h-2.5 mt-4 overflow-hidden border border-forest-200">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${atRisk ? 'bg-rose-500' : 'bg-forest-600'}`}
                      style={{ width: `${sb.rate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-forest-800 mt-3 font-semibold">
                    <span className="flex items-center space-x-1"><span>🌱</span><span>{sb.present} P</span></span>
                    <span className="flex items-center space-x-1"><span>⏳</span><span>{sb.late} L</span></span>
                    <span className="flex items-center space-x-1"><span>🍂</span><span>{sb.absent} A</span></span>
                    <span className="font-bold text-forest-950">{sb.total} Total</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Attendance Log & Excused Leave Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Log Table */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-3xl shadow-sm border border-forest-200/80 p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black font-serif text-forest-950 flex items-center space-x-2">
                <span>📅</span>
                <span>Session Attendance Log</span>
              </h2>
              <span className="text-xs text-forest-700 font-medium">
                Showing {displayedAttendance.length} recorded session footprints
              </span>
            </div>
            {selectedSubFilter && (
              <button 
                onClick={() => setSelectedSubFilter('')}
                className="text-xs text-forest-700 font-extrabold hover:underline bg-forest-100 px-3 py-1 rounded-xl"
              >
                Clear Filter ✕
              </button>
            )}
          </div>

          {displayedAttendance.length === 0 ? (
            <div className="text-center py-14 text-forest-600 text-sm">
              <span className="text-4xl block mb-2">🌿</span>
              No records match your selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-forest-200 text-forest-800 text-xs font-black uppercase tracking-wider bg-forest-100/60">
                    <th className="py-3 px-3 rounded-l-2xl">Date</th>
                    <th className="py-3 px-3">Subject / Field</th>
                    <th className="py-3 px-3 text-right rounded-r-2xl">Presence Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest-100/80">
                  {displayedAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-forest-50/70 transition">
                      <td className="py-3 px-3 font-bold text-forest-950 font-mono text-xs">{a.date}</td>
                      <td className="py-3 px-3">
                        {a.subject_name ? (
                          <span className="bg-forest-100/80 text-forest-900 border border-forest-300 px-2.5 py-0.5 rounded-xl text-xs font-bold inline-flex items-center space-x-1">
                            <span>🌿</span>
                            <span>{a.subject_name}</span>
                          </span>
                        ) : (
                          <span className="text-forest-400 text-xs italic">General Campus</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs border capitalize shadow-sm ${statusPills[a.status] || ''}`}>
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

        {/* Leave Petition Submission Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-sm border border-forest-200/80 p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="text-2xl">🍃</span>
              <h2 className="text-xl font-black font-serif text-forest-950">Petition for Absence</h2>
            </div>
            <p className="text-xs text-forest-700/80 mb-4 font-medium">
              Submit official medical or educational absence with verified documentation for faculty approval.
            </p>

            {msg && <div className="mb-3.5 p-3.5 bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs rounded-2xl font-bold flex items-center space-x-2"><span>🌱</span><span>{msg}</span></div>}
            {err && <div className="mb-3.5 p-3.5 bg-rose-50 text-rose-950 border border-rose-300 text-xs rounded-2xl font-bold flex items-center space-x-2"><span>⚠️</span><span>{err}</span></div>}

            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-black text-forest-900 uppercase tracking-wider mb-1">Absence Date</label>
                <input 
                  type="date" 
                  required 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full p-3 rounded-2xl border border-forest-200 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/30 font-bold text-forest-950" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-900 uppercase tracking-wider mb-1">Reason for Absence</label>
                <textarea 
                  required 
                  rows="3" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Medical reason, ecological fieldwork, youth summit..." 
                  className="w-full p-3 rounded-2xl border border-forest-200 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none bg-forest-50/30 font-medium text-forest-950" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-forest-900 uppercase tracking-wider mb-1">Supporting Evidence (PDF / Photo)</label>
                <input 
                  type="file" 
                  onChange={(e) => setDoc(e.target.files[0])} 
                  className="w-full text-xs text-forest-700 file:mr-2.5 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-forest-100 file:text-forest-900 hover:file:bg-forest-200 cursor-pointer" 
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-3 bg-gradient-to-r from-forest-800 to-forest-950 hover:from-forest-900 hover:to-forest-950 text-white font-black rounded-2xl text-sm transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2 border border-forest-700"
              >
                <span>{submitting ? 'Transmitting to Faculty...' : 'Submit Leave Petition'}</span>
                <span>🌿</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Submitted Leaves Table */}
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-sm border border-forest-200/80 p-6 sm:p-7">
        <h2 className="text-xl font-black font-serif text-forest-950 mb-3.5 flex items-center space-x-2">
          <span>📜</span>
          <span>Submitted Leave Petitions History</span>
        </h2>
        {leaves.length === 0 ? (
          <p className="text-forest-600 text-center py-8 text-sm">No leave petitions submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-forest-200 text-forest-800 text-xs font-black uppercase tracking-wider bg-forest-100/60">
                  <th className="py-3 px-3 rounded-l-2xl">Target Date</th>
                  <th className="py-3 px-3">Explanation</th>
                  <th className="py-3 px-3">Document Attached</th>
                  <th className="py-3 px-3 rounded-r-2xl">Faculty Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100/80">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-forest-50/70 transition">
                    <td className="py-3 px-3 font-bold text-forest-950 font-mono text-xs">{l.date}</td>
                    <td className="py-3 px-3 text-forest-900 font-medium">{l.reason}</td>
                    <td className="py-3 px-3">
                      {l.document ? (
                        <a href={l.document} target="_blank" rel="noreferrer" className="text-forest-700 hover:text-forest-900 font-extrabold underline text-xs inline-flex items-center space-x-1.5 bg-forest-50 px-2.5 py-1 rounded-xl border border-forest-200">
                          <span>Inspect Document</span>
                          <span>📄</span>
                        </a>
                      ) : (
                        <span className="text-forest-400 text-xs italic">None</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-3 py-1 rounded-full text-xs border capitalize shadow-sm ${statusPills[l.status] || ''}`}>
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
