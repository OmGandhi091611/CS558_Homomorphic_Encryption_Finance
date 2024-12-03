import React, { useState } from 'react';

const LoanApprovalForm = () => {
  const [creditScore, setCreditScore] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [income, setIncome] = useState('');
  const [totalMonthlyDebt, setTotalMonthlyDebt] = useState('');
  const [appraisedPropertyValue, setAppraisedPropertyValue] = useState('');
  const [result, setResult] = useState(null);
  const [encryptedValues, setEncryptedValues] = useState(null);
  const [decryptedDTI, setDecryptedDTI] = useState(null);
  const [decryptedLTV, setDecryptedLTV] = useState(null);
  const [error, setError] = useState('');

  const handleLoanApproval = async () => {
    setError('');
    setResult(null);

    // Calculate the multiplicative inverses on the frontend
    const incomeInverse = 1 / parseFloat(income);  // Inverse of income for DTI calculation
    const appraisedValueInverse = 1 / parseFloat(appraisedPropertyValue);  // Inverse for LTV calculation

    try {
      const response = await fetch('/api/loan-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credit_score: creditScore,
          loan_amount: loanAmount,
          income: incomeInverse,  // Send the inverse to backend
          total_monthly_debt: totalMonthlyDebt,
          appraised_property_value: appraisedValueInverse,  // Send the inverse to backend
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Encrypted Values:', data.encrypted_values);
        console.log('Loan Approved:', data.loan_approved);
        setResult(data.loan_approved ? 'Loan Approved' : 'Loan Denied');
        setEncryptedValues(data.encrypted_values);
        setDecryptedDTI(data.dti);  // Set decrypted DTI
        setDecryptedLTV(data.ltv);  // Set decrypted LTV
      } else {
        setError(data.error || 'An error occurred.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div>
      <h2>Loan Approval</h2>
      <div>
        <input
          type="number"
          placeholder="Credit Score"
          value={creditScore}
          onChange={(e) => setCreditScore(e.target.value)}
        />
        <input
          type="number"
          placeholder="Loan Amount"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
        <input
          type="number"
          placeholder="Total Monthly Debt"
          value={totalMonthlyDebt}
          onChange={(e) => setTotalMonthlyDebt(e.target.value)}
        />
        <input
          type="number"
          placeholder="Appraised Property Value"
          value={appraisedPropertyValue}
          onChange={(e) => setAppraisedPropertyValue(e.target.value)}
        />
        <button onClick={handleLoanApproval}>Submit</button>
      </div>

      {result && <h3>{result}</h3>}  {/* Show loan approval result directly */}

      {encryptedValues && (
        <div>
          <h3>Encrypted Values</h3>
          <p>Credit Score: {encryptedValues.credit_score}</p>
          <p>Loan Amount: {encryptedValues.loan_amount}</p>
          <p>Income (Inverse): {encryptedValues.income}</p>
          <p>Total Monthly Debt: {encryptedValues.total_monthly_debt}</p>
          <p>Appraised Property Value (Inverse): {encryptedValues.appraised_property_value}</p>
          <p>DTI (Encrypted): {encryptedValues.dti}</p>
          <p>LTV (Encrypted): {encryptedValues.ltv}</p>
          <p>Approval: {encryptedValues.approval}</p>
        </div>
      )}

      {decryptedDTI !== null && (
        <div>
          <h3>Decrypted DTI</h3>
          <p>{decryptedDTI}</p>
        </div>
      )}

      {decryptedLTV !== null && (
        <div>
          <h3>Decrypted LTV</h3>
          <p>{decryptedLTV}</p>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoanApprovalForm;
