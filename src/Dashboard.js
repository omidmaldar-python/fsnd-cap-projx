import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import jwt_decode from 'jwt-decode';
import TeamList from './TeamList';
import ProjectList from './ProjectList';
import locked from './images/locked.svg';
import loading from './images/blocks-loader.gif';

const Dashboard = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [permissions, setPermissions] = useState(null);
  const [authorizationFail, setFail] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: 'projx',
        });
        setUserToken(token);
        const decoded = jwt_decode(token);
        setPermissions(decoded.permissions);
      } catch (e) {
        console.error('oops!', e);
        setFail(true);
      }
    })();
  }, [getAccessTokenSilently, userToken]);

  if (authorizationFail) {
    return (
      <div className='unauthorized'>
        <img alt='padlock' src={locked} />
        <h1>Unable to Authorize</h1>
        <p>You are not allowed to access this content</p>
      </div>
    );
  } else if (!permissions) {
    return (
      <div className='unauthorized'>
        <img alt='loading' src={loading} />
      </div>
    );
  }

  return (
    <div className='dashboard'>
      <TeamList permissions={permissions} token={userToken} />
      <ProjectList permissions={permissions} token={userToken} />
    </div>
  );
};

export default Dashboard;
