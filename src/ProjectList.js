import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const ProjectList = (props) => {
  const [projectList, setProjectList] = useState(null);

  const deleteProject = async (id) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_DATABASE_URL + '/projects/' + id,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        }
      );
      const data = await response.json();

      // Update project list when delete succeeds
      if (data.success) {
        const updatedProjects = projectList.filter(
          (project) => project.id !== id
        );
        setProjectList(updatedProjects);
      }
    } catch (e) {
      console.error('oops!', e);
    }
  };

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
        setProjectList(project_data.projects);
      } catch (e) {
        console.error('oops!', e);
      }
    })();
  }, [props.token]);

  if (!projectList) {
    return <div>Loading...</div>;
  }

  return (
    <div className='projects'>
      <h2 className='projectHeader'>Projects</h2>
      <ul className='projectList'>
        {projectList.map((project) => {
          return (
            <li className='project' key={project.id}>
              <div className='projectData'>
                <span className='name'>{project.title}</span>
                <span className='client'>{project.client}</span>
                <span className='lead'>LEAD: {project.project_lead}</span>
                <span className='projectTeamHeader'>TEAM: </span>
                <ul className='projectTeam'>
                  {project.team.map((name, index) => {
                    return (
                      <li key={index} className='projectMember'>
                        {name}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className='admin'>
                <button className='edit'>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className='delete'
                  onClick={(e) => deleteProject(project.id, e)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProjectList;
