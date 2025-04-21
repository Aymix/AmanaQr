'use client';

import { useEffect, useState } from 'react';

interface QRCodeData {
  success: boolean;
  qrCode: {
    code: string;
    isAssigned: boolean;
    objectDetails?: {
      title: string;
      phoneNumber: string;
      location: string;
      notes: string;
    };
  };
}

export function ClientDetails({ code }: { code: string }) {
  const [data, setData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/qrcodes/${code}`);
        if (!response.ok) {
          throw new Error('Failed to fetch QR code data');
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch QR code data');
        }
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!data?.qrCode.isAssigned || !data?.qrCode.objectDetails) {
    return (
      <div className="text-center text-gray-600">
        <p>No details found for this QR code.</p>
      </div>
    );
  }

  const { title, phoneNumber, location, notes } = data.qrCode.objectDetails;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Title</h3>
        <p className="mt-1 text-gray-600">{title}</p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Phone Number</h3>
        <p className="mt-1 text-gray-600">{phoneNumber}</p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Location</h3>
        <p className="mt-1 text-gray-600">{location}</p>
      </div>

      {notes && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notes</h3>
          <p className="mt-1 text-gray-600">{notes}</p>
        </div>
      )}
      <div className="pt-4">
        <button
          onClick={() => window.location.href = `tel:${phoneNumber}`}
          className="w-full mb-4 flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          Call Owner
        </button>
        <button
          onClick={() => window.location.href = `/edit/${code}`}
          className="w-full mb-4 flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </button>
      </div>
    </div>
  );
}
