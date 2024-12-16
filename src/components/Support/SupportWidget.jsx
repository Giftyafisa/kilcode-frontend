import React from 'react';
import { useCountryConfig } from '../../hooks/useCountryConfig';
import { FaWhatsapp, FaPhone, FaEnvelope, FaQuestionCircle } from 'react-icons/fa';

function SupportWidget() {
  const { config } = useCountryConfig();
  const { support } = config;

  const contactMethods = [
    {
      icon: <FaWhatsapp className="h-6 w-6" />,
      label: 'WhatsApp',
      value: support.whatsapp,
      action: `https://wa.me/${support.whatsapp.replace(/[^0-9]/g, '')}`
    },
    {
      icon: <FaPhone className="h-6 w-6" />,
      label: 'Phone',
      value: support.phone,
      action: `tel:${support.phone}`
    },
    {
      icon: <FaEnvelope className="h-6 w-6" />,
      label: 'Email',
      value: support.email,
      action: `mailto:${support.email}`
    }
  ];

  const faqCategories = {
    nigeria: [
      {
        title: 'Bank Transfers',
        questions: [
          'How long do bank transfers take?',
          'Which banks are supported?',
          'What are the transfer limits?'
        ]
      },
      // Add more Nigeria-specific FAQs
    ],
    ghana: [
      {
        title: 'Mobile Money',
        questions: [
          'Which mobile money providers are supported?',
          'How long do mobile money transfers take?',
          'What are the mobile money limits?'
        ]
      },
      // Add more Ghana-specific FAQs
    ]
  };

  return (
    <div className="space-y-8">
      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contactMethods.map((method) => (
          <a
            key={method.label}
            href={method.action}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="text-blue-600">{method.icon}</div>
            <div>
              <p className="font-medium">{method.label}</p>
              <p className="text-sm text-gray-600">{method.value}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Support Hours */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900">Support Hours</h3>
        <p className="text-blue-700">{support.hours}</p>
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Frequently Asked Questions</h3>
        {faqCategories[config.country]?.map((category) => (
          <div key={category.title} className="space-y-2">
            <h4 className="font-medium">{category.title}</h4>
            <ul className="space-y-2">
              {category.questions.map((question) => (
                <li key={question} className="flex items-start space-x-2">
                  <FaQuestionCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SupportWidget; 