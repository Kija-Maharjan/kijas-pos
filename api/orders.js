// ══════════════════════════════════════
// api/orders.js  —  Orders CRUD
// Uses Supabase table: orders
// ══════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ── GET all orders ──
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // ── POST create order ──
    if (req.method === 'POST') {
      const { customer_name, table_no, items, total } = req.body;
      if (!customer_name || !items || total === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const { data, error } = await supabase
        .from('orders')
        .insert([{ customer_name, table_no, items, total, created_at: new Date().toISOString() }])
        .select();
      if (error) throw error;
      return res.status(201).json(data[0]);
    }

    // ── DELETE single or all orders ──
    if (req.method === 'DELETE') {
      const id = req.query?.id;
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Orders API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
