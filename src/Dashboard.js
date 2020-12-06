import TeamList from './TeamList';
import ProjectList from './ProjectList';

const Dashboard = (props) => {
  return (
    <div className='dashboard'>
      <TeamList permissions={props.permissions} token={props.token} />
      <ProjectList permissions={props.permissions} token={props.token} />
    </div>
  );
};

export default Dashboard;
