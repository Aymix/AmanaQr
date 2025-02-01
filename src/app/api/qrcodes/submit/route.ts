import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QRCodeModel from '@/models/QRCode';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const { code, objectDetails } = await req.json();

    if (!code || !objectDetails) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Find the QR code and check if it's already assigned
    const qrCode = await QRCodeModel.findOne({ code });
    
    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: 'QR code not found' },
        { status: 404 }
      );
    }
    
    if (qrCode.isAssigned) {
      return NextResponse.json(
        { success: false, error: 'QR code already assigned' },
        { status: 400 }
      );
    }
    
    // Update QR code with object details
    qrCode.objectDetails = objectDetails;
    qrCode.isAssigned = true;
    
    const updatedQRCode = await qrCode.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Object details submitted successfully',
      qrCode: updatedQRCode 
    });
  } catch (error) {
    console.error('Error submitting object details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit object details' },
      { status: 500 }
    );
  }
}
