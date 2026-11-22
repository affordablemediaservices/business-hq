/* =====================================================================
   Business HQ portal — single-page app (vanilla JS, no build step)
   Data: Supabase (shared) or browser storage (demo mode)
===================================================================== */
'use strict';

const CFG = window.PORTAL_CONFIG || {};
const DEMO = !(CFG.supabaseUrl && CFG.supabaseAnonKey);
const APP_NAME = CFG.portalName || 'Business HQ';

/* ---------------- helpers ---------------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseD = s => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => ymd(new Date());
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); };
const nowISO = () => new Date().toISOString();
const clone = o => JSON.parse(JSON.stringify(o ?? null));
const fmtD = s => {
  if (!s) return '';
  const d = parseD(s), opts = { month: 'short', day: 'numeric' };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  return d.toLocaleDateString(undefined, opts);
};
const fmtDT = s => s ? new Date(s).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
const ago = s => {
  if (!s) return '';
  const m = Math.round((Date.now() - new Date(s).getTime()) / 60000);
  if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60); if (h < 24) return h + ' h ago';
  const d = Math.round(h / 24); return d < 8 ? d + ' d ago' : fmtD(s.slice(0, 10));
};
const normUrl = u => (!u ? null : (/^(https?:|mailto:|tel:)/i.test(u) ? u : 'https://' + u));
const shortUrl = u => String(u || '').replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '').slice(0, 40);
const link = u => u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(shortUrl(u))}</a>` : '';
const by = (k, dir = 1) => (a, b) => (a[k] ?? '') > (b[k] ?? '') ? dir : (a[k] ?? '') < (b[k] ?? '') ? -dir : 0;

/* ---------------- options ---------------- */
const SIDES = ['Developer', 'Pierre'];
const OWNER3 = ['Developer', 'Pierre', 'Shared'];
const PRIORITY = ['Urgent', 'High', 'Medium', 'Low'];
const PRIO_RANK = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
const PROJECT_STATUS = ['Planning', 'Not Started', 'Active', 'On Hold', 'In Review', 'Completed', 'Archived'];
const PROJECT_CAT = ['E-commerce', 'YouTube Channel', 'Real Estate', 'Website Development', 'Website Maintenance', 'Agency', 'Agency Client', 'Mobile App', 'Web Application', 'Social Media', 'SEO', 'Custom'];
const TASK_STATUS = ['New Request', 'To Do', 'In Progress', 'Waiting for Client', 'Client Review', 'Revision Required', 'On Hold', 'Completed', 'Cancelled'];
const DONE = ['Completed', 'Cancelled'];
const TASK_CAT = ['Website Development', 'Product Management', 'Website Maintenance', 'SEO & Content', 'Video Production', 'Publishing', 'Channel Management', 'Branding', 'Marketing', 'CRM & Leads', 'Business Operations', 'Research', 'Compliance', 'Other'];
const TASK_TYPE = ['One-off', 'Recurring', 'Client Request', 'Bug', 'Client Action', 'Milestone'];
const APPROVAL = ['Not Required', 'Pending Review', 'Approved', 'Revision Required'];
const FREQ = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const REQ_STATUS = ['New Request', 'Review', 'Approved', 'Converted to Task', 'In Progress', 'Completed', 'Declined'];
const CONTENT_TYPE = ['Blog Article', 'YouTube Long Video', 'YouTube Short', 'Social Media Post', 'Reel', 'Promotional Video'];
const PLATFORM = ['WordPress', 'YouTube', 'Instagram', 'Facebook', 'TikTok', 'Other'];
const LANG = ['English', 'Spanish', 'French'];
const CONTENT_STATUS = ['Idea', 'Research', 'Writing', 'Editing', 'Ready for Upload', 'Uploaded', 'Client Review', 'Revision Required', 'Scheduled', 'Published'];
const IDEA_CAT = ['New Feature', 'Content Idea', 'New Business', 'Marketing', 'Improvement', 'Other'];
const IDEA_STATUS = ['New Idea', 'Under Review', 'Approved', 'Planned', 'In Development', 'Completed', 'Rejected', 'Archived'];
const EFFORT = ['Small', 'Medium', 'Large', 'Very Large'];
const DOC_CAT = ['Brand Guidelines', 'Website Instructions', 'Client Requirements', 'SOP', 'Meeting Notes', 'Project Specification', 'Design Reference', 'Important Decision', 'Documentation'];
const LEAD_SOURCE = ['Website', 'Facebook Ad', 'Facebook Group', 'Instagram', 'Google Business Profile', 'Referral', 'Open House', 'YouTube', 'Other'];
const LEAD_KIND = ['Buyer', 'Seller', 'Both', 'Renter'];
const LEAD_STATUS = ['New Lead', 'Contacted', 'Qualified', 'Appointment', 'Follow-up', 'Converted', 'Lost'];

const BADGE = {
  Urgent: 'red', High: 'orange', Medium: 'yellow', Low: 'gray',
  Active: 'blue', Planning: 'gray', 'Not Started': 'gray', 'On Hold': 'orange', 'In Review': 'purple', Completed: 'green', Archived: 'gray',
  'New Request': 'gray', 'To Do': 'gray', 'In Progress': 'blue', 'Waiting for Client': 'orange', 'Client Review': 'purple', 'Revision Required': 'red', Cancelled: 'gray',
  'Not Required': 'gray', 'Pending Review': 'yellow', Approved: 'green',
  Review: 'yellow', 'Converted to Task': 'blue', Declined: 'red',
  Idea: 'gray', Research: 'gray', Writing: 'yellow', Editing: 'yellow', 'Ready for Upload': 'blue', Uploaded: 'blue', Scheduled: 'blue', Published: 'green',
  'New Idea': 'gray', 'Under Review': 'yellow', Planned: 'blue', 'In Development': 'purple', Rejected: 'red',
  'New Lead': 'gray', Contacted: 'yellow', Qualified: 'blue', Appointment: 'purple', 'Follow-up': 'orange', Converted: 'green', Lost: 'red'
};
const CAT_ICON = { 'E-commerce': '🛒', 'YouTube Channel': '🎬', 'Real Estate': '🏠', 'Website Development': '🌐', 'Website Maintenance': '🛠️', Agency: '💼', 'Agency Client': '🤝', 'Mobile App': '📱', 'Web Application': '🧩', 'Social Media': '📣', SEO: '🔎', Custom: '📁' };

/* ---------------- project templates ---------------- */
const PROJECT_TEMPLATES = {
  'Website Development': [['Discovery', ['Requirements and goals', 'Sitemap / page list', 'Content and assets needed from client']], ['Design', ['Wireframes', 'Visual design', 'Client approval']], ['Build', ['Frontend', 'Backend / CMS', 'Forms and integrations', 'SEO basics']], ['Launch', ['Mobile and browser testing', 'Client review', 'Deployment', 'Handover / maintenance plan']]],
  'Website Maintenance': [['Setup', ['Access confirmed (stored outside the portal)', 'Backup method confirmed', 'Maintenance frequency agreed']], ['Recurring', ['Set up the Website Maintenance workflow']], ['Reporting', ['Monthly maintenance summary in Weekly Reports']]],
  'E-commerce Management': [['Store', ['Checkout and payment gateway', 'Shipping integration', 'Order notifications']], ['Products', ['Import / catalog process', 'Pricing and stock updates']], ['Growth', ['SEO and blog', 'Email marketing integration']], ['Compliance (regulated products)', ['Age, platform, payment and legal checks']]],
  'YouTube Channel': [['Strategy', ['Reference research', 'Competitor analysis', 'Niche and audience', 'Language confirmed']], ['Branding & Setup', ['Name selection (client approval)', 'Logo and banner', 'Channel description and SEO']], ['Production', ['Publishing cadence confirmed', 'Long-form workflow set up', 'Shorts workflow set up']], ['Growth', ['Performance analysis', 'Monetization planning']]],
  'Mobile App Development': [['Discovery', ['Requirements and user stories', 'Platforms (iOS / Android)']], ['Design', ['Screens and flows', 'Client approval']], ['Build', ['Backend / API', 'App development', 'Testing']], ['Release', ['Store listings', 'Submission and review', 'Post-launch support']]],
  'Web Application': [['Discovery', ['Requirements and scope', 'Data model']], ['Build', ['Authentication and roles', 'Core features', 'Integrations', 'Testing']], ['Launch', ['Client review', 'Deployment and monitoring', 'Documentation']]],
  'Social Media Management': [['Setup', ['Accounts and access (credentials stored outside the portal)', 'Brand voice and content pillars', 'Posting cadence confirmed']], ['Ongoing', ['Content calendar entry per post', 'Engagement and comments', 'Monthly performance review']]],
  'SEO': [['Audit', ['Technical audit', 'Keyword research', 'Competitor review']], ['On-page', ['Titles and meta descriptions', 'Internal linking', 'Content updates']], ['Ongoing', ['Indexing monitoring', 'Monthly ranking report']]],
  'Agency Client': [['Pre-sale', ['Prospect information', 'Proposal', 'Demo', 'Client approval and scope (no paid work before this)']], ['Delivery', ['Onboarding', 'Build / service delivery', 'Client review']], ['After', ['Handover', 'Maintenance agreement']]],
  'Custom': [['Overview', ['Goal and success criteria', 'Scope and constraints', 'Milestones']], ['Review', ['Client review', 'Close-out or archive']]]
};
const TEMPLATE_CAT = { 'Website Development': 'Website Development', 'Website Maintenance': 'Website Maintenance', 'E-commerce Management': 'E-commerce', 'YouTube Channel': 'YouTube Channel', 'Mobile App Development': 'Mobile App', 'Web Application': 'Web Application', 'Social Media Management': 'Social Media', SEO: 'SEO', 'Agency Client': 'Agency Client', Custom: 'Custom' };
const mkPlan = sections => sections.map(([title, items]) => ({ title, items: items.map(it => typeof it === 'string' ? { id: uid(), text: it, done: false } : { id: uid(), text: it.text, done: !!it.done }) }));

/* ---------------- models (form fields) ---------------- */
const F = (k, label, type = 'text', extra = {}) => ({ k, label, type, ...extra });
const SEC = label => ({ section: label });
const MODELS = {
  projects: {
    name: 'Project', title: 'name', fields: [
      F('name', 'Project name', 'text', { req: true, full: true }),
      F('client', 'Client / business', 'text', { full: true }),
      F('category', 'Category', 'select', { options: PROJECT_CAT }),
      F('status', 'Status', 'select', { options: PROJECT_STATUS, def: 'Planning' }),
      F('priority', 'Priority', 'select', { options: PRIORITY, def: 'Medium' }),
      F('owner_side', 'Project owner', 'select', { options: OWNER3, def: 'Shared' }),
      F('start_date', 'Start date', 'date'), F('target_date', 'Expected completion', 'date'),
      F('budget', 'Budget (optional)', 'number'), F('links', 'Reference link', 'url'),
      F('needs_confirmation', 'Needs Pierre’s confirmation', 'checkbox', { full: true }),
      F('description', 'Description', 'textarea', { full: true }),
      F('instructions', 'Special instructions', 'textarea', { full: true })
    ]
  },
  tasks: {
    name: 'Task', title: 'title', fields: [
      F('title', 'Task name', 'text', { req: true, full: true }),
      F('project_id', 'Project', 'project', { full: true }),
      F('status', 'Status', 'select', { options: TASK_STATUS, def: 'To Do' }),
      F('priority', 'Priority', 'select', { options: PRIORITY, def: 'Medium' }),
      F('responsible', 'Who does it', 'select', { options: SIDES, def: 'Developer' }),
      F('due_date', 'Due date', 'date'),
      F('category', 'Category', 'select', { options: TASK_CAT }),
      F('type', 'Type', 'select', { options: TASK_TYPE, def: 'One-off' }),
      F('start_date', 'Start date', 'date'),
      F('reference_url', 'Reference link', 'url'),
      F('instructions', 'Instructions', 'textarea', { full: true }),
      F('checklist', 'Checklist', 'checklist', { full: true }),
      F('files', 'Reference files', 'files', { full: true }),
      SEC('Delivery & approval'),
      F('delivery_url', 'Delivery link (finished work)', 'url', { full: true }),
      F('approval_required', 'Needs Pierre’s approval before it is complete', 'checkbox', { full: true }),
      F('approval_status', 'Approval status', 'select', { options: APPROVAL }),
      F('reviewer', 'Reviewer'),
      F('review_date', 'Review date', 'date'), F('approval_date', 'Approval date', 'date'),
      F('feedback', 'Feedback', 'textarea', { full: true }),
      F('revision_notes', 'Revision notes', 'textarea', { full: true }),
      SEC('Recurring & notes'),
      F('recurring', 'Recurring task', 'checkbox'), F('frequency', 'Frequency', 'select', { options: FREQ }),
      F('notes', 'Notes', 'textarea', { full: true })
    ]
  },
  requests: {
    name: 'Request', title: 'title', fields: [
      F('title', 'What do you need?', 'text', { req: true, full: true }),
      F('project_id', 'Project', 'project', { full: true }),
      F('description', 'Details', 'textarea', { full: true }),
      F('priority', 'Priority', 'select', { options: PRIORITY, def: 'Medium' }),
      F('deadline', 'Needed by', 'date'),
      F('links', 'Reference link', 'url', { full: true }),
      F('files', 'Attachments', 'files', { full: true }),
      SEC('Handling'),
      F('status', 'Status', 'select', { options: REQ_STATUS, def: 'New Request', adv: true }),
      F('assigned_to', 'Assigned to', 'select', { options: SIDES, def: 'Developer', adv: true }),
      F('requested_by', 'Requested by', 'select', { options: SIDES, adv: true })
    ]
  },
  content: {
    name: 'Content', title: 'title', fields: [
      F('title', 'Content title', 'text', { req: true, full: true }),
      F('project_id', 'Project', 'project', { full: true }),
      F('type', 'Content type', 'select', { options: CONTENT_TYPE }),
      F('platform', 'Platform', 'select', { options: PLATFORM }),
      F('status', 'Status', 'select', { options: CONTENT_STATUS, def: 'Idea' }),
      F('language', 'Language', 'select', { options: LANG }),
      F('keyword', 'Target keyword'), F('owner', 'Content owner', 'select', { options: SIDES, def: 'Developer' }),
      F('assigned_date', 'Assigned / received date', 'date'), F('deadline', 'Deadline', 'date'),
      F('publish_date', 'Publication date', 'date'), F('task_id', 'Related task', 'task'),
      F('draft_url', 'Draft link', 'url'), F('final_url', 'Final published link', 'url'),
      F('approval_required', 'Needs Pierre’s approval', 'checkbox', { full: true }),
      F('files', 'Thumbnail / images', 'files', { full: true }),
      F('notes', 'Notes', 'textarea', { full: true })
    ]
  },
  ideas: {
    name: 'Idea', title: 'title', fields: [
      F('title', 'Idea', 'text', { req: true, full: true }),
      F('project_id', 'Related project', 'project', { full: true }),
      F('category', 'Category', 'select', { options: IDEA_CAT }),
      F('priority', 'Priority', 'select', { options: PRIORITY, def: 'Medium' }),
      F('status', 'Status', 'select', { options: IDEA_STATUS, def: 'New Idea' }),
      F('effort', 'Estimated effort', 'select', { options: EFFORT }),
      F('submitted_by', 'Submitted by', 'select', { options: SIDES }),
      F('reference_url', 'Reference link', 'url'),
      F('description', 'Description', 'textarea', { full: true }),
      F('decision', 'Decision', 'textarea', { full: true })
    ]
  },
  documents: {
    name: 'Document', title: 'title', fields: [
      F('title', 'Document name', 'text', { req: true, full: true }),
      F('project_id', 'Related project', 'project', { full: true }),
      F('category', 'Category', 'select', { options: DOC_CAT }),
      F('owner', 'Owner', 'select', { options: OWNER3 }),
      F('url', 'Link (Google Drive, Dropbox, website…)', 'url', { full: true }),
      F('files', 'Files', 'files', { full: true }),
      F('important', 'Important / key reference', 'checkbox', { full: true }),
      F('description', 'Description', 'textarea', { full: true })
    ]
  },
  leads: {
    name: 'Lead', title: 'name', fields: [
      F('name', 'Lead name', 'text', { req: true, full: true }),
      F('phone', 'Phone', 'tel'), F('email', 'Email', 'email'),
      F('kind', 'Buyer / Seller', 'select', { options: LEAD_KIND }),
      F('source', 'Lead source', 'select', { options: LEAD_SOURCE }),
      F('status', 'Status', 'select', { options: LEAD_STATUS, def: 'New Lead' }),
      F('next_follow_up', 'Next follow-up', 'date'),
      F('location', 'Location / area'), F('owner', 'Assigned owner', 'select', { options: SIDES, def: 'Pierre' }),
      F('notes', 'Notes', 'textarea', { full: true })
    ]
  },
  workflows: {
    name: 'Recurring workflow', title: 'name', fields: [
      F('name', 'Workflow name', 'text', { req: true, full: true }),
      F('project_id', 'Project', 'project', { full: true }),
      F('category', 'Task category', 'select', { options: TASK_CAT }),
      F('responsible', 'Who does it', 'select', { options: SIDES, def: 'Developer' }),
      F('frequency', 'Repeats', 'select', { options: FREQ, def: 'Weekly' }),
      F('weekday', 'Day of week (weekly / bi-weekly)', 'select', { options: WEEKDAYS }),
      F('month_day', 'Day of month (monthly / quarterly, 1–28)', 'number'),
      F('start_date', 'Start from', 'date'),
      F('active', 'Switched on — create a new task automatically each time', 'checkbox', { full: true }),
      F('approval_required', 'Each task needs Pierre’s approval', 'checkbox', { full: true }),
      F('checklist', 'Checklist copied into every task', 'checklist', { full: true }),
      F('notes', 'Notes', 'textarea', { full: true })
    ]
  }
};

