import React, { useEffect, useState } from 'react';

const TeamList = (props) => {
  const [teamList, setTeamList] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_DATABASE_URL + '/team',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${props.token}`,
            },
          }
        );
        const team_data = await response.json();
        setTeamList(team_data.team);
      } catch (e) {
        console.error('oops!', e);
      }
    })();
  }, [props.token]);

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
