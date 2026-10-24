# Manager Nol - Football Management Simulation

A football management simulation featuring a dark tactical aesthetic, 30 distinct live competitive servers, 900 unique AI-generated clubs, real cryptographic authentication, and atomic club claiming with strict €100,000,000 starting budgets.

---

## ⚡ Quick Start (Local & Cloud)

### 1. Installation
```bash
npm install
```

### 2. Development Mode
Run the full-stack server (Express backend + Vite client middleware on port 3000):
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🚀 How to Import into Bolt.new

1. **Download the ZIP**:
   - In the application UI, click the **"Download Project ZIP"** button in the header or dashboard, or fetch directly from `/api/download-zip`.
2. **Open Bolt.new**:
   - Navigate to [https://bolt.new](https://bolt.new).
3. **Upload Archive**:
   - Drag and drop the downloaded `manager-nol-project.zip` directly into the Bolt workspace, or choose **"Open Local Project"** / unzip into a GitHub repository and import from Git.
4. **Run Application**:
   - Bolt will automatically run `npm install` and `npm run dev`.
   - The app starts on port 3000 with the Express API and Vite frontend seamlessly active!

---

## 🏗️ Architecture & Technical Details

### Backend & Database
- **Database Engine**: Persistent JSON store located at `data/database.json`.
- **Concurrency & Atomicity**: Atomic mutex locking and safe temporary file writing (`fs.writeFileSync(tmp); fs.renameSync(tmp, file)`) ensure zero corruption and prevent simultaneous claims of the same club across concurrent users.
- **Strict Budget Rule**: Every claimed club is assigned an exact transfer budget of **€100,000,000** (`100000000` numeric integer). Budget rules and ownership verification are strictly enforced on the server.
- **Authentication**: Salted PBKDF2 hashing (`crypto.pbkdf2Sync`) with 32-byte cryptographic session tokens. Sessions are persisted and restored automatically upon reload.

### Features
1. **Interactive Tactical Canvas**:
   - Real-time HTML5 2D canvas simulation of football pitch markings, passing patterns, player movement dots, and goal animations adapted from the original Manager Nol prototype.
2. **30 Competitive Servers**:
   - Short code identification (`EU01`, `ENG02`, `GER03`, ..., `WLD30`).
   - Regional categorization (Europe, Americas, Asia-Pacific, International).
   - Real-time club claim status counter (e.g. `0 / 30 Clubs Claimed`).
3. **900 Distinct Clubs (30 per Server)**:
   - AI-generated realistic football club names (e.g. *Northbridge FC*, *Royal Vesterholm*, *Ironvale Athletic*, *Kingsport Rovers*, *Solhaven City*, etc.).
   - Distinctive stadium names, seating capacities (28,000 - 72,000), founded years, and club color palettes for badges and kits.
4. **Manager Dashboard**:
   - Full manager credentials, active server badge, club crest display, prominent **€100,000,000** warchest card, stadium overview, and Bolt.new export panel.
