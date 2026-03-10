import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Validate server env necessary for Supabase access
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars: SUPABASE_URL or SUPABASE_ANON_KEY');
    res.status(500).json({ error: 'Supabase configuration missing on server. Set SUPABASE_URL and SUPABASE_ANON_KEY.' });
    return;
  }
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Get all orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      // Create new order
      const { customer_name, table_no, items, total } = req.body;

      if (!customer_name || !table_no || !items || !total) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name,
            table_no,
            items,
            total,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      return res.status(201).json(data[0]);
    }

    if (req.method === 'DELETE') {
      // Delete single order by id or all orders
      const id = req.query && req.query.id;
      if (id) {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ deleted: id });
      } else {
        const { error } = await supabase.from('orders').delete().neq('id', 0);
        if (error) throw error;
        return res.status(200).json({ deleted: 'all' });
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}