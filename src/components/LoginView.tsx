import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  User as UserIcon, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import { authService } from '../auth/authService';
import { AuthUser } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        username: username.trim(),
        password: password.trim(),
      });

      if (response.success && response.user) {
        onLoginSuccess(response.user);
      } else {
        setErrorMessage(response.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B111E] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Lighting */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 60%)`,
        }}
      />

      {/* Header Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-[#0F172A]/70 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-950/50 ring-1 ring-sky-400/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
                SkyGuard <span className="text-sky-400">AI</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Weather Station Monitoring & Anomaly Detection System
            </span>
          </div>
        </div>
      </header>

      {/* Authentication Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-[#131E32] rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden">
            
            {/* Card Header */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Operator Login
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in to access system monitoring
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {/* Form Section */}
            <div className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-[#0F172A]/70 text-center text-xs text-slate-400">
        SkyGuard AI — Weather Station Anomaly Detection System
      </footer>
    </div>
  );
};
