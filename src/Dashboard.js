import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import jwt_decode from 'jwt-decode';
import TeamList from './TeamList';
import ProjectList from './ProjectList';

const Dashboard = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [role, setRole] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: 'projx',
        });
        setUserToken(token);
        const decoded = jwt_decode(token);
        setRole(decoded);
      } catch (e) {
        console.error('oops!', e);
      }
    })();
  }, [getAccessTokenSilently, userToken]);

  if (!role) {
    return <div>Loading...</div>;
  }

  return (
    <div className='dashboard'>
      <TeamList permissions={role.permissions} token={userToken} />
      <ProjectList permissions={role.permissions} token={userToken} />
    </div>
  );
};

export default Dashboard;
