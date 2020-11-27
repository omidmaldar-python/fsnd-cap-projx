import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ProjectList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [projectList, setProjectList] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: 'projx',
          scope: 'get:team',
        });
        const response = await fetch(
          process.env.REACT_APP_DATABASE_URL + '/projects',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const project_data = await response.json();
        console.log(project_data);
        setProjectList(project_data.projects);
      } catch (e) {
        console.error('oops!', e);
      }
    })();
  }, [getAccessTokenSilently]);

  if (!projectList) {
    return <div>Loading...</div>;
  }

  return (
    <ul>
      {projectList.map((project, index) => {
        return (
          <li key={index}>
            {project.title}/{project.project_lead}
          </li>
        );
      })}
    </ul>
  );
};

export default ProjectList;
