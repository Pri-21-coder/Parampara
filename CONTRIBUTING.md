node -v## 🌟 CONTRIBUTING TO PARAMPARA

### 🚀 Quick Start (First-Time Contributors)

Welcome! We are thrilled to have you help preserve rural cultural heritage. Follow these steps to get your local environment running:

1.  **Fork** the repository to your GitHub account.
2.  **Clone** your fork to your local machine.
3.  Open the project folder in your preferred code editor (e.g., VS Code).
4.  Open your terminal and run `npm install` to grab all dependencies.
5.  Start the development server by running `npm run dev` (this enables auto-reload).
6.  Open your browser and navigate to `http://localhost:3000`.
7.  Pick an assigned issue, create a branch (e.g., `feature/map-heatmap-update`), and start coding!
8.  **Push & PR:** Push your branch and open a Pull Request with screenshots.

> **Tip**
> Estimated setup time: 5-10 minutes. Grab some chai ☕ and let's get started!

### 🧱 Project Architecture

Parampara uses Node.js and Express for the backend, with a modular, vanilla JavaScript frontend mapping system via Leaflet.js.

- **Frontend (`/public`):** Contains all user-facing HTML, CSS (in `/styles`), and JS (in `/scripts`). Each major feature (map, gallery, paths, quest, trails, chat) has its own dedicated `.html`, `.css`, and `.js` file to maintain clean separation of concerns.
- **Backend (`server.js`):** Handles API routes, serves the static files from the `/public` directory, and manages the AI Chat interface integration.

### 🖥️ Local Development Rules

Because Parampara relies on a Node/Express backend to serve up map APIs, audio files, and AI chat endpoints, **you must run the project via the local server**.

> **Warning**
> Opening `index.html` directly (via `file://`) will break the Leaflet Map, Audio Stories, and AI Chat fetch requests. Always use `npm start` or `npm run dev`!

### 🚦 WORKFLOW

**1️⃣ Fork & Clone**

```bash
git clone [https://github.com/your-username/Parampara.git](https://github.com/your-username/Parampara.git)
cd Parampara
```

**2️⃣ Branching**
Always create a descriptive feature branch:

```bash
git checkout -b feature/your-feature-name
```

**3️⃣ Commit Messages**
We strictly follow the `type(scope): subject` convention.

- `feat`: A new feature (e.g., `feat: add ambient audio to map markers`)
- `fix`: A bug fix (e.g., `fix: resolve mobile overflow in gallery`)
- `docs`: Documentation changes
- `content`: Adding new cultural stories or map markers
- `refactor`: Code changes without feature/bug impact

**4️⃣ Pull Request**
Push your branch to your fork and open a PR against the `main` branch. Use the provided PR template.

### 📸 VISUAL REQUIREMENTS (MANDATORY)

✅ **For Pull Requests (UI/Frontend Changes)**
You MUST include:

- Screenshots or GIFs of the implemented changes (e.g., how the new marker looks on the map, or the new gallery layout).

✅ **For Issues**
You MUST include:

- Screenshots of the current state / problem area.

> **Caution**
> Submissions altering the UI without visuals will not be reviewed until screenshots are provided.

### ⏱️ TIME CONSTRAINTS & DISQUALIFICATION

**⏳ Assignment Rules**

- Wait for an issue to be officially assigned by a maintainer before starting. Unsolicited PRs for unassigned issues will be closed.
- Work must begin within a reasonable timeframe after assignment.

**🕒 Deadlines**

- **Ideal completion:** 24 – 48 hours.
- **Grace period:** 72 hours.
- If no progress or communication is shown after 72 hours, the issue will be reassigned to keep the project moving.

**🚨 Disqualification Conditions**
❌ PR fails build or breaks the server.
❌ Missing mandatory screenshots for UI changes.
❌ Duplicate PRs for already-assigned issues.

### 🟢 Contribution Categories

| Category             | Description                                                               |
| :------------------- | :------------------------------------------------------------------------ |
| ✏️ **Documentation** | Improve README, fix typos, or clarify code comments.                      |
| 🎨 **Design**        | Enhance CSS, make the gallery prettier, or improve mobile responsiveness. |
| 📝 **Content**       | Add new village markers, craft tags, or audio story transcripts.          |
| 🐛 **Bugs**          | Find and squash bugs in the Leaflet map logic or Express server.          |
| 💡 **Features**      | Build new Discovery Quests or Heritage Paths.                             |

> **Tip**
> Look for issues labeled `good first issue` or `beginner-friendly` if you are new to open source. We love helping new folks get started in preserving history!

**Happy Contributing! Preserving rural heritage, one story at a time. 💙**
