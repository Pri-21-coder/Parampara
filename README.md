# Parampara

A community-driven digital archive for preserving rural cultural heritage. Parampara connects traditions with the world through interactive maps, audio stories, visual galleries, and responsible tourism.

## 🌟 Features

### Core Features

- **Cultural Mapping**: Interactive map-based exploration of rural villages and their unique traditions
- **Audio Stories**: Record and preserve oral histories from village elders
- **Visual Archive**: Gallery of traditional crafts (Kantha, Madhubani, Dokra) with detailed descriptions
- **Heritage Paths**: Curated guided journeys that connect stories and traditions across villages
- **Discovery Quest**: Gamified learning with scavenger hunts and digital badges
- **AI Chat Interface**: Talk to an AI curator about rural traditions and stories
- **Heritage Trails**: Plan responsible visits, connect with local hosts, and support artisans
- **GPS Check-in**: Physical-to-digital badges for village visits
- **Live Updates**: Real-time posts from villages about festivals and events

### Key Highlights

- **Heatmap Visualization**: See cultural activity intensity across regions
- **Ambient Sounds**: Immersive audio experience when exploring villages
- **Digital Passports**: Track your cultural exploration journey
- **Responsible Travel Guide**: Dos and Don'ts for respectful cultural visits

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone or navigate to the project directory**

   ```bash
   cd Parampara
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and add your MapTiler API key (free at [maptiler.com](https://www.maptiler.com/)):

   ```bash
   cp .env.example .env
   ```

   ```env
   PORT=3000
   MAPTILER_KEY=your_key
   ```

   The map page loads without a key and shows setup instructions. Add a MapTiler key to enable interactive map tiles, village markers, and heatmap overlays.

4. **Start the server**

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
Parampara/
├── server.js              # Express server and API routes
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── public/               # Frontend files
    ├── index.html        # Home page
    ├── map.html          # Interactive map page
    ├── gallery.html      # Visual archive gallery
    ├── paths.html        # Heritage paths
    ├── quest.html        # Discovery quest
    ├── trails.html       # Heritage trails & local hosts
    ├── chat.html         # AI chat interface
    ├── styles/          # CSS stylesheets
    │   ├── main.css     # Main styles
    │   ├── map.css      # Map page styles
    │   ├── gallery.css  # Gallery styles
    │   ├── paths.css    # Paths styles
    │   ├── quest.css    # Quest styles
    │   ├── trails.css   # Trails styles
    │   └── chat.css     # Chat styles
    └── scripts/         # JavaScript files
        ├── main.js      # Home page logic
        ├── map.js       # Map functionality
        ├── gallery.js   # Gallery functionality
        ├── paths.js     # Paths functionality
        ├── quest.js     # Quest functionality
        ├── trails.js    # Trails functionality
        └── chat.js      # Chat functionality
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Mapping**: MapLibre GL JS, MapTiler
- **Styling**: Custom CSS with modern design principles

## 🎨 Features in Detail

### 1. Cultural Mapping

Explore villages on an interactive map. Click on markers to learn about traditions, festivals, and crafts. Toggle heatmap view to see cultural activity intensity.

### 2. Visual Archive

Browse and contribute to a gallery of traditional crafts. Each item includes descriptions, locations, and tags for easy discovery.

### 3. Heritage Paths

Follow curated journeys that tell a story. Paths connect multiple cultural items in a narrative sequence, complete with audio and images.

### 4. Discovery Quest

Engage in scavenger hunts to unlock digital badges. Complete objectives by exploring the archive and visiting villages.

### 5. Heritage Trails

Plan responsible visits to villages. Get contact information for local hosts, learn dos and don'ts, and find route information.

### 6. AI Chat

Ask questions about rural traditions, crafts, festivals, and stories. The AI curator draws from the archive to provide answers.

## 💡 How You Can Contribute?

| Category         | Description                                  |
| :--------------- | :------------------------------------------- |
| ✏️ **Fix Typos** | Improve writing and fix documentation errors |
| 🎨 **Design**    | Make it look better and prettier             |
| 📝 **Content**   | Add new guides and tutorials                 |
| 🐛 **Bugs**      | Find and fix bugs in the code                |
| 💡 **Ideas**     | Share awesome ideas for new features         |

## 🌐 Gallery API Reference

The visual gallery API retrieves cultural heritage items from the archive. It supports pagination, search, sorting, filtering, and request validation.

### Endpoints

#### `GET /api/gallery`

Retrieves a paginated list of gallery items matching search and filter criteria.

##### Query Parameters

| Parameter | Type    | Required | Description                                                            | Validation                                                                  |
| :-------- | :------ | :------- | :--------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| `page`    | Integer | No       | The page index to fetch (default: `1`).                                | Must be `> 0`.                                                              |
| `limit`   | Integer | No       | Number of items per page (default: `12`).                              | Must be `> 0` and `<= 100`.                                                 |
| `search`  | String  | No       | Search term matching craft title, description, location, or tags.      | Must be a string.                                                           |
| `craft`   | String  | No       | Filter items matching the craft name.                                  | Must be a string.                                                           |
| `state`   | String  | No       | Filter items matching the state name (e.g. `Bihar`, `West Bengal`).    | Must be a string.                                                           |
| `tag`     | String  | No       | Filter items matching a specific tag (e.g. `embroidery`, `metalwork`). | Must be a string.                                                           |
| `sort`    | String  | No       | Order of returned items.                                               | One of: `latest` (newest first), `oldest`, `name` (A-Z), `name_desc` (Z-A). |

##### Sample Request

```http
GET /api/gallery?search=kantha&state=West Bengal&sort=latest&page=1&limit=2
```

##### Sample Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Kantha Embroidery Patterns",
      "type": "visual",
      "location": "Kantha Village, Bengal",
      "coordinates": [22.5726, 88.3639],
      "description": "Traditional Kantha embroidery using running stitch on layered vintage saris.",
      "tags": ["embroidery", "textile"],
      "year": 1950,
      "timestamp": "2026-07-05T11:23:20.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 2,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

##### Sample Validation Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Page must be greater than 0"
}
```

---

## 📋 Submitting Your Changes

### Step 1: Fork the repo

### Step 2: Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

### Step 3: Make Your Changes

Implement your updates following project guidelines.

### Step 4: Test Locally

Ensure everything works correctly before committing.

### Step 5: Commit Your Work

```bash
git add .
git commit -m "Brief description of your changes"
```

### Step 6: Push to GitHub

```bash
git push origin feature/your-feature-name
```

### Step 7: Create a Pull Request

Go to GitHub and click "Create Pull Request". Done! 🚀

Read the [Contributors Guide](CONTRIBUTING.md) for detailed instructions.

---

## ⭐ Star the Repo!

If this project inspired you or helped in any way — do leave a ⭐<br>
It keeps us going and growing!

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

Parampara is designed to preserve the rich cultural heritage of rural communities. Special thanks to all the communities and artisans who keep these traditions alive.

---

**Preserving rural heritage, one story at a time.**
