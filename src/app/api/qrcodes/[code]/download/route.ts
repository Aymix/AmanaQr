import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QRCodeModel from '@/models/QRCode';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await dbConnect();

    const qrCode = await QRCodeModel.findOne({ code: params.code });
    
    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // Extract the base64 data from the data URL
    const base64Data = qrCode.qrImage.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Return the image with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-${params.code}.png"`,
      },
    });

  } catch (error) {
    console.error('Error downloading QR code:', error);
    return NextResponse.json(
      { error: 'Failed to download QR code' },
      { status: 500 }
    );
  }
}
