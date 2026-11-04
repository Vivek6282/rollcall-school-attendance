import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './api';
import Student from './Student';
import Teacher from './Teacher';
import Admin from './Admin';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Foliage corner decorations for school & nature aesthetic
export function NatureCorners() {
  return (
    <>
      {/* Top Left Botanical Branch */}
      <div className="fixed top-0 left-0 pointer-events-none z-30 select-none opacity-80 transition-all hover:opacity-100">
        <svg width="180" height="180" viewBox="0 0 200 200" fill="none" className="animate-sway-slow">
          <path d="M-10 -10 Q 70 30 110 90 Q 130 130 150 170" stroke="#166534" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
          <path d="M15 15 Q 45 -5 70 10 Q 55 35 15 15 Z" fill="#22c55e" opacity="0.75"/>
          <path d="M45 40 Q 85 20 105 45 Q 80 70 45 40 Z" fill="#15803d" opacity="0.85"/>
          <path d="M80 75 Q 120 50 145 75 Q 120 105 80 75 Z" fill="#4ade80" opacity="0.7"/>
          <path d="M110 110 Q 155 95 175 125 Q 145 150 110 110 Z" fill="#14532d" opacity="0.9"/>
          <circle cx="160" cy="155" r="5" fill="#eab308" />
          <circle cx="125" cy="85" r="4" fill="#fb7185" />
        </svg>
      </div>

      {/* Top Right Ivy Vines */}
      <div className="fixed top-0 right-0 pointer-events-none z-30 select-none opacity-80 transition-all hover:opacity-100">
        <svg width="180" height="180" viewBox="0 0 200 200" fill="none" className="animate-sway">
          <path d="M210 -10 Q 140 40 100 100 Q 75 140 60 180" stroke="#14532d" strokeWidth="4" strokeLinecap="round" opacity="0.6"/>
          <path d="M185 15 Q 155 -5 130 10 Q 145 35 185 15 Z" fill="#16a34a" opacity="0.8"/>
          <path d="M155 40 Q 115 20 95 45 Q 120 70 155 40 Z" fill="#15803d" opacity="0.9"/>
          <path d="M120 75 Q 80 50 55 75 Q 80 105 120 75 Z" fill="#86efac" opacity="0.75"/>
          <path d="M90 110 Q 45 95 25 125 Q 55 150 90 110 Z" fill="#22c55e" opacity="0.85"/>
          <circle cx="40" cy="155" r="5" fill="#f59e0b" />
        </svg>
      </div>

      {/* Bottom Left Potted Ferns / Trees */}
      <div className="fixed bottom-0 left-0 pointer-events-none z-30 select-none opacity-80">
        <svg width="190" height="160" viewBox="0 0 200 180" fill="none" className="animate-sway">
          <ellipse cx="60" cy="170" rx="35" ry="12" fill="#52796f" opacity="0.3" />
          <path d="M60 170 C 60 120, 20 80, 5 40 C 35 60, 55 90, 60 170 Z" fill="#15803d" opacity="0.85"/>
          <path d="M60 170 C 60 110, 60 60, 50 15 C 75 45, 75 90, 60 170 Z" fill="#16a34a" opacity="0.9"/>
          <path d="M60 170 C 60 120, 100 80, 125 45 C 105 75, 85 105, 60 170 Z" fill="#4ade80" opacity="0.8"/>
          <path d="M60 170 C 60 130, 130 110, 155 95 C 130 125, 95 140, 60 170 Z" fill="#14532d" opacity="0.95"/>
        </svg>
      </div>

      {/* Bottom Right Whispering Bamboo & Flora */}
      <div className="fixed bottom-0 right-0 pointer-events-none z-30 select-none opacity-80">
        <svg width="190" height="170" viewBox="0 0 200 180" fill="none" className="animate-sway-slow">
          <path d="M140 180 Q 145 100 130 20" stroke="#166534" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
          <path d="M130 50 Q 80 40 60 55 Q 95 70 132 55" fill="#22c55e" opacity="0.9"/>
          <path d="M135 90 Q 190 75 210 95 Q 170 110 136 95" fill="#15803d" opacity="0.85"/>
          <path d="M138 130 Q 90 120 70 140 Q 105 150 139 135" fill="#4ade80" opacity="0.85"/>
          <path d="M170 180 Q 175 120 185 60" stroke="#14532d" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>
          <path d="M180 80 Q 140 70 120 90 Q 155 100 180 85" fill="#86efac" opacity="0.75"/>
        </svg>
      </div>
    </>
  );
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  const badges = {
    admin: 'bg-emerald-900/90 text-emerald-100 border border-emerald-700',
    teacher: 'bg-teal-900/90 text-teal-100 border border-teal-700',
    student: 'bg-lime-900/90 text-lime-100 border border-lime-700'
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f4f7f2] via-[#eef4ea] to-[#f7f9f4] relative overflow-x-hidden">
      <NatureCorners />
      <header className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white shadow-lg sticky top-0 z-40 border-b border-forest-700/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-300 flex items-center justify-center text-forest-950 text-xl shadow-md transform hover:rotate-6 transition">
              🌿
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white font-serif">RollCall</span>
                <span className="text-[10px] bg-lime-400/20 text-lime-300 font-bold px-2 py-0.5 rounded-full border border-lime-400/30">NATURE CAMPUS</span>
              </div>
              <p className="text-[11px] text-forest-200 hidden sm:block">Sustainable & Transparent Attendance System</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <span className="font-bold text-sm block text-white leading-tight">{user.first_name ? `${user.first_name} ${user.last_name}` : user.username}</span>
                <span className="text-[10px] text-forest-300 font-medium">{user.email || `@${user.username}`}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${badges[user.role] || 'bg-forest-800 text-white'}`}>
                {user.role}
              </span>
              <button 
                onClick={logout} 
                className="bg-forest-950 hover:bg-forest-900 text-lime-200 hover:text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-bold border border-forest-700/80 transition duration-200 shadow-sm flex items-center space-x-1"
              >
                <span>Logout</span>
                <span>🍃</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-20">{children}</main>
      <footer className="text-center py-4 text-xs text-forest-800/60 font-semibold relative z-20">
        🌱 RollCall Nature Edition • Eco-Friendly School Management System
      </footer>
    </div>
  );
}

function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-forest-50 text-forest-900">
        <div className="text-4xl animate-bounce mb-3">🍃</div>
        <p className="font-bold text-lg text-forest-800">Entering RollCall Sanctuary...</p>
      </div>
    );
  }
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

  useEffect(() => { 
    if (user) navigate(`/${user.role}`, { replace: true }); 
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setErr(''); 
    setBusy(true);
    try { 
      const u = await login(username, password); 
      navigate(`/${u.role}`, { replace: true }); 
    } catch { 
      setErr('Invalid credentials. Check username & password.'); 
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-forest-950 overflow-hidden">
      {/* Dynamic Nature Botanical Background with High Quality Students Imagery */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 filter blur-[1px] transition duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop')`
        }}
      />
      {/* Nature Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest-950/90 via-emerald-950/85 to-[#0b2716]/95" />
      
      {/* Decorative Tree / Plants in corners */}
      <NatureCorners />

      {/* Login Card */}
      <div className="relative z-20 max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100/60 overflow-hidden">
        {/* Left Visual Column */}
        <div className="md:col-span-5 bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-lime-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-forest-700/60 border border-forest-500/30 px-3 py-1.5 rounded-full text-lime-300 text-xs font-bold mb-6">
              <span>🌿</span>
              <span>Green Campus Initiative</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight font-serif">Welcome to RollCall</h1>
            <p className="mt-3 text-forest-200 text-sm leading-relaxed">
              An intelligent, nature-inspired school attendance platform featuring subject-level metrics, automated leave approvals, and campus analytics.
            </p>
          </div>

          <div className="relative z-10 my-6 bg-forest-950/50 backdrop-blur-md rounded-2xl p-4 border border-forest-700/40">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xl">🌳</span>
              <h4 className="font-bold text-sm text-lime-300">Eco-Campus Highlights</h4>
            </div>
            <ul className="text-xs text-forest-200 space-y-1.5 pl-1">
              <li>✓ Subject-wise Attendance Tracking</li>
              <li>✓ Digital Leave Request Storage</li>
              <li>✓ Automated At-Risk Alerts (&lt; 75%)</li>
            </ul>
          </div>

          <div className="relative z-10 text-[11px] text-forest-300 flex items-center justify-between border-t border-forest-700/60 pt-4">
            <span>RollCall v2.0 • Green Edition</span>
            <span>🌲 High Grove Academy</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-gradient-to-b from-white to-[#fbfdfa]">
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌱</span>
              <h2 className="text-2xl font-black text-forest-900 tracking-tight">Sign In to Campus</h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">Select your credentials to access your academic dashboard</p>
          </div>

          {err && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center space-x-2">
              <span>⚠️</span>
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-800 mb-1.5">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-forest-50/30 text-sm font-semibold transition" 
                  placeholder="e.g. admin or t.sharma" 
                />
                <span className="absolute right-3 top-2.5 text-slate-400 text-sm">👤</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-800 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-forest-50/30 text-sm font-semibold transition" 
                  placeholder="••••••••" 
                />
                <span className="absolute right-3 top-2.5 text-slate-400 text-sm">🔒</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={busy} 
              className="w-full bg-gradient-to-r from-forest-800 to-forest-900 hover:from-forest-900 hover:to-forest-950 text-white font-black py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center justify-center space-x-2 border border-forest-700"
            >
              <span>{busy ? 'Authenticating...' : 'Enter School Portal'}</span>
              <span>➔</span>
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-black uppercase tracking-wider text-forest-800 mb-2.5 flex items-center justify-between">
              <span>⚡ Quick Demo Portals</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">Click to auto-fill</span>
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                ['admin', 'admin123', 'emerald', '👑 Admin', 'admin'],
                ['t.sharma', 'teach123', 'forest', '📚 Teacher', 'Grade 8'],
                ['s1', 'stud123', 'lime', '🎓 Student', 'Aarav (s1)']
              ].map(([u, p, c, lbl, sub]) => (
                <button 
                  key={u} 
                  type="button"
                  onClick={() => { setUsername(u); setPassword(p); }} 
                  className="p-2.5 text-left rounded-xl bg-forest-50/70 hover:bg-forest-100/80 border border-forest-200 text-forest-950 transition group hover:shadow-sm"
                >
                  <span className="text-xs font-black block group-hover:text-forest-700">{lbl}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{sub}</span>
                </button>
              ))}
            </div>
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
    api.get('/me/').then((res) => setUser(res.data)).catch(() => { 
      localStorage.removeItem('token'); 
      setUser(null); 
    }).finally(() => setLoading(false));
  }, []);

  const login = async (u, p) => {
    const res = await api.post('/auth/login/', { username: u, password: p });
    localStorage.setItem('token', res.data.access);
    const me = await api.get('/me/');
    setUser(me.data); 
    return me.data;
  };

  const logout = () => { 
    localStorage.removeItem('token'); 
    setUser(null); 
  };

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
