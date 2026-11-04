import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import api from './api';
import Student from './Student';
import Teacher from './Teacher';
import Admin from './Admin';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Rich botanical foliage framing all four corners with swaying trees & vines
export function NatureCorners() {
  return (
    <>
      {/* Top Left: Overhanging Canopy Vines & Leaves */}
      <div className="fixed top-0 left-0 pointer-events-none z-30 select-none opacity-85 transition-all hover:opacity-100">
        <svg width="220" height="220" viewBox="0 0 240 240" fill="none" className="animate-sway-slow">
          <path d="M-15 -15 Q 80 40 130 110 Q 155 160 175 210" stroke="#1e4226" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
          <path d="M-5 25 Q 70 85 95 160" stroke="#276233" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
          
          {/* Leaves */}
          <path d="M20 20 Q 60 -5 90 15 Q 70 45 20 20 Z" fill="#3e984f" opacity="0.9"/>
          <path d="M55 45 Q 105 25 130 55 Q 100 85 55 45 Z" fill="#234f2c" opacity="0.95"/>
          <path d="M95 90 Q 145 60 175 90 Q 145 125 95 90 Z" fill="#64b473" opacity="0.85"/>
          <path d="M130 130 Q 185 115 205 150 Q 170 180 130 130 Z" fill="#14532d" opacity="0.95"/>
          <path d="M150 175 Q 195 165 210 195 Q 180 215 150 175 Z" fill="#84cc16" opacity="0.85"/>
          
          {/* Small wild berries */}
          <circle cx="185" cy="180" r="5" fill="#f59e0b" />
          <circle cx="145" cy="105" r="4.5" fill="#fb7185" />
          <circle cx="95" cy="50" r="4" fill="#facc15" />
        </svg>
      </div>

      {/* Top Right: Lush Ivy with hanging foliage */}
      <div className="fixed top-0 right-0 pointer-events-none z-30 select-none opacity-85 transition-all hover:opacity-100">
        <svg width="220" height="220" viewBox="0 0 240 240" fill="none" className="animate-sway">
          <path d="M255 -15 Q 160 50 115 120 Q 85 170 65 220" stroke="#1e4226" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
          <path d="M225 30 Q 175 90 145 170" stroke="#276233" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
          
          {/* Leaves */}
          <path d="M220 20 Q 180 -5 150 15 Q 170 45 220 20 Z" fill="#2f7c3e" opacity="0.9"/>
          <path d="M185 45 Q 135 25 110 55 Q 140 85 185 45 Z" fill="#234f2c" opacity="0.95"/>
          <path d="M145 90 Q 95 60 65 90 Q 95 125 145 90 Z" fill="#86efac" opacity="0.8"/>
          <path d="M110 130 Q 55 115 35 150 Q 70 180 110 130 Z" fill="#3e984f" opacity="0.9"/>
          <path d="M90 175 Q 45 165 30 195 Q 60 215 90 175 Z" fill="#a3e635" opacity="0.85"/>
          
          <circle cx="55" cy="180" r="5" fill="#f97316" />
          <circle cx="95" cy="105" r="4.5" fill="#eab308" />
        </svg>
      </div>

      {/* Bottom Left: Woodland Ferns & Sapling Trees */}
      <div className="fixed bottom-0 left-0 pointer-events-none z-30 select-none opacity-85">
        <svg width="230" height="190" viewBox="0 0 240 200" fill="none" className="animate-sway">
          <ellipse cx="70" cy="190" rx="45" ry="14" fill="#381a08" opacity="0.25" />
          {/* Trunk */}
          <path d="M70 190 Q 65 140 70 80" stroke="#582b14" strokeWidth="7" strokeLinecap="round"/>
          <path d="M70 130 Q 30 100 10 90" stroke="#582b14" strokeWidth="4" strokeLinecap="round"/>
          <path d="M70 110 Q 110 85 135 75" stroke="#582b14" strokeWidth="3.5" strokeLinecap="round"/>
          
          {/* Tree Canopy & Fern Fronds */}
          <circle cx="70" cy="65" r="32" fill="#276233" opacity="0.9" />
          <circle cx="95" cy="55" r="26" fill="#3e984f" opacity="0.85" />
          <circle cx="45" cy="60" r="24" fill="#1e4226" opacity="0.95" />
          <circle cx="70" cy="40" r="22" fill="#84cc16" opacity="0.8" />
          
          {/* Fronds at base */}
          <path d="M30 190 C 25 150 5 120 -10 95 C 15 115 35 145 40 190 Z" fill="#2f7c3e" opacity="0.85"/>
          <path d="M70 190 C 80 150 120 125 150 110 C 130 140 105 165 85 190 Z" fill="#64b473" opacity="0.9"/>
        </svg>
      </div>

      {/* Bottom Right: Gentle Whispering Bamboo Grove */}
      <div className="fixed bottom-0 right-0 pointer-events-none z-30 select-none opacity-85">
        <svg width="230" height="200" viewBox="0 0 240 210" fill="none" className="animate-sway-slow">
          <ellipse cx="165" cy="200" rx="55" ry="14" fill="#276233" opacity="0.2" />
          
          {/* Bamboo Culms */}
          <path d="M170 210 Q 175 110 160 15" stroke="#276233" strokeWidth="6" strokeLinecap="round" opacity="0.85"/>
          <path d="M205 210 Q 210 120 220 50" stroke="#1e4226" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
          <path d="M135 210 Q 130 135 120 70" stroke="#3e984f" strokeWidth="4" strokeLinecap="round" opacity="0.7"/>

          {/* Bamboo foliage */}
          <path d="M160 45 Q 100 35 75 50 Q 115 65 162 50" fill="#84cc16" opacity="0.9"/>
          <path d="M165 90 Q 230 70 250 95 Q 205 110 166 95" fill="#2f7c3e" opacity="0.85"/>
          <path d="M168 135 Q 110 120 85 145 Q 125 155 169 140" fill="#64b473" opacity="0.85"/>
          <path d="M210 80 Q 160 70 140 90 Q 180 100 210 85" fill="#a3e635" opacity="0.8"/>
          <path d="M215 125 Q 260 115 275 135 Q 240 145 216 130" fill="#234f2c" opacity="0.9"/>
        </svg>
      </div>
    </>
  );
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  
  const roleBadges = {
    admin: { label: 'Principal & Guardian', icon: '🌲', bg: 'bg-emerald-950/80 text-emerald-200 border-emerald-600/60' },
    teacher: { label: 'Faculty Botanist', icon: '🌿', bg: 'bg-forest-900/80 text-lime-200 border-forest-600/60' },
    student: { label: 'Campus Scholar', icon: '🌱', bg: 'bg-lime-950/80 text-lime-300 border-lime-600/60' },
  };

  const badge = user ? (roleBadges[user.role] || { label: user.role, icon: '🍃', bg: 'bg-forest-900 text-white border-forest-700' }) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f2f7ef] via-[#ebf4e6] to-[#f5f9f2] relative overflow-x-hidden">
      <NatureCorners />

      {/* Floating subtle spore/leaf particle */}
      <div className="fixed top-24 left-1/4 pointer-events-none opacity-40 animate-float text-xl select-none z-10">🍃</div>
      <div className="fixed top-64 right-1/4 pointer-events-none opacity-30 animate-float text-lg select-none z-10" style={{ animationDelay: '3s' }}>🌿</div>

      {/* Header */}
      <header className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-white shadow-xl sticky top-0 z-40 border-b border-forest-700/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-lime-400 via-emerald-400 to-forest-600 flex items-center justify-center text-forest-950 text-2xl shadow-lg border border-lime-200/50 transform hover:scale-105 transition">
              🌳
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white font-serif">RollCall</span>
                <span className="text-[10px] bg-lime-400/20 text-lime-300 font-extrabold px-2.5 py-0.5 rounded-full border border-lime-400/40 uppercase tracking-wider">
                  ECO-CAMPUS
                </span>
              </div>
              <p className="text-[11px] text-forest-200/90 font-medium hidden sm:block">Living Forest Academic Attendance & Leave Management</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <span className="font-extrabold text-sm block text-white leading-tight">
                  {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                </span>
                <span className="text-[10px] text-lime-300 font-mono">@{user.username}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border flex items-center space-x-1.5 ${badge.bg}`}>
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </span>
              <button 
                onClick={logout} 
                className="bg-forest-950/80 hover:bg-forest-900 text-lime-200 hover:text-white text-xs sm:text-sm px-3.5 py-1.5 rounded-xl font-extrabold border border-forest-700/80 transition duration-200 shadow-sm flex items-center space-x-1.5"
                title="Sign out of nature sanctuary"
              >
                <span>Exit Portal</span>
                <span>🍂</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area with parchment texture styling */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-xs text-forest-900/70 font-bold border-t border-forest-200/60 bg-forest-100/30 backdrop-blur-sm relative z-20">
        🌱 RollCall Living Forest Sanctuary • Fostering Education Harmony with Nature 🍃
      </footer>
    </div>
  );
}

function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-forest-950 text-white relative">
        <NatureCorners />
        <div className="text-5xl animate-bounce mb-4">🌿</div>
        <p className="font-serif font-black text-2xl text-lime-300">Entering Campus Sanctuary...</p>
        <span className="text-xs text-forest-300 mt-2">Connecting to nature database</span>
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
      {/* High-Res Student Nature Background Photo */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 filter blur-[1px] transition duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop')`
        }}
      />
      {/* Deep Forest Gradient Filter */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest-950/95 via-forest-900/90 to-[#071c0e]/95" />
      
      {/* Nature corner vines and trees */}
      <NatureCorners />

      {/* Main Glassmorphic Card */}
      <div className="relative z-20 max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-forest-600/40 overflow-hidden">
        {/* Left Visual Column */}
        <div className="md:col-span-5 bg-gradient-to-br from-forest-900 via-forest-950 to-forest-900 p-8 text-white flex flex-col justify-between relative overflow-hidden border-r border-forest-800">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-lime-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-forest-800/80 border border-lime-400/30 px-3.5 py-1.5 rounded-full text-lime-300 text-xs font-black mb-6 shadow-sm">
              <span>🌿</span>
              <span>Green Campus Sanctuary</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight font-serif text-white">Welcome to RollCall</h1>
            <p className="mt-3 text-forest-200 text-xs sm:text-sm leading-relaxed">
              Step into our living nature campus. Monitor subject-wise attendance, manage leaves digitally, and nurture academic growth in a sustainable learning environment.
            </p>
          </div>

          <div className="relative z-10 my-6 bg-forest-950/70 backdrop-blur-md rounded-2xl p-4 border border-forest-700/60 shadow-inner">
            <div className="flex items-center space-x-3 mb-2.5">
              <span className="text-2xl">🌲</span>
              <h4 className="font-black text-sm text-lime-300 font-serif">Eco-Campus Core Pillars</h4>
            </div>
            <ul className="text-xs text-forest-200 space-y-2 pl-1 font-medium">
              <li className="flex items-center space-x-2">
                <span className="text-lime-400 font-bold">✓</span>
                <span>Granular Subject Attendance Breakdown</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lime-400 font-bold">✓</span>
                <span>Digital Excused Leave Storage Vault</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-lime-400 font-bold">✓</span>
                <span>Automated At-Risk Warnings (&lt; 75%)</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 text-[11px] text-forest-300 flex items-center justify-between border-t border-forest-800 pt-4">
            <span className="font-bold">RollCall • Nature Edition</span>
            <span className="flex items-center space-x-1">
              <span>🍃</span>
              <span>High Grove Academy</span>
            </span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-gradient-to-b from-white via-parchment to-forest-50/40">
          <div className="mb-6">
            <div className="flex items-center space-x-2.5">
              <span className="text-3xl">🌱</span>
              <h2 className="text-2xl sm:text-3xl font-black text-forest-950 font-serif tracking-tight">Enter Sanctuary</h2>
            </div>
            <p className="text-forest-700/80 text-xs mt-1 font-medium">Please sign in with your academic credentials</p>
          </div>

          {err && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl font-bold flex items-center space-x-2 shadow-sm">
              <span>⚠️</span>
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-900 mb-1.5">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white text-sm font-bold text-forest-950 transition shadow-sm" 
                  placeholder="e.g. admin or t.sharma" 
                />
                <span className="absolute right-3.5 top-3.5 text-forest-400 text-sm">👤</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-forest-900 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-3.5 pr-10 py-3 rounded-2xl border border-forest-200 focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white text-sm font-bold text-forest-950 transition shadow-sm" 
                  placeholder="••••••••" 
                />
                <span className="absolute right-3.5 top-3.5 text-forest-400 text-sm">🔒</span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={busy} 
              className="w-full bg-gradient-to-r from-forest-800 via-forest-900 to-forest-950 hover:from-forest-900 hover:to-forest-950 text-white font-black py-3.5 rounded-2xl transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center justify-center space-x-2 border border-forest-700"
            >
              <span>{busy ? 'Opening Campus Gate...' : 'Sign In to Campus'}</span>
              <span>🌿</span>
            </button>
          </form>

          {/* Quick Demo Portals */}
          <div className="mt-8 pt-5 border-t border-forest-100">
            <p className="text-[11px] font-black uppercase tracking-wider text-forest-900 mb-2.5 flex items-center justify-between">
              <span>⚡ One-Click Access Pass</span>
              <span className="text-[10px] text-forest-600 lowercase font-bold">Auto-fills credentials</span>
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                ['admin', 'admin123', '🌲 Principal', 'Full Access'],
                ['t.sharma', 'teach123', '🌿 Teacher', 'Grade 8 - Sunflower'],
                ['s1', 'stud123', '🌱 Scholar', 'Aarav Patel (s1)']
              ].map(([u, p, lbl, sub]) => (
                <button 
                  key={u} 
                  type="button"
                  onClick={() => { setUsername(u); setPassword(p); }} 
                  className="p-2.5 text-left rounded-2xl bg-forest-50/80 hover:bg-forest-100 border border-forest-200 text-forest-950 transition group hover:shadow-sm"
                >
                  <span className="text-xs font-black block group-hover:text-forest-700 font-serif">{lbl}</span>
                  <span className="text-[10px] text-forest-600 block truncate font-medium">{sub}</span>
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
