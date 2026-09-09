import { NextResponse } from 'next/server';
import { getSupabaseForToken } from '../../../lib/supabaseServer';
import { updateBusinessContent } from '../../../lib/github';

export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Missing auth token' }, { status: 401 });
  }

  const { businessId, content } = await request.json();
  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseForToken(token);

  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error || !business) {
    console.error('Business lookup failed (update-business):', error);
    return NextResponse.json(
      { error: 'Business not found or not yours', detail: error?.message },
      { status: 403 }
    );
  }

  try {
    await updateBusinessContent(business, content);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('GitHub update failed:', err.message);
    return NextResponse.json(
      { error: 'GitHub update failed', detail: err.message },
      { status: 502 }
    );
  }
}
