import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Authorization from './Authorization';
import Error from './Error';
import loading from './images/blocks-loader.gif';
import logo from './images/projx-logo.svg';

function App() {
  const { isLoading, isAuthenticated, error, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return (
      <div className='loading'>
        <img alt='loading' src={loading} />
        <p>Loading your ProjX</p>
      </div>
    );
  }

  if (error) {
    return <Error errorMessage={error.message} />;
  }

  if (isAuthenticated) {
    return <Authorization />;
  } else {
    return (
      <div className='welcome'>
        <div className='welcome-left'>
          <img alt='ProjX logo' src={logo} />
        </div>
        <div className='welcome-right'>
          <h1 className='headline'>Welcome to ProjX</h1>
          <p className='subhead'>Project Staffing made easy!</p>
          <button onClick={loginWithRedirect}>Log in</button>
        </div>
      </div>
    );
  }
}

export default App;