/* ---------------- state ---------------- */
const TABLES = ['members', 'projects', 'workflows', 'tasks', 'requests', 'content', 'ideas', 'documents', 'leads', 'comments', 'activity', 'reports'];
const S = {
  data: Object.fromEntries(TABLES.map(t => [t, []])),
  me: null, modal: null, q: '', calMonth: null, booted: false,
  ui: { tasks: { view: 'board', f: 'open', project: '' }, projects: { tab: 'active' }, content: { tab: 'month' }, docs: { cat: '' }, leads: { view: 'board' }, proj: { tab: 'overview' }, planOpen: {} }
};
let db = null;

/* ---------------- data layer: demo (browser storage) ---------------- */
const LocalDB = {
  key: 'business_hq_demo_v1', mem: null,
  exists() { try { return !!localStorage.getItem(this.key); } catch (e) { return false; } },
  read() {
    if (!this.mem) { try { this.mem = JSON.parse(localStorage.getItem(this.key)); } catch (e) { this.mem = null; } }
    if (!this.mem) this.mem = Object.fromEntries(TABLES.map(t => [t, []]));
    return this.mem;
  },
  write() { try { localStorage.setItem(this.key, JSON.stringify(this.mem)); } catch (e) { console.warn('Browser storage unavailable — changes last until the page is closed.'); } },
  async list(t) { return clone(this.read()[t] || []); },
  async insert(t, row) {
    const d = this.read(); d[t] = d[t] || [];
    const r = { id: uid(), created_at: nowISO(), updated_at: nowISO(), ...row };
    if (t === 'projects' || t === 'tasks') r.code = d[t].reduce((m, x) => Math.max(m, x.code || 0), 0) + 1;
    if (t === 'tasks' && r.workflow_id && d.tasks.some(x => x.workflow_id === r.workflow_id && x.occurrence_date === r.occurrence_date)) throw new Error('duplicate occurrence');
    d[t].push(r); this.write(); return clone(r);
  },
  async update(t, id, patch) {
    const d = this.read(); const i = (d[t] || []).findIndex(r => r.id === id);
    if (i < 0) throw new Error('Record not found');
    d[t][i] = { ...d[t][i], ...patch }; this.write(); return clone(d[t][i]);
  },
  async remove(t, id) { const d = this.read(); d[t] = (d[t] || []).filter(r => r.id !== id); this.write(); },
  async upload(file) {
    if (file.size > 900 * 1024) throw new Error(`“${file.name}” is too large for demo mode (max 900 KB). Connect Supabase for real file storage.`);
    const path = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
    return { name: file.name, path, size: file.size };
  },
  async fileUrl(f) { return f.path; },
  async removeFile() { }
};

/* ---------------- data layer: Supabase ---------------- */
const SupaDB = {
  c: null,
  async init() {
    const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    this.c = mod.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  },
  async list(t) {
    let q = this.c.from(t).select('*');
    q = t === 'activity' ? q.order('created_at', { ascending: false }).limit(300) : q.order('created_at', { ascending: true });
    const { data, error } = await q;
    if (error) { if (t === 'leads') return []; throw error; }
    return data || [];
  },
  async insert(t, row) { const { data, error } = await this.c.from(t).insert(row).select().single(); if (error) throw error; return data; },
  async update(t, id, patch) { const { data, error } = await this.c.from(t).update(patch).eq('id', id).select().single(); if (error) throw error; return data; },
  async remove(t, id) { const { error } = await this.c.from(t).delete().eq('id', id); if (error) throw error; },
  async upload(file) {
    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    const path = `${uid()}/${safe}`;
    const { error } = await this.c.storage.from('attachments').upload(path, file);
    if (error) throw error;
    return { name: file.name, path, size: file.size };
  },
  async fileUrl(f) { const { data, error } = await this.c.storage.from('attachments').createSignedUrl(f.path, 3600); if (error) throw error; return data.signedUrl; },
  async removeFile(f) { await this.c.storage.from('attachments').remove([f.path]); }
};

/* ---------------- data helpers ---------------- */
const D = t => S.data[t] || [];
const byId = (t, id) => D(t).find(r => r.id === id);
const projName = id => (byId('projects', id) || {}).name || '';
const titleOf = (t, r) => r ? (r[MODELS[t] ? MODELS[t].title : 'title'] || r.title || r.name || '(untitled)') : '';
const isDone = t => DONE.includes(t.status);
const isOverdue = t => !!t.due_date && t.due_date < today() && !isDone(t);
const meSide = () => (S.me && S.me.side) || 'Developer';
const isPierre = () => meSide() === 'Pierre';
const canLeads = () => !!(S.me && S.me.leads_access);
const sortTasks = rows => rows.slice().sort((a, b) => {
  const ad = a.due_date || '9999', bd = b.due_date || '9999';
  if (ad !== bd) return ad < bd ? -1 : 1;
  return (PRIO_RANK[a.priority] ?? 9) - (PRIO_RANK[b.priority] ?? 9);
});
function projectStats(pid) {
  const ts = D('tasks').filter(t => t.project_id === pid && t.status !== 'Cancelled');
  const done = ts.filter(t => t.status === 'Completed').length;
  return { total: ts.length, done, pct: ts.length ? Math.round(done / ts.length * 100) : 0, open: ts.length - done };
}

async function loadAll() {
  const res = await Promise.all(TABLES.map(t => db.list(t).catch(e => { console.error(t, e); if (t === 'members' && !DEMO) throw e; return []; })));
  TABLES.forEach((t, i) => { S.data[t] = res[i]; });
  S.data.activity.sort(by('created_at', -1));
}

async function logActivity(action, t, row) {
  const entry = { actor: S.me ? S.me.display_name : '', action, entity_type: t, entity_id: row && row.id ? row.id : null, summary: `${(MODELS[t] || {}).name || t} “${titleOf(t, row)}”` };
  try { const r = await db.insert('activity', entry); S.data.activity.unshift(r); } catch (e) { console.warn('activity log failed', e); }
}

async function saveRow(t, id, vals, verb) {
  const patch = { ...vals, updated_at: nowISO() };
  let r;
  if (id) {
    r = await db.update(t, id, patch);
    const i = D(t).findIndex(x => x.id === id); if (i >= 0) S.data[t][i] = r;
  } else {
    if (t !== 'activity' && t !== 'comments' && !patch.created_by) patch.created_by = S.me ? S.me.display_name : null;
    r = await db.insert(t, patch);
    S.data[t].push(r);
  }
  if (t !== 'comments' && t !== 'activity' && t !== 'reports') logActivity(verb || (id ? 'updated' : 'created'), t, r);
  return r;
}

async function deleteRow(t, id) {
  const r = byId(t, id);
  await db.remove(t, id);
  S.data[t] = D(t).filter(x => x.id !== id);
  if (r) logActivity('deleted', t, r);
}

/* ---------------- task rules (approval workflow) ---------------- */
function applyTaskRules(v, old = {}) {
  const st = v.status !== undefined ? v.status : old.status;
  const appr = v.approval_required !== undefined ? v.approval_required : old.approval_required;
  const as = v.approval_status !== undefined ? v.approval_status : old.approval_status;
  if (as === 'Approved' && old.approval_status !== 'Approved' && !isPierre()) {
    toast('Only Pierre can approve work. Use “Send for review” instead.', 'warn'); return false;
  }
  if (st === 'Completed' && appr && as !== 'Approved') {
    toast('This task needs Pierre’s approval first — use “Send for review”.', 'warn'); return false;
  }
  if (st === 'Client Review' && old.status !== 'Client Review') {
    v.approval_required = true;
    if (as !== 'Pending Review') v.approval_status = 'Pending Review';
    v.review_date = v.review_date || today();
  }
  if (!appr && !as) v.approval_status = 'Not Required';
  if (st === 'Completed' && old.status !== 'Completed') v.completed_at = nowISO();
  if (st !== 'Completed' && old.status === 'Completed') v.completed_at = null;
  return true;
}

async function saveTask(id, vals, verb) {
  const old = id ? byId('tasks', id) || {} : {};
  if (!applyTaskRules(vals, old)) return null;
  const r = await saveRow('tasks', id, vals, verb);
  if (r.status === 'Completed') {
    for (const q of D('requests').filter(q => q.task_id === r.id && q.status !== 'Completed')) await saveRow('requests', q.id, { status: 'Completed' }, 'completed');
  } else if (r.status === 'In Progress') {
    for (const q of D('requests').filter(q => q.task_id === r.id && q.status === 'Converted to Task')) await saveRow('requests', q.id, { status: 'In Progress' });
  }
  return r;
}

/* ---------------- recurring workflows ---------------- */
function occurrenceFor(w, ref = today()) {
  const start = w.start_date || '2000-01-01';
  if (ref < start) return null;
  const d = parseD(ref);
  let occ = null;
  switch (w.frequency) {
    case 'Daily': occ = ref; break;
    case 'Weekly': case 'Bi-weekly': {
      if (!w.weekday) return null;
      const target = WEEKDAYS.indexOf(w.weekday);
      const cur = (d.getDay() + 6) % 7;
      occ = addDays(ref, -((cur - target + 7) % 7));
      if (w.frequency === 'Bi-weekly') {
        const s = parseD(start), sw = addDays(start, (target - ((s.getDay() + 6) % 7) + 7) % 7);
        if (occ < sw) return null;
        const weeks = Math.round((parseD(occ) - parseD(sw)) / (7 * 864e5));
        if (weeks % 2) occ = addDays(occ, -7);
        if (occ < sw) return null;
      }
      break;
    }
    case 'Monthly': {
      const md = Math.min(28, Math.max(1, +w.month_day || 1));
      occ = ymd(new Date(d.getFullYear(), d.getMonth(), md));
      if (occ > ref) occ = ymd(new Date(d.getFullYear(), d.getMonth() - 1, md));
      break;
    }
    case 'Quarterly': {
      const md = Math.min(28, Math.max(1, +w.month_day || 1)), qm = Math.floor(d.getMonth() / 3) * 3;
      occ = ymd(new Date(d.getFullYear(), qm, md));
      if (occ > ref) occ = ymd(new Date(d.getFullYear(), qm - 3, md));
      break;
    }
    default: return null;
  }
  return occ >= start ? occ : null;
}

function taskFromWorkflow(w, occ) {
  return {
    title: `${w.name} — ${fmtD(occ || today())}`, project_id: w.project_id || null, category: w.category || null,
    type: 'Recurring', recurring: true, frequency: w.frequency || null, responsible: w.responsible || 'Developer',
    status: 'To Do', priority: 'Medium', due_date: occ || today(), approval_required: !!w.approval_required,
    approval_status: w.approval_required ? null : 'Not Required',
    checklist: (w.checklist || []).map(i => ({ id: uid(), text: i.text, done: false })),
    instructions: w.notes || null, workflow_id: occ ? w.id : null, occurrence_date: occ || null
  };
}

async function runRecurring() {
  let made = 0;
  for (const w of D('workflows').filter(w => w.active)) {
    const occ = occurrenceFor(w);
    if (!occ) continue;
    if (D('tasks').some(t => t.workflow_id === w.id && t.occurrence_date === occ)) continue;
    try { await saveTask(null, taskFromWorkflow(w, occ), 'auto-created'); made++; }
    catch (e) { console.info('recurring skipped', e.message); }
  }
  if (made) toast(`${made} recurring task${made > 1 ? 's' : ''} created for this period`);
  return made;
}

/* ---------------- starter data import ---------------- */
async function importSeed() {
  const seed = window.PORTAL_SEED; if (!seed) return toast('Starter data file missing', 'err');
  const keyToId = {};
  for (const p of seed.projects) {
    const { key, plan, ...rest } = p;
    const r = await db.insert('projects', { ...rest, plan: mkPlan(plan.map(s => [s.title, s.items])), created_by: 'Setup' });
    keyToId[key] = r.id;
  }
  for (const t of seed.tasks) {
    const { project, ...rest } = t;
    await db.insert('tasks', { approval_required: false, approval_status: rest.approval_required ? rest.approval_status : 'Not Required', ...rest, project_id: keyToId[project] || null, checklist: [], files: [], created_by: 'Setup' });
  }
  for (const w of seed.workflows) {
    const { project, checklist, ...rest } = w;
    await db.insert('workflows', { ...rest, project_id: project ? keyToId[project] : null, checklist: checklist.map(text => ({ id: uid(), text, done: false })), created_by: 'Setup' });
  }
}

/* ---------------- UI primitives ---------------- */
function toast(msg, kind = '') {
  const el = $('#toast'); el.textContent = msg; el.className = 'show ' + kind;
  clearTimeout(toast.t); toast.t = setTimeout(() => { el.className = kind; }, 3800);
}
const badge = v => (v == null || v === '') ? '' : `<span class="badge b-${BADGE[v] || 'gray'}">${esc(v)}</span>`;
const whoChip = w => w ? `<span class="who-chip who-${esc(w.toLowerCase())}">${esc(w)}</span>` : '';
const dueChip = t => t.due_date ? `<span class="due ${isOverdue(t) ? 'late' : ''}">${isOverdue(t) ? 'Overdue · ' : ''}${fmtD(t.due_date)}</span>` : '';
const empty = msg => `<div class="empty">${esc(msg)}</div>`;
const progress = pct => `<div class="progress" title="${pct}% complete"><i style="width:${pct}%"></i></div>`;

function taskLine(t, opts = {}) {
  return `<div class="line" data-act="open" data-t="tasks" data-id="${t.id}">
    ${t.status === 'Client Review' ? '<span class="qd" title="Waiting for Pierre’s approval" style="text-align:center">⏳</span>' : `<input type="checkbox" class="qd" title="Mark complete" data-act="quick-done" data-id="${t.id}" ${t.status === 'Completed' ? 'checked' : ''}>`}
    <div class="grow"><div class="tt">${esc(t.title)}</div>
      <div class="sub">${opts.noProject ? '' : esc(projName(t.project_id))}${t.status && !opts.noStatus ? ' · ' + esc(t.status) : ''}</div></div>
    ${whoChip(opts.noWho ? '' : t.responsible)} ${badge(t.priority === 'Urgent' || t.priority === 'High' ? t.priority : '')} ${dueChip(t)}
  </div>`;
}

