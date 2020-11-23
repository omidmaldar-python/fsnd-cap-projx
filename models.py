import os
from sqlalchemy import Column, String, Integer, create_engine, Table
from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()
database_path = os.environ['DATABASE_URL']

"""
setup_db(app)
    binds a flask application and a SQLAlchemy service
"""
def setup_db(app, database_path=database_path):
    app.config["SQLALCHEMY_DATABASE_URI"] = database_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.app = app
    db.init_app(app)
    db.create_all()
"""
association table
"""

associations = db.Table('associations',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id')),
    db.Column('team_id', db.Integer, db.ForeignKey('team.id'))
)


"""
class Project(db.Model)
    sets up the projects table and shortcut methods for 
    formatting, inserting, updating and deleting projects
"""

class Project(db.Model):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, nullable=False)
    title = Column(String, nullable=False)
    client = Column(String, nullable=False)
    project_lead = db.Column(db.Integer, db.ForeignKey('team.id',  onupdate="CASCADE", ondelete="SET NULL"), nullable=True)
    team = db.relationship('TeamMember', secondary=associations, backref='projects', lazy='dynamic')
    
    
    def __init__(self, title, client, project_lead, team = []):
        self.title = title
        self.client = client
        self.project_lead = project_lead
        self.team = team

    def info(self):
        # Get name of project lead
        if self.project_lead:
            team_lead = TeamMember.query.get(self.project_lead).name
        else:
            team_lead = 'not assigned'

        # Get names of team members
        team_members = db.session.query(associations).filter(associations.c.project_id == self.id).all()
        if team_members:
            team = [TeamMember.query.get(member.team_id).name for member in team_members]
        else:
            team = []

        return {
            'id': self.id,
            'title': self.title,
            'client': self.client,
            'project_lead': team_lead,
            'team': team
        }

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def __repr__(self):
        return f'<Project {self.id}: {self.title} for {self.client}>'

"""
class Project(db.Model)
    sets up the team table and shortcut methods for 
    formatting, inserting, updating and deleting team members
"""

class TeamMember(db.Model):  
    __tablename__ = 'team'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    
    def __init__(self, name, department):
        self.name = name
        self.department = department

    def info(self):
        return {
            'id': self.id,
            'name': self.name,
            'department': self.department
        }

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def __repr__(self):
        return f'<TeamMember {self.id}: {self.name} - {self.department}>'