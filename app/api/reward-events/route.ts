import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'anonymous';
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data, error } = await supabase
      .from('reward_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to fetch reward events' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reward events' },
      { status: 500 }
    );
  }
}






