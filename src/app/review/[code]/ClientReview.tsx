'use client';

import { useEffect, useState } from 'react';

interface QRCodeData {
  objectDetails: {
    title: string;
    phoneNumber: string;
    location: string;
    notes: string;
  };
}

export function ClientReview({ code }: { code: string }) {
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

  if (!data?.objectDetails) {
    return (
      <div className="text-center text-gray-600">
        <p>No details found for this QR code.</p>
      </div>
    );
  }

  const { title, phoneNumber, location, notes } = data.objectDetails;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Title</h3>
        <p className="mt-1 text-lg text-gray-900">{title}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
        <p className="mt-1 text-lg text-gray-900">{phoneNumber}</p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">Location</h3>
        <p className="mt-1 text-lg text-gray-900">{location}</p>
      </div>
      {notes && (
        <div>
          <h3 className="text-sm font-medium text-gray-500">Notes</h3>
          <p className="mt-1 text-lg text-gray-900">{notes}</p>
        </div>
      )}
    </div>
  );
}
