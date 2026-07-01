# Deploy Your GPT Clone Online

This guide shows how to make your project work online so you can open it from your phone.

We will deploy 3 parts:

1. MySQL database on Railway
2. Express backend on Render
3. React frontend on Netlify

Official docs used:

- Railway MySQL docs: https://docs.railway.com/databases/mysql
- Render web service docs: https://render.com/docs/web-services
- Netlify Vite docs: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/
- Netlify environment variable docs: https://docs.netlify.com/build/environment-variables/overview

## How The Online Version Works

Local development:

```txt
Phone/browser is not involved yet
React frontend -> Vite proxy -> localhost:3777 backend -> local MySQL
```

Online deployment:

```txt
Your phone
  -> Netlify frontend URL
  -> Render backend URL
  -> Railway MySQL database
  -> Gemini API
```

Important idea:

Your phone cannot access `localhost` on your computer. `localhost` means "this same device." So when the app is online, every part needs a public URL.

## Before You Deploy

Make sure your project runs locally first:

```powershell
cd backend
npm run migrate
npm run dev
```

Open another terminal:

```powershell
cd frontend
npm run dev
```

Test in your browser before deploying.

## Step 1: Push Project To GitHub

Render and Netlify deploy easiest from GitHub.

From the project root:

```powershell
git init
git add .
git commit -m "Prepare GPT clone for deployment"
```

Create a new GitHub repo, then push:

```powershell
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

Do not push real secret keys in `.env`.

## Step 2: Create Online MySQL On Railway

1. Go to https://railway.com
2. Create a new project.
3. Add a MySQL database.
4. Open the MySQL service.
5. Find the connection variables.

You need these values:

```txt
MYSQLHOST
MYSQLPORT
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
```

In our backend, they map like this:

```txt
DB_HOST=MYSQLHOST
DB_PORT=MYSQLPORT
DB_USER=MYSQLUSER
DB_PASSWORD=MYSQLPASSWORD
DB_DATABASE=MYSQLDATABASE
```

Keep these secret.

## Step 3: Deploy Backend On Render

1. Go to https://render.com
2. Create a new Web Service.
3. Connect your GitHub repository.
4. Use these settings:

```txt
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Add these environment variables in Render:

```txt
NODE_ENV=production
NODE_VERSION=22
PORT=10000

DB_HOST=your_railway_mysql_host
DB_PORT=your_railway_mysql_port
DB_USER=your_railway_mysql_user
DB_PASSWORD=your_railway_mysql_password
DB_DATABASE=your_railway_mysql_database
DB_CONNECTION_LIMIT=10
DB_REQUIRED=true

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite
GEMINI_MAX_OUTPUT_TOKENS=1024
GEMINI_TEMPERATURE=0.7

CORS_ORIGIN=*
REQUEST_BODY_LIMIT=1mb
CHAT_HISTORY_LIMIT=5
CHAT_LIST_LIMIT=100
CHAT_MAX_QUESTION_LENGTH=65535
```

Teacher note:

Render gives your backend a public URL like:

```txt
https://your-backend-name.onrender.com
```

Your API health URL will be:

```txt
https://your-backend-name.onrender.com/api/health
```

Open that URL in your browser. You should see JSON like:

```json
{
  "success": true,
  "message": "API is healthy."
}
```

## Step 4: Run Database Migration Against Railway

Your Railway database exists, but it still needs the `conversations` table.

On your computer, temporarily put the Railway database values inside `backend/.env`.

Example:

```txt
PORT=3777
NODE_ENV=development

DB_HOST=your_railway_mysql_host
DB_PORT=your_railway_mysql_port
DB_USER=your_railway_mysql_user
DB_PASSWORD=your_railway_mysql_password
DB_DATABASE=your_railway_mysql_database
DB_CONNECTION_LIMIT=10

GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGIN=*
DB_REQUIRED=false
REQUEST_BODY_LIMIT=1mb
CHAT_HISTORY_LIMIT=5
CHAT_LIST_LIMIT=100
CHAT_MAX_QUESTION_LENGTH=65535
```

Then run:

```powershell
cd backend
npm run migrate
```

This creates the `conversations` table in the online Railway database.

After migration, you can put your local database values back if you still want local development.

## Step 5: Test Backend POST Online

Use Postman, Thunder Client, or PowerShell.

PowerShell example:

```powershell
$body = @{
  question = "What is a closure in JavaScript?"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://your-backend-name.onrender.com/api/chat/conversations" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

If it works, the backend should return:

```txt
userConversation
assistantConversation
```

Do not deploy the frontend until the backend works.

## Step 6: Deploy Frontend On Netlify

1. Go to https://netlify.com
2. Add new site from Git.
3. Choose your GitHub repository.
4. Use these build settings:

```txt
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Add this environment variable in Netlify:

```txt
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

Teacher note:

Do not use `localhost` here. Your phone cannot access your computer's localhost.

Also do not use `VITE_API_PROXY_TARGET` for production. The Vite proxy only works during local development.

Deploy the site.

Netlify gives you a URL like:

```txt
https://your-site-name.netlify.app
```

Open that URL on your computer first.

## Step 7: Lock CORS To Your Netlify URL

At first, we used:

```txt
CORS_ORIGIN=*
```

That is easy for testing, but not best for a real deployed app.

After your Netlify URL works, go back to Render and change:

```txt
CORS_ORIGIN=https://your-site-name.netlify.app
```

Redeploy the backend.

Now your backend only allows your frontend site.

## Step 8: Test On Your Phone

On your phone:

1. Open your Netlify URL:

```txt
https://your-site-name.netlify.app
```

2. Send this test question:

```txt
What is a closure in JavaScript?
```

3. Wait for the assistant answer.

If you use a free backend service, the first request can be slow because the backend may sleep when unused.

## Common Problems

### Problem: Frontend opens but chat does not work

Check Netlify environment variable:

```txt
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
```

Then redeploy the frontend.

### Problem: Browser console says CORS error

Check Render environment variable:

```txt
CORS_ORIGIN=https://your-site-name.netlify.app
```

For quick testing only:

```txt
CORS_ORIGIN=*
```

### Problem: Backend health works but POST fails

Check Render environment variables:

```txt
GEMINI_API_KEY
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_DATABASE
```

Also check Render logs.

### Problem: Backend says database connection failed

Make sure you used Railway public connection values, not local/private-only values.

Your deployed Render backend must be able to reach the Railway database over the internet.

### Problem: Table does not exist

Run migration again with Railway database values:

```powershell
cd backend
npm run migrate
```

### Problem: It works on computer but not phone

Make sure you are opening the Netlify URL, not:

```txt
localhost
127.0.0.1
```

Those addresses only work on the machine running the server.

## Final Checklist

Before saying deployment is finished, confirm:

- Railway MySQL is created.
- `npm run migrate` was run against Railway.
- Render backend is deployed.
- Render `/api/health` returns success.
- Render POST `/api/chat/conversations` works.
- Netlify frontend is deployed.
- Netlify has `VITE_API_BASE_URL` set to the Render backend `/api` URL.
- Render has `CORS_ORIGIN` set to the Netlify URL.
- The Netlify URL works from your phone.

## Important Security Reminder

Never put this in frontend code:

```txt
GEMINI_API_KEY
DB_PASSWORD
```

Those belong only in the backend environment variables.

Frontend code is visible to users. Backend environment variables are private on the server.
