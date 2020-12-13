import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Sidebar = () => {
  const { user, logout } = useAuth0();

  return (
    <div className='sidebar'>
      <h1>Your ProjX</h1>
      <div className='user'>
        <p>{user.name}</p>
        <button
          className='logout'
          onClick={() => logout({ returnTo: window.location.origin })}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
