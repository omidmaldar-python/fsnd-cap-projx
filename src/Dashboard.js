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
        console.log('JWT Token', props.token);
        setProjectList(project_data.projects);
      } catch (e) {
        console.error('oops!', e);
      }
    })();
  }, [props.token]);

  if (!projectList || !teamList) {
    return <Loading />;
  }

  const afterDeleteTM = (id) => {
    // Update team list state
    const updatedTeam = teamList.filter((member) => member.id !== id);
    setTeamList(updatedTeam);

    // Update project list state
    const updatedProjectList = [...projectList];
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
    setProjectList(updatedProjectList);
  };

  const afterTMUpdate = (teamMember) => {
    // Update team list state
    const updatedTeam = teamList.filter(
      (member) => member.id !== teamMember.id
    );
    setTeamList(updatedTeam.concat(teamMember));

    // Update project list state
    const updatedProjectList = [...projectList];
    for (let i = 0; i < projectList.length; i++) {
      const project = projectList[i];
      if (project.project_lead === teamMember.id) {
        project.project_lead = teamMember.id;
        project.formattedTeam.lead = teamMember;
      }
      const team = project.formattedTeam.team;
      for (let j = 0; j < team.length; j++) {
        if (team[j].id === teamMember.id) {
          team[j] = teamMember;
        }
      }
    }
    setProjectList(updatedProjectList);
  };

  return (
    <div className='dashboard'>
      <TeamList
        permissions={props.permissions}
        token={props.token}
        teamList={teamList}
        setTeamList={setTeamList}
        afterDeleteTM={afterDeleteTM}
        afterTMUpdate={afterTMUpdate}
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
