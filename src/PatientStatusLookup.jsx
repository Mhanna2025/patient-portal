import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
        `https://prima-webhook.azurewebsites.net/lookup?lastName=${encodeURIComponent(form.lastName.trim().toUpperCase())}&dob=${encodeURIComponent(form.dob)}`
      );
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Lookup failed');
      }
      const data = await res.json();
      console.log('Data from backend:', data);
      setRecord(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 font-sans" style={{ backgroundColor: '#F9F6F1', fontFamily: 'Visuelt, Austin, sans-serif' }}>
      <motion.div 
        className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg"
        style={{ backgroundColor: '#FFFFFF' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img src="/prima-logo.png" alt="Prima Logo" className="mx-auto mb-6 w-32" />

        <h2 className="text-3xl font-extrabold mb-6 text-center" style={{ color: '#034638' }}>
          Prescription Status Lookup
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lastName">Last Name</label>
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
            <label className="block text-sm font-medium mb-1" htmlFor="dob">Date of Birth (YYYY-MM-DD)</label>
            <input
              id="dob"
              type="text"
              value={form.dob}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
            />
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

        {error && (
          <div className="mt-4 text-red-600 text-center font-medium">{error}</div>
        )}
      </motion.div>

      {record && (
        <motion.div 
          className="max-w-5xl mx-auto mt-10 p-8 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 text-sm tracking-wide leading-relaxed"
          style={{ backgroundColor: '#FFFFFF', color: '#000000', fontFamily: 'Visuelt, Austin, sans-serif' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div>
            <h4 className="text-lg font-bold mb-3" style={{ color: '#034638' }}>👤 Patient</h4>
            <p><strong>Name:</strong> {record.Patient?.FirstName} {record.Patient?.LastName}</p>
            <p><strong>DOB:</strong> {record.Patient?.DOB}</p>
            <p><strong>Gender:</strong> {record.Patient?.Gender}</p>
            <p><strong>Phone:</strong> {record.Patient?.Phone}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-3" style={{ color: '#034638' }}>💊 Prescription</h4>
            <p><strong>Rx No:</strong> {record.RxNo}</p>
            <p><strong>Drug:</strong> {record.Drug?.DrugName} {record.Drug?.Strong}</p>
            <p><strong>Sig:</strong> {record.Sig}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className="inline-block px-3 py-1 mt-1 rounded-full text-white font-semibold" style={{ backgroundColor: '#78D64B' }}>
                {record.Status}
              </span>
            </p>
            <p><strong>Picked Up:</strong> {record.PickedUp === 'Y' ? '✅ Yes' : '❌ No'}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-3" style={{ color: '#034638' }}>🩺 Prescriber</h4>
            <p><strong>Name:</strong> {record.Prescriber?.FirstName} {record.Prescriber?.LastName}</p>
            <p><strong>DEA:</strong> {record.Prescriber?.DEARegNo}</p>
            <p><strong>NPI:</strong> {record.Prescriber?.NPINo}</p>
            <p><strong>Clinic:</strong> {record.EPrescriptionData?.PrescriberClinicName}</p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-3" style={{ color: '#034638' }}>💵 Billing</h4>
            <p><strong>Insurance Paid:</strong> ${record.PrimaryInsurancePaid}</p>
            <p><strong>Copay Paid:</strong> {record.CopayPaid === 'Y' ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Amount:</strong> ${record.TotalRxAmount}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}