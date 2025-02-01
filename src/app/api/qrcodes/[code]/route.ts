import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import QRCodeModel from '@/models/QRCode';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    await connectDB();
    
    const qrCode = await QRCodeModel.findOne({ code });
    
    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, qrCode });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QR code' },
      { status: 500 }
    );
  }
}
