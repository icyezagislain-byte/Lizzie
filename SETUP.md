# The Detectives: Setup Guide

This guide is for setting up the research website without needing to write code. The site has two different uses:

- Anyone with the website link can record answers in the field and browse saved responses, statistics, and the Excel download.
- There is no login or access verification. Keep the site link private and only share it with the research team.

## 1. Rotate The Exposed Supabase Credentials

The service-role key and database password previously shared in chat should be considered exposed. Before collecting real research data:

1. Open the Supabase dashboard for this project.
2. In **Project Settings**, open **API Keys** (the exact label can vary).
3. Rotate or replace the service-role secret. Do not copy the old value from chat.
4. If the database password was shared, open **Database** settings and reset it too. The app does not need the database password for its REST API connection.
5. Copy the new service-role key for the next step. Do not send it in a message or put it in a frontend file.

The project URL is already filled in in the local API settings file.

## 2. Add The New Service Key

I created `artifacts/api-server/.env` for this computer. It is ignored by Git, so its contents are not committed.

1. In VS Code, open `artifacts/api-server/.env`.
2. Replace `PASTE_YOUR_NEW_ROTATED_SERVICE_ROLE_KEY_HERE` with the new service-role key from Supabase.
3. Save the file. Keep the key on that line only. Do not add a `VITE_` prefix or put it in the website's frontend folder.

## 3. Create The Three Response Tables

1. In Supabase, open **SQL Editor**.
2. Choose **New query**.
3. In VS Code, open `supabase/migrations/20261009_create_interview_tables.sql` and copy all of its contents.
4. Paste the SQL into Supabase and click **Run**.
5. Open **Table Editor** and confirm these three tables exist: `cbhi_interviews`, `minaloc_interviews`, and `rssb_interviews`.

Run the migration once. Do not create a single combined responses table instead; the app uses these three separate tables.

## 4. Install The App

Open a terminal in the project folder, the folder that contains `package.json`, and run:

```powershell
corepack pnpm install
```

Do not run `npm run install`. That asks npm to run a script named `install`, and this project does not have one. Use the Corepack/pnpm command above.

## 5. Start The Two Parts

Open two terminals in VS Code. Leave both running while you use the site.

In the first terminal, start the API server:

```powershell
corepack pnpm --filter @workspace/api-server run dev
```

In the second terminal, start the website:

```powershell
corepack pnpm --filter @workspace/the-detectives run dev
```

Open the local URL printed by the website command. It is usually `http://localhost:5173`.

## 6. Use It In The Field

1. Open the website and choose CBHI, MINALOC, or RSSB.
2. Ask the questions verbally and enter the answers yourself. Participants do not type into the form.
3. Choose **Continue** or **Skip question** to save a draft as you go. The draft is placed in the matching respondent table.
4. At the end, choose **Submit interview**. The server checks required answers and records the submitted status.
5. If the CBHI participant is under 18 or anyone refuses consent, the interview stops. The app attempts to discard the draft.

Interview pages do not ask for the administrator code. Anyone with the website link can start an interview, as requested. Submitted responses are not readable from the public interview link.

## 7. View Results

1. Choose **Admin access** in the website navigation.
2. Click **Open research dashboard**.
3. Use the CBHI, MINALOC, and RSSB tabs to browse records and answers.
4. Choose **Download research data** to create an Excel workbook with separate CBHI, MINALOC, and RSSB worksheets.

## Important Access Notes

- There is no authentication. Anyone who can reach the website can view all saved responses and download the workbook. Only share the website link with people you trust.
- Interview submission is public to the app link by design. Do not put participant names, phone numbers, or email addresses in answers.
- The `.env` file has a placeholder until you insert a newly rotated service-role key. Saving to Supabase will not work until you do that and apply the migration.
- Supabase Row Level Security is enabled on all three tables. Only the API server uses the service-role key; never put that key in browser settings or a `VITE_` variable.

## Troubleshooting

- **`npm error Missing script: "install"`**: use `corepack pnpm install` instead of `npm run install`.
- **`Secure interview storage is unavailable`**: check the new key in `artifacts/api-server/.env`, verify the migration has run, and restart the API terminal.
- **Website loads but responses do not save**: make sure both terminals are running and the API terminal is using the `.env` file in `artifacts/api-server`.
