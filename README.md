# Carleton Computer Science Course Map Visualizer

An interactive web application that visualizes Computer Science course prerequisites at Carleton University. Explore course relationships, see which courses unlock others, and plan your academic path with an intuitive graph visualization.

## 🌐 Live Website

**[Visit the live website →](https://your-vercel-url.vercel.app)**

> **Note**: Replace `https://your-vercel-url.vercel.app` with your actual Vercel deployment URL once deployed.

## Features

- **Interactive Graph Visualization**: Visual representation of all COMP courses and their prerequisite relationships
- **Course Selection**: Click courses to select them and see which courses become available
- **Detailed Information**: View comprehensive course details in a side panel
- **Search & Filter**: Quickly find courses by code or title
- **Color-Coded Levels**: Courses are color-coded by level (1000, 2000, 3000, 4000)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Prerequisite Highlighting**: Visual highlighting of prerequisite chains and unlockable courses

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Graph Visualization**: Custom React components with SVG rendering
- **Database**: Supabase (PostgreSQL)
- **Data Collection**: Python 3.8+ (BeautifulSoup, requests)

## For End Users

Simply visit the [live website](https://your-vercel-url.vercel.app) to use the application. No installation or setup required!

## For Developers

The following setup instructions are for developers who want to run the application locally or contribute to the project.

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account ([free tier works](https://supabase.com))

### Setup

#### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

#### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema in the Supabase SQL editor:
   - Open the SQL editor in your Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Execute the script

The schema includes:
- `courses` table for course information
- `prerequisites` table for prerequisite relationships
- Indexes for optimal query performance
- Row Level Security policies for public read access

3. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy your Project URL and anon/public key

#### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For Python Scripts** (optional, for data population):

Create a `.env` file in the root directory or set environment variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **Note**: The service role key has elevated permissions and should only be used for server-side scripts. Never expose it in client-side code.

#### 4. Populate Database (Optional)

If you want to populate the database with course data:

```bash
# Navigate to scripts directory
cd scripts

# Step 1: Scrape course data from Carleton website
python scraper.py

# Step 2: Process the scraped data
python data_processor.py

# Step 3: Populate Supabase database
python populate_db.py
```

> **Note**: The scraper may need adjustments based on Carleton's website structure. For testing, you can manually create a sample `courses_processed.json` file in `data/scraped/`.

#### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
carleton-cs-prereq-visualizer/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles and Tailwind imports
│
├── components/             # React components
│   ├── CourseGraph.tsx    # Main graph visualization component
│   ├── CourseNode.tsx     # Individual course node component
│   ├── CourseDetails.tsx  # Course details side panel
│   └── CourseSelector.tsx # Search bar and filters
│
├── hooks/                  # Custom React hooks
│   ├── useCourseGraph.ts  # Graph data and layout logic
│   └── useCourseSelection.ts # Course selection state management
│
├── lib/                    # Core utilities and data handling
│   ├── supabase.ts       # Supabase client configuration
│   ├── courseData.ts     # Course data transformation utilities
│   ├── graph.ts          # Graph layout algorithms
│   └── types.ts          # TypeScript type definitions
│
├── constants/              # Application constants
│   ├── colors.ts         # Color scheme definitions
│   ├── dimensions.ts     # Layout and sizing constants
│   └── urls.ts           # External URLs and app metadata
│
├── utils/                  # Utility functions
│   ├── scroll.ts         # Scroll-related utilities
│   ├── text.ts           # Text cleaning and formatting
│   └── year.ts           # Year level utilities
│
├── scripts/                # Python data collection scripts
│   ├── scraper.py        # Web scraper for course data
│   ├── data_processor.py # Data processing and prerequisite parsing
│   └── populate_db.py    # Database population script
│
├── database/               # Database schema
│   └── schema.sql        # PostgreSQL schema definition
│
└── data/                   # Data files (gitignored)
    └── scraped/          # Scraped course data
        ├── courses_raw.json
        └── courses_processed.json
```

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

### Code Organization

- **Constants**: All magic numbers, colors, and URLs are centralized in `constants/`
- **Utilities**: Reusable helper functions are in `utils/`
- **Types**: All TypeScript interfaces and types are in `lib/types.ts`
- **Graph Logic**: Graph layout and edge building algorithms are in `lib/graph.ts`

## How It Works

1. **Data Collection**: Python scripts scrape course data from Carleton's website and parse prerequisite relationships
2. **Data Storage**: Course and prerequisite data is stored in Supabase PostgreSQL database
3. **Graph Visualization**: React components render courses as nodes and prerequisites as edges using SVG
4. **Layout Algorithm**: Custom algorithm positions courses by year level and organizes them horizontally
5. **Interactive Selection**: Clicking a course highlights its prerequisites and unlockable courses

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

**Automatic Deployments**: Once connected, Vercel automatically deploys on every push to your main branch. You don't need to manually redeploy - just push to GitHub and your changes will go live automatically within minutes!

- Each push creates a new deployment
- You can preview deployments before they go live
- Vercel provides deployment status and logs in the dashboard
- You can configure which branches trigger automatic deployments

### Environment Variables for Production

Make sure to set the following environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key

> **Tip**: After deployment, update the live website link at the top of this README with your actual Vercel URL.

## Future Enhancements

- Multi-department support (MATH, STATS, etc.)
- User accounts and saved course plans
- Export course plan as PDF or image
- Improved graph layout algorithm with better edge routing
- Dark/light theme toggle

## License

MIT
