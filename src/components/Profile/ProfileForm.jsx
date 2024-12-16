import React from 'react';
import { useForm } from 'react-hook-form';
import { useCountryConfig } from '../../hooks/useCountryConfig';
import { useAuth } from '../../context/AuthContext';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

function ProfileForm() {
  const { user, updateUser } = useAuth();
  const { config } = useCountryConfig();
  
  const userCountry = user?.country?.toLowerCase() || 'nigeria';

  console.log('Profile form country:', userCountry);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      state: user?.state || '',
      city: user?.city || '',
      preferredBookmaker: user?.preferredBookmaker || '',
      preferredPaymentMethod: user?.preferredPaymentMethod || '',
      bankDetails: user?.bankDetails || {}
    }
  });

  // Country-specific form fields
  const locationFields = {
    nigeria: [
      {
        name: 'state',
        label: 'State',
        type: 'select',
        options: [
          'Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 
          // Add more Nigerian states
        ]
      },
      {
        name: 'bankDetails.bankName',
        label: 'Bank Name',
        type: 'select',
        options: [
          'Access Bank', 'GTBank', 'First Bank', 'UBA', 'Zenith Bank',
          // Add more Nigerian banks
        ]
      },
      {
        name: 'bankDetails.accountNumber',
        label: 'Account Number',
        type: 'text',
        pattern: '^[0-9]{10}$',
        placeholder: '0123456789'
      }
    ],
    ghana: [
      {
        name: 'region',
        label: 'Region',
        type: 'select',
        options: [
          'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
          // Add more Ghanaian regions
        ]
      },
      {
        name: 'bankDetails.mobileNetwork',
        label: 'Mobile Money Network',
        type: 'select',
        options: ['MTN', 'Vodafone', 'AirtelTigo']
      },
      {
        name: 'bankDetails.mobileNumber',
        label: 'Mobile Money Number',
        type: 'text',
        pattern: '^[0-9]{10}$',
        placeholder: '0241234567'
      }
    ]
  };

  const fields = locationFields[userCountry] || locationFields.nigeria;

  const onSubmit = async (data) => {
    try {
      await updateUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <PhoneInput
            international
            defaultCountry={user?.country.toLowerCase()}
            value={user?.phone}
            onChange={(value) => setValue('phone', value)}
            className="mt-1 block w-full"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Country-specific fields */}
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                {...register(field.name)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                {...register(field.name, {
                  pattern: field.pattern && {
                    value: new RegExp(field.pattern),
                    message: `Invalid ${field.label.toLowerCase()} format`
                  }
                })}
                placeholder={field.placeholder}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            )}
            {errors[field.name] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[field.name].message}
              </p>
            )}
          </div>
        ))}

        {/* Preferred Bookmaker */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Bookmaker
          </label>
          <select
            {...register('preferredBookmaker')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Bookmaker</option>
            {config.bookmakers.map((bookmaker) => (
              <option key={bookmaker.id} value={bookmaker.id}>
                {bookmaker.name}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Payment Method
          </label>
          <select
            {...register('preferredPaymentMethod')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Payment Method</option>
            {config.payments.withdrawal.methods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

export default ProfileForm; 