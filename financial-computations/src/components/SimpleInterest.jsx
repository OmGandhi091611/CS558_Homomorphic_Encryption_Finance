import React, { useState } from 'react';

const FinancialForm = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [result, setResult] = useState(null);
  const [encryptedValues, setEncryptedValues] = useState(null);
  const [error, setError] = useState('');

  const calculateInterest = async () => {
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/calculate-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ principal, rate, time }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Encrypted Values:', data.encrypted_values); // Log encrypted values
        console.log('Decrypted Interest:', data.decrypted_interest); // Log decrypted interest
        setResult(data.decrypted_interest); // Display decrypted interest to user
        setEncryptedValues(data.encrypted_values); // Store encrypted values for display
      } else {
        setError(data.error || 'An error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div>
      <h2>Interest Calculator</h2>
      <div>
        <input
          type="number"
          placeholder="Principal"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
        />
        <input
          type="number"
          placeholder="Rate (%)"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Time (years)"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button onClick={calculateInterest}>Calculate</button>
      </div>

      {result !== null && (
        <div>
          <h3>Decrypted Interest: {result}</h3>
        </div>
      )}

      {encryptedValues && (
        <div>
          <h3>Encrypted Values</h3>
          <p>Principal: {encryptedValues.principal}</p>
          <p>Rate: {encryptedValues.rate}</p>
          <p>Time: {encryptedValues.time}</p>
          <p>Interest: {encryptedValues.interest}</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FinancialForm;
