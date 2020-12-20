import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const TeamList = (props) => {
  const emptyTM = {
    name: '',
    department: '',
    id: null,
  };
  const [showModal, setShowModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [updateTM, setUpdateTM] = useState(false);
  const [teamMember, setTeamMember] = useState(emptyTM);

  // passed props
  const teamList = props.teamList.sort((a, b) => (a.name > b.name ? 1 : -1));
  const setTeamList = props.setTeamList;
  const afterDeleteTM = props.afterDeleteTM;
  const afterTMUpdate = props.afterTMUpdate;

  // set permissions
  const canAddTM = props.permissions.includes('post:team');
  const canEditTM = props.permissions.includes('patch:team');
  const canDeleteTM = props.permissions.includes('delete:team');

  // Update team member
  const updateName = (e) =>
    setTeamMember((state) => ({ ...state, name: e.target.value }));

  const updateDepartment = (e) =>
    setTeamMember((state) => ({
      ...state,
      department: e.target.value,
    }));

  const addUpdateTeamMember = async (e) => {
    e.preventDefault();
    if (!teamMember.name || !teamMember.department) {
      setShowWarning(true);
      return;
    }
    if (teamMember.id !== null) {
      try {
        const response = await fetch(
          process.env.REACT_APP_DATABASE_URL + '/team/' + teamMember.id,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${props.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(teamMember),
          }
        );
        const data = await response.json();

        // Update teamList and reset teamMember when add succeeds
        if (data.success) {
          afterTMUpdate(teamMember);
          setTeamMember(emptyTM);
          setShowModal(false);
          setShowWarning(false);
          setUpdateTM(false);
        }
      } catch (e) {
        console.error('oops!', e);
      }
    } else
      try {
        const response = await fetch(
          process.env.REACT_APP_DATABASE_URL + '/team',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${props.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(teamMember),
          }
        );
        const data = await response.json();

        // Update teamList and reset teamMember when add succeeds
        if (data.success) {
          teamMember.id = data.team_member.id;
          setTeamList(teamList.concat(teamMember));
          setTeamMember(emptyTM);
          setShowModal(false);
          setShowWarning(false);
        }
      } catch (e) {
        console.error('oops!', e);
      }
  };
  const editTeamMember = (id) => {
    setUpdateTM(true);
    const currentTM = teamList.filter((member) => member.id === id)[0];
    if (currentTM) {
      setTeamMember(currentTM);
    }
    openModal();
  };

  const deleteTeamMember = async (id) => {
    try {
      const response = await fetch(
        process.env.REACT_APP_DATABASE_URL + '/team/' + id,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${props.token}`,
          },
        }
      );
      const data = await response.json();

      // Update team and project lists when delete succeeds
      if (data.success) {
        afterDeleteTM(id);
      }
    } catch (e) {
      console.error('oops!', e);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTeamMember(emptyTM);
    setUpdateTM(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

  return (
    <section className='team'>
      <h2 className='teamHeader'>Team Members</h2>
      <ul className='teamList'>
        {props.teamList.map((member, index) => {
          return (
            <li className='teamMember' key={index}>
              <div className='memberData'>
                <span className='name'>{member.name}</span>
                <span className='department'>{member.department}</span>
              </div>
              <div className='admin'>
                <button
                  className={canEditTM ? 'edit' : 'closed'}
                  onClick={(e) => editTeamMember(member.id, e)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className={canDeleteTM ? 'edit' : 'closed'}
                  onClick={(e) => deleteTeamMember(member.id, e)}
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
        className={canAddTM ? 'add-button' : 'closed add-button'}
        onClick={openModal}
      >
        Add New Team Member
      </button>
      <div className={showModal ? 'open modal' : 'closed model'}>
        <section className='teamModal'>
          <h3>{updateTM ? 'Update Team Member' : 'Add New Team Member'}</h3>
          <form className='teamForm' onSubmit={addUpdateTeamMember}>
            <label htmlFor='nameInput'>Name</label>
            <input
              id='nameInput'
              className='teamInput'
              type='text'
              name='memberName'
              onChange={updateName}
              value={teamMember.name}
            />

            <label htmlFor='deptInput'>Department</label>
            <input
              id='deptInput'
              className='teamInput'
              type='text'
              name='memberDepartment'
              onChange={updateDepartment}
              value={teamMember.department}
            />
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
    </section>
  );
};

export default TeamList;
