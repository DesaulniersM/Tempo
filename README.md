# 🎓 ScholarTrack

**ScholarTrack** is a high-performance, focused time tracker designed specifically for the unique workflows of PhD students and researchers. Move beyond messy spreadsheets and into a "Flow-first" environment.

![ScholarTrack Icon](resources/icon.png)

## 🚀 Key Features

-   **Deep Work Flow Timer:** A prominent, distraction-free timer to help you enter and maintain flow states.
-   **PhD Dashboard:** A bird's-eye view of your research week, including daily intensity heatmaps (GitHub-style).
-   **Intelligent Insights:** Visualize your time allocation across projects with interactive charts and peak productivity analysis.
-   **Weekly Targets:** Set specific hour goals for your Research, TA duties, or Writing and track your progress in real-time.
-   **Google Sheets Sync:** Seamlessly migrate your entire research history from existing spreadsheets via CSV import.
-   **Native & Portable:** Built for Linux (Ubuntu) with a native launcher and portable `.AppImage` support.
-   **Dark Mode:** A refined, research-friendly dark theme for late-night writing sessions.

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/scholar-track.git
   cd scholar-track
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
2. In ScholarTrack, go to the **Settings** tab.
3. Click **Select CSV File to Import**.
4. The app will automatically create your projects and migrate all historical hours.

## 📦 Building for Production
To create a standalone, portable Linux application (.AppImage):
```bash
npm run build:linux
```
Your portable app will be generated in the `dist/` folder.

## 📝 Roadmap
Detailed development progress can be found in [ROADMAP.md](ROADMAP.md).

---
*Created with ❤️ for the research community.*
