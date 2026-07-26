import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  X,
  UserPlus,
  LogIn,
  BookOpen,
  PenTool,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  MapPin,
  Mail,
  Lock,
  User as UserIcon,
  Feather,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  allUsers: User[];
  initialTab?: 'login' | 'register';
  promptMessage?: string | null;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
];

const LOCALITIES = [
  'Oakridge West',
  'Downtown Core',
  'River Valley District',
  'Highland Heights',
  'Old Town',
  'Westside',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  allUsers,
  initialTab = 'login',
  promptMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [role, setRole] = useState<UserRole>('reader');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [locality, setLocality] = useState(LOCALITIES[0]);
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [customAvatar, setCustomAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [badge, setBadge] = useState<User['badge']>('Local Resident');
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const found = allUsers.find(
      (u) => u.email.toLowerCase().trim() === loginEmail.toLowerCase().trim()
    );

    if (found) {
      onLogin(found);
      onClose();
    } else {
      setLoginError('No user found with this email. Please register or try quick demo login.');
    }
  };

  const handleQuickDemoLogin = (user: User) => {
    onLogin(user);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!name.trim() || !email.trim()) {
      setRegError('Please provide your name and email.');
      return;
    }

    const existing = allUsers.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (existing) {
      setRegError('An account with this email already exists. Please log in.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      avatar: customAvatar.trim() || avatar,
      locality,
      bio: bio.trim() || (role === 'writer' ? 'Oakridge local writer and contributor.' : 'Oakridge resident.'),
      badge: role === 'writer' ? badge : 'Local Resident',
      savedArticleIds: [],
      followedAuthorIds: [],
      createdAt: new Date().toISOString(),
    };

    onRegister(newUser);
    onClose();
  };

  // Handle Escape key to close modal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] relative"
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-stone-800/90 hover:bg-amber-900 text-stone-200 hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 border border-stone-700 shadow-md cursor-pointer transition-all active:scale-95 z-10"
            title="Exit authentication modal (Esc)"
          >
            <X className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span>Exit</span>
          </button>

          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Feather className="w-4 h-4" />
            <span>Oakridge Writers Guild & Community</span>
          </div>

          <h2 className="font-serif text-2xl font-bold">
            {activeTab === 'login' ? 'Welcome Back, Neighbor' : 'Join Oakridge Local'}
          </h2>
          <p className="text-stone-300 text-xs mt-1">
            {activeTab === 'login'
              ? 'Access your personalized library, saved stories, and writer studio.'
              : 'Create a free account to follow local writers, save articles, or submit stories.'}
          </p>

          {promptMessage && (
            <div className="mt-3 p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-200 text-xs flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>{promptMessage}</span>
            </div>
          )}
        </div>

        {/* Auth Tab Bar */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'login'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-700" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'register'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-700" />
            <span>Register Account</span>
          </button>
        </div>

        {/* Form Body Container */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'login' ? (
            <div className="space-y-6">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g., alex.rivera@oakridge.org"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Account</span>
                </button>
              </form>

              {/* Quick Demo Accounts */}
              <div className="border-t border-stone-200 pt-5">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-3 text-center">
                  ⚡ Quick Demo Login (Select Role)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(u)}
                      className="p-3 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-all cursor-pointer flex items-center space-x-3 group"
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-stone-300 group-hover:border-amber-600"
                      />
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-bold text-stone-900 group-hover:text-amber-900 truncate">
                            {u.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 text-[10px] text-stone-500">
                          <span className="capitalize font-semibold text-amber-800">{u.role}</span>
                          <span>•</span>
                          <span className="truncate">{u.locality || 'Oakridge'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {regError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                  {regError}
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Select Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('reader')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'reader'
                        ? 'bg-amber-50 border-amber-700 ring-2 ring-amber-500/20 text-stone-900'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-amber-800 mb-1" />
                    <span className="text-xs font-bold block">Reader</span>
                    <span className="text-[10px] text-stone-500 block leading-tight">
                      Save favorite stories & follow writers
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('writer')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'writer'
                        ? 'bg-amber-50 border-amber-700 ring-2 ring-amber-500/20 text-stone-900'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <PenTool className="w-4 h-4 text-amber-800 mb-1" />
                    <span className="text-xs font-bold block">Writer</span>
                    <span className="text-[10px] text-stone-500 block leading-tight">
                      Submit stories & use Gemini AI tools
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('editor')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'editor'
                        ? 'bg-amber-50 border-amber-700 ring-2 ring-amber-500/20 text-stone-900'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-800 mb-1" />
                    <span className="text-xs font-bold block">Editor</span>
                    <span className="text-[10px] text-stone-500 block leading-tight">
                      Review & approve submissions
                    </span>
                  </button>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Jane Miller"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.m@oakridge.org"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Neighborhood / Locality */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Oakridge Neighborhood / Locality
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {LOCALITIES.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Choose Profile Picture Avatar
                </label>
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                  {AVATAR_PRESETS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Avatar preset"
                      onClick={() => {
                        setAvatar(url);
                        setCustomAvatar('');
                      }}
                      className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        avatar === url && !customAvatar
                          ? 'border-amber-700 ring-2 ring-amber-500/30'
                          : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={customAvatar}
                  onChange={(e) => setCustomAvatar(e.target.value)}
                  placeholder="Or paste custom image URL..."
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 mt-1"
                />
              </div>

              {/* Writer Specific Fields */}
              {role === 'writer' && (
                <div className="space-y-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Writer Guild Badge
                    </label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-800"
                    >
                      <option value="Local Resident">Local Resident</option>
                      <option value="Verified Journalist">Verified Journalist</option>
                      <option value="Community Leader">Community Leader</option>
                      <option value="Columnist">Columnist</option>
                      <option value="Guest Writer">Guest Writer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                      Writer Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Short bio for your author profile (e.g. Oakridge resident for 8 years, local urban history enthusiast)..."
                      rows={2}
                      className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create My Oakridge Account</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
