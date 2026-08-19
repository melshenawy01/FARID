import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, email, country } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ success: false, error: 'Missing userId or email' });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({ id: userId, email: email, country: country || 'Unknown' }, { onConflict: 'id' })
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}