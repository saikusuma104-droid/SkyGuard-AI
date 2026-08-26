import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Radio,
  Server,
  KeyRound,
  ShieldCheck
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

  const demoAccounts = authService.getDemoAccounts();

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

  const handleSelectDemoAccount = (acc: typeof demoAccounts[0]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorMessage(null);
  };

  const handleDirectDemoLogin = async (acc: typeof demoAccounts[0]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorMessage(null);
    setIsLoading(true);

    const response = await authService.login({
      username: acc.username,
      password: acc.password,
    });

    if (response.success && response.user) {
      onLoginSuccess(response.user);
    } else {
      setErrorMessage('Login failed.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B111E] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background Ambient Grid & Radial Lighting */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 60%),
                            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 48px 48px, 48px 48px',
        }}
      />

      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-[#0F172A]/70 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-950/50 ring-1 ring-sky-400/30">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white font-['Plus_Jakarta_Sans']">
                SkyGuard AI
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                AWS OPS
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Automatic Weather Stations Telemetry & Anomaly Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-semibold">SYNOPTIC GATEWAY ONLINE</span>
        </div>
      </header>

      {/* Center Authentication Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-xl space-y-6">
          
          {/* Main Card */}
          <div className="bg-[#131E32] rounded-2xl border border-slate-800/90 shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-sm">
            
            {/* Card Header Banner */}
            <div className="p-6 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/90 to-slate-900/40">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                    Operator Authentication
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Sign in to access the National AWS Anomaly & Telemetry Control Center
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-6 sm:p-7 space-y-5">
              
              {/* Error Message Alert */}
              {errorMessage && (
                <div 
                  id="auth-error-alert"
                  className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-3 animate-fade-in"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-rose-200">Authentication Failed</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label 
                    htmlFor="username" 
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="username"
                      type="text"
                      autoComplete="username"
                      placeholder="e.g. admin1, admin2, admin3"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor="password" 
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono"
                    >
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter operator password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  id="login-submit-button"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-950/50 flex items-center justify-center gap-2 border border-sky-400/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating Operator...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to Operations Center</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Logins Quick Selection Box */}
              <div className="pt-5 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>3 Predefined Admin Demo Logins</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Role: Admin
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {demoAccounts.map((acc, index) => {
                    const isSelected = username === acc.username;
                    return (
                      <div
                        key={acc.username}
                        className={`p-3 rounded-xl border transition-all text-left group ${
                          isSelected
                            ? 'bg-sky-500/15 border-sky-500/50 shadow-sm shadow-sky-950/40'
                            : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-mono font-bold text-xs text-white">
                              {acc.username}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono font-bold bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">
                            {acc.role}
                          </span>
                        </div>

                        <div className="mt-1 text-[11px] text-slate-400">
                          Pass: <code className="text-slate-300 font-mono font-semibold bg-slate-800/80 px-1 py-0.5 rounded text-[10px]">{acc.password}</code>
                        </div>

                        <div className="mt-2.5 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectDemoAccount(acc)}
                            className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 transition-colors border border-slate-700"
                          >
                            Fill
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDirectDemoLogin(acc)}
                            className="flex-1 py-1 rounded bg-sky-600 hover:bg-sky-500 text-[10px] font-bold text-white transition-colors shadow-sm"
                          >
                            Login →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Card Footer Note */}
            <div className="p-3.5 bg-slate-950/60 border-t border-slate-800/80 text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Admin telemetry control & anomaly diagnostic authorizations granted.</span>
            </div>

          </div>

        </div>
      </div>

      {/* System Status Footer */}
      <footer className="px-6 py-3 border-t border-slate-800/80 bg-[#0F172A]/70 text-center text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 z-10">
        <div>SkyGuard AI v2.4 • National Automatic Weather Stations Anomaly Network</div>
        <div className="font-mono text-[11px]">WMO-Compliant Synoptic Quality Assurance</div>
      </footer>
    </div>
  );
};
