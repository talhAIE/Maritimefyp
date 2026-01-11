# AIS Watch Frontend Dashboard

Maritime Anomaly Detection Dashboard - Frontend Application

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- React-Leaflet (Maps)
- Recharts (Charts)
- Lucide React (Icons)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at:
- Local: http://localhost:5173
- Network: Check terminal for network URL

### Build for Production

Build the production bundle:
```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── Layout/      # Header, Sidebar
│   │   ├── Dashboard/   # Main views
│   │   ├── Maps/        # Map components
│   │   ├── Charts/      # Chart components
│   │   ├── Statistics/  # Stats cards
│   │   └── Tables/      # Data tables
│   ├── data/            # Mock data
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json         # Dependencies
```

## Features

- 📊 Dashboard Overview with Statistics
- 🗺️ Interactive Maps (Traffic Density, Trajectories, Anomaly Detection)
- 📈 Analytics Charts (Speed, Course, Vessel Types, Timeline)
- 🚨 Anomaly Alerts Management
- 📋 Data Tables (Vessels, Alerts)
- ⚙️ Settings Panel

## Notes

- Currently uses mock/dummy data
- Ready for backend integration
- All components are modular and reusable