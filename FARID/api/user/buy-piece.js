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
    const { userId, pieceId } = req.body;
    if (!userId || !pieceId) {
      return res.status(400).json({ success: false, error: 'Missing userId or pieceId' });
    }

    // جلب البيانات الحالية
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('owned_pieces')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // تحديث المصفوفة
    let updatedPieces = user?.owned_pieces || [];
    if (!updatedPieces.includes(pieceId)) {
      updatedPieces.push(pieceId);
    }

    // حفظ التحديث
    const { data, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        owned_pieces: updatedPieces, 
        payment_status: 'completed' 
      })
      .eq('id', userId)
      .select();

    if (updateError) throw updateError;
    
    return res.status(200).json({ 
      success: true, 
      message: 'Piece successfully added', 
      data 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}