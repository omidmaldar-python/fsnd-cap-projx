import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const TeamList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [teamList, setTeamList] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: 'projx',
          scope: 'get:team',
        });
        console.log('TOKEN', token);
        console.log('DATABASE_URL', process.env.REACT_APP_DATABASE_URL);
        const response = await fetch(
          process.env.REACT_APP_DATABASE_URL + '//team',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const team_data = await response.json();
        setTeamList(team_data.team);
      } catch (e) {
        console.error('oops!', e);
      }
    })();
  }, [getAccessTokenSilently]);

  if (!teamList) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {teamList.map((member, index) => {
        return (
          <li key={index}>
            {member.name}/{member.department}
          </li>
        );
      })}
    </ul>
  );
};

export default TeamList;
