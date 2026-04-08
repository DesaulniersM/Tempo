# ⏱️ Tempo

**Tempo** is a focused time tracker.

![Tempo Icon](resources/icon.png)

## 🚀 Key Features

-   **Deep Work Flow Timer:** A prominent, distraction-free timer to help you enter and maintain flow states.
-   **Mastery Dashboard:** A bird's-eye view of your focus week, including daily intensity heatmaps.
-   **Intelligent Insights:** Visualize your time allocation across projects with interactive charts and peak productivity analysis.
-   **Weekly Targets:** Set specific hour goals for your most important work and track your progress in real-time.
-   **Universal Data Sync:** Seamlessly migrate your entire history from existing spreadsheets via CSV import.
-   **Native & Portable:** Built for Linux (Ubuntu) with a native launcher and portable `.AppImage` support.
-   **Dark Mode:** A refined, distraction-free dark theme.

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/DesaulniersM/Tempo.git
   cd tempo
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in Development Mode:
   ```bash
   npm run dev
   ```

## 📊 Migrating your History
If you have an existing spreadsheet (like a Google Sheet), follow these steps:
1. Open your sheet and go to **File > Download > Comma Separated Values (.csv)**.
2. In Tempo, go to the **Settings** tab.
3. Click **Select CSV File to Import**.
4. The app will automatically create your projects and migrate all historical hours.

## 📦 Building for Production
To create a standalone, portable Linux application (.AppImage), navigate to the project directory and run:

### For Standard PCs (x64)
```bash
npm run build:linux
```

### For ARM Devices (Raspberry Pi, PineBook, etc.)
```bash
npx electron-builder --linux AppImage --arm64
```
Your portable app will be generated in the `dist/` folder.

## 💻 Multi-Architecture Support
Tempo supports both **x64** and **ARM64** Linux environments. Because it utilizes a native SQLite engine for high performance, ensure you build the AppImage for your specific hardware target.

## 📝 Roadmap
Development progress can be found in [ROADMAP.md](ROADMAP.md).

---
*Tempo is a work in progress. I am open to suggestions, improvements, and research collaborations.*
