import React, { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import App, { loadLocalWorkspaceData } from '../App';
import { AuthGate } from './AuthGate';
import { supabase } from '../lib/supabase';
import { createEmptyWorkspaceData, isWorkspaceData, WorkspaceData, WorkspaceMembership } from '../lib/workspaceState';

interface WorkspaceRow {
  id: string;
  name: string;
  invite_code: string;
}

interface MembershipRow {
  workspace_id: string;
  role: string;
}

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">{children}</section>
  </main>
);

export const StaffWorkspace: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceMembership | null>(null);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let live = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!live) return;
      if (error) setMessage(error.message);
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setMemberships([]);
        setActiveWorkspace(null);
        setWorkspaceData(null);
        setNeedsSetup(false);
      }
      setMessage('');
    });
    return () => {
      live = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshMemberships = useCallback(async (userId: string) => {
    if (!supabase) return;
    setLoading(true);
    setMessage('');
    const { data: memberRows, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', userId);
    if (memberError) {
      setMessage(memberError.message);
      setLoading(false);
      return;
    }
    const rows = (memberRows || []) as MembershipRow[];
    if (!rows.length) {
      setMemberships([]);
      setLoading(false);
      return;
    }
    const ids = rows.map((row) => row.workspace_id);
    const { data: workspaceRows, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id, name, invite_code')
      .in('id', ids);
    if (workspaceError) {
      setMessage(workspaceError.message);
      setLoading(false);
      return;
    }
    const nextMemberships = ((workspaceRows || []) as WorkspaceRow[]).map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      inviteCode: workspace.invite_code,
      role: rows.find((row) => row.workspace_id === workspace.id)?.role || 'pharmacist',
    }));
    setMemberships(nextMemberships);
    setLoading(false);
    if (nextMemberships.length === 1) void selectWorkspace(nextMemberships[0]);
  }, []);

  const selectWorkspace = useCallback(async (workspace: WorkspaceMembership) => {
    if (!supabase) return;
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase
      .from('workspace_state')
      .select('payload')
      .eq('workspace_id', workspace.id)
      .maybeSingle();
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    setActiveWorkspace(workspace);
    if (!data || !isWorkspaceData(data.payload)) {
      setWorkspaceData(null);
      setNeedsSetup(true);
    } else {
      setWorkspaceData(data.payload);
      setNeedsSetup(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user.id) void refreshMemberships(session.user.id);
  }, [session?.user.id, refreshMemberships]);

  const joinWorkspace = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !session || !inviteCode.trim()) return;
    setBusy(true);
    setMessage('');
    const { error } = await supabase.rpc('join_medpoint_workspace', { invite_code_input: inviteCode.trim() });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setInviteCode('');
    setActiveWorkspace(null);
    setWorkspaceData(null);
    setNeedsSetup(false);
    setShowJoinForm(false);
    await refreshMemberships(session.user.id);
    setMessage('You joined the pharmacy workspace. Choose it below to open its shared records.');
  };

  const initializeWorkspace = async (data: WorkspaceData) => {
    if (!supabase || !activeWorkspace || !session) return;
    setBusy(true);
    setMessage('');
    const { error } = await supabase.from('workspace_state').upsert({
      workspace_id: activeWorkspace.id,
      payload: data,
      updated_by: session.user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id' });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setWorkspaceData(data);
    setNeedsSetup(false);
  };

  const supabaseClient = supabase;
  if (!supabaseClient) return <App />;
  if (loading) return <Panel><p className="text-sm text-slate-600">Connecting to your pharmacy workspace…</p></Panel>;
  if (!session) return <AuthGate />;
  if (!memberships.length) return <Panel>
    <h1 className="text-xl font-bold text-slate-900">Join your pharmacy workspace</h1>
    <p className="mt-2 text-sm leading-6 text-slate-600">This account has no workspace membership yet. Ask the owner or manager for the workspace invite code.</p>
    <form onSubmit={joinWorkspace} className="mt-5 flex flex-col gap-3 sm:flex-row">
      <input required value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Workspace invite code" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5" />
      <button disabled={busy} className="rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Joining…' : 'Join workspace'}</button>
    </form>
    {message && <p role="status" className="mt-3 text-sm text-rose-700">{message}</p>}
    <button onClick={() => { void supabaseClient.auth.signOut(); }} className="mt-5 text-sm font-medium text-teal-800 hover:underline">Sign out</button>
  </Panel>;
  if (!activeWorkspace) return <Panel>
    <h1 className="text-xl font-bold text-slate-900">Choose a pharmacy workspace</h1>
    <div className="mt-4 space-y-2">{memberships.map((workspace) => <button key={workspace.id} onClick={() => void selectWorkspace(workspace)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-teal-500 hover:bg-teal-50"><span className="font-semibold text-slate-800">{workspace.name}</span><span className="text-xs capitalize text-slate-500">{workspace.role}</span></button>)}</div>
    <form onSubmit={joinWorkspace} className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row">
      <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Join another workspace with invite code" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5" />
      <button disabled={busy || !inviteCode.trim()} className="rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white disabled:opacity-60">{busy ? 'Joining…' : 'Join'}</button>
    </form>
    {message && <p role="status" className="mt-3 text-sm text-rose-700">{message}</p>}
    <button onClick={() => { void supabaseClient.auth.signOut(); }} className="mt-5 text-sm font-medium text-teal-800 hover:underline">Sign out</button>
  </Panel>;
  if (needsSetup) return <Panel>
    <h1 className="text-xl font-bold text-slate-900">Set up {activeWorkspace.name}</h1>
    <p className="mt-2 text-sm leading-6 text-slate-600">This shared workspace is empty. Choose whether to copy the records from this browser to Supabase. Your browser copy will remain unchanged.</p>
    <form onSubmit={joinWorkspace} className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row">
      <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Have a staff invite code? Enter it here" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
      <button disabled={busy || !inviteCode.trim()} className="rounded-lg border border-teal-700 px-4 py-2.5 text-sm font-semibold text-teal-800 disabled:opacity-60">{busy ? 'Joining…' : 'Join that workspace'}</button>
    </form>
    {message && <p role="status" className="mt-3 text-sm text-rose-700">{message}</p>}
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <button disabled={busy} onClick={() => void initializeWorkspace(createEmptyWorkspaceData(activeWorkspace.id, activeWorkspace.name))} className="rounded-xl border border-slate-300 p-4 text-left hover:border-teal-500 disabled:opacity-60"><strong className="block text-sm text-slate-900">Start with an empty workspace</strong><span className="mt-1 block text-xs leading-5 text-slate-600">No local products, sales, staff, or expenses are copied.</span></button>
      <button disabled={busy} onClick={() => void initializeWorkspace(loadLocalWorkspaceData())} className="rounded-xl border border-teal-700 bg-teal-50 p-4 text-left hover:bg-teal-100 disabled:opacity-60"><strong className="block text-sm text-teal-900">Copy this browser’s records</strong><span className="mt-1 block text-xs leading-5 text-teal-800">Uploads current medicines, sales, staff, suppliers, and operations data to this workspace.</span></button>
    </div>
    <button onClick={() => { setActiveWorkspace(null); setWorkspaceData(null); setNeedsSetup(false); }} className="mt-5 text-sm font-medium text-teal-800 hover:underline">Back to workspace list</button>
  </Panel>;
  if (!workspaceData || !activeWorkspace) return null;

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(activeWorkspace.inviteCode);
      setMessage('Invite code copied. Share it only with staff you want to add.');
    } catch {
      setMessage(`Invite code: ${activeWorkspace.inviteCode}`);
    }
  };

  return <>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-900 px-4 py-2 text-xs text-white sm:px-6">
      <span>{activeWorkspace.name} · {activeWorkspace.role} · {session.user.email}</span>
      <div className="flex items-center gap-3">
        {(activeWorkspace.role === 'owner' || activeWorkspace.role === 'manager') && <button onClick={() => void copyInviteCode()} className="rounded-md bg-white/10 px-2.5 py-1.5 hover:bg-white/20">Copy staff invite code</button>}
        <button onClick={() => setShowJoinForm((open) => !open)} className="rounded-md bg-white/10 px-2.5 py-1.5 hover:bg-white/20">Join another workspace</button>
        <button onClick={() => { void supabaseClient.auth.signOut(); }} className="font-semibold hover:underline">Sign out</button>
      </div>
    </div>
    {showJoinForm && <form onSubmit={joinWorkspace} className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
      <label className="sr-only" htmlFor="join-workspace-code">Workspace invite code</label>
      <input id="join-workspace-code" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Workspace invite code" className="w-64 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <button disabled={busy || !inviteCode.trim()} className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? 'Joining…' : 'Join'}</button>
    </form>}
    {message && <p role="status" className="bg-emerald-50 px-4 py-2 text-center text-xs text-emerald-900">{message}</p>}
    <App
      initialWorkspaceData={workspaceData}
      workspace={{ id: activeWorkspace.id, userId: session.user.id, name: activeWorkspace.name }}
    />
  </>;
};
