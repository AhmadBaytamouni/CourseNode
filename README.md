# Carleton CS Prerequisite Visualizer

An interactive web application that visualizes Computer Science course prerequisites at Carleton University. Built with Next.js, React Flow, and Supabase.

## Features

- Interactive graph visualization of all COMP courses
- Click courses to select them and see which courses become available
- View detailed course information in a side panel
- Search and filter courses
- Color-coded by course level (1000, 2000, 3000, 4000)
- Responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Graph Visualization**: React Flow (@xyflow/react)
- **Database**: Supabase (PostgreSQL)
- **Data Collection**: Python (BeautifulSoup, requests)

## Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account (free tier works)

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema in the Supabase SQL editor:

```sql
-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  credits INTEGER NOT NULL,
  description TEXT,
  level INTEGER NOT NULL,
  department VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Prerequisites table
CREATE TABLE prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  is_corequisite BOOLEAN DEFAULT FALSE,
  is_exclusion BOOLEAN DEFAULT FALSE,
  logic_type VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_prerequisites_course ON prerequisites(course_id);
CREATE INDEX idx_prerequisites_prereq ON prerequisites(prerequisite_id);
```

3. Get your Supabase URL and anon key from Project Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For the Python scripts, create a `.env` file or set environment variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Scrape and Populate Data

```bash
# Scrape course data from Carleton website 
cd scripts
python scraper.py

# Process the scraped data
python data_processor.py

# Populate Supabase database
python populate_db.py
```

**Note**: The scraper is a basic implementation. You may need to adjust it based on Carleton's website structure. For initial testing, you can manually create a sample `courses_processed.json` file.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
carleton-cs-prereq-visualizer/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── CourseGraph.tsx    # Main graph component
│   ├── CourseNode.tsx    # Custom node component
│   ├── CourseDetails.tsx  # Course details panel
│   ├── CourseSelector.tsx # Search and filters
│   └── Legend.tsx        # Graph legend
├── hooks/                 # Custom React hooks
│   ├── useCourseGraph.ts
│   └── useCourseSelection.ts
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── courseData.ts     # Course data utilities
│   ├── graph.ts          # Graph algorithms
│   └── types.ts          # TypeScript types
├── scripts/               # Python scripts
│   ├── scraper.py        # Web scraper
│   ├── data_processor.py # Data processing
│   └── populate_db.py    # Database population
└── data/                 # Data files
    └── scraped/          # Scraped data
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Vercel will automatically deploy on every push to your main branch.

## Future Enhancements

- Multi-department support (MATH, STATS, etc.)
- User accounts and saved progress
- Export course plan
- Prerequisite path visualization
- Better graph layout algorithm

## License

MIT

