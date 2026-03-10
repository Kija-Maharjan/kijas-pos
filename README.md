# Trio's Cafe POS System

A modern Point of Sale system for Trio's Cafe with database integration and Vercel deployment.

## Features

- ☕ Complete menu with multiple categories
- 🛒 Shopping cart with real-time calculations
- 🗄️ Database integration with Supabase (PostgreSQL)
- 📋 Order history tracking
- 💾 Persistent data storage
- 🚀 Ready for Vercel deployment

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- Git installed
- GitHub account
- Supabase account (free at https://supabase.com)
- Vercel account (free at https://vercel.com)

### 1. Local Development Setup

Clone and install dependencies:
```bash
cd trios-cafe
npm install
```

### 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. In the SQL Editor, run this query to create the orders table:

```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  table_no VARCHAR(10) NOT NULL,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  tax INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON orders
  FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert" ON orders
  FOR INSERT WITH CHECK (true);
```

4. Get your Supabase credentials:
   - Go to Settings → API
   - Copy `Project URL` (SUPABASE_URL)
   - Copy `anon` key (SUPABASE_ANON_KEY)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run Locally

```bash
npm run dev
```

The app will run on `http://localhost:3000`

### 5. Deploy to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Add database integration"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "New Project" → Import your GitHub repository

4. In the environment variables section, add:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key

5. Click "Deploy"

Your app will be live at a URL like: `https://trios-cafe.vercel.app`

## API Endpoints

### GET /api/orders
Retrieves all orders from the database.

Response:
```json
[
  {
    "id": 1,
    "customer_name": "Ram Bahadur",
    "table_no": "5",
    "items": [...],
    "subtotal": 500,
    "tax": 65,
    "total": 565,
    "created_at": "2026-02-25T10:30:00"
  }
]
```

### POST /api/orders
Creates a new order.

Request body:
```json
{
  "customer_name": "Ram Bahadur",
  "table_no": "5",
  "items": [
    {
      "id": 1,
      "name": "Boiled Egg (2pc)",
      "price": 60,
      "emoji": "🥚",
      "qty": 2
    }
  ],
  "subtotal": 500,
  "tax": 65,
  "total": 565
}
```

Response:
```json
{
  "id": 1,
  "customer_name": "Ram Bahadur",
  "table_no": "5",
  "items": [...],
  "subtotal": 500,
  "tax": 65,
  "total": 565,
  "created_at": "2026-02-25T10:30:00"
}
```

## Project Structure

```
trios-cafe/
├── public/
│   └── index.html         # Main frontend application
├── api/
│   ├── orders.js          # Orders API endpoint
│   └── health.js          # Health check endpoint
├── package.json           # Dependencies
├── vercel.json            # Vercel configuration
├── .env.local.example     # Environment variables template
└── README.md              # This file
```

## Troubleshooting

### "Database connection error"
- Check that SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify the orders table exists in Supabase
- Check that RLS policies are enabled

### "Orders not saving"
- Check browser console for errors
- Verify Supabase URL is accessible
- Check that .env.local has correct credentials

### "Vercel deployment fails"
- Ensure environment variables are set in Vercel project settings
- Check that package.json has all dependencies
- Review Vercel deployment logs

## Future Enhancements

- [ ] User authentication
- [ ] Multiple staff accounts
- [ ] Advanced analytics dashboard
- [ ] Payment integration
- [ ] Kitchen display system
- [ ] Mobile app version
- [ ] Inventory management

## License

MIT
