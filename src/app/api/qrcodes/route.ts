import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QRCodeModel from '@/models/QRCode';

export async function GET() {
  try {
    await dbConnect();

    const qrCodes = await QRCodeModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ qrCodes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    );
  }
}
