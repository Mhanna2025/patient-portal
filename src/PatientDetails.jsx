import React from 'react';

const PatientDetails = ({ record }) => {
  return (
    <div className="p-4">
      <p>Patient: {record.Patient?.FirstName} {record.Patient?.LastName}</p>
      {/* Add other patient details here */}
    </div>
  );
};

export default PatientDetails;
