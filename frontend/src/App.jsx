import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './api';
import Student from './Student';
import Teacher from './Teacher';
import Admin from './Admin';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function Layout({ children }) {
  const { user, logout } = useAuth();
  const badges = { admin: 'bg-purple-100 text-purple-800', teacher: 'bg-blue-100 text-blue-800', student: 'bg-emerald-100 text-emerald-800' };
  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2"><span className="text-2xl">🍎</span><span className="text-2xl font-bold tracking-tight">RollCall</span></div>
          {user && (
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-sm hidden sm:inline">{user.first_name ? `${user.first_name} ${user.last_name}` : user.username}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badges[user.role] || 'bg-slate-100'}`}>{user.role}</span>
              <button onClick={logout} className="bg-emerald-900 hover:bg-emerald-950 text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg font-medium transition">Logout</button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}

function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center p-12 text-slate-500 font-semibold">Loading RollCall...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === role ? <Layout>{children}</Layout> : <Navigate to={`/${user.role}`} replace />;
}

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (user) navigate(`/${user.role}`, { replace: true }); }, [user, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const u = await login(username, password); navigate(`/${u.role}`, { replace: true }); }
    catch { setErr('Invalid credentials'); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-amber-50">
      <div className="bg-white rounded-2xl shadow-md border border-amber-100 max-w-md w-full p-8">
        <div className="text-center mb-6"><div className="text-5xl mb-2">🍎</div><h1 className="text-3xl font-extrabold text-emerald-800">RollCall</h1><p className="text-slate-500 text-sm mt-1">School Attendance System</p></div>
        {err && <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl font-medium">{err}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Username</label><input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm" placeholder="Username" /></div>
          <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm" placeholder="••••••••" /></div>
          <button type="submit" disabled={busy} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl transition shadow disabled:opacity-50 text-sm">{busy ? 'Signing In...' : 'Sign In'}</button>
        </form>
        <div className="mt-8 pt-5 border-t border-slate-100"><p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">Quick Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {[['admin','admin123','purple','Admin'], ['t.sharma','teach123','blue','Teacher'], ['s1','stud123','emerald','Student']].map(([u,p,c,lbl]) => (
              <button key={u} onClick={() => { setUsername(u); setPassword(p); }} className={`p-2 text-center rounded-xl bg-${c}-50 hover:bg-${c}-100 border border-${c}-200 text-${c}-900 text-xs font-semibold`}>
                <span>{lbl}</span><br/><span className={`text-[10px] text-${c}-600 font-normal`}>{u}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/me/').then((res) => setUser(res.data)).catch(() => { localStorage.removeItem('token'); setUser(null); }).finally(() => setLoading(false));
  }, []);
  const login = async (u, p) => {
    const res = await api.post('/auth/login/', { username: u, password: p });
    localStorage.setItem('token', res.data.access);
    const me = await api.get('/me/');
    setUser(me.data); return me.data;
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/student" element={<ProtectedRoute role="student"><Student /></ProtectedRoute>} />
          <Route path="/teacher" element={<ProtectedRoute role="teacher"><Teacher /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
