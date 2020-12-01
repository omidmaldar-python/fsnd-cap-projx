import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const TeamList = (props) => {
  const [teamList, setTeamList] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [teamMember, setTeamMember] = useState({
    name: '',
    department: '',
    id: null,
  });

  const addTeamMember = async (e) => {
    e.preventDefault();
    if (!teamMember.name || !teamMember.department) {
      setShowWarning(true);
      return;
    }
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
        setTeamMember({
          name: '',
          department: '',
          id: null,
        });
        setShowModal(false);
      }
    } catch (e) {
      console.error('oops!', e);
    }
  };
  const editTeamMember = (id) => {
    openModal();
    console.log(id);
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

      // Update team list when delete succeeds
      if (data.success) {
        const updatedTeam = teamList.filter((member) => member.id !== id);
        setTeamList(updatedTeam);
      }
    } catch (e) {
      console.error('oops!', e);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openModal = () => {
    setShowModal(true);
  };

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
    <section className='team'>
      <h2 className='teamHeader'>Team Members</h2>
      <ul className='teamList'>
        {teamList.map((member, index) => {
          return (
            <li className='teamMember' key={index}>
              <div className='memberData'>
                <span className='name'>{member.name}</span>
                <span className='department'>{member.department}</span>
              </div>
              <div className='admin'>
                <button
                  className='edit'
                  onClick={(e) => editTeamMember(member.id, e)}
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  className='delete'
                  onClick={(e) => deleteTeamMember(member.id, e)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <button type='button' onClick={openModal}>
        Add New Team Member
      </button>
      <div className={showModal ? 'open modal' : 'closed model'}>
        <section className='teamModal'>
          <h3>Add Team Member</h3>
          <form className='teamForm' onSubmit={addTeamMember}>
            <label htmlFor='nameInput'>Name</label>
            <input
              id='nameInput'
              className='teamInput'
              type='text'
              name='memberName'
              onChange={(e) =>
                setTeamMember((state) => ({ ...state, name: e.target.value }))
              }
              value={teamMember.name}
            />

            <label htmlFor='deptInput'>Department</label>
            <input
              id='deptInput'
              className='teamInput'
              type='text'
              name='memberDepartment'
              onChange={(e) =>
                setTeamMember((state) => ({
                  ...state,
                  department: e.target.value,
                }))
              }
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
