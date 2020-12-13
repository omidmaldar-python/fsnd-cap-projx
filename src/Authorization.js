import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import jwt_decode from 'jwt-decode';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Loading from './Loading';
import Unauthorized from './Unauthorized';

const Authorization = () => {
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
    return <Unauthorized />;
  } else if (!permissions) {
    return <Loading />;
  }

  return (
    <div className='userView'>
      <Sidebar />
      <Dashboard permissions={permissions} token={userToken} />
    </div>
  );
};

export default Authorization;
