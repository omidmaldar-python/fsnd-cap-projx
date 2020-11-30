import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const TeamList = (props) => {
  const [teamList, setTeamList] = useState(null);
  const [showModal, setShowModal] = useState(true);

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
                <button className='edit'>
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
          <button onClick={closeModal}>X</button>
        </section>
      </div>
    </section>
  );
};

export default TeamList;
