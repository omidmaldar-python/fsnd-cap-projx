import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const ProjectList = (props) => {
  const emptyProject = {
    client: '',
    project_lead: 0,
    team: [],
    title: '',
    id: null,
    teamIDs: [],
    formattedTeam: {
      lead: 0,
      team: [],
    },
  };

  // state and setters
  const [showModal, setShowModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [updateProject, setUpdateProject] = useState(false);
  const [project, setProject] = useState(emptyProject);

  // passed props
  const projectList = props.projectList.sort((a, b) =>
    a.title > b.title ? 1 : -1
  );
  const setProjectList = props.setProjectList;
  const teamList = props.teamList.sort((a, b) => (a.name > b.name ? 1 : -1));

  // helper functions
  const teamMember = (id) => teamList.filter((m) => parseInt(id) === m.id)[0];
  const formattedTeam = (teamIDs) => teamIDs.map((id) => teamMember(id));

  // set permissions
  const canAddProject = props.permissions.includes('post:projects');
  const canEditProject = props.permissions.includes('patch:projects');
  const canDeleteProject = props.permissions.includes('delete:projects');

  const addUpdateProject = async (e) => {
    e.preventDefault();
    if (!project.client || !project.title) {
      setShowWarning(true);
      return;
    }

    // update project if one is selected
    if (project.id !== null) {
      try {
        const response = await fetch(
          process.env.REACT_APP_DATABASE_URL + '/projects/' + project.id,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${props.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
          }
        );
        const data = await response.json();

        // Update projectList and reset project when add succeeds
        if (data.success) {
          const updatedProjects = projectList.filter(
            (proj) => proj.id !== project.id
          );

          project.formattedTeam.lead = teamMember(project.project_lead);
          project.formattedTeam.team = formattedTeam(project.team);
          setProjectList(updatedProjects.concat(project));
          setProject(emptyProject);
          setShowModal(false);
          setShowWarning(false);
          setUpdateProject(false);
        }
      } catch (e) {
        console.error('oops!', e);
      }

      // add project if none is selected
    } else
      try {
        const response = await fetch(
          process.env.REACT_APP_DATABASE_URL + '/projects',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${props.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
          }
        );
        const data = await response.json();

        // update projectList and reset project when add succeeds
        if (data.success) {
          project.id = data.project.id;
          project.project_lead = data.project.project_lead;
          project.formattedTeam.lead = teamMember(project.project_lead);
          project.team = data.project.team;
          project.formattedTeam.team = formattedTeam(project.team);
          setProjectList(projectList.concat(project));
          setProject(emptyProject);
          setShowModal(false);
          setShowWarning(false);
        }
      } catch (e) {
        console.error('oops!', e);
      }
  };

  // set edit state
  const editProject = (id) => {
    setUpdateProject(true);
    const currentProject = projectList.filter(
      (project) => project.id === id
    )[0];
    if (currentProject) {
      setProject(currentProject);
    }
    openModal();
  };

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

  const closeModal = () => {
    setShowModal(false);
    setProject(emptyProject);
    setUpdateProject(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

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
                <span className='lead'>
                  LEAD:{' '}
                  {project.formattedTeam.lead
                    ? project.formattedTeam.lead.name
                    : 'Not assigned'}
                </span>
                <span className='projectTeamHeader'>TEAM: </span>
                <ul className='projectTeam'>
                  {project.formattedTeam.team.map((member) => {
                    return (
                      <li key={member.id} className='projectMember'>
                        {member.name}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className='admin'>
                <button
                  className={canEditProject ? 'edit' : 'closed'}
                  onClick={(e) => editProject(project.id, e)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className={canDeleteProject ? 'delete' : 'closed'}
                  onClick={(e) => deleteProject(project.id, e)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type='button'
        className={canAddProject ? 'add-button' : 'closed add-button'}
        onClick={openModal}
      >
        Add New Project
      </button>
      <div className={showModal ? 'open modal' : 'closed model'}>
        <section className='projectModal'>
          <h3>{updateProject ? 'Update Project' : 'Add New Project'}</h3>
          <form className='projectForm' onSubmit={addUpdateProject}>
            <label htmlFor='titleInput'>Title</label>
            <input
              id='titleInput'
              className='projectInput'
              type='text'
              name='projectTitle'
              onChange={(e) =>
                setProject((state) => ({ ...state, title: e.target.value }))
              }
              value={project.title}
            />

            <label htmlFor='ClientInput'>Client</label>
            <input
              id='clientInput'
              className='projectInput'
              type='text'
              name='projectClient'
              onChange={(e) =>
                setProject((state) => ({
                  ...state,
                  client: e.target.value,
                }))
              }
              value={project.client}
            />
            <label htmlFor='leadInput'>Project Lead</label>
            <select
              id='leadInput'
              className='projectInput'
              type='select'
              onChange={(e) => {
                setProject((state) => ({
                  ...state,
                  project_lead: parseInt(e.target.value),
                }));
              }}
              value={project.project_lead ? project.project_lead : 0}
              name='selectLead'
            >
              <option value={0} disabled>
                Select Lead
              </option>
              {teamList.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <label htmlFor='teamInput'>Team</label>
            <select
              id='teamInput'
              className='projectInput'
              type='select-multiple'
              multiple={true}
              onChange={(e) => {
                const team = Array.from(e.target.selectedOptions, (option) =>
                  parseInt(option.value)
                );
                setProject((state) => ({
                  ...state,
                  team: team,
                }));
              }}
              value={project.team}
              name='selectTeam'
            >
              <option value={0} disabled>
                Select Team
              </option>
              {teamList.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <p className={showWarning ? 'warning' : 'closed'}>
              Please enter all data
            </p>
            <input type='submit' value='Submit' className='submitButton' />
          </form>

          <button className='closeButton' onClick={closeModal}>
            X
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProjectList;
