import React from 'react';
import eyes from './images/eyes.svg';

const Error = (props) => {
  return (
    <div className='errorPage'>
      <img className='errorImage' alt='concerned' src={eyes} />
      <h1>Something has gone wrong...</h1>
      <p>{props.errorMessage}</p>
    </div>
  );
};

export default Error;
