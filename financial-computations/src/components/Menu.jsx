import React, { useState } from 'react';
import SimpleInterest from './SimpleInterest';
import LoanApproval from './LoanApproval';

const Menu = () => {
  const [activeComponent, setActiveComponent] = useState('simpleInterest');

  return (
    <div>
      <nav>
        <button onClick={() => setActiveComponent('simpleInterest')}>Simple Interest</button>
        <button onClick={() => setActiveComponent('loanApproval')}>Loan Approval</button>
      </nav>
      <hr />
      {activeComponent === 'simpleInterest' && <SimpleInterest />}
      {activeComponent === 'loanApproval' && <LoanApproval />}
    </div>
  );
};

export default Menu;
