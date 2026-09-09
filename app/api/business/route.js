import { NextResponse } from 'next/server';
import { getSupabaseForToken } from '../../../lib/supabaseServer';
import { getBusinessContent } from '../../../lib/github';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const authHeader = request.headers.get('authorization');

  if (!businessId || !authHeader) {
    return NextResponse.json({ error: 'Missing businessId or auth token' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabaseForToken(token);

  // RLS on the businesses table means this only returns a row if the
  // logged-in user is that business's owner — otherwise it returns nothing,
  // and we treat that as "not found / not yours" rather than leaking why.
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (error || !business) {
    console.error('Business lookup failed (business GET):', error);
    return NextResponse.json(
      { error: 'Business not found or not yours', detail: error?.message },
      { status: 403 }
    );
  }

  const { content } = await getBusinessContent(business);
  return NextResponse.json({ business, content });
}
