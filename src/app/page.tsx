'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QRCode {
  _id: string;
  code: string;
  qrImage: string;
  isAssigned: boolean;
  objectDetails?: {
    title: string;
    phoneNumber: string;
    location: string;
  };
  createdAt: string;
}

type FilterStatus = 'all' | 'assigned' | 'not-assigned';

export default function Home() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedQRCodes, setGeneratedQRCodes] = useState<QRCode[]>([]);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);
  const [printCount, setPrintCount] = useState<number>(1);
  const [printSize, setPrintSize] = useState<number>(150);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchQRCodes = async () => {
    try {
      const response = await fetch('/api/qrcodes');
      if (!response.ok) {
        throw new Error('Failed to fetch QR codes');
      }
      const data = await response.json();
      setQrCodes(data.qrCodes);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQRCodes = qrCodes.filter((qrCode) => {
    switch (filterStatus) {
      case 'assigned':
        return qrCode.isAssigned;
      case 'not-assigned':
        return !qrCode.isAssigned;
      default:
        return true;
    }
  });

  // Pagination logic
  const totalItems = filteredQRCodes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredQRCodes.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [filterStatus]);

  const generateQRCodes = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/qrcodes/generate', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate QR codes');
      }

      const data = await response.json();
      
      if (data.success && data.qrCodes) {
        setGeneratedQRCodes(data.qrCodes);
        setShowQRModal(true);
        // Update the main table with the new QR codes
        setQrCodes(prevCodes => [...data.qrCodes, ...prevCodes]);
      } else {
        throw new Error(data.error || 'Failed to generate QR codes');
      }
    } catch (error) {
      console.error('Error generating QR codes:', error);
      alert('Failed to generate QR codes. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = (qrCode: QRCode) => {
    setSelectedQRCode(qrCode);
    setShowPrintModal(true);
  };

  const executePrint = () => {
    if (!selectedQRCode) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${selectedQRCode.code}</title>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              .print-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(${printSize + 50}px, 1fr));
                gap: 20px;
                padding: 20px;
              }
              .qr-container {
                text-align: center;
                page-break-inside: avoid;
              }
              .qr-code {
                width: ${printSize}px;
                height: ${printSize}px;
                margin: 10px 0;
              }
              .code {
                font-size: 14px;
                color: #4B5563;
                margin: 5px 0;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                @page {
                  margin: 0.5cm;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-grid">
              ${Array(printCount).fill(null).map(() => `
                <div class="qr-container">
                  <img src="${selectedQRCode.qrImage}" alt="QR Code" class="qr-code" />
                  <p class="code">Code: ${selectedQRCode.code}</p>
                </div>
              `).join('')}
            </div>
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setShowPrintModal(false);
    setPrintCount(1);
    setPrintSize(150);
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QR Code Management</h1>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-4">
            <div className="relative">
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.59L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <select
                  id="status-filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                  className="block w-56 rounded-md border-gray-300 pl-10 pr-4 py-2 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                >
                  <option value="all">All QR Codes</option>
                  <option value="assigned">Assigned</option>
                  <option value="not-assigned">Not Assigned</option>
                </select>
              </div>
            </div>
            <button
              onClick={generateQRCodes}
              disabled={generating}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              {generating ? 'Generating...' : 'Generate 50 QR Codes'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  QR Code
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Code
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((qrCode) => (
                <tr key={qrCode._id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {qrCode.qrImage && (
                      <img
                        src={qrCode.qrImage}
                        alt={`QR Code ${qrCode.code}`}
                        className="h-20 w-20"
                      />
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {qrCode.code}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        qrCode.isAssigned
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {qrCode.isAssigned ? 'Assigned' : 'Not Assigned'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                    {qrCode.isAssigned ? (
                      <Link
                        href={`/details/${qrCode.code}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </Link>
                    ) : (
                      <Link
                        href={`/form/${qrCode.code}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Add Details
                      </Link>
                    )}
                    <button
                      onClick={() => handlePrint(qrCode)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <svg
                        className="h-5 w-5 inline-block"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <nav className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Always show first and last page
                    if (page === 1 || page === totalPages) return true;
                    // Show pages around current page
                    return Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, array) => {
                    // Add ellipsis
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <span
                          key={`ellipsis-${page}`}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === page
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Mobile pagination */}
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <p className="text-sm text-gray-700 self-center">
              Page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </p>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </nav>

      </div>

      {/* QR Code Generation Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generated QR Codes</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Download all QR codes
                    generatedQRCodes.forEach((qrCode) => {
                      const link = document.createElement('a');
                      link.href = qrCode.qrImage;
                      link.download = `qr-code-${qrCode.code}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    });
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Download All
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {generatedQRCodes.map((qrCode) => (
                <div key={qrCode._id} className="border rounded-lg p-4 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode.qrImage}
                    alt={`QR Code ${qrCode.code}`}
                    className="w-full h-auto mb-2 rounded-lg"
                  />
                  <p className="text-sm font-medium text-gray-900 mb-2">{qrCode.code}</p>
                  <a
                    href={qrCode.qrImage}
                    download={`qr-code-${qrCode.code}.png`}
                    className="text-sm text-indigo-600 hover:text-indigo-900 inline-block"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && selectedQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Print QR Code</h3>
            
            <div className="space-y-6">
              {/* Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                <div 
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                  style={{ width: `${printSize + 32}px` }}
                >
                  <img
                    src={selectedQRCode.qrImage}
                    alt={`QR Code ${selectedQRCode.code}`}
                    style={{ width: `${printSize}px`, height: `${printSize}px` }}
                    className="transition-all duration-200"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">Preview</p>
              </div>

              {/* Print Settings */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="printCount" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Copies
                  </label>
                  <input
                    type="number"
                    id="printCount"
                    min="1"
                    max="100"
                    value={printCount}
                    onChange={(e) => setPrintCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  />
                </div>

                <div>
                  <label htmlFor="printSize" className="block text-sm font-medium text-gray-700 mb-1">
                    QR Code Size (px)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      id="printSize"
                      min="100"
                      max="300"
                      step="10"
                      value={printSize}
                      onChange={(e) => setPrintSize(parseInt(e.target.value))}
                      className="flex-1 text-black"
                    />
                    <span className="text-sm w-16 text-black">{printSize}px</span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-black">
                    <span>Small</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowPrintModal(false);
                      setPrintCount(1);
                      setPrintSize(150);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executePrint}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
