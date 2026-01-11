# Quick Start Guide

## Step 1: Start the Backend (Terminal 1)

Open a terminal/command prompt in the project root:

```bash
cd C:\Users\PC\Desktop\Fyp_Maritime
python backend\api.py
```

**Wait until you see:**
- `[OK] Model loaded successfully`
- `INFO: Application startup complete.`
- `INFO: Uvicorn running on http://0.0.0.0:8000`

**Keep this terminal open!** The backend must keep running.

---

## Step 2: Start the Frontend (Terminal 2)

Open a **NEW** terminal/command prompt:

```bash
cd C:\Users\PC\Desktop\Fyp_Maritime\frontend
npm run dev
```

**Wait until you see:**
- `VITE v... ready in ... ms`
- `➜  Local:   http://localhost:5173/`

---

## Step 3: Open in Browser

Open your web browser and go to:
```
http://localhost:5173
```

---

## Troubleshooting

### Port 8000 Already in Use

If you see "port 8000 already in use", you have two options:

**Option 1: Use the PowerShell script (easiest)**
```powershell
.\KILL_PORT_8000.ps1
```

**Option 2: Manual PowerShell command**
```powershell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

Then try starting the backend again with:
```powershell
python backend\api.py
```

**Option 3: Use the auto-start script**
```powershell
.\START_BACKEND.ps1
```
This script will automatically kill any process on port 8000 and start the backend.

### Frontend Shows "Connection Error"

1. Make sure the backend is running (check Terminal 1)
2. Make sure you see `INFO: Application startup complete.`
3. Test the backend by opening: http://localhost:8000/ in your browser
4. You should see: `{"message":"Maritime Anomaly Detection API","status":"running","model_loaded":true}`

### Frontend Shows Blank Page

1. Check the browser console (F12) for errors
2. Make sure both servers are running
3. Try refreshing the page (Ctrl+F5)
