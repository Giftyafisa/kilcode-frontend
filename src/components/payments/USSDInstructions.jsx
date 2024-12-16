import React from 'react';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function USSDInstructions({ ussdCode, instructions, reference }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">USSD Payment Instructions</h3>
      
      <div className="mb-4">
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
          <code className="text-lg font-mono">{ussdCode}</code>
          <button
            onClick={() => copyToClipboard(ussdCode)}
            className="text-blue-600 hover:text-blue-800"
          >
            {copied ? <FaCheckCircle /> : <FaCopy />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex items-start">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
              {index + 1}
            </span>
            <p>{instruction}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>Reference: {reference}</p>
        <p>Please save this reference number for tracking your payment.</p>
      </div>
    </div>
  );
} 