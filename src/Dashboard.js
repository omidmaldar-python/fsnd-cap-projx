import React, { useEffect, useState } from 'react';
import TeamList from './TeamList';
import ProjectList from './ProjectList';
import Loading from './Loading';

const Dashboard = (props) => {
  const [teamList, setTeamList] = useState(null);

  // Load team
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
    return <Loading />;
  }

  const deleteTMUpdate = async (id) => {
    const updatedTeam = teamList.filter((member) => member.id !== id);
    setTeamList(updatedTeam);
    // TODO: update projects list when team member is deleted
  };

  return (
    <div className='dashboard'>
      <TeamList
        permissions={props.permissions}
        token={props.token}
        teamList={teamList}
        setTeamList={setTeamList}
        deleteTMUpdate={deleteTMUpdate}
      />
      <ProjectList permissions={props.permissions} token={props.token} />
    </div>
  );
};

export default Dashboard;
