import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Authorization from './Authorization';
import loading from './images/blocks-loader.gif';

function App() {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    loginWithRedirect,
    logout,
  } = useAuth0();

  if (isLoading) {
    return (
      <div className='loading'>
        <img alt='loading' src={loading} />
      </div>
    );
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
    return (
      <div>
        Hello {user.name}{' '}
        <button onClick={() => logout({ returnTo: window.location.origin })}>
          Log out
        </button>
        <Authorization />
      </div>
    );
  } else {
    return <button onClick={loginWithRedirect}>Log in</button>;
  }
}

export default App;
