from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from models import setup_db, Project, TeamMember
import json
from authorization.auth import AuthError, requires_auth

def create_app(test_config=None):
    app = Flask(__name__, static_folder='./build', static_url_path='/')
    setup_db(app)
    cors = CORS(app, resources={r'/api/*': {'origins': '*'}})


    """
    Home Route
    """
    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    """
    Project Routes
    """
    @app.route('/projects')
    @requires_auth('get:projects')
    def get_projects(payload):
        all_projects = Project.query.all()
        formatted_projects = [project.info() for project in all_projects] 
        return jsonify({
            'projects': formatted_projects,
            'success': True
            })

    @app.route('/projects/<int:project_id>', methods=['GET'])
    @requires_auth('get:projects')
    def get_project(payload, project_id):
        project = Project.query.filter(Project.id == project_id).one_or_none()
        if project is None:
            abort(404)

        return jsonify({
            'success': True,
            'project': project.info()
        })

    @app.route('/projects', methods=['POST'])
    @requires_auth('post:projects')
    def add_project(payload):
        body = request.get_json()

        if body is None:
            abort(404)

        try:
            title = body.get("title", None)
            client = body.get("client", None)
            project_lead = body.get("project_lead", None)
            team = body.get("team", None)
            new_project = Project(title=title, client=client, project_lead=project_lead, team=[])
                
            if team is not None:
                for member in team:
                    new_project.team.append(TeamMember.query.get(member))

            new_project.insert()

            return jsonify({
                'project': new_project.info(),
                'success': True
                })

        except:
            abort(422)

    @app.route('/projects/<int:project_id>', methods=['PATCH'])
    @requires_auth('patch:projects')
    def update_project(payload, project_id):

        body = request.get_json()
        project = Project.query.filter(Project.id == project_id).one_or_none()

        if body is None or project is None:
            abort(404)

        try:
            project.title = body.get("title", project.title)
            project.client = body.get("client", project.client)
            project.project_lead = body.get("project_lead", project.project_lead)
            team = body.get('team', None)

            if team != 'null':
                project.team = []
                project.update()
                for member in team:
                    project.team.append(TeamMember.query.get(member))

            project.update()

            return jsonify({
                'project': project.info(),
                'success': True
                })

        except:
            abort(422)
    
    @app.route('/projects/<int:project_id>', methods=['DELETE'])
    @requires_auth('delete:projects')
    def delete_project(payload, project_id):
        project = Project.query.filter(Project.id == project_id).one_or_none()
        if project is None:
            abort(404)

        try:     
            project.delete()
            return jsonify({
                'success': True,
                'deleted': project_id
            })

        except:
            abort(422)

    """
    Team Routes
    """
    @app.route('/team')
    @requires_auth('get:team')
    def get_team(payload):
        all_team = TeamMember.query.all()
        formatted_team = [team.info() for team in all_team] 
        return jsonify({
            'team': formatted_team,
            'success': True
            })

    @app.route('/team/<int:team_id>', methods=['GET'])
    @requires_auth('get:team')
    def get_team_member(payload, team_id):
        team_member = TeamMember.query.filter(TeamMember.id == team_id).one_or_none()
        if team_member is None:
            abort(404)
 
        return jsonify({
            'success': True,
            'team_member': team_member.info()
        })

    @app.route('/team', methods=['POST'])
    @requires_auth('post:team')
    def add_team_member(payload):
        body = request.get_json()

        if body is None:
            abort(404)

        try:
            name = body.get("name", None)
            department = body.get("department", None)

            new_team_member = TeamMember(name=name, department=department) 
            new_team_member.insert()

            return jsonify({
                'team_member': new_team_member.info(),
                'success': True
                })

        except:
            abort(422)

    @app.route('/team/<int:team_id>', methods=['PATCH'])
    @requires_auth('patch:team')
    def update_team_member(payload, team_id):
        body = request.get_json()
        team_member = TeamMember.query.filter(TeamMember.id == team_id).one_or_none()

        if body is None or team_member is None:
            abort(404)

        try:
            team_member.name = body.get("name", team_member.name)
            team_member.department = body.get("department", team_member.department)

            team_member.update()

            return jsonify({
                'team_member': team_member.info(),
                'success': True
                })

        except:
            abort(422)

    @app.route('/team/<int:team_id>', methods=['DELETE'])
    @requires_auth('delete:team')
    def delete_team_member(payload, team_id):
        team_member = TeamMember.query.filter(TeamMember.id == team_id).one_or_none()
        if team_member is None:
            abort(404)

        try:     
            team_member.delete()
            return jsonify({
                'success': True,
                'deleted': team_id
            })

        except:
            abort(422)
    """
    @app.errorhandler()
        returns a JSON object with an error code and message
    """

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False, 
            'error': 400,
            'message': 'bad request'
        }), 400

    @app.errorhandler(401)
    def bad_request(error):
        return jsonify({
            'success': False, 
            'error': 401,
            'message': 'not authorized'
        }), 401

    @app.errorhandler(403)
    def not_found(error):
        return jsonify({
            'success': False, 
            'error': 403,
            'message': 'access not allowed'
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False, 
            'error': 404,
            'message': 'resource not found'
        }), 404

    @app.errorhandler(405)
    def not_allowed (error):
        return jsonify({
            'success': False, 
            'error': 405,
            'message': 'not allowed'
        }), 405

    @app.errorhandler(422)
    def unprocessable(error):
        return jsonify({
            'success': False, 
            'error': 422,
            'message': 'unprocessable'
        }), 422        

    @app.errorhandler(AuthError)
    def handle_auth_error(e):
        response = jsonify(e.error)
        response = jsonify({
            "success": False,
            "error_code": e.error['code'],
            "description": e.error['description']
        })
        response.status_code = e.status_code
        return response
  
    return app

app = create_app()

if __name__ == '__main__':
    app.run()
