import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function generateMemberId() {
  const randomNum = Math.floor(10 + Math.random() * 90);
  return `M-${randomNum}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, email, country } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    // 1. البحث عن المستخدم أولاً باستخدام صلاحيات الادمن
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // 2. إذا كان موجوداً وله اسم سابق، نعيده مباشرة
    if (existingUser && existingUser.name) {
      return res.status(200).json({ success: true, user: existingUser });
    }

    // 3. إذا كان مستخدم جديد أو اسمه null، ننشئ له اسماً ودولة
    const generatedName = generateMemberId();
    const userCountry = country || existingUser?.country || 'Unknown';

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .upsert(
        { 
          id: userId, 
          email: email || existingUser?.email, 
          name: generatedName,
          country: userCountry 
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, user: updatedUser });

  } catch (err) {
    console.error('API Profile Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}