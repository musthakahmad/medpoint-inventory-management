import React, { useState } from 'react';
import { Cross, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AuthGate: React.FC = () => {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setMessage('');
    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { workspace_name: workspaceName.trim() || 'My Pharmacy' },
            emailRedirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin,
          },
        });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === 'sign-up' && !result.data.session) setMessage('Check your email to confirm your account, then sign in.');
  };

  const resendConfirmation = async () => {
    if (!supabase || !email) return;
    setResending(true);
    setMessage('');
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin },
    });
    setResending(false);
    setMessage(error ? error.message : 'A new confirmation email was sent. Open it on your phone while your phone and computer are on the same Wi-Fi.');
  };

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-teal-700 p-2 text-white"><Cross size={22}/></span><div><h1 className="text-xl font-bold text-slate-900">MedPoint</h1><p className="text-sm text-slate-500">Sign in to your pharmacy workspace</p></div></div>
      {mode === 'sign-up' && <label className="block text-sm font-medium text-slate-700">Pharmacy / workspace name<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="My Pharmacy" /></label>}
      <label className="block text-sm font-medium text-slate-700">Email<input required type="email" autoComplete="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label className="block text-sm font-medium text-slate-700">Password<input required type="password" minLength={8} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {message && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
      {mode === 'sign-in' && /email not confirmed/i.test(message) && <button type="button" disabled={resending} onClick={resendConfirmation} className="w-full text-sm font-medium text-teal-800 hover:underline">{resending ? 'Sending…' : 'Resend confirmation email'}</button>}
      <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60">{mode === 'sign-in' ? <LogIn size={17}/> : <UserPlus size={17} />}{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create workspace'}</button>
      <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); }} className="w-full text-sm font-medium text-teal-800 hover:underline">{mode === 'sign-in' ? 'New to MedPoint? Create a workspace' : 'Already have an account? Sign in'}</button>
    </form>
  </main>;
};
