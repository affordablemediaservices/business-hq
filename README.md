# Business HQ — project portal for Pierre & the developer

One website to manage every business, website, YouTube channel and client project:
dashboard, projects, one central task list, requests, approvals, content calendar,
ideas, documents, a restricted real-estate leads CRM, recurring workflows and weekly reports.

- **Hosting:** GitHub Pages (free)
- **Data & logins:** Supabase (free tier)
- **No build step:** plain HTML/CSS/JavaScript — edit and upload.

---

## Run it on your computer

You need [Node.js](https://nodejs.org) installed. In this folder run:

```bash
npm run dev
```

Then open **http://localhost:5173**. (No `npm install` needed — there are no dependencies.)
No Node? Double-click `index.html` instead, or run `python -m http.server 5173`.

## Try it first (2 minutes, nothing to set up)

Until `config.js` is filled in, the portal runs in **Demo mode**.
It runs in **Demo mode**: data is saved in that browser only, and you can switch
**View as → Developer / Pierre** in the yellow bar to see both sides.

---

## Setup (about 20 minutes, one time)

### 1. Create the database (Supabase)

1. Go to <https://supabase.com> → sign up → **New project**. Pick any name and a strong database password (save it in a password manager), region close to you.
2. When it's ready, open **SQL Editor → New query**.
3. Open `supabase/schema.sql` from this folder, copy **everything**, paste, click **Run**. You should see “Success”.

### 2. Add the two people allowed in

Still in the SQL editor, run this with your real emails:

```sql
insert into public.members (email, display_name, side, leads_access) values
  ('YOUR-EMAIL@gmail.com',   'Developer', 'Developer', true),
  ('PIERRE-EMAIL@gmail.com', 'Pierre',    'Pierre',    true);
```

- `side` must be `Developer` or `Pierre` (decides “My tasks” and who can approve).
- `leads_access = true` lets that person see the Real Estate Leads CRM. Set `false` to hide it.
- Only emails in this table can see or change anything — even if someone else creates an account.

### 3. Create the logins

1. Supabase → **Authentication → Users → Add user → Create new user**.
2. Enter each email + a password, tick **Auto Confirm User**. Do this for both people.
3. Recommended: **Authentication → Sign In / Providers → Email** → turn **off** “Allow new users to sign up”.

### 4. Connect the website to the database

1. **Project URL:** Supabase → your project → **Connect** (or **Settings → Data API**).
2. **Key:** **Settings → API Keys** → copy the **Publishable key** (`sb_publishable_…`). Older projects can use the legacy **anon public** key — both work.
3. Open `config.js` and paste them:

```js
window.PORTAL_CONFIG = {
  supabaseUrl: 'https://xxxxxxxx.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi…',
  portalName: 'Business HQ'
};
```

The publishable key is meant to be public. Your data is protected by the database rules + the members list.
**Never** put the secret key (`sb_secret_…` / `service_role`) in this file.

### 5. Put it online with GitHub Pages

1. Go to <https://github.com/new> → name it e.g. `business-hq` → **Public** (GitHub Pages is free for public repos; your *data* is still private in Supabase) → **Create repository**.
2. Click **uploading an existing file** → drag in **all files and the `supabase` folder** from this package → **Commit changes**.
3. Repo **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main**, folder **/(root)** → **Save**.
4. After ~1 minute your portal is live at `https://YOUR-USERNAME.github.io/business-hq/`.
5. Back in Supabase → **Authentication → URL Configuration** → set **Site URL** to that address (needed for “Forgot password” emails).

### 6. First login

Sign in as the developer → the dashboard offers **Import starter data** → click it once.
This loads the 7 projects, the confirmed next actions and the 7 recurring workflows (all switched off).

Send Pierre the link + his password. Done.

---

## Daily use

**Pierre**
- Need something? **＋ New → Request** (or *Submit a request* on the dashboard).
- Your to-dos are under **Your tasks** on the dashboard — tick when done.
- **Approvals**: open the delivery link, then **✓ Approve** or **Request changes** (write what to change).
- Comment at the bottom of any task or project to give instructions.

**Developer**
1. Dashboard: check *Overdue*, *My tasks*, *Waiting for approval*.
2. **Requests** → Start review → Approve → **Convert to task**.
3. **Tasks** board: drag cards as work moves; add the *Delivery link* when finished.
4. Work needing approval → **Send for review** (only Pierre can approve).
5. Log every article/video in **Content** with its final URL.
6. Friday: **Weekly reports → Generate this week** → add priorities → Print / save PDF.

**New project:** ＋ New → Project → choose a template (Website, E-commerce, YouTube, App, SEO, Agency client…).
Turn plan items into tasks with ＋ only when needed. Finished? **Archive** — history is kept.

**Recurring work:** *Recurring* page → open a workflow → set project + day → **Switch on**.
A new task (with its own checklist) is created automatically each period the first time either of you opens the portal — never duplicated. Leave *Weekly Blog Article* and the YouTube workflows off until Pierre confirms the schedule.

---

## What's automatic vs. manual

| Automatic | Manual / optional |
|---|---|
| Recurring tasks created each period (when the portal is opened) | Email/WhatsApp notifications (would need a paid automation tool or Supabase Edge Function) |
| Request → Completed when its task is completed | |
| Approval rules: tasks needing approval can't be completed until Pierre approves | |
| Weekly report content pulled from real data | Writing priorities / notes in the report |
| Data refreshes every 60 seconds and when you return to the tab | |

## Safety rules

- Never store passwords, card/bank details, verification codes or recovery codes in the portal.
- Lead contact details only go in **Leads (CRM)**, which only `leads_access` members can see.
- Vape store: every product or marketing change needs an age, platform and legal compliance check.

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `app.js` | All the portal logic |
| `styles.css` | The look |
| `config.js` | **Your Supabase details go here** |
| `seed-data.js` | Starter projects, tasks and workflows |
| `supabase/schema.sql` | Database tables + security rules (run once) |
| `package.json`, `dev-server.js` | Only for running locally with `npm run dev` (GitHub Pages ignores them) |

## Troubleshooting

- **“Not on the member list”** — the email you signed in with isn't in `members` (step 2). Check spelling.
- **“Can't load data”** — `schema.sql` wasn't run, or `config.js` has a wrong URL/key.
- **Changes don't show on GitHub Pages** — wait 1–2 minutes and hard-refresh (Ctrl/Cmd + Shift + R).
- **Forgot password email goes to the wrong page** — set Site URL (step 5.5).
