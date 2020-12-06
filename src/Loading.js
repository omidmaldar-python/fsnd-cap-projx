import React from 'react';
import loading from './images/blocks-loader.gif';

const Loading = () => {
  return (
    <div className='loading'>
      <img alt='loading' src={loading} />
    </div>
  );
};

export default Loading;
