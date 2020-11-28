import React, { useEffect, useState } from 'react';

const ProjectList = (props) => {
  const [projectList, setProjectList] = useState(null);

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
