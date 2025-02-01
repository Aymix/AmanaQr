import { use } from 'react';
import { ClientReview } from './ClientReview';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default function ReviewPage({ params }: PageProps) {
  const { code } = use(params);
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Review Details - {code}
        </h2>
        <ClientReview code={code} />
      </div>
    </div>
  );
}
