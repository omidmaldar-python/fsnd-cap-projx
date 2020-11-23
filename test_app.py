import os
import unittest
import json
from flask_sqlalchemy import SQLAlchemy

from app import create_app
from models import setup_db, Project, TeamMember

TEST_DATABASE_PATH = os.environ['TEST_DATABASE_PATH']
ADMINISTRATOR_TOKEN = os.environ['ADMIN_TOKEN']
PROJECT_MANAGER_TOKEN = os.environ['PM_TOKEN']
TEAM_MEMBER_TOKEN = os.environ['TM_TOKEN']

class AppTestCase(unittest.TestCase):
    """This class represents the trivia test case"""

    def setUp(self):
        """Define test variables and initialize app."""
        self.app = create_app()
        self.client = self.app.test_client

        self.administrator_headers = {
            "Authorization": "Bearer " + ADMINISTRATOR_TOKEN
        }

        self.project_manager_headers = {
            "Authorization": "Bearer " + PROJECT_MANAGER_TOKEN
        }

        self.team_member_headers = {
            "Authorization": "Bearer " + TEAM_MEMBER_TOKEN
        }

        self.new_team_member = {
            'name': 'Sarah',
            'department': 'CM'
        }
        
        self.updated_team_member = {
            'id': 1,
            'name': 'SarahBarraBuBara',
            'department': 'PgM'
        }

        self.new_project = {
            'title': 'Project 1',
            'client': 'Amazon',
            'project_lead': 1,
            'team': [1]
        }

        self.updated_project = {
            'id': 51,
            'title': 'Project One',
            'client': 'Amazon Web',
            'project_lead': 3,
            'team': [4,5]
        }

        setup_db(self.app, TEST_DATABASE_PATH)

        # binds the app to the current context
        with self.app.app_context():
            self.db = SQLAlchemy()
            self.db.init_app(self.app)
            # create all tables
            self.db.create_all()

    def tearDown(self):
        """Executed after reach test"""
        pass
    
    """
    Team Tests
    """

    # POST Team requests

    def test_admin_add_team_member(self):
        """Test Administrator role adding a team member"""
        res = self.client().post('/team', json=self.new_team_member, headers=self.administrator_headers)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data['team_member']['name'], self.new_team_member['name'])
        self.assertEqual(data['team_member']['department'], self.new_team_member['department'])
    
    def test_pm_add_team_member(self):
        """Test Project Manager Role role adding a team member"""
        res = self.client().post('/team', json=self.new_team_member, headers=self.project_manager_headers)
        self.assertEqual(res.status_code, 403)

    def test_tm_add_team_member(self):
        """Test Team Member Role role adding a team member"""
        res = self.client().post('/team', json=self.new_team_member, headers=self.team_member_headers)
        self.assertEqual(res.status_code, 403)

    def test_add_team_member_no_data(self):
        """Test adding a team member with no data"""
        res = self.client().post('/team', json={}, headers=self.administrator_headers)
        self.assertEqual(res.status_code, 422)

    # PATCH Team Requests

    def test_admin_update_team_member(self):
        """Test Administrator role updating a team member"""
        res = self.client().patch('/team/' + str(self.updated_team_member['id']), json=self.updated_team_member, headers=self.administrator_headers)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data['team_member']['id'], self.updated_team_member['id'])
        self.assertEqual(data['team_member']['name'], self.updated_team_member['name'])
        self.assertEqual(data['team_member']['department'], self.updated_team_member['department'])

    def test_pm_update_team_member(self):
        """Test Project Manager role updating a team member"""
        res = self.client().patch('/team/' + str(self.updated_team_member['id']), json=self.updated_team_member, headers=self.project_manager_headers)
        self.assertEqual(res.status_code, 403)

    def test_tm_update_team_member(self):
        """Test Team Member role updating a team member"""
        res = self.client().patch('/team/' + str(self.updated_team_member['id']), json=self.updated_team_member, headers=self.team_member_headers)
        self.assertEqual(res.status_code, 403)
 
    def test_update_team_member_bad_id(self):
        """Test updating a team member with a bad id"""
        res = self.client().patch('/team/9999', json=self.updated_team_member, headers=self.administrator_headers)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)

    # GET All Team Members Requests

    def test_admin_get_team(self):
        """Test Administrator role getting all team members"""
        res = self.client().get('/team', headers=self.administrator_headers)
        data = json.loads(res.data)
        num_team_members = TeamMember.query.count()

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['team']), num_team_members)

    def test_pm_get_team(self):
        """Test Project Manager role getting all team members"""
        res = self.client().get('/team', headers=self.project_manager_headers)
        data = json.loads(res.data)
        num_team_members = TeamMember.query.count()

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['team']), num_team_members)

    def test_tm_get_team(self):
        """Test Team Member role getting all team members"""
        res = self.client().get('/team', headers=self.team_member_headers)
        data = json.loads(res.data)
        num_team_members = TeamMember.query.count()

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['team']), num_team_members)

    def test_get_team_bad_url(self):
        """Test getting all team members with typo in the url"""
        res = self.client().get('/teem')
        self.assertEqual(res.status_code, 404)

    # GET Single Team Member Requests

    def test_admin_get_team_member(self):
        """Test Administrator role getting a single team member by id"""
        res = self.client().get('/team/2', headers=self.administrator_headers)
        self.assertEqual(res.status_code, 200)


    def test_pm_get_team_member(self):
        """Test Project Manager role getting a single team member by id"""
        res = self.client().get('/team/2', headers=self.project_manager_headers)
        self.assertEqual(res.status_code, 200)


    def test_tm_get_team_member(self):
        """Test Team Member role getting a single team member by id"""
        res = self.client().get('/team/2', headers=self.team_member_headers)
        self.assertEqual(res.status_code, 200)

    def test_get_team_member_bad_url(self):
        """Test getting a single team member by id with typo in the url"""
        res = self.client().get('/teem/2')
        self.assertEqual(res.status_code, 404)

    # DELETE Team Requests

    def test_admin_delete_team_member(self):
        """Test Administrator role deleting a specific team member"""
        # get last team member added
        member_to_delete = TeamMember.query.order_by(TeamMember.id.desc()).first()
        member_id = member_to_delete.info()['id']

        res = self.client().delete('/team/' + str(member_id), headers=self.administrator_headers)
        data = json.loads(res.data)

        # check for member in database
        member = TeamMember.query.filter(TeamMember.id == member_id).one_or_none()
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['deleted'], member_id)
        self.assertEqual(member, None)

    def test_pm_delete_team_member(self):
        """Test Project Manager role deleting a specific team member"""
        res = self.client().delete('/team/100', headers=self.project_manager_headers)
        self.assertEqual(res.status_code, 403)

    def test_tm_delete_team_member(self):
        """Test Team Member role deleting a specific team member"""
        res = self.client().delete('/team/100', headers=self.team_member_headers)
        self.assertEqual(res.status_code, 403)

    def test_delete_unknown_team_member(self):
        """Test 404 error for unknown team member deletion"""
        res = self.client().delete('/team/10000', headers=self.administrator_headers)
        self.assertEqual(res.status_code, 404)

    """
    Project Tests
    """
    
    # POST Project requests
    def test_admin_add_project(self):
        """Test Administrator role adding a project"""
        res = self.client().post('/projects', json=self.new_project, headers=self.administrator_headers)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data['project']['title'], self.new_project['title'])
        self.assertEqual(data['project']['client'], self.new_project['client'])
        self.assertTrue(data['project']['project_lead'])
        self.assertEqual(len(data['project']['team']), len(self.new_project['team']))

    def test_pm_add_project(self):
        """Test Project Manager role adding a project"""
        res = self.client().post('/projects', json=self.new_project, headers=self.project_manager_headers)
        self.assertEqual(res.status_code, 403)

    def test_tm_add_project(self):
        """Test Team Member role adding a project"""
        res = self.client().post('/projects', json=self.new_project, headers=self.team_member_headers)
        self.assertEqual(res.status_code, 403)

    def test_add_project_no_data(self):
        """Test adding a project with no data"""
        res = self.client().post('/projects', json={}, headers=self.administrator_headers)
        self.assertEqual(res.status_code, 422)

    # PATCH Project Requests

    def test_admin_update_project(self):
        """Test Administrator role updating a project"""
        res = self.client().patch('/projects/' + str(self.updated_project['id']), json=self.updated_project, headers=self.administrator_headers)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data['project']['id'], self.updated_project['id'])
        self.assertEqual(data['project']['title'], self.updated_project['title'])
        self.assertEqual(data['project']['client'], self.updated_project['client'])
        self.assertTrue(data['project']['project_lead'])
        self.assertEqual(len(data['project']['team']), len(self.updated_project['team']))


    def test_pm_update_project(self):
        """Test Project Manager role updating a project"""
        res = self.client().patch('/projects/' + str(self.updated_project['id']), json=self.updated_project, headers=self.project_manager_headers)
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(data['project']['id'], self.updated_project['id'])
        self.assertEqual(data['project']['title'], self.updated_project['title'])
        self.assertEqual(data['project']['client'], self.updated_project['client'])
        self.assertTrue(data['project']['project_lead'])
        self.assertEqual(len(data['project']['team']), len(self.updated_project['team']))

    def test_tm_update_project(self):
        """Test Team Member role updating a project"""
        res = self.client().patch('/projects/' + str(self.updated_project['id']), json=self.updated_project, headers=self.team_member_headers)
        self.assertEqual(res.status_code, 403)

    def test_update_project_bad_id(self):
        """Test updating a project with a bad id"""
        res = self.client().patch('/project/9999', json=self.updated_project, headers=self.administrator_headers)
        self.assertEqual(res.status_code, 404)
    # GET All Project Requests

    def test_admin_get_projects(self):
        """Test Administrator role getting all projects"""
        res = self.client().get('/projects', headers=self.administrator_headers)
        data = json.loads(res.data)
        num_projects = Project.query.count()

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['projects']), num_projects)
    
    def test_pm_get_projects(self):
        """Test Project Manager role getting all projects"""
        res = self.client().get('/projects', headers=self.project_manager_headers)
        data = json.loads(res.data)
        num_projects = Project.query.count()

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['projects']), num_projects)

    def test_tm_get_projects(self):
        """Test Team Member role getting all projects"""
        res = self.client().get('/projects', headers=self.team_member_headers)
        data = json.loads(res.data)
        num_projects = Project.query.count()

        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(len(data['projects']), num_projects)   
    
    def test_unauthorized_get_projects(self):
        """Test unauthorized request to get all projects"""
        res = self.client().get('/projects')
        data = json.loads(res.data)
        num_projects = Project.query.count()

        self.assertEqual(res.status_code, 401)
        self.assertFalse(data['success'])
        self.assertEqual(data['description'], "Authorization header is expected.")
    
    def test_get_projects_bad_url(self):
        """Test getting all projects with typo in the url"""
        res = self.client().get('/projectx')
        self.assertEqual(res.status_code, 404)    

    # GET Single Project Requests

    def test_admin_get_project(self):
        """Test Administrator role getting a single project"""
        res = self.client().get('/projects/51', headers=self.administrator_headers)
        self.assertEqual(res.status_code, 200)
    
    def test_pm_get_project(self):
        """Test Project Manager role getting a single project"""
        res = self.client().get('/projects/51', headers=self.project_manager_headers)
        self.assertEqual(res.status_code, 200)

    def test_tm_get_project(self):
        """Test Team Member role getting a single project"""
        res = self.client().get('/projects/51', headers=self.team_member_headers)
        self.assertEqual(res.status_code, 200)
    
    def test_unauthorized_get_project(self):
        """Test unauthorized request to get a single project"""
        res = self.client().get('/projects/51')
        self.assertEqual(res.status_code, 401)
    
    def test_get_project_bad_url(self):
        """Test getting a single project with typo in the url"""
        res = self.client().get('/projectx/51')
        data = json.loads(res.data)
        self.assertEqual(res.status_code, 404)

    # DELETE Project Requests

    def test_admin_delete_project(self):
        """Test Administrator role deleting a specific project"""
        # get last team member added
        project_to_delete = Project.query.order_by(Project.id.desc()).first()
        project_id = project_to_delete.info()['id']

        res = self.client().delete('/projects/' + str(project_id), headers=self.administrator_headers)
        data = json.loads(res.data)

        # check for member in database
        project = Project.query.filter(Project.id == project_id).one_or_none()
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['deleted'], project_id)
        self.assertEqual(project, None)

    def test_pm_delete_project(self):
        """Test Project Manager role deleting a specific project"""
        res = self.client().delete('/projects/164', headers=self.project_manager_headers)
        self.assertEqual(res.status_code, 403)

    def test_tm_delete_project(self):
        """Test Team Member role deleting a specific project"""
        res = self.client().delete('/projects/164', headers=self.team_member_headers)
        self.assertEqual(res.status_code, 403)

    def test_delete_unknown_project(self):
        """Test 404 error for unknown project deletion"""
        res = self.client().delete('/projects/164', headers=self.administrator_headers)
        self.assertEqual(res.status_code, 404)

    """
    General Error Tests
    """
 
    def test_404(self):
        """Test 404 error"""
        res = self.client().get('/unknown')
        data = json.loads(res.data)

        self.assertEqual(res.status_code, 404)
        self.assertEqual(data['success'], False)
        self.assertEqual(data['error'], 404)
        self.assertEqual(data['message'], "resource not found")
    
if __name__ == "__main__":
    unittest.main()