import React, { useEffect, useState } from 'react';
import TeamList from './TeamList';
import ProjectList from './ProjectList';
import Loading from './Loading';

const Dashboard = (props) => {
  const [teamList, setTeamList] = useState(null);
  const [projectList, setProjectList] = useState(null);

  // load team
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

  // load projects
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_DATABASE_URL + '/projects',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${props.token}`,
            },
          }
        );
        const project_data = await response.json();
        console.log(props.token);
        console.log(project_data.projects);
        setProjectList(project_data.projects);
      } catch (e) {
        console.error('oops!', e);
      }
    })();
  }, [props.token]);

  if (!projectList || !teamList) {
    return <Loading />;
  }

  const deleteTMUpdate = (id) => {
    const updatedTeam = teamList.filter((member) => member.id !== id);
    setTeamList(updatedTeam);
    const updatedProjectList = projectList;
    for (let i = 0; i < projectList.length; i++) {
      const project = projectList[i];
      if (project.project_lead === id) {
        project.project_lead = null;
        project.formattedTeam.lead = null;
      }
      const team = project.team;
      for (let j = 0; j < team.length; j++) {
        if (team[j] === id) {
          team.splice(j, 1);
          project.formattedTeam.team = project.formattedTeam.team.filter(
            (member) => member.id !== id
          );
        }
      }
    }
    setProjectList([...updatedProjectList]);
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
      <ProjectList
        permissions={props.permissions}
        token={props.token}
        teamList={teamList}
        projectList={projectList}
        setProjectList={setProjectList}
      />
    </div>
  );
};

export default Dashboard;
