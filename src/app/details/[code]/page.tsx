import { use } from 'react';
import { ClientDetails } from './ClientDetails';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default function DetailsPage({ params }: PageProps) {
  const { code } = use(params);
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Object Details - {code}
        </h2>
        <ClientDetails code={code} />
      </div>
    </div>
  );
}
