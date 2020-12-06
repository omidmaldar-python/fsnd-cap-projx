import React from 'react';
import locked from './images/locked.svg';

const Unauthorized = () => {
  return (
    <div className='unauthorized'>
      <img alt='padlock' src={locked} />
      <h1>Unable to Authorize</h1>
      <p>You are not allowed to access this content</p>
    </div>
  );
};

export default Unauthorized;
