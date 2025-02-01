import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import dbConnect from '@/lib/db';
import QRCodeModel from '@/models/QRCode';

export async function POST() {
  try {
    await dbConnect();

    const numberOfCodes = 50;
    const qrCodes = [];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    for (let i = 0; i < numberOfCodes; i++) {
      // Generate a unique code
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8);
      const code = `${timestamp}-${random}`;

      // Generate QR code URL that points to the form page
      const qrCodeUrl = `${baseUrl}/form/${code}`;

      try {
        // Generate QR code as data URL
        const qrImage = await QRCode.toDataURL(qrCodeUrl, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });

        // Create and save QR code document
        const qrCode = new QRCodeModel({
          code,
          qrImage,
          isAssigned: false,
        });

        const savedQRCode = await qrCode.save();
        
        // Add the saved QR code to our array
        qrCodes.push({
          ...savedQRCode.toObject(),
          qrImage: qrImage // Ensure the image is included in the response
        });
      } catch (error) {
        console.error(`Error generating QR code ${code}:`, error);
        // Continue with the next code even if one fails
        continue;
      }
    }

    // Check if we generated any QR codes
    if (qrCodes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any QR codes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully generated ${qrCodes.length} QR codes`,
      qrCodes 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in QR code generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR codes' },
      { status: 500 }
    );
  }
}
