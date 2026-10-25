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
    <div className="min-h-screen w-full bg-[#FAF8F5] text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Header Bar */}
      <header className="px-6 py-4 border-b border-[#E8E2D8] bg-white backdrop-blur-md flex items-center justify-between z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-700 flex items-center justify-center shadow-xs border border-amber-800">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
              SkyGuard <span className="text-amber-700">AI</span>
            </span>
          </div>
        </div>
      </header>

      {/* Authentication Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white rounded-2xl border border-[#E2DCCE] shadow-lg overflow-hidden">
            <div className="p-6 border-b border-[#E8E2D8] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans']">
                  Operator Login
                </h2>
              </div>
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            <div className="p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-[#E2DCCE] focus:outline-none focus:border-amber-600 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-11 py-2.5 bg-[#FAF8F5] text-sm text-slate-900 placeholder-slate-400 rounded-xl border border-[#E2DCCE] focus:outline-none focus:border-amber-600 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 font-mono"
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

      <footer className="px-6 py-3 border-t border-[#E8E2D8] bg-white text-center text-xs text-slate-500">
        SkyGuard AI — Weather Station Monitoring
      </footer>
    </div>
  );
};
