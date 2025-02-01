import { redirect } from 'next/navigation';
import ObjectForm from '@/components/ObjectForm';
import dbConnect from '@/lib/db';
import QRCodeModel from '@/models/QRCode';

interface PageProps {
  params: {
    code: string;
  };
}

export default async function FormPage({ params }: PageProps) {
  const { code } = params;

  // Connect to database and check if QR code exists and is assigned
  await dbConnect();
  const qrCode = await QRCodeModel.findOne({ code });

  // If QR code doesn't exist, redirect to 404 or error page
  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid QR Code</h2>
          <p className="text-gray-600">
            This QR code does not exist. Please make sure you scanned a valid QR code.
          </p>
        </div>
      </div>
    );
  }

  // If QR code is already assigned, redirect to details page
  if (qrCode.isAssigned) {
    redirect(`/details/${code}`);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Submit Object Details
        </h2>
        <ObjectForm code={code} />
      </div>
    </div>
  );
}
