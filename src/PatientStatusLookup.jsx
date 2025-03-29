import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiClipboard,
  FiUserCheck,
  FiDollarSign,
  FiLock,
  FiArrowLeft,
  FiPhone,
  FiCalendar,
  FiUserPlus,
} from 'react-icons/fi';
import InputMask from 'react-input-mask';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PatientStatusLookup() {
  const [form, setForm] = useState({ lastName: '', dob: '' });
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecord(null);

    try {
      const res = await fetch(
        `https://prima-webhook.azurewebsites.net/lookup?lastName=${encodeURIComponent(
          form.lastName.trim().toUpperCase()
        )}&dob=${encodeURIComponent(form.dob)}`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lookup failed');
      }

      const data = await res.json();
      setRecord(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecord(null);
    setForm({ lastName: '', dob: '' });
    setError('');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Prescription Summary', 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Section', 'Details']],
      body: [
        ['Patient Name', `${record.Patient?.FirstName} ${record.Patient?.LastName}`],
        ['DOB', record.Patient?.DOB],
        ['Gender', record.Patient?.Gender],
        ['Phone', record.Patient?.Phone],
        ['Rx No', record.RxNo],
        ['Drug', `${record.Drug?.DrugName} ${record.Drug?.Strong}`],
        ['Instructions', record.Sig],
        ['Status', record.Status],
        ['Picked Up', record.PickedUp === 'Y' ? 'Yes' : 'No'],
        ['Prescriber', `${record.Prescriber?.FirstName} ${record.Prescriber?.LastName}`],
        ['Clinic', record.EPrescriptionData?.PrescriberClinicName],
        ['DEA', record.Prescriber?.DEARegNo],
        ['NPI', record.Prescriber?.NPINo],
        ['Insurance Paid', `$${record.PrimaryInsurancePaid}`],
        ['Copay Paid', record.CopayPaid === 'Y' ? 'Yes' : 'No'],
        ['Total Amount', `$${record.TotalRxAmount}`],
      ],
    });

    doc.save('prescription-summary.pdf');
  };

  return (
    <div
      className="min-h-screen px-6 py-10 font-sans"
      style={{ backgroundColor: '#F9F6F1', fontFamily: 'Visuelt, Austin, sans-serif' }}
    >
      {!record && (
        <motion.div
          className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src="/prima-logo.png" alt="Prima Logo" className="mx-auto mb-6 w-32" />
          <div className="flex justify-center items-center gap-2 mb-4 text-green-700 text-sm">
            <FiLock /> Secure & Encrypted Lookup
          </div>
          <h2 className="text-3xl font-extrabold mb-6 text-center" style={{ color: '#034638' }}>
            Prescription Status Lookup
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="dob">
                Date of Birth (MM/DD/YYYY)
              </label>
              <InputMask
                mask="99/99/9999"
                id="dob"
                value={form.dob}
                onChange={handleChange}
                required
              >
                {(inputProps) => (
                  <input
                    {...inputProps}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
                  />
                )}
              </InputMask>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-md text-white font-semibold shadow-md transition duration-200"
              style={{ backgroundColor: '#034638' }}
            >
              {loading ? 'Checking...' : 'Check Status'}
            </button>
          </form>

          {error && <div className="mt-4 text-red-600 text-center font-medium">{error}</div>}
        </motion.div>
      )}

      {record && (
        <motion.div
          className="max-w-5xl mx-auto mt-6 p-8 rounded-2xl shadow-lg bg-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <button
            onClick={resetForm}
            className="mb-6 flex items-center gap-2 text-green-700 hover:underline"
          >
            <FiArrowLeft size={18} /> Back
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-900">
                <FiUser className="text-green-700 text-2xl" /> Patient
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="font-medium text-gray-600">Name:</div>
                <div>{record.Patient?.FirstName} {record.Patient?.LastName}</div>
                <div className="font-medium text-gray-600">DOB:</div>
                <div>{record.Patient?.DOB}</div>
                <div className="font-medium text-gray-600">Gender:</div>
                <div>{record.Patient?.Gender}</div>
                <div className="font-medium text-gray-600">Phone:</div>
                <div>{record.Patient?.Phone}</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-900">
                <FiClipboard className="text-green-700 text-2xl" /> Prescription
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="font-medium text-gray-600">Rx No:</div>
                <div>{record.RxNo}</div>
                <div className="font-medium text-gray-600">Drug:</div>
                <div>{record.Drug?.DrugName} {record.Drug?.Strong}</div>
                <div className="font-medium text-gray-600">Instructions:</div>
                <div>{record.Sig}</div>
                <div className="font-medium text-gray-600">Status:</div>
                <div>
                  <span className="inline-block px-3 py-1 mt-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                    {record.Status}
                  </span>
                </div>
                <div className="font-medium text-gray-600">Picked Up:</div>
                <div>{record.PickedUp === 'Y' ? '✅ Yes' : '❌ No'}</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-900">
                <FiUserCheck className="text-green-700 text-2xl" /> Prescriber
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="font-medium text-gray-600">Name:</div>
                <div>{record.Prescriber?.FirstName} {record.Prescriber?.LastName}</div>
                <div className="font-medium text-gray-600">DEA:</div>
                <div>{record.Prescriber?.DEARegNo}</div>
                <div className="font-medium text-gray-600">NPI:</div>
                <div>{record.Prescriber?.NPINo}</div>
                <div className="font-medium text-gray-600">Clinic:</div>
                <div>{record.EPrescriptionData?.PrescriberClinicName}</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-900">
                <FiDollarSign className="text-green-700 text-2xl" /> Billing
              </h4>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div className="font-medium text-gray-600">Insurance Paid:</div>
                <div>${record.PrimaryInsurancePaid}</div>
                <div className="font-medium text-gray-600">Copay Paid:</div>
                <div>{record.CopayPaid === 'Y' ? '✅ Yes' : '❌ No'}</div>
                <div className="font-medium text-gray-600">Amount:</div>
                <div>${record.TotalRxAmount}</div>
              </div>
            </div>
          </div>

          <div className="col-span-full text-center mt-10">
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
            >
              Download Summary
            </button>
          </div>
        </motion.div>
      )}

      <div className="fixed bottom-4 right-4 text-xs text-gray-500 opacity-70">
        Built by Prima • Powered by Azure • Secure
      </div>
    </div>
  );
}