function taskCard(t) {
  const cl = t.checklist || [], cd = cl.filter(i => i.done).length;
  return `<div class="card" draggable="true" data-drag="tasks" data-id="${t.id}" data-act="open" data-t="tasks">
    <div class="card-title">${esc(t.title)}</div>
    ${t.project_id ? `<div class="card-meta">${esc(projName(t.project_id))}</div>` : ''}
    <div class="card-foot">${badge(t.priority)} ${whoChip(t.responsible)} ${dueChip(t)} ${cl.length ? `<span class="due">☑ ${cd}/${cl.length}</span>` : ''}</div>
  </div>`;
}

function genericCard(t, r, metaFn) {
  return `<div class="card" draggable="true" data-drag="${t}" data-id="${r.id}" data-act="open" data-t="${t}">
    <div class="card-title">${esc(titleOf(t, r))}</div>
    <div class="card-meta">${metaFn ? metaFn(r) : esc(projName(r.project_id))}</div>
    <div class="card-foot">${badge(r.priority)}</div></div>`;
}

function board(t, rows, field, groups, cardFn) {
  return `<div class="board">${groups.map(g => {
    const items = rows.filter(r => (r[field] || groups[0]) === g);
    return `<div class="col" data-drop="${t}" data-field="${field}" data-val="${esc(g)}">
      <div class="col-head"><span>${esc(g)}</span><span class="count">${items.length}</span></div>
      <div class="col-body">${items.map(cardFn).join('') || '<div class="empty-col">Drop here</div>'}</div></div>`;
  }).join('')}</div>`;
}

function table(t, rows, cols, emptyMsg = 'Nothing here yet.') {
  if (!rows.length) return `<div class="panel">${empty(emptyMsg)}</div>`;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${cols.map(c => `<th>${esc(c[0])}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr data-act="open" data-t="${t}" data-id="${r.id}">${cols.map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function calendar(rows, key, t) {
  const m = S.calMonth || today().slice(0, 7);
  const [y, mo] = m.split('-').map(Number);
  const first = new Date(y, mo - 1, 1), off = (first.getDay() + 6) % 7, days = new Date(y, mo, 0).getDate();
  const cells = []; for (let i = 0; i < off; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(`${m}-${pad(d)}`);
  while (cells.length % 7) cells.push(null);
  const label = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const cls = r => t === 'tasks' ? (r.status === 'Completed' ? 'done' : isOverdue(r) ? 'late' : '') : (r.status === 'Published' ? 'done' : '');
  return `<div class="cal"><div class="cal-head">
      <button class="btn sm" data-act="cal" data-d="-1" aria-label="Previous month">‹</button><strong>${esc(label)}</strong>
      <button class="btn sm" data-act="cal" data-d="1" aria-label="Next month">›</button>
      <button class="btn sm ghost" data-act="cal" data-d="0">Today</button></div>
    <div class="cal-grid">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
    ${cells.map(c => {
      if (!c) return '<div class="cal-cell blank"></div>';
      const items = rows.filter(r => r[key] && String(r[key]).slice(0, 10) === c);
      return `<div class="cal-cell ${c === today() ? 'today' : ''}"><div class="cal-day">${+c.slice(8)}</div>
        ${items.map(r => `<div class="cal-item ${cls(r)}" data-act="open" data-t="${t}" data-id="${r.id}" title="${esc(titleOf(t, r))}">${esc(titleOf(t, r))}</div>`).join('')}</div>`;
    }).join('')}</div></div>`;
}

function weekView(rows, key, t) {
  const start = today();
  return `<div class="week">${[0, 1, 2, 3, 4, 5, 6].map(i => {
    const d = addDays(start, i), items = rows.filter(r => r[key] && String(r[key]).slice(0, 10) === d);
    const dn = parseD(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    return `<div class="day ${i === 0 ? 'today' : ''}"><h4>${esc(dn)}</h4>${items.map(r => `<div class="card" style="margin-bottom:6px" data-act="open" data-t="${t}" data-id="${r.id}"><div class="card-title" style="font-size:12.5px">${esc(titleOf(t, r))}</div><div class="card-foot">${badge(r.status)}</div></div>`).join('') || '<div class="empty" style="padding:6px">—</div>'}</div>`;
  }).join('')}</div>`;
}

const tabsHTML = (act, cur, items) => `<div class="tabs">${items.map(([k, l]) => `<button class="${k === cur ? 'on' : ''}" data-act="${act}" data-v="${k}">${esc(l)}</button>`).join('')}</div>`;
const segHTML = (act, cur, items) => `<div class="seg">${items.map(([k, l]) => `<button class="${k === cur ? 'on' : ''}" data-act="${act}" data-v="${k}">${esc(l)}</button>`).join('')}</div>`;
const projectFilter = (act, cur) => `<select data-change="${act}" aria-label="Filter by project"><option value="">All projects</option>${D('projects').slice().sort(by('name')).map(p => `<option value="${p.id}" ${p.id === cur ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`;

/* ---------------- routing ---------------- */
function parseRoute() {
  const h = (location.hash || '#/dashboard').slice(2);
  const [path, qs] = h.split('?');
  const parts = path.split('/');
  return { page: parts[0] || 'dashboard', id: parts[1] || null, params: Object.fromEntries(new URLSearchParams(qs || '')) };
}

const NAV = [
  ['dashboard', '🏠', 'Dashboard'], ['projects', '📁', 'Projects'], ['tasks', '✅', 'Tasks'],
  ['requests', '📥', 'Requests'], ['approvals', '👍', 'Approvals'], ['content', '🗓️', 'Content'],
  ['ideas', '💡', 'Ideas'], ['documents', '📄', 'Documents'], ['leads', '🔒', 'Leads (CRM)'],
  ['workflows', '🔁', 'Recurring'], ['reports', '📊', 'Weekly reports'], ['help', '❓', 'How to use']
];

function shell() {
  $('#app').innerHTML = `<div class="shell">
    <aside class="side" id="side">
      <div class="brand"><div class="logo">HQ</div>${esc(APP_NAME)}</div>
      <nav class="nav" id="nav"></nav>
      <div class="who"><b>${esc(S.me.display_name)}</b>${esc(S.me.side === 'Pierre' ? 'Client / owner' : 'Developer / manager')}${DEMO ? '' : `<br><a href="#" data-act="logout" style="color:#93c5fd">Sign out</a>`}</div>
    </aside>
    <div class="main-wrap">
      ${DEMO ? `<div class="demo-bar no-print"><b>Demo mode</b> — data is saved in this browser only. Connect Supabase (see README) so you and Pierre share the same data.
        <label>View as <select data-change="demo-side">${SIDES.map(s => `<option ${s === S.me.side ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
        <button class="btn sm" data-act="demo-reset">Reset demo data</button></div>` : ''}
      <header class="top no-print">
        <button class="btn sm menu-btn" data-act="menu" aria-label="Menu">☰</button>
        <div class="search"><span>🔍</span><input id="q" placeholder="Search tasks, projects, requests…" autocomplete="off"></div>
        <div class="spacer"></div>
        <button class="btn sm ghost refresh-btn" data-act="refresh" title="Refresh data">↻ Refresh</button>
        <div class="dropdown" id="newdd"><button class="btn primary" data-act="newmenu">＋ New</button>
          <div class="dd-menu">
            <button data-act="new" data-t="tasks">Task</button><button data-act="new" data-t="projects">Project</button>
            <button data-act="new" data-t="requests">Request</button><button data-act="new" data-t="content">Content item</button>
            <button data-act="new" data-t="ideas">Idea</button><button data-act="new" data-t="documents">Document</button>
            ${canLeads() ? '<button data-act="new" data-t="leads">Lead</button>' : ''}
          </div></div>
      </header>
      <main id="main"></main>
    </div></div>`;
  $('#q').addEventListener('input', e => {
    S.q = e.target.value.trim();
    if (S.q && parseRoute().page !== 'search') location.hash = '#/search'; else render();
  });
}

function renderNav(page) {
  const appr = D('tasks').filter(t => t.status === 'Client Review').length + D('content').filter(c => c.status === 'Client Review').length;
  const newReq = D('requests').filter(r => r.status === 'New Request').length;
  $('#nav').innerHTML = NAV.filter(n => n[0] !== 'leads' || canLeads()).map(([k, ico, l]) => {
    const pill = k === 'approvals' && appr ? appr : k === 'requests' && newReq && !isPierre() ? newReq : 0;
    const on = page === k || (page === 'project' && k === 'projects') || (page === 'report' && k === 'reports');
    return `<a href="#/${k}" class="${on ? 'on' : ''}"><span class="ico">${ico}</span>${esc(l)}${pill ? `<span class="pill">${pill}</span>` : ''}</a>`;
  }).join('') + '<div class="sep"></div>';
}

function render() {
  if (!S.booted) return;
  const r = parseRoute();
  renderNav(r.page);
  $('#side').classList.remove('open');
  const pages = { dashboard: pgDashboard, projects: pgProjects, project: pgProject, tasks: pgTasks, requests: pgRequests, approvals: pgApprovals, content: pgContent, ideas: pgIdeas, documents: pgDocuments, leads: pgLeads, workflows: pgWorkflows, reports: pgReports, report: pgReport, help: pgHelp, search: pgSearch };
  const fn = pages[r.page] || pgDashboard;
  const scroll = window.scrollY;
  try { $('#main').innerHTML = fn(r); }
  catch (e) { console.error(e); $('#main').innerHTML = `<div class="alert danger"><b>Something went wrong showing this page.</b>${esc(e.message)}</div>`; }
  if (r.page === S.lastPage) window.scrollTo(0, scroll); else window.scrollTo(0, 0);
  S.lastPage = r.page;
}

/* ================================================================
   PAGES
================================================================ */
function pgDashboard() {
  const T = D('tasks'), open = T.filter(t => !isDone(t)), td = today(), wk = addDays(td, 7);
  const weekAgo = addDays(td, -6);
  const greet = (() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; })();
  const kpis = [
    ['Active projects', D('projects').filter(p => p.status === 'Active').length, '#/projects?tab=active', ''],
    ['Open tasks', open.length, '#/tasks?f=open', ''],
    ['In progress', T.filter(t => t.status === 'In Progress').length, '#/tasks?f=inprogress', ''],
    ['Overdue', open.filter(isOverdue).length, '#/tasks?f=overdue', 'red'],
    ['Waiting for Pierre', T.filter(t => t.status === 'Waiting for Client').length, '#/tasks?f=waiting', 'orange'],
    ['Completed this week', T.filter(t => t.status === 'Completed' && t.completed_at && t.completed_at.slice(0, 10) >= weekAgo).length, '#/tasks?f=completed', 'green']
  ];
  const mineSide = meSide(), otherSide = mineSide === 'Pierre' ? 'Developer' : 'Pierre';
  const mine = sortTasks(open.filter(t => t.responsible === mineSide));
  const other = sortTasks(open.filter(t => t.responsible === otherSide));
  const upcoming = sortTasks(open.filter(t => t.due_date && t.due_date >= td && t.due_date <= wk));
  const review = T.filter(t => t.status === 'Client Review');
  const contentWeek = D('content').filter(c => c.publish_date && c.publish_date >= td && c.publish_date <= wk).sort(by('publish_date'));
  const active = D('projects').filter(p => p.status === 'Active').sort((a, b) => (PRIO_RANK[a.priority] ?? 9) - (PRIO_RANK[b.priority] ?? 9));
  const confirm = D('projects').filter(p => p.needs_confirmation && p.status !== 'Archived');
  const emptyDb = !D('projects').length;
  const list = (rows, msg, opts) => rows.length ? `<div class="lines">${rows.slice(0, 8).map(t => taskLine(t, opts)).join('')}</div>${rows.length > 8 ? `<div class="small muted" style="padding-top:6px">+ ${rows.length - 8} more</div>` : ''}` : empty(msg);

  return `
  <div class="page-head"><div><h1>${greet}, ${esc(S.me.display_name)}</h1><p>${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · everything across your businesses in one place.</p></div></div>
  ${emptyDb ? `<div class="alert info"><b>Your portal is empty.</b>Load the 7 starter projects (vape store, YouTube channels, real estate, AMS, restaurant prospect), the confirmed next actions and the recurring workflows.<div style="margin-top:8px"><button class="btn primary" data-act="import-seed">Import starter data</button></div></div>` : ''}
  ${isPierre() && mine.length ? `<div class="alert warn"><b>${mine.length} item${mine.length > 1 ? 's' : ''} waiting on you.</b>See “Your tasks” below — mostly quick confirmations so work can continue.</div>` : ''}
  ${review.length && isPierre() ? `<div class="alert info"><b>${review.length} item${review.length > 1 ? 's' : ''} ready for your review.</b><a href="#/approvals">Open Approvals →</a></div>` : ''}
  <div class="kpis">${kpis.map(k => `<a class="kpi ${k[3]}" href="${k[2]}"><div class="n">${k[1]}</div><div class="l">${esc(k[0])}</div></a>`).join('')}</div>
  <div class="quick no-print">
    <button class="btn" data-act="new" data-t="projects">📁 Add new project</button>
    <button class="btn" data-act="new" data-t="tasks">✅ Create task</button>
    <button class="btn" data-act="new" data-t="requests">📥 Submit a request</button>
    <button class="btn" data-act="new" data-t="ideas">💡 Add idea</button>
    <button class="btn" data-act="new" data-t="documents">📄 Add document</button>
    <a class="btn" href="#/tasks?view=calendar">🗓️ View calendar</a>
  </div>
  <div class="panel" style="margin-bottom:16px"><div class="panel-head"><h2>Active projects</h2><a href="#/projects">All projects →</a></div>
    ${active.length ? `<div class="pcards">${active.map(projectCard).join('')}</div>` : empty('No active projects.')}</div>
  <div class="grid g2" style="margin-bottom:16px">
    <div class="panel"><div class="panel-head"><h2>${mineSide === 'Pierre' ? 'Your tasks (Pierre)' : 'My tasks (Developer)'}</h2><a href="#/tasks?f=mine">See all →</a></div>${list(mine, 'Nothing assigned to you. 🎉', { noWho: true })}</div>
    <div class="panel"><div class="panel-head"><h2>${otherSide === 'Pierre' ? 'Client tasks (Pierre)' : 'Developer tasks'}</h2><a href="#/tasks?f=${otherSide === 'Pierre' ? 'pierre' : 'developer'}">See all →</a></div>${list(other, 'Nothing open.', { noWho: true })}</div>
  </div>
  <div class="grid g3" style="margin-bottom:16px">
    <div class="panel"><div class="panel-head"><h2>Upcoming deadlines</h2><span class="small muted">next 7 days</span></div>${list(upcoming, 'No deadlines this week.')}</div>
    <div class="panel"><div class="panel-head"><h2>Waiting for approval</h2><a href="#/approvals">Approvals →</a></div>${list(review, 'Nothing awaiting review.')}</div>
    <div class="panel"><div class="panel-head"><h2>This week’s content</h2><a href="#/content?tab=week">Calendar →</a></div>
      ${contentWeek.length ? `<div class="lines">${contentWeek.map(c => `<div class="line" data-act="open" data-t="content" data-id="${c.id}"><div class="grow"><div class="tt">${esc(c.title)}</div><div class="sub">${esc(c.type || '')} · ${esc(projName(c.project_id))}</div></div>${badge(c.status)}<span class="due">${fmtD(c.publish_date)}</span></div>`).join('')}</div>` : empty('No content scheduled this week.')}</div>
  </div>
  <div class="grid g2">
    <div class="panel"><div class="panel-head"><h2>Needs Pierre’s confirmation</h2></div>
      ${confirm.length ? `<div class="lines">${confirm.map(p => `<a class="line" href="#/project/${p.id}" style="color:inherit;text-decoration:none"><div class="grow"><div class="tt">${esc(p.name)}</div><div class="sub">${esc((p.description || '').slice(0, 90))}</div></div>${badge(p.status)}</a>`).join('')}</div>` : empty('Nothing waiting for confirmation.')}</div>
    <div class="panel"><div class="panel-head"><h2>Recent activity</h2></div>
      ${D('activity').length ? `<div class="lines">${D('activity').slice(0, 10).map(a => `<div class="line" ${a.entity_id && byId(a.entity_type, a.entity_id) ? `data-act="open" data-t="${esc(a.entity_type)}" data-id="${a.entity_id}"` : ''}><div class="grow"><div class="tt" style="font-weight:500"><b>${esc(a.actor || 'Someone')}</b> ${esc(a.action)} ${esc(a.summary)}</div></div><span class="due">${ago(a.created_at)}</span></div>`).join('')}</div>` : empty('No activity yet.')}</div>
  </div>`;
}

function projectCard(p) {
  const s = projectStats(p.id);
  return `<a class="pcard" href="#/project/${p.id}">
    <div class="row between"><span style="font-size:20px">${CAT_ICON[p.category] || '📁'}</span><span class="row">${badge(p.priority)} ${badge(p.status)}</span></div>
    <div class="t">${esc(p.name)}</div><div class="c">${esc(p.client || '')}</div>
    ${progress(s.pct)}
    <div class="row between small muted"><span>${s.done}/${s.total} tasks done</span><span>${p.target_date ? 'Due ' + fmtD(p.target_date) : ''}</span></div>
    ${p.needs_confirmation ? '<span class="badge b-orange" style="align-self:flex-start">Needs confirmation</span>' : ''}
  </a>`;
}

function pgProjects(r) {
  if (r.params.tab) { S.ui.projects.tab = r.params.tab; history.replaceState(null, '', '#/projects'); }
  const tab = S.ui.projects.tab, P = D('projects');
  const sets = {
    active: P.filter(p => p.status === 'Active'), all: P.filter(p => p.status !== 'Archived'),
    hold: P.filter(p => p.status === 'On Hold'), planning: P.filter(p => ['Planning', 'Not Started', 'In Review'].includes(p.status)),
    done: P.filter(p => ['Completed', 'Archived'].includes(p.status))
  };
  let body;
  if (tab === 'category') {
    const cats = PROJECT_CAT.filter(c => P.some(p => p.category === c));
    body = cats.map(c => `<h3 style="margin:16px 0 8px">${CAT_ICON[c] || ''} ${esc(c)}</h3><div class="pcards">${P.filter(p => p.category === c).map(projectCard).join('')}</div>`).join('') || empty('No projects yet.');
  } else if (tab === 'timeline') body = timeline(P.filter(p => p.status !== 'Archived'));
  else body = sets[tab].length ? `<div class="pcards">${sets[tab].sort((a, b) => (PRIO_RANK[a.priority] ?? 9) - (PRIO_RANK[b.priority] ?? 9)).map(projectCard).join('')}</div>` : `<div class="panel">${empty('No projects in this view.')}</div>`;
  return `<div class="page-head"><div><h1>Projects</h1><p>Every business, channel and client project. Archive instead of deleting so history is kept.</p></div>
    <button class="btn primary" data-act="new" data-t="projects">＋ Add new project</button></div>
    ${tabsHTML('ptab', tab, [['active', `Active (${sets.active.length})`], ['planning', `Planning (${sets.planning.length})`], ['hold', `On hold (${sets.hold.length})`], ['done', `Completed & archived (${sets.done.length})`], ['all', 'All'], ['category', 'By category'], ['timeline', 'Timeline']])}
    ${body}`;
}

function timeline(P) {
  const dated = P.filter(p => p.start_date || p.target_date);
  const undated = P.filter(p => !p.start_date && !p.target_date);
  if (!dated.length) return `<div class="panel">${empty('Add start and target dates to projects to see them on the timeline.')}</div>`;
  const starts = dated.map(p => p.start_date || p.target_date), ends = dated.map(p => p.target_date || addDays(p.start_date, 30));
  let min = starts.reduce((a, b) => a < b ? a : b), max = ends.reduce((a, b) => a > b ? a : b);
  min = min.slice(0, 8) + '01'; const mx = parseD(max); max = ymd(new Date(mx.getFullYear(), mx.getMonth() + 1, 0));
  if (today() < min) min = today().slice(0, 8) + '01';
  const span = (parseD(max) - parseD(min)) / 864e5 + 1, pos = d => ((parseD(d) - parseD(min)) / 864e5) / span * 100;
  const months = []; let c = parseD(min); while (ymd(c) <= max) { months.push(new Date(c)); c = new Date(c.getFullYear(), c.getMonth() + 1, 1); }
  const head = `<div class="tl-row"><div class="tl-name muted small">Project</div><div class="tl-track" style="height:26px"><div class="tl-months">${months.map(m => { const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate(); return `<div style="width:${days / span * 100}%">${m.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}</div>`; }).join('')}</div></div></div>`;
  const tdp = today() <= max ? `<div class="tl-today" style="left:${pos(today())}%"></div>` : '';
  return `<div class="tl">${head}${dated.map(p => {
    const s = p.start_date || p.target_date, e = p.target_date || addDays(s, 30);
    return `<div class="tl-row"><div class="tl-name">${esc(p.name)}</div><div class="tl-track">${tdp}<div class="tl-bar" data-act="go" data-href="#/project/${p.id}" style="left:${pos(s)}%;width:${Math.max(2, pos(e) - pos(s) + 100 / span)}%;background:${p.status === 'Active' ? 'var(--accent)' : 'var(--soft)'}">${esc(p.name)}${p.target_date ? '' : ' (no target)'}</div></div></div>`;
  }).join('')}</div>${undated.length ? `<p class="small muted" style="margin-top:8px">No dates yet: ${undated.map(p => esc(p.name)).join(', ')}</p>` : ''}`;
}

function pgProject(r) {
  const p = byId('projects', r.id);
  if (!p) return `<div class="panel">${empty('Project not found.')}</div>`;
  if (S.ui.proj.id !== p.id) { S.ui.proj = { id: p.id, tab: 'overview' }; }
  if (r.params.tab) { S.ui.proj.tab = r.params.tab; history.replaceState(null, '', `#/project/${p.id}`); }
  const tab = S.ui.proj.tab, s = projectStats(p.id);
  const tasks = D('tasks').filter(t => t.project_id === p.id);
  const open = tasks.filter(t => !isDone(t)), td = today();
  const content = D('content').filter(c => c.project_id === p.id), reqs = D('requests').filter(q => q.project_id === p.id);
  const docs = D('documents').filter(d => d.project_id === p.id), ideas = D('ideas').filter(i => i.project_id === p.id);
  const fact = (k, v) => v ? `<div class="fact"><div class="k">${k}</div><div class="v">${v}</div></div>` : '';
  let body = '';
  if (tab === 'overview') {
    const plan = p.plan || [];
    const upcoming = sortTasks(open.filter(t => t.due_date)).slice(0, 6);
    body = `<div class="grid g2">
      <div class="panel"><div class="panel-head"><h2>Plan & checklists</h2><span class="small muted">tick items as they’re done · ＋ turns an item into a task</span></div>
        ${plan.length ? plan.map((sec, si) => { const its = sec.items || [], dn = its.filter(i => i.done).length, key = p.id + ':' + si; const isOpen = S.ui.planOpen[key] !== undefined ? S.ui.planOpen[key] : si === plan.findIndex(x => (x.items || []).some(i => !i.done)); return `<details class="plan-sec" data-key="${key}" ${isOpen ? 'open' : ''}><summary>${esc(sec.title)}<span class="sp small muted">${dn}/${its.length}</span></summary>${its.map((it, ii) => `
          <label class="plan-item ${it.done ? 'done' : ''}"><input type="checkbox" data-act="plan-toggle" data-pid="${p.id}" data-si="${si}" data-ii="${ii}" ${it.done ? 'checked' : ''}><span>${esc(it.text)}</span>
          ${it.task_id && byId('tasks', it.task_id) ? `<a class="mk small" style="opacity:1" href="#" data-act="open" data-t="tasks" data-id="${it.task_id}">task ↗</a>` : `<button class="icon-btn mk" title="Make this a task" data-act="plan-task" data-pid="${p.id}" data-si="${si}" data-ii="${ii}">＋</button>`}</label>`).join('')}</details>`; }).join('') : empty('No plan yet — edit the project to apply a template.')}
        <button class="btn sm no-print" data-act="plan-edit" data-pid="${p.id}">Edit plan</button></div>
      <div>
        <div class="panel" style="margin-bottom:16px"><div class="panel-head"><h2>Upcoming deadlines</h2></div>${upcoming.length ? `<div class="lines">${upcoming.map(t => taskLine(t, { noProject: true })).join('')}</div>` : empty('No dated open tasks.')}</div>
        <div class="panel" style="margin-bottom:16px"><div class="panel-head"><h2>Open tasks</h2><button class="btn sm" data-act="new" data-t="tasks" data-project="${p.id}">＋ Task</button></div>${open.length ? `<div class="lines">${sortTasks(open).slice(0, 10).map(t => taskLine(t, { noProject: true })).join('')}</div>` : empty('No open tasks.')}</div>
        <div class="panel">${commentsHTML('projects', p.id, 'Feedback & notes')}</div>
      </div></div>`;
  } else if (tab === 'board') body = board('tasks', tasks.filter(t => t.status !== 'Cancelled'), 'status', TASK_STATUS.filter(s => s !== 'Cancelled'), taskCard);
  else if (tab === 'completed') body = table('tasks', tasks.filter(t => t.status === 'Completed').sort(by('completed_at', -1)), [['Task', t => `<span class="ttl">${esc(t.title)}</span>`], ['Who', t => whoChip(t.responsible)], ['Completed', t => fmtD((t.completed_at || '').slice(0, 10))], ['Delivery', t => link(t.delivery_url)]], 'No completed tasks yet.');
  else if (tab === 'content') body = `<div class="toolbar"><button class="btn sm" data-act="new" data-t="content" data-project="${p.id}">＋ Content</button></div>` + table('content', content.sort(by('publish_date')), CONTENT_COLS, 'No content for this project.');
  else if (tab === 'requests') body = `<div class="toolbar"><button class="btn sm" data-act="new" data-t="requests" data-project="${p.id}">＋ Request</button></div>` + table('requests', reqs, REQUEST_COLS, 'No requests for this project.');
  else if (tab === 'docs') body = `<div class="toolbar"><button class="btn sm" data-act="new" data-t="documents" data-project="${p.id}">＋ Document</button></div>` + table('documents', docs, DOC_COLS, 'No documents for this project.');
  else if (tab === 'ideas') body = `<div class="toolbar"><button class="btn sm" data-act="new" data-t="ideas" data-project="${p.id}">＋ Idea</button></div>` + table('ideas', ideas, IDEA_COLS, 'No ideas for this project.');
  else if (tab === 'activity') {
    const ids = new Set([p.id, ...tasks.map(t => t.id), ...content.map(c => c.id), ...reqs.map(q => q.id), ...docs.map(d => d.id), ...ideas.map(i => i.id)]);
    const acts = D('activity').filter(a => ids.has(a.entity_id)).slice(0, 50);
    body = `<div class="panel">${acts.length ? `<div class="lines">${acts.map(a => `<div class="line"><div class="grow"><b>${esc(a.actor)}</b> ${esc(a.action)} ${esc(a.summary)}</div><span class="due">${fmtDT(a.created_at)}</span></div>`).join('')}</div>` : empty('No activity yet.')}</div>`;
  }
  return `<div class="small muted no-print" style="margin-bottom:8px"><a href="#/projects">← Projects</a></div>
  <div class="p-hero">
    <div class="row between"><div class="row"><span style="font-size:26px">${CAT_ICON[p.category] || '📁'}</span><div><h1>${esc(p.name)}</h1><div class="muted">${esc(p.client || '')}</div></div></div>
      <div class="row no-print"><button class="btn sm" data-act="open" data-t="projects" data-id="${p.id}">Edit project</button>
      ${p.status !== 'Archived' ? `<button class="btn sm" data-act="archive" data-id="${p.id}">Archive</button>` : ''}</div></div>
    ${p.needs_confirmation ? `<div class="alert warn" style="margin:12px 0 0"><b>Needs Pierre’s confirmation</b>Some details are not confirmed yet — see the description and Pierre’s tasks.</div>` : ''}
    <div class="facts">
      ${fact('Status', badge(p.status))}${fact('Priority', badge(p.priority))}${fact('Progress', `${s.pct}% · ${s.done}/${s.total} tasks`)}
      ${fact('Category', esc(p.category))}${fact('Owner', esc(p.owner_side))}${fact('Start', fmtD(p.start_date))}${fact('Target', fmtD(p.target_date))}
      ${fact('Budget', p.budget != null ? '$' + Number(p.budget).toLocaleString() : '')}${fact('Link', link(p.links))}${fact('Project ID', p.code ? 'P-' + p.code : '')}
    </div>
    ${p.description ? `<div style="margin-top:14px"><div class="fact"><div class="k">Description</div></div><div class="prose">${esc(p.description)}</div></div>` : ''}
    ${p.instructions ? `<div style="margin-top:10px"><div class="fact"><div class="k">Instructions</div></div><div class="prose">${esc(p.instructions)}</div></div>` : ''}
    <div style="margin-top:12px">${progress(s.pct)}</div>
  </div>
  ${tabsHTML('projtab', tab, [['overview', 'Overview'], ['board', `Task board (${tasks.filter(t => t.status !== 'Cancelled').length})`], ['completed', `Completed (${s.done})`], ['content', `Content (${content.length})`], ['requests', `Requests (${reqs.length})`], ['docs', `Documents (${docs.length})`], ['ideas', `Ideas (${ideas.length})`], ['activity', 'Activity']])}
  ${body}`;
}

const TASK_FILTERS = {
  open: ['Open', t => !isDone(t)],
  mine: ['My tasks', t => !isDone(t) && t.responsible === meSide()],
  developer: ['Developer', t => !isDone(t) && t.responsible === 'Developer'],
  pierre: ['Pierre (client)', t => !isDone(t) && t.responsible === 'Pierre'],
  today: ['Today', t => !isDone(t) && t.due_date === today()],
  upcoming: ['Next 7 days', t => !isDone(t) && t.due_date && t.due_date >= today() && t.due_date <= addDays(today(), 7)],
  overdue: ['Overdue', isOverdue],
  inprogress: ['In progress', t => t.status === 'In Progress'],
  waiting: ['Waiting for Pierre', t => t.status === 'Waiting for Client'],
  review: ['Client review', t => ['Client Review', 'Revision Required'].includes(t.status)],
  completed: ['Completed', t => t.status === 'Completed'],
  all: ['All', () => true]
};
const TASK_COLS = [
  ['ID', t => `<span class="muted small">T-${t.code || ''}</span>`], ['Task', t => `<span class="ttl">${esc(t.title)}</span>`],
  ['Project', t => esc(projName(t.project_id))], ['Status', t => badge(t.status)], ['Priority', t => badge(t.priority)],
  ['Who', t => whoChip(t.responsible)], ['Due', t => dueChip(t)]
];

function pgTasks(r) {
  const u = S.ui.tasks;
  if (r.params.f || r.params.view) { if (r.params.f) u.f = r.params.f; if (r.params.view) u.view = r.params.view; history.replaceState(null, '', '#/tasks'); }
  let rows = D('tasks').filter(TASK_FILTERS[u.f] ? TASK_FILTERS[u.f][1] : () => true);
  if (u.project) rows = rows.filter(t => t.project_id === u.project);
  let body;
  if (u.view === 'board') body = board('tasks', rows, 'status', TASK_STATUS.filter(s => s !== 'Cancelled'), taskCard);
  else if (u.view === 'list') body = table('tasks', sortTasks(rows), TASK_COLS, 'No tasks match this view.');
  else if (u.view === 'byproject') {
    const groups = {}; sortTasks(rows).forEach(t => { (groups[t.project_id || ''] = groups[t.project_id || ''] || []).push(t); });
    const keys = Object.keys(groups).sort((a, b) => projName(a).localeCompare(projName(b)));
    body = keys.length ? keys.map(k => `<div class="panel" style="margin-bottom:12px"><div class="panel-head"><h2>${esc(projName(k) || 'No project')}</h2><span class="count">${groups[k].length}</span></div><div class="lines">${groups[k].map(t => taskLine(t, { noProject: true })).join('')}</div></div>`).join('') : `<div class="panel">${empty('No tasks match this view.')}</div>`;
  } else body = calendar(rows, 'due_date', 'tasks');
  return `<div class="page-head"><div><h1>Tasks</h1><p>One central task list. Drag cards between columns to update status.</p></div>
    <button class="btn primary" data-act="new" data-t="tasks" ${u.project ? `data-project="${u.project}"` : ''}>＋ Create task</button></div>
    <div class="toolbar">${segHTML('tview', u.view, [['board', 'Board'], ['list', 'List'], ['byproject', 'By project'], ['calendar', 'Calendar']])}${projectFilter('tproject', u.project)}</div>
    <div class="toolbar"><div class="chips">${Object.entries(TASK_FILTERS).map(([k, [l, fn]]) => `<button class="chip ${k === u.f ? 'on' : ''}" data-act="tfilter" data-v="${k}">${esc(l)} <span style="opacity:.6">${D('tasks').filter(t => (!u.project || t.project_id === u.project) && fn(t)).length}</span></button>`).join('')}</div></div>
    ${body}`;
}

const REQUEST_COLS = [['Request', q => `<span class="ttl">${esc(q.title)}</span>`], ['Project', q => esc(projName(q.project_id))], ['Status', q => badge(q.status)], ['Priority', q => badge(q.priority)], ['Needed by', q => fmtD(q.deadline)], ['Submitted', q => fmtD((q.created_at || '').slice(0, 10))]];
function pgRequests() {
  const rows = D('requests');
  return `<div class="page-head"><div><h1>Requests</h1><p>Pierre submits new work here. The developer reviews each request, then approves it and turns it into a task — nothing becomes work automatically.</p></div>
    <button class="btn primary" data-act="new" data-t="requests">📥 Submit a request</button></div>
    <div class="alert info"><b>How it works</b>New Request → Review → Approved → Converted to Task → In Progress → Completed. When the linked task is finished, the request completes automatically.</div>
    ${board('requests', rows, 'status', REQ_STATUS, q => genericCard('requests', q, q => `${esc(projName(q.project_id) || 'No project')}${q.deadline ? ' · by ' + fmtD(q.deadline) : ''}`))}`;
}

function pgApprovals() {
  const review = D('tasks').filter(t => t.status === 'Client Review');
  const revise = D('tasks').filter(t => t.status === 'Revision Required');
  const waiting = sortTasks(D('tasks').filter(t => t.status === 'Waiting for Client'));
  const cReview = D('content').filter(c => c.status === 'Client Review');
  const reviewRow = t => `<div class="line" data-act="open" data-t="tasks" data-id="${t.id}"><div class="grow"><div class="tt">${esc(t.title)}</div>
      <div class="sub">${esc(projName(t.project_id))}${t.delivery_url ? ' · ' + link(t.delivery_url) : ' · no delivery link yet'}${t.review_date ? ' · sent ' + fmtD(t.review_date) : ''}</div></div>
      ${isPierre() ? `<button class="btn sm green" data-act="approve" data-t="tasks" data-id="${t.id}">✓ Approve</button><button class="btn sm danger" data-act="revise" data-t="tasks" data-id="${t.id}">Request changes</button>` : badge('Pending Review')}</div>`;
  const contentRow = c => `<div class="line" data-act="open" data-t="content" data-id="${c.id}"><div class="grow"><div class="tt">${esc(c.title)}</div><div class="sub">${esc(c.type || '')} · ${esc(projName(c.project_id))}${c.draft_url ? ' · ' + link(c.draft_url) : ''}</div></div>
      ${isPierre() ? `<button class="btn sm green" data-act="approve" data-t="content" data-id="${c.id}">✓ Approve</button><button class="btn sm danger" data-act="revise" data-t="content" data-id="${c.id}">Request changes</button>` : badge('Client Review')}</div>`;
  return `<div class="page-head"><div><h1>Approvals</h1><p>${isPierre() ? 'Review finished work. Approve it, or request changes with clear feedback.' : 'Work sent to Pierre for review, and changes he has requested.'}</p></div></div>
    <div class="alert info"><b>Approval flow</b>In Progress → Client Review → Approved (Completed) or Revision Required. Only Pierre can approve. Sending for review never counts as approval.</div>
    <div class="grid g2">
      <div class="panel"><div class="panel-head"><h2>Tasks waiting for Pierre’s review</h2><span class="count">${review.length}</span></div>${review.length ? `<div class="lines">${review.map(reviewRow).join('')}</div>` : empty('Nothing to review.')}</div>
      <div class="panel"><div class="panel-head"><h2>Content waiting for review</h2><span class="count">${cReview.length}</span></div>${cReview.length ? `<div class="lines">${cReview.map(contentRow).join('')}</div>` : empty('Nothing to review.')}</div>
      <div class="panel"><div class="panel-head"><h2>Changes requested (developer to fix)</h2><span class="count">${revise.length}</span></div>${revise.length ? `<div class="lines">${revise.map(t => taskLine(t)).join('')}</div>` : empty('No revisions pending.')}</div>
      <div class="panel"><div class="panel-head"><h2>Waiting for Pierre (actions & info)</h2><span class="count">${waiting.length}</span></div>${waiting.length ? `<div class="lines">${waiting.map(t => taskLine(t)).join('')}</div>` : empty('Nothing waiting.')}</div>
    </div>`;
}

const CONTENT_COLS = [['Title', c => `<span class="ttl">${esc(c.title)}</span>`], ['Project', c => esc(projName(c.project_id))], ['Type', c => esc(c.type || '')], ['Platform', c => esc(c.platform || '')], ['Status', c => badge(c.status)], ['Publish', c => fmtD(c.publish_date)], ['Link', c => link(c.final_url || c.draft_url)]];
function pgContent(r) {
  if (r.params.tab) { S.ui.content.tab = r.params.tab; history.replaceState(null, '', '#/content'); }
  const tab = S.ui.content.tab, C = D('content');
  const card = c => genericCard('content', c, c => `${esc(c.type || '')}${c.publish_date ? ' · ' + fmtD(c.publish_date) : ''}<br>${esc(projName(c.project_id))}`);
  let body;
  if (tab === 'month') body = calendar(C, 'publish_date', 'content');
  else if (tab === 'week') body = weekView(C, 'publish_date', 'content');
  else if (tab === 'blog') body = board('content', C.filter(c => c.type === 'Blog Article'), 'status', CONTENT_STATUS, card);
  else if (tab === 'youtube') body = board('content', C.filter(c => ['YouTube Long Video', 'YouTube Short'].includes(c.type)), 'status', CONTENT_STATUS, card);
  else if (tab === 'social') body = calendar(C.filter(c => ['Social Media Post', 'Reel', 'Promotional Video'].includes(c.type)), 'publish_date', 'content');
  else if (tab === 'approval') body = table('content', C.filter(c => ['Client Review', 'Revision Required'].includes(c.status)), CONTENT_COLS, 'Nothing awaiting approval.');
  else if (tab === 'published') body = table('content', C.filter(c => c.status === 'Published').sort(by('publish_date', -1)), CONTENT_COLS, 'Nothing published yet.');
  else body = table('content', C.slice().sort(by('publish_date')), CONTENT_COLS, 'No content yet.');
  return `<div class="page-head"><div><h1>Content & publishing</h1><p>Blog articles, YouTube videos, Shorts, social posts and reels for every project.</p></div>
    <button class="btn primary" data-act="new" data-t="content">＋ Add content</button></div>
    ${tabsHTML('ctab', tab, [['month', 'Month'], ['week', 'This week'], ['blog', 'Blog'], ['youtube', 'YouTube'], ['social', 'Social media'], ['approval', 'Awaiting approval'], ['published', 'Published'], ['all', 'All']])}
    ${body}`;
}

const IDEA_COLS = [['Idea', i => `<span class="ttl">${esc(i.title)}</span>`], ['Project', i => esc(projName(i.project_id))], ['Status', i => badge(i.status)], ['Priority', i => badge(i.priority)], ['Effort', i => esc(i.effort || '')], ['By', i => whoChip(i.submitted_by)]];
function pgIdeas() {
  return `<div class="page-head"><div><h1>Ideas & feature backlog</h1><p>Ideas wait here. They only become tasks after they’re reviewed and approved.</p></div>
    <button class="btn primary" data-act="new" data-t="ideas">💡 Add idea</button></div>
    ${board('ideas', D('ideas'), 'status', IDEA_STATUS, i => genericCard('ideas', i, i => `${esc(projName(i.project_id) || 'No project')}${i.effort ? ' · ' + esc(i.effort) : ''}`))}`;
}

const DOC_COLS = [['Document', d => `${d.important ? '⭐ ' : ''}<span class="ttl">${esc(d.title)}</span>`], ['Project', d => esc(projName(d.project_id))], ['Category', d => esc(d.category || '')], ['Owner', d => esc(d.owner || '')], ['Link', d => link(d.url) || ((d.files || []).length ? `📎 ${(d.files || []).length}` : '')], ['Updated', d => fmtD((d.updated_at || '').slice(0, 10))]];
function pgDocuments() {
  const cat = S.ui.docs.cat;
  const rows = D('documents').filter(d => !cat || d.category === cat).sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0) || String(b.updated_at).localeCompare(String(a.updated_at)));
  return `<div class="page-head"><div><h1>Documents & instructions</h1><p>Brand guidelines, SOPs, requirements, meeting notes, specs and decisions.</p></div>
    <button class="btn primary" data-act="new" data-t="documents">＋ Add document</button></div>
    <div class="alert danger"><b>Never store passwords, payment details, verification codes or account recovery codes here.</b>Use a password manager and share access through it.</div>
    <div class="toolbar"><div class="chips"><button class="chip ${!cat ? 'on' : ''}" data-act="dcat" data-v="">All</button>${DOC_CAT.map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-act="dcat" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>
    ${table('documents', rows, DOC_COLS, 'No documents yet.')}`;
}

function pgLeads() {
  if (!canLeads()) return `<div class="panel">${empty('You don’t have access to the leads CRM.')}</div>`;
  const L = D('leads'), v = S.ui.leads.view;
  const due = L.filter(l => l.next_follow_up && l.next_follow_up <= today() && !['Converted', 'Lost'].includes(l.status));
  const cols = [['Name', l => `<span class="ttl">${esc(l.name)}</span>`], ['Type', l => esc(l.kind || '')], ['Source', l => esc(l.source || '')], ['Status', l => badge(l.status)], ['Location', l => esc(l.location || '')], ['Follow-up', l => l.next_follow_up ? `<span class="due ${l.next_follow_up < today() ? 'late' : ''}">${fmtD(l.next_follow_up)}</span>` : ''], ['Owner', l => whoChip(l.owner)]];
  return `<div class="page-head"><div><h1>🔒 Real estate leads</h1><p>Restricted — only people with leads access can see this. Pipeline: New Lead → Contacted → Qualified → Appointment → Follow-up → Converted / Lost.</p></div>
    <button class="btn primary" data-act="new" data-t="leads">＋ Add lead</button></div>
    ${due.length ? `<div class="alert warn"><b>${due.length} follow-up${due.length > 1 ? 's' : ''} due</b>${due.map(l => esc(l.name)).join(', ')}</div>` : ''}
    <div class="toolbar">${segHTML('lview', v, [['board', 'Pipeline'], ['list', 'List']])}</div>
    ${v === 'board' ? board('leads', L, 'status', LEAD_STATUS, l => genericCard('leads', l, l => `${esc(l.kind || '')}${l.source ? ' · ' + esc(l.source) : ''}${l.next_follow_up ? '<br>Follow up ' + fmtD(l.next_follow_up) : ''}`)) : table('leads', L, cols, 'No leads yet.')}`;
}

function pgWorkflows() {
  const W = D('workflows');
  const next = w => { if (!w.active) return 'Off'; const o = occurrenceFor(w); return o ? `Current: ${fmtD(o)}` : 'Waiting for start date / day'; };
  return `<div class="page-head"><div><h1>Recurring workflows</h1><p>Each workflow creates a <b>new task for every occurrence</b> (with its own checklist), so the history of every week is kept.</p></div>
    <button class="btn primary" data-act="new" data-t="workflows">＋ New workflow</button></div>
    <div class="alert info"><b>How it works</b>Switch a workflow on and pick its day. Whenever someone opens the portal, any task due for the current period is created automatically (never twice). Use “Run now” for one-off use. Leave the blog and YouTube workflows off until Pierre confirms the schedule.</div>
    <div class="pcards">${W.map(w => `<div class="pcard" data-act="open" data-t="workflows" data-id="${w.id}" style="cursor:pointer">
      <div class="row between"><span class="t">${esc(w.name)}</span>${w.active ? badge('Active') : '<span class="badge b-gray">Off</span>'}</div>
      <div class="c">${esc(projName(w.project_id) || 'No project chosen')}</div>
      <div class="small">${esc(w.frequency || '')}${w.weekday ? ' · ' + esc(w.weekday) : ''}${['Monthly', 'Quarterly'].includes(w.frequency) ? ' · day ' + esc(w.month_day || 1) : ''} · ${(w.checklist || []).length} steps</div>
      <div class="small muted">${esc(next(w))} · ${D('tasks').filter(t => t.workflow_id === w.id).length} tasks created so far</div>
      ${w.notes ? `<div class="small muted">${esc(w.notes.slice(0, 120))}</div>` : ''}
      <div class="row no-print"><button class="btn sm" data-act="wf-run" data-id="${w.id}">Run now</button><button class="btn sm" data-act="wf-toggle" data-id="${w.id}">${w.active ? 'Switch off' : 'Switch on'}</button></div>
    </div>`).join('') || empty('No workflows yet.')}</div>`;
}

/* ---------------- reports ---------------- */
function weekBounds(offset = 0) {
  const t = parseD(today()), dow = (t.getDay() + 6) % 7;
  const start = addDays(ymd(t), -dow + offset * 7);
  return [start, addDays(start, 6)];
}
function buildReport(start, end) {
  const inR = s => s && String(s).slice(0, 10) >= start && String(s).slice(0, 10) <= end;
  const T = D('tasks');
  const tl = t => `${t.title}${t.project_id ? ' — ' + projName(t.project_id) : ''}${t.due_date ? ' (due ' + fmtD(t.due_date) + ')' : ''}`;
  const worked = new Set(T.filter(t => inR(t.updated_at) || inR(t.completed_at)).map(t => t.project_id).filter(Boolean));
  const sections = [
    ['Projects worked on', [...worked].map(projName)],
    ['Tasks completed', T.filter(t => t.status === 'Completed' && inR(t.completed_at)).map(tl)],
    ['Tasks currently in progress', T.filter(t => ['In Progress', 'Revision Required'].includes(t.status)).map(tl)],
    ['Delayed tasks', T.filter(t => !isDone(t) && t.due_date && t.due_date < today()).map(tl)],
    ["Tasks awaiting Pierre's approval", T.filter(t => t.status === 'Client Review').map(tl)],
    ['Content published', D('content').filter(c => c.status === 'Published' && inR(c.publish_date)).map(c => `${c.title} — ${c.type || ''}${c.final_url ? ' — ' + c.final_url : ''}`)],
    ['Upcoming deadlines (next 7 days)', T.filter(t => !isDone(t) && t.due_date && t.due_date > end && t.due_date <= addDays(end, 7)).map(tl)],
    ['New requests received', D('requests').filter(q => inR(q.created_at)).map(q => `${q.title} — ${q.status}`)],
    ['Important decisions', D('documents').filter(d => d.category === 'Important Decision' && inR(d.created_at)).map(d => d.title)]
  ].map(([title, items]) => ({ title, items }));
  return { sections, priorities: '', notes: '' };
}
function pgReports() {
  const R = D('reports').slice().sort(by('period_start', -1));
  return `<div class="page-head"><div><h1>Weekly reports</h1><p>Generated from real data — nothing is typed in by hand except decisions, notes and next week’s priorities.</p></div>
    <div class="row"><button class="btn" data-act="report-gen" data-o="-1">Generate last week</button><button class="btn primary" data-act="report-gen" data-o="0">Generate this week</button></div></div>
    ${table('reports', R, [['Report', x => `<span class="ttl">${esc(x.title)}</span>`], ['Period', x => `${fmtD(x.period_start)} – ${fmtD(x.period_end)}`], ['Created by', x => esc(x.created_by || '')], ['Created', x => fmtD((x.created_at || '').slice(0, 10))]], 'No reports yet — generate the first one.')}`;
}
function pgReport(r) {
  const rep = byId('reports', r.id);
  if (!rep) return `<div class="panel">${empty('Report not found.')}</div>`;
  const b = rep.body || {};
  return `<div class="small muted no-print" style="margin-bottom:8px"><a href="#/reports">← Weekly reports</a></div>
  <div class="panel report">
    <div class="row between"><div><h1>${esc(rep.title)}</h1><div class="muted">Report period: ${fmtD(rep.period_start)} – ${fmtD(rep.period_end)} · prepared by ${esc(rep.created_by || '')}</div></div>
    <div class="row no-print"><button class="btn sm" data-act="print">🖨 Print / save PDF</button><button class="btn sm danger" data-act="del-report" data-id="${rep.id}">Delete</button></div></div>
    ${(b.sections || []).map((s, i) => `<h2>${i + 1}. ${esc(s.title)}</h2>${s.items.length ? `<ul>${s.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '<div class="muted">None.</div>'}`).join('')}
    <h2>${(b.sections || []).length + 1}. Next week’s priorities</h2>
    <textarea class="no-print" id="rep-pri" style="width:100%;min-height:90px;font:inherit;padding:8px;border:1px solid var(--border-2);border-radius:8px" placeholder="One priority per line">${esc(b.priorities || '')}</textarea>
    <div class="prose" style="display:none" id="rep-pri-print">${esc(b.priorities || '')}</div>
    <h2>Notes</h2>
    <textarea class="no-print" id="rep-notes" style="width:100%;min-height:70px;font:inherit;padding:8px;border:1px solid var(--border-2);border-radius:8px">${esc(b.notes || '')}</textarea>
    <div style="margin-top:10px" class="no-print"><button class="btn primary" data-act="report-save" data-id="${rep.id}">Save notes</button></div>
  </div><style>@media print{#rep-pri-print{display:block!important}}</style>`;
}

/* ---------------- help & search ---------------- */
function pgHelp() {
  return `<div class="page-head"><div><h1>How to use the portal</h1><p>Two people, one system. Everything links back to a project.</p></div></div>
  <div class="grid g2">
    <div class="panel"><h2 style="margin-bottom:8px">For Pierre</h2><ol>
      <li><b>Need something?</b> Click <b>＋ New → Request</b> (or “Submit a request” on the dashboard). Describe it, pick the project, add a link or file.</li>
      <li><b>Your to-dos</b> are on the dashboard under “Your tasks”. Tick the box when done.</li>
      <li><b>Approve work</b> in <a href="#/approvals">Approvals</a>: open the delivery link, then press ✓ Approve or Request changes (write what to change).</li>
      <li><b>Track progress</b> on each project page: progress bar, task board, deadlines and content.</li>
      <li><b>Comment</b> at the bottom of any task or project to give instructions.</li>
      <li><b>Ideas</b> go to <a href="#/ideas">Ideas</a> — they don’t become work until approved.</li></ol></div>
    <div class="panel"><h2 style="margin-bottom:8px">For the developer (daily)</h2><ol>
      <li>Open the <b>Dashboard</b>: check Overdue, My tasks and Waiting for approval.</li>
      <li>Review <a href="#/requests">Requests</a>: move to Review → Approved → <b>Convert to task</b>.</li>
      <li>Work the <a href="#/tasks">Task board</a>: drag cards as status changes; add the delivery link when done.</li>
      <li>Work needing approval: <b>Send for review</b> (never mark it complete yourself).</li>
      <li>Log every article/video in <a href="#/content">Content</a> with its final URL.</li>
      <li>Friday: <a href="#/reports">Weekly reports</a> → Generate this week → add priorities → share/print.</li></ol></div>
    <div class="panel"><h2 style="margin-bottom:8px">Adding a new project</h2><ol>
      <li>＋ New → Project. Fill in name, client, category, dates, priority, owner, status, budget (optional), link and instructions.</li>
      <li>Pick a <b>template</b> (Website, E-commerce, YouTube, App, SEO, Agency client…) — it adds a ready checklist plan.</li>
      <li>On the project page, press ＋ next to a plan item only when it should become a real task.</li>
      <li>Finished or dropped? Press <b>Archive</b> — tasks, documents and reports are kept.</li></ol></div>
    <div class="panel"><h2 style="margin-bottom:8px">Safety rules</h2><ul>
      <li>Never store passwords, card/bank details or verification codes in the portal.</li>
      <li>Real estate lead contact details only go in <b>Leads (CRM)</b>, which is restricted.</li>
      <li>Vape store: every product or marketing change needs an age, platform and legal compliance check.</li>
      <li>Things marked “Needs confirmation” are not final until Pierre confirms.</li></ul></div>
  </div>`;
}
function pgSearch() {
  const q = S.q.toLowerCase();
  if (!q) return `<div class="panel">${empty('Type in the search box to find anything.')}</div>`;
  const hit = (r, keys) => keys.some(k => String(r[k] || '').toLowerCase().includes(q));
  const groups = [
    ['projects', 'Projects', D('projects').filter(r => hit(r, ['name', 'client', 'description']))],
    ['tasks', 'Tasks', D('tasks').filter(r => hit(r, ['title', 'instructions', 'notes']))],
    ['requests', 'Requests', D('requests').filter(r => hit(r, ['title', 'description']))],
    ['content', 'Content', D('content').filter(r => hit(r, ['title', 'keyword', 'notes']))],
    ['ideas', 'Ideas', D('ideas').filter(r => hit(r, ['title', 'description']))],
    ['documents', 'Documents', D('documents').filter(r => hit(r, ['title', 'description']))],
    ...(canLeads() ? [['leads', 'Leads', D('leads').filter(r => hit(r, ['name', 'location', 'notes']))]] : [])
  ].filter(g => g[2].length);
  return `<div class="page-head"><div><h1>Search: “${esc(S.q)}”</h1></div></div>${groups.length ? groups.map(([t, l, rows]) => `<div class="panel" style="margin-bottom:12px"><div class="panel-head"><h2>${l}</h2><span class="count">${rows.length}</span></div><div class="lines">${rows.slice(0, 20).map(r => t === 'projects'
    ? `<a class="line" href="#/project/${r.id}" style="color:inherit;text-decoration:none"><div class="grow"><div class="tt">${esc(r.name)}</div></div>${badge(r.status)}</a>`
    : `<div class="line" data-act="open" data-t="${t}" data-id="${r.id}"><div class="grow"><div class="tt">${esc(titleOf(t, r))}</div><div class="sub">${esc(projName(r.project_id))}</div></div>${badge(r.status)}</div>`).join('')}</div></div>`).join('') : `<div class="panel">${empty('No results.')}</div>`}`;
}

/* ================================================================
   FORMS / MODAL
================================================================ */
function inputHTML(f, val) {
  const id = 'f_' + f.k, v = val ?? '';
  if (f.type === 'checkbox') return `<div class="fld ${f.full ? 'full' : ''}"><label class="check" style="padding-top:${f.full ? 0 : 20}px"><input type="checkbox" name="${f.k}" ${v ? 'checked' : ''}> ${esc(f.label)}</label></div>`;
  if (f.type === 'checklist') return `<div class="fld full"><label>${esc(f.label)}</label><div id="cl-editor"></div></div>`;
  if (f.type === 'files') return `<div class="fld full"><label>${esc(f.label)}</label><div id="files-editor"></div><input type="file" id="file-input" multiple><span class="hint">Images, PDFs, docs. Not for passwords or ID documents.</span></div>`;
  let ctl;
  switch (f.type) {
    case 'textarea': ctl = `<textarea name="${f.k}" id="${id}" rows="3">${esc(v)}</textarea>`; break;
    case 'select': ctl = `<select name="${f.k}" id="${id}"><option value="">—</option>${f.options.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`; break;
    case 'project': ctl = `<select name="${f.k}" id="${id}"><option value="">— No project —</option>${D('projects').slice().sort(by('name')).filter(p => p.status !== 'Archived' || p.id === v).map(p => `<option value="${p.id}" ${p.id === v ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`; break;
    case 'task': ctl = `<select name="${f.k}" id="${id}"><option value="">— None —</option>${sortTasks(D('tasks').filter(t => !isDone(t) || t.id === v)).map(t => `<option value="${t.id}" ${t.id === v ? 'selected' : ''}>${esc(t.title)}</option>`).join('')}</select>`; break;
    default: {
      const type = { date: 'date', number: 'number', email: 'email', tel: 'tel' }[f.type] || 'text';
      ctl = `<input type="${type}" name="${f.k}" id="${id}" value="${esc(v)}" ${f.type === 'url' ? 'placeholder="https://…"' : ''} ${f.type === 'number' && f.k === 'month_day' ? 'min="1" max="28"' : ''}>`;
    }
  }
  return `<div class="fld ${f.full ? 'full' : ''}"><label for="${id}">${esc(f.label)}${f.req ? ' *' : ''}</label>${ctl}</div>`;
}

function formFields(t, isNew) {
  return MODELS[t].fields.filter(f => !(isNew && f.adv) && !(isNew && f.section === 'Handling'));
}

function openForm(t, id, defaults = {}) {
  const row = id ? byId(t, id) : null;
  if (id && !row) return toast('That item no longer exists', 'warn');
  const isNew = !row, M = MODELS[t];
  const vals = row ? { ...row } : {};
  if (isNew) { M.fields.forEach(f => { if (f.k && f.def !== undefined) vals[f.k] = f.def; }); Object.assign(vals, defaults); }
  S.modal = { t, id: row ? row.id : null, checklist: clone(vals.checklist || []), files: clone(vals.files || []), newFiles: [], template: '' };
  const fields = formFields(t, isNew);
  let extra = '';
  if (t === 'projects' && isNew) extra = `<div class="fld full"><label for="f_template">Start from a template</label><select id="f_template"><option value="">— No template —</option>${Object.keys(PROJECT_TEMPLATES).map(k => `<option>${esc(k)}</option>`).join('')}</select><span class="hint">Adds a ready checklist plan to the project. No tasks are created until you choose.</span></div>`;
  const body = `<form id="mform" class="form" autocomplete="off" onsubmit="return false">${extra}${fields.map(f => f.section ? `<div class="form-sec">${esc(f.section)}</div>` : inputHTML(f, vals[f.k])).join('')}</form>
    ${row && ['tasks', 'requests', 'content', 'ideas', 'projects', 'leads'].includes(t) ? `<div class="comments" id="cmts">${commentsHTML(t, row.id)}</div>` : ''}
    ${row && row.created_by ? `<p class="hint" style="margin-top:10px">Created by ${esc(row.created_by)} · ${fmtDT(row.created_at)}${row.updated_at ? ' · updated ' + ago(row.updated_at) : ''}</p>` : ''}`;
  const title = isNew ? (t === 'requests' ? 'Submit a request' : `New ${M.name.toLowerCase()}`) : `${M.name}${row.code ? (t === 'tasks' ? ' T-' : ' P-') + row.code : ''}`;
  showModal(title, body, footerFor(t, row), t === 'tasks' || t === 'projects');
  renderChecklistEditor(); renderFilesEditor();
  setTimeout(() => { const first = $('#mform input[type=text], #mform textarea'); if (first && isNew) first.focus(); }, 30);
}

function footerFor(t, r) {
  const left = [];
  if (r) {
    if (t === 'tasks') {
      if (!isDone(r) && r.status !== 'Client Review') left.push(`<button class="btn sm" data-act="send-review" data-id="${r.id}">📤 Send for review</button>`);
      if (r.status === 'Client Review' && isPierre()) left.push(`<button class="btn sm green" data-act="approve" data-t="tasks" data-id="${r.id}">✓ Approve</button><button class="btn sm danger" data-act="revise" data-t="tasks" data-id="${r.id}">Request changes</button>`);
      left.push(`<button class="btn sm" data-act="dup-task" data-id="${r.id}">Duplicate</button>`);
    }
    if (t === 'content' && r.status !== 'Client Review' && r.status !== 'Published') left.push(`<button class="btn sm" data-act="content-review" data-id="${r.id}">📤 Send for review</button>`);
    if (t === 'content' && r.status === 'Client Review' && isPierre()) left.push(`<button class="btn sm green" data-act="approve" data-t="content" data-id="${r.id}">✓ Approve</button><button class="btn sm danger" data-act="revise" data-t="content" data-id="${r.id}">Request changes</button>`);
    if (t === 'requests') {
      if (r.task_id && byId('tasks', r.task_id)) left.push(`<button class="btn sm" data-act="open" data-t="tasks" data-id="${r.task_id}">Open linked task</button>`);
      else if (!isPierre()) {
        if (['New Request'].includes(r.status)) left.push(`<button class="btn sm" data-act="req-status" data-id="${r.id}" data-v="Review">Start review</button>`);
        if (['New Request', 'Review'].includes(r.status)) left.push(`<button class="btn sm green" data-act="req-status" data-id="${r.id}" data-v="Approved">✓ Approve</button><button class="btn sm danger" data-act="req-status" data-id="${r.id}" data-v="Declined">Decline</button>`);
        if (r.status === 'Approved') left.push(`<button class="btn sm primary" data-act="req-convert" data-id="${r.id}">→ Convert to task</button>`);
      }
    }
    if (t === 'ideas' && !r.task_id) {
      if (['New Idea', 'Under Review'].includes(r.status)) left.push(`<button class="btn sm green" data-act="idea-status" data-id="${r.id}" data-v="Approved">✓ Approve</button><button class="btn sm danger" data-act="idea-status" data-id="${r.id}" data-v="Rejected">Reject</button>`);
      if (['Approved', 'Planned'].includes(r.status)) left.push(`<button class="btn sm primary" data-act="idea-task" data-id="${r.id}">→ Create task</button>`);
    }
    if (t === 'ideas' && r.task_id && byId('tasks', r.task_id)) left.push(`<button class="btn sm" data-act="open" data-t="tasks" data-id="${r.task_id}">Open task</button>`);
    if (t === 'workflows') left.push(`<button class="btn sm" data-act="wf-run" data-id="${r.id}">Run now</button>`);
    if (t === 'projects') left.push(`<a class="btn sm" href="#/project/${r.id}" data-act="close">Open project page</a>`);
    left.push(`<button class="btn sm danger" data-act="delete" data-t="${t}" data-id="${r.id}">Delete</button>`);
  }
  return `<div class="left">${left.join('')}</div><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="save">${r ? 'Save' : (t === 'requests' ? 'Submit request' : 'Create')}</button>`;
}

function showModal(title, body, footer, wide) {
  $('#modal-root').innerHTML = `<div class="overlay" data-act="overlay"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-act="close" aria-label="Close">✕</button></div>
    <div class="modal-body">${body}</div><div class="modal-foot">${footer}</div></div></div>`;
}

/* in-page confirm dialog (works where browser pop-ups are blocked) */
function askConfirm(msg, okLabel = 'Yes, continue') {
  return new Promise(res => {
    let root = $('#confirm-root');
    if (!root) { root = document.createElement('div'); root.id = 'confirm-root'; document.body.appendChild(root); }
    root.innerHTML = `<div class="overlay" style="z-index:150;align-items:center"><div class="modal" style="max-width:440px" role="alertdialog" aria-modal="true">
      <div class="modal-body"><p class="prose" style="margin:0">${esc(msg)}</p></div>
      <div class="modal-foot"><button class="btn" id="cf-no">Cancel</button><button class="btn primary" id="cf-yes">${esc(okLabel)}</button></div></div></div>`;
    const done = v => { root.innerHTML = ''; res(v); };
    $('#cf-no').onclick = () => done(false); $('#cf-yes').onclick = () => done(true);
    $('#cf-yes').focus();
  });
}

function closeModal() { $('#modal-root').innerHTML = ''; S.modal = null; }

function renderChecklistEditor() {
  const el = $('#cl-editor'); if (!el || !S.modal) return;
  const cl = S.modal.checklist, d = cl.filter(i => i.done).length;
  el.innerHTML = (cl.length ? `<div class="hint" style="margin-bottom:6px">${d}/${cl.length} done</div>` : '') +
    cl.map((it, i) => `<div class="cl-row"><input type="checkbox" data-cl="${i}" ${it.done ? 'checked' : ''} aria-label="Done"><input type="text" data-clt="${i}" value="${esc(it.text)}"><button type="button" class="icon-btn" data-act="cl-del" data-i="${i}" aria-label="Remove">✕</button></div>`).join('') +
    `<div class="cl-add"><input type="text" id="cl-new" placeholder="Add a step and press Enter"><button type="button" class="btn sm" data-act="cl-add">Add</button></div>`;
}
function renderFilesEditor() {
  const el = $('#files-editor'); if (!el || !S.modal) return;
  const m = S.modal;
  el.innerHTML = m.files.map((f, i) => `<div class="file-row">📎 <a href="#" data-act="file-open" data-i="${i}">${esc(f.name)}</a><button type="button" class="icon-btn" data-act="file-del" data-i="${i}" aria-label="Remove">✕</button></div>`).join('') +
    m.newFiles.map((f, i) => `<div class="file-row">⬆️ ${esc(f.name)} <span class="hint">(uploads when you save)</span><button type="button" class="icon-btn" data-act="newfile-del" data-i="${i}">✕</button></div>`).join('');
}

function commentsHTML(t, id, title = 'Comments') {
  const cs = D('comments').filter(c => c.entity_type === t && c.entity_id === id).sort(by('created_at'));
  return `<h3>${esc(title)} ${cs.length ? `<span class="count">${cs.length}</span>` : ''}</h3>
    ${cs.map(c => `<div class="cmt"><div class="meta"><b>${esc(c.author)}</b> · ${fmtDT(c.created_at)}</div><div class="prose">${esc(c.body)}</div></div>`).join('')}
    <div class="cmt-new no-print"><textarea id="cmt-${id}" placeholder="Write a comment or instruction…"></textarea><button class="btn sm" data-act="comment" data-t="${t}" data-id="${id}">Post</button></div>`;
}

function readForm(fields) {
  const fm = $('#mform'), v = {};
  for (const f of fields) {
    if (!f.k || f.type === 'checklist' || f.type === 'files') continue;
    const el = fm.elements[f.k]; if (!el) continue;
    if (f.type === 'checkbox') v[f.k] = el.checked;
    else if (f.type === 'number') v[f.k] = el.value === '' ? null : Number(el.value);
    else { const x = el.value.trim(); v[f.k] = x === '' ? null : (f.type === 'url' ? normUrl(x) : x); }
  }
  return v;
}

async function submitForm(btn) {
  const m = S.modal; if (!m) return;
  const { t, id } = m, isNew = !id, fields = formFields(t, isNew);
  syncChecklistFromDom();
  const vals = readForm(fields);
  for (const f of fields) if (f.req && !vals[f.k]) { toast(`Please fill in “${f.label}”`, 'warn'); const el = $(`#f_${f.k}`); if (el) el.focus(); return; }
  if (fields.some(f => f.type === 'checklist')) vals.checklist = m.checklist.filter(i => i.text.trim());
  if (t === 'documents' || t === 'tasks' || t === 'requests') {
    const txt = `${vals.description || ''} ${vals.instructions || ''} ${vals.notes || ''}`.toLowerCase();
    if (/\b(password|passcode|pin code|cvv|routing number|recovery code)\b/.test(txt) && !await askConfirm('This text looks like it may contain a password or financial detail. These should never be stored in the portal. Save anyway?')) return;
  }
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    if (fields.some(f => f.type === 'files')) {
      const up = [];
      for (const f of m.newFiles) up.push(await db.upload(f));
      vals.files = [...m.files, ...up];
    }
    if (t === 'projects' && isNew) {
      const tpl = $('#f_template') && $('#f_template').value;
      vals.plan = tpl ? mkPlan(PROJECT_TEMPLATES[tpl]) : [];
      if (tpl && !vals.category) vals.category = TEMPLATE_CAT[tpl];
    }
    if (t === 'requests' && isNew) { vals.requested_by = vals.requested_by || meSide(); vals.status = 'New Request'; vals.assigned_to = vals.assigned_to || 'Developer'; }
    if (t === 'ideas' && isNew && !vals.submitted_by) vals.submitted_by = meSide();
    let r;
    if (t === 'tasks') { r = await saveTask(id, vals); if (!r) { btn.disabled = false; btn.textContent = 'Save'; return; } }
    else r = await saveRow(t, id, vals, isNew && t === 'requests' ? 'submitted' : undefined);
    closeModal();
    toast(isNew ? `${MODELS[t].name} created` : 'Saved');
    if (t === 'projects' && isNew) location.hash = `#/project/${r.id}`; else render();
  } catch (e) { console.error(e); toast(e.message || 'Could not save', 'err'); btn.disabled = false; btn.textContent = 'Save'; }
}

function syncChecklistFromDom() {
  if (!S.modal) return;
  $$('[data-clt]').forEach(el => { const i = +el.dataset.clt; if (S.modal.checklist[i]) S.modal.checklist[i].text = el.value; });
  $$('[data-cl]').forEach(el => { const i = +el.dataset.cl; if (S.modal.checklist[i]) S.modal.checklist[i].done = el.checked; });
}
function addChecklistItem() {
  const inp = $('#cl-new'); if (!inp || !inp.value.trim()) return;
  syncChecklistFromDom();
  S.modal.checklist.push({ id: uid(), text: inp.value.trim(), done: false });
  renderChecklistEditor(); $('#cl-new').focus();
}

function promptModal(title, label, cb, opts = {}) {
  const prev = S.modal;
  const body = `<div class="fld"><label for="pm-in">${esc(label)}</label><textarea id="pm-in" rows="4" placeholder="${esc(opts.placeholder || '')}"></textarea></div>`;
  showModal(title, body, `<button class="btn" data-act="close">Cancel</button><button class="btn primary" id="pm-ok">${esc(opts.ok || 'OK')}</button>`);
  S.modal = { prompt: true, prev };
  $('#pm-in').focus();
  $('#pm-ok').onclick = async () => {
    const v = $('#pm-in').value.trim();
    if (opts.required && !v) return toast('Please write something first', 'warn');
    closeModal(); await cb(v);
  };
}

/* ================================================================
   ACTIONS
================================================================ */
const ACTIONS = {
  open: d => { if (d.t === 'projects' && parseRoute().page !== 'project' && !S.modal) { location.hash = `#/project/${d.id}`; return; } openForm(d.t, d.id); },
  go: d => { location.hash = d.href; },
  new: d => { closeDropdowns(); openForm(d.t, null, d.project ? { project_id: d.project } : {}); },
  close: () => closeModal(),
  overlay: (d, el, e) => { if (e.target === el) closeModal(); },
  save: (d, el) => submitForm(el),
  delete: async d => {
    const r = byId(d.t, d.id);
    const extra = d.t === 'projects' ? '\n\nTip: use Archive instead to keep its history.' : '';
    if (!await askConfirm(`Delete “${titleOf(d.t, r)}”? This cannot be undone.${extra}`)) return;
    try {
      if (r && r.files && r.files.length) for (const f of r.files) await db.removeFile(f).catch(() => { });
      await deleteRow(d.t, d.id); closeModal(); toast('Deleted');
      if (d.t === 'projects') location.hash = '#/projects'; else render();
    } catch (e) { toast(e.message, 'err'); }
  },
  newmenu: () => { $('#newdd').classList.toggle('open'); },
  menu: () => $('#side').classList.toggle('open'),
  refresh: async () => { await refresh(); toast('Up to date'); },
  logout: async (d, el, e) => { e.preventDefault(); await SupaDB.c.auth.signOut(); location.reload(); },
  'demo-reset': async () => { if (await askConfirm('Reset all demo data back to the starter projects?')) { try { localStorage.removeItem(LocalDB.key); } catch (e) { } LocalDB.mem = null; location.reload(); } },
  'import-seed': async (d, el) => { el.disabled = true; el.textContent = 'Importing…'; try { await importSeed(); await loadAll(); toast('Starter data imported'); render(); } catch (e) { toast(e.message, 'err'); el.disabled = false; el.textContent = 'Import starter data'; } },

  tview: d => { S.ui.tasks.view = d.v; render(); },
  tfilter: d => { S.ui.tasks.f = d.v; render(); },
  ptab: d => { S.ui.projects.tab = d.v; render(); },
  projtab: d => { S.ui.proj.tab = d.v; render(); },
  ctab: d => { S.ui.content.tab = d.v; render(); },
  dcat: d => { S.ui.docs.cat = d.v; render(); },
  lview: d => { S.ui.leads.view = d.v; render(); },
  cal: d => {
    const n = +d.d;
    if (n === 0) S.calMonth = today().slice(0, 7);
    else { const [y, m] = (S.calMonth || today().slice(0, 7)).split('-').map(Number); const nd = new Date(y, m - 1 + n, 1); S.calMonth = `${nd.getFullYear()}-${pad(nd.getMonth() + 1)}`; }
    render();
  },

  'quick-done': async (d, el, e) => {
    e.stopPropagation();
    const t = byId('tasks', d.id); if (!t) return;
    const target = t.status === 'Completed' ? 'To Do' : 'Completed';
    try { const r = await saveTask(t.id, { status: target }, target === 'Completed' ? 'completed' : 'reopened'); if (r) toast(target === 'Completed' ? 'Nice — task completed' : 'Task reopened'); }
    catch (er) { toast(er.message, 'err'); }
    render();
  },
  'send-review': async d => {
    const t = byId('tasks', d.id);
    if (!t.delivery_url && !await askConfirm('There is no delivery link yet. Pierre will need something to review. Send anyway?')) return;
    try { await saveTask(d.id, { status: 'Client Review', approval_required: true, approval_status: 'Pending Review', review_date: today() }, 'sent for review'); closeModal(); toast('Sent to Pierre for review'); render(); } catch (e) { toast(e.message, 'err'); }
  },
  'content-review': async d => { try { await saveRow('content', d.id, { status: 'Client Review', approval_required: true }, 'sent for review'); closeModal(); toast('Sent for review'); render(); } catch (e) { toast(e.message, 'err'); } },
  approve: async (d, el, e) => {
    e.stopPropagation();
    if (!isPierre()) return toast('Only Pierre can approve.', 'warn');
    try {
      if (d.t === 'tasks') await saveTask(d.id, { approval_status: 'Approved', approval_date: today(), reviewer: S.me.display_name, status: 'Completed' }, 'approved');
      else await saveRow('content', d.id, { status: 'Scheduled' }, 'approved');
      closeModal(); toast('Approved ✓'); render();
    } catch (er) { toast(er.message, 'err'); }
  },
  revise: (d, el, e) => {
    e.stopPropagation();
    promptModal('Request changes', 'What needs to change? Be specific so it can be fixed in one go.', async txt => {
      try {
        if (d.t === 'tasks') {
          const t = byId('tasks', d.id);
          const notes = [t.revision_notes, `${fmtD(today())} (${S.me.display_name}): ${txt}`].filter(Boolean).join('\n');
          await saveTask(d.id, { status: 'Revision Required', approval_status: 'Revision Required', feedback: txt, revision_notes: notes, reviewer: S.me.display_name, review_date: today() }, 'requested changes on');
        } else {
          const c = byId('content', d.id);
          await saveRow('content', d.id, { status: 'Revision Required', notes: [c.notes, `Changes requested ${fmtD(today())}: ${txt}`].filter(Boolean).join('\n') }, 'requested changes on');
        }
        await db.insert('comments', { entity_type: d.t, entity_id: d.id, author: S.me.display_name, body: 'Changes requested: ' + txt }).then(r => S.data.comments.push(r));
        toast('Feedback sent'); render();
      } catch (e) { toast(e.message, 'err'); }
    }, { required: true, ok: 'Send feedback', placeholder: 'e.g. Use a brighter thumbnail and fix the typo in the title' });
  },
  'dup-task': async d => {
    const t = byId('tasks', d.id);
    const { id, code, created_at, updated_at, completed_at, workflow_id, occurrence_date, ...rest } = t;
    try { const r = await saveTask(null, { ...rest, title: t.title + ' (copy)', status: 'To Do', approval_status: rest.approval_required ? null : 'Not Required', approval_date: null, feedback: null, checklist: (t.checklist || []).map(i => ({ ...i, id: uid(), done: false })) }); closeModal(); render(); if (r) openForm('tasks', r.id); } catch (e) { toast(e.message, 'err'); }
  },
  'req-status': async d => { try { await saveRow('requests', d.id, { status: d.v }, d.v === 'Approved' ? 'approved' : d.v === 'Declined' ? 'declined' : 'started reviewing'); closeModal(); toast(`Request: ${d.v}`); render(); } catch (e) { toast(e.message, 'err'); } },
  'req-convert': async d => {
    const q = byId('requests', d.id);
    try {
      const t = await saveTask(null, { title: q.title, project_id: q.project_id, instructions: q.description, priority: q.priority || 'Medium', due_date: q.deadline, type: 'Client Request', status: 'To Do', responsible: q.assigned_to || 'Developer', reference_url: q.links, files: q.files || [], checklist: [], approval_required: true, approval_status: null }, 'created from request');
      await saveRow('requests', q.id, { status: 'Converted to Task', task_id: t.id }, 'converted to task');
      closeModal(); toast('Task created from request'); render(); openForm('tasks', t.id);
    } catch (e) { toast(e.message, 'err'); }
  },
  'idea-status': async d => { try { await saveRow('ideas', d.id, { status: d.v }, d.v.toLowerCase()); closeModal(); render(); } catch (e) { toast(e.message, 'err'); } },
  'idea-task': async d => {
    const i = byId('ideas', d.id);
    try {
      const t = await saveTask(null, { title: i.title, project_id: i.project_id, instructions: i.description, priority: i.priority || 'Medium', type: 'One-off', status: 'To Do', responsible: 'Developer', reference_url: i.reference_url, checklist: [] }, 'created from idea');
      await saveRow('ideas', i.id, { status: 'Planned', task_id: t.id }, 'planned');
      closeModal(); toast('Task created from idea'); render();
    } catch (e) { toast(e.message, 'err'); }
  },
  archive: async d => { if (!await askConfirm('Archive this project? Its tasks, documents and reports are kept.')) return; try { await saveRow('projects', d.id, { status: 'Archived' }, 'archived'); render(); } catch (e) { toast(e.message, 'err'); } },

  'plan-toggle': async (d, el, e) => {
    e.stopPropagation();
    const p = byId('projects', d.pid), plan = clone(p.plan || []);
    const it = plan[+d.si] && plan[+d.si].items[+d.ii]; if (!it) return;
    it.done = el.checked;
    try { await saveRow('projects', p.id, { plan }, it.done ? 'ticked a plan item on' : 'unticked a plan item on'); render(); } catch (er) { toast(er.message, 'err'); }
  },
  'plan-task': async (d, el, e) => {
    e.preventDefault(); e.stopPropagation();
    const p = byId('projects', d.pid), plan = clone(p.plan || []);
    const sec = plan[+d.si], it = sec && sec.items[+d.ii]; if (!it) return;
    try {
      const t = await saveTask(null, { title: it.text, project_id: p.id, status: 'To Do', priority: p.priority === 'Urgent' ? 'High' : 'Medium', responsible: 'Developer', type: 'One-off', notes: `From plan section: ${sec.title}`, checklist: [] });
      it.task_id = t.id;
      await saveRow('projects', p.id, { plan });
      toast('Task created'); render();
    } catch (er) { toast(er.message, 'err'); }
  },
  'plan-edit': d => {
    const p = byId('projects', d.pid);
    const text = (p.plan || []).map(s => `# ${s.title}\n${(s.items || []).map(i => `${i.done ? '[x] ' : ''}${i.text}`).join('\n')}`).join('\n\n');
    showModal('Edit plan', `<p class="hint">One line per item. Start a section with “# ”. Prefix “[x] ” to mark an item done.</p><textarea id="plan-txt" style="width:100%;min-height:360px;font:13px ui-monospace,monospace;padding:10px;border:1px solid var(--border-2);border-radius:8px">${esc(text)}</textarea>
      <div class="fld" style="margin-top:10px"><label for="plan-tpl">…or append a template</label><select id="plan-tpl"><option value="">—</option>${Object.keys(PROJECT_TEMPLATES).map(k => `<option>${esc(k)}</option>`).join('')}</select></div>`,
      `<button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="plan-save" data-pid="${p.id}">Save plan</button>`, true);
    $('#plan-tpl').onchange = e => { const k = e.target.value; if (!k) return; $('#plan-txt').value += '\n\n' + PROJECT_TEMPLATES[k].map(([s, items]) => `# ${s}\n${items.join('\n')}`).join('\n\n'); e.target.value = ''; };
  },
  'plan-save': async d => {
    const p = byId('projects', d.pid), old = p.plan || [];
    const oldMap = {}; old.forEach(s => (s.items || []).forEach(i => { oldMap[i.text] = i; }));
    const plan = []; let cur = null;
    $('#plan-txt').value.split('\n').forEach(line => {
      const l = line.trim(); if (!l) return;
      if (l.startsWith('#')) { cur = { title: l.replace(/^#+\s*/, ''), items: [] }; plan.push(cur); return; }
      if (!cur) { cur = { title: 'Plan', items: [] }; plan.push(cur); }
      const done = /^\[x\]\s*/i.test(l), text = l.replace(/^\[x\]\s*/i, '');
      const prev = oldMap[text];
      cur.items.push({ id: prev ? prev.id : uid(), text, done, ...(prev && prev.task_id ? { task_id: prev.task_id } : {}) });
    });
    try { await saveRow('projects', p.id, { plan }, 'edited the plan of'); closeModal(); render(); } catch (e) { toast(e.message, 'err'); }
  },

  'cl-add': () => addChecklistItem(),
  'cl-del': d => { syncChecklistFromDom(); S.modal.checklist.splice(+d.i, 1); renderChecklistEditor(); },
  'file-open': async (d, el, e) => { e.preventDefault(); try { const url = await db.fileUrl(S.modal.files[+d.i]); const w = window.open(); if (w) { if (url.startsWith('data:')) { w.document.write(`<iframe src="${url}" style="border:0;width:100%;height:100%"></iframe>`); } else w.location = url; } } catch (er) { toast(er.message, 'err'); } },
  'file-del': d => { S.modal.files.splice(+d.i, 1); renderFilesEditor(); },
  'newfile-del': d => { S.modal.newFiles.splice(+d.i, 1); renderFilesEditor(); },

  comment: async (d, el) => {
    const ta = $(`#cmt-${d.id}`); const body = ta && ta.value.trim(); if (!body) return;
    el.disabled = true;
    try {
      const r = await db.insert('comments', { entity_type: d.t, entity_id: d.id, author: S.me.display_name, body });
      S.data.comments.push(r);
      const host = ta.closest('.comments, .panel');
      logActivity('commented on', d.t, byId(d.t, d.id));
      if (S.modal && $('#cmts')) $('#cmts').innerHTML = commentsHTML(d.t, d.id); else if (host) host.innerHTML = commentsHTML(d.t, d.id, 'Feedback & notes');
    } catch (e) { toast(e.message, 'err'); el.disabled = false; }
  },

  'wf-run': async d => {
    const w = byId('workflows', d.id);
    try { const t = await saveTask(null, taskFromWorkflow(w, null), 'ran workflow'); closeModal(); toast('Task created from workflow'); render(); if (t) openForm('tasks', t.id); } catch (e) { toast(e.message, 'err'); }
  },
  'wf-toggle': async (d, el, e) => {
    e.stopPropagation();
    const w = byId('workflows', d.id);
    if (!w.active && ['Weekly', 'Bi-weekly'].includes(w.frequency) && !w.weekday) { toast('Choose the day of the week first (open the workflow to edit).', 'warn'); return openForm('workflows', w.id); }
    if (!w.active && !w.project_id && !await askConfirm('This workflow has no project yet. Switch on anyway?')) return;
    try { await saveRow('workflows', w.id, { active: !w.active }, w.active ? 'switched off' : 'switched on'); if (!w.active) await runRecurring(); render(); } catch (er) { toast(er.message, 'err'); }
  },

  'report-gen': async d => {
    const [start, end] = weekBounds(+d.o);
    const existing = D('reports').find(r => r.period_start === start);
    if (existing && !await askConfirm('A report for this week already exists. Create a fresh one with the latest data?')) { location.hash = `#/report/${existing.id}`; return; }
    try {
      const r = await saveRow('reports', null, { title: `Weekly Project Report — ${fmtD(start)} to ${fmtD(end)}`, period_start: start, period_end: end, body: buildReport(start, end) });
      location.hash = `#/report/${r.id}`;
    } catch (e) { toast(e.message, 'err'); }
  },
  'report-save': async d => {
    const r = byId('reports', d.id), body = { ...(r.body || {}), priorities: $('#rep-pri').value, notes: $('#rep-notes').value };
    try { await saveRow('reports', r.id, { body }); toast('Report saved'); render(); } catch (e) { toast(e.message, 'err'); }
  },
  'del-report': async d => { if (!await askConfirm('Delete this report?')) return; await deleteRow('reports', d.id); location.hash = '#/reports'; },
  print: () => { try { window.print(); } catch (e) { toast('Printing is not available here — use your browser’s Print menu.', 'warn'); } }
};

const CHANGES = {
  'demo-side': v => { S.me = D('members').find(m => m.side === v) || S.me; shell(); render(); },
  tproject: v => { S.ui.tasks.project = v; render(); }
};

function closeDropdowns() { $$('.dropdown.open').forEach(x => x.classList.remove('open')); }

async function changeField(t, id, field, val) {
  const r = byId(t, id); if (!r || r[field] === val) return;
  try {
    if (t === 'tasks' && field === 'status') await saveTask(id, { status: val }, `moved to ${val}:`);
    else await saveRow(t, id, { [field]: val }, `moved to ${val}:`);
  } catch (e) { toast(e.message, 'err'); }
  render();
}

function bindGlobal() {
  document.addEventListener('click', e => {
    if (!e.target.closest('.dropdown')) closeDropdowns();
    const a = e.target.closest('[data-act]');
    if (!a) return;
    if (e.target.closest('a[target="_blank"]') && a.dataset.act === 'open') return;
    const fn = ACTIONS[a.dataset.act]; if (!fn) return;
    if (a.tagName === 'A' && a.getAttribute('href') === '#') e.preventDefault();
    if (a.dataset.act === 'open' && a.tagName === 'A') e.preventDefault();
    if (a.dataset.act === 'open' || a.dataset.act === 'new') e.stopPropagation();
    Promise.resolve(fn(a.dataset, a, e)).catch(err => { console.error(err); toast(err.message || 'Something went wrong', 'err'); });
  });
  document.addEventListener('change', e => {
    const c = e.target.closest('[data-change]');
    if (c && CHANGES[c.dataset.change]) CHANGES[c.dataset.change](c.value);
    if (e.target.id === 'file-input' && S.modal) { S.modal.newFiles.push(...Array.from(e.target.files)); e.target.value = ''; renderFilesEditor(); }
    if (e.target.matches('[data-cl]') && S.modal) { syncChecklistFromDom(); renderChecklistEditor(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'cl-new') { e.preventDefault(); addChecklistItem(); }
    if (e.key === 'Escape') { const cr = $('#confirm-root'); if (cr && cr.innerHTML) { const n = $('#cf-no'); if (n) n.click(); } else if (S.modal) closeModal(); }
  });
  document.addEventListener('dragstart', e => { const c = e.target.closest && e.target.closest('[data-drag]'); if (!c) return; e.dataTransfer.setData('text/plain', JSON.stringify({ t: c.dataset.drag, id: c.dataset.id })); e.dataTransfer.effectAllowed = 'move'; c.classList.add('dragging'); });
  document.addEventListener('dragend', () => $$('.dragging, .col.over').forEach(x => x.classList.remove('dragging', 'over')));
  document.addEventListener('dragover', e => { const col = e.target.closest && e.target.closest('[data-drop]'); if (!col) return; e.preventDefault(); $$('.col.over').forEach(x => x !== col && x.classList.remove('over')); col.classList.add('over'); });
  document.addEventListener('drop', e => {
    const col = e.target.closest && e.target.closest('[data-drop]'); if (!col) return;
    e.preventDefault(); col.classList.remove('over');
    let dd; try { dd = JSON.parse(e.dataTransfer.getData('text/plain')); } catch (er) { return; }
    if (dd.t === col.dataset.drop) changeField(dd.t, dd.id, col.dataset.field, col.dataset.val);
  });
  document.addEventListener('toggle', e => { const d = e.target; if (d.matches && d.matches('details.plan-sec')) S.ui.planOpen[d.dataset.key] = d.open; }, true);
  window.addEventListener('hashchange', () => { closeModal(); render(); });
}

async function refresh() { await loadAll(); render(); }

/* ================================================================
   BOOT & AUTH
================================================================ */
function renderLogin(msg = '', mode = 'login') {
  const reset = mode === 'reset', newpw = mode === 'newpw';
  $('#app').innerHTML = `<div class="login"><div class="box">
    <div class="brand" style="color:var(--text);padding:0 0 14px"><div class="logo" style="color:#fff">HQ</div>${esc(APP_NAME)}</div>
    <h1 style="margin-bottom:14px">${newpw ? 'Choose a new password' : reset ? 'Reset password' : 'Sign in'}</h1>
    ${msg ? `<div class="alert info">${esc(msg)}</div>` : ''}
    <form id="loginf" onsubmit="return false">
      ${newpw ? '' : '<div class="fld"><label for="em">Email</label><input type="email" id="em" required autocomplete="email"></div>'}
      ${reset ? '' : `<div class="fld"><label for="pw">${newpw ? 'New password' : 'Password'}</label><input type="password" id="pw" required autocomplete="${newpw ? 'new-password' : 'current-password'}"></div>`}
      <button class="btn primary" style="width:100%;justify-content:center" id="lgo">${newpw ? 'Save password' : reset ? 'Send reset link' : 'Sign in'}</button>
    </form>
    <p class="small" style="margin-top:12px;text-align:center">${reset ? '<a href="#" id="lback">Back to sign in</a>' : newpw ? '' : '<a href="#" id="lreset">Forgot password?</a>'}</p>
  </div></div>`;
  const go = $('#lgo');
  go.onclick = async () => {
    go.disabled = true;
    try {
      if (newpw) { const { error } = await SupaDB.c.auth.updateUser({ password: $('#pw').value }); if (error) throw error; location.hash = ''; location.reload(); return; }
      if (reset) { const { error } = await SupaDB.c.auth.resetPasswordForEmail($('#em').value.trim(), { redirectTo: location.origin + location.pathname }); if (error) throw error; renderLogin('If that email is registered, a reset link is on its way.'); return; }
      const { data, error } = await SupaDB.c.auth.signInWithPassword({ email: $('#em').value.trim(), password: $('#pw').value });
      if (error) throw error;
      await afterLogin(data.session);
    } catch (e) { go.disabled = false; renderLogin(e.message || 'Sign-in failed', mode); }
  };
  const lr = $('#lreset'); if (lr) lr.onclick = e => { e.preventDefault(); renderLogin('', 'reset'); };
  const lb = $('#lback'); if (lb) lb.onclick = e => { e.preventDefault(); renderLogin(); };
}

async function afterLogin(session) {
  $('#app').innerHTML = '<div class="boot">Loading your workspace…</div>';
  try { await loadAll(); }
  catch (e) { $('#app').innerHTML = `<div class="login"><div class="box"><h1>Can’t load data</h1><p>${esc(e.message)}</p><p class="small muted">Did you run supabase/schema.sql?</p><button class="btn" onclick="location.reload()">Try again</button></div></div>`; return; }
  const email = (session.user.email || '').toLowerCase();
  S.me = D('members').find(m => (m.email || '').toLowerCase() === email);
  if (!S.me) {
    $('#app').innerHTML = `<div class="login"><div class="box"><h1>Not on the member list</h1><p>${esc(email)} is signed in but isn’t allowed into this portal yet. Add it to the <b>members</b> table in Supabase (see README, step 2).</p><button class="btn" id="so">Sign out</button></div></div>`;
    $('#so').onclick = async () => { await SupaDB.c.auth.signOut(); location.reload(); };
    return;
  }
  startApp();
}

async function startApp() {
  S.booted = true;
  shell(); render();
  try { await runRecurring(); render(); } catch (e) { console.warn(e); }
  setInterval(async () => {
    if (document.hidden || S.modal) return;
    try { await loadAll(); await runRecurring(); render(); } catch (e) { console.warn('auto refresh failed', e); }
  }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !S.modal) refresh().catch(() => { }); });
}

const AUTH_LINK = (location.hash.match(/type=(invite|recovery|signup)/) || [])[1] || '';
async function boot() {
  bindGlobal();
  if (DEMO) {
    db = LocalDB;
    const fresh = !LocalDB.exists();
    if (fresh || !LocalDB.read().members.length) {
      await LocalDB.insert('members', { email: 'developer@demo', display_name: 'Developer', side: 'Developer', leads_access: true });
      await LocalDB.insert('members', { email: 'pierre@demo', display_name: 'Pierre', side: 'Pierre', leads_access: true });
      if (fresh) await importSeed();
    }
    await loadAll();
    S.me = D('members').find(m => m.side === 'Developer');
    startApp();
    return;
  }
  db = SupaDB;
  try { await SupaDB.init(); }
  catch (e) { $('#app').innerHTML = `<div class="login"><div class="box"><h1>Can’t connect</h1><p>Couldn’t load the Supabase library. Check your internet connection.</p></div></div>`; return; }
  SupaDB.c.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') renderLogin('Enter a new password for your account.', 'newpw'); });
  const { data: { session } } = await SupaDB.c.auth.getSession();
  if (AUTH_LINK === 'recovery') { if (session) renderLogin('Enter a new password for your account.', 'newpw'); return; }
  if (AUTH_LINK === 'invite' && session) return renderLogin('Welcome! Choose a password for your account.', 'newpw');
  if (!session) return renderLogin();
  afterLogin(session);
}

boot();
