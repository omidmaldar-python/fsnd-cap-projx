# Test database url
export TEST_DATABASE_PATH=:"{YOUR TEST DATABASE URL}"

# Auth0 Token for Administator role.  
# Should have GET, POST, PATCH and DELETE privileges for both projects and team.
export ADMIN_TOKEN="{YOUR ADMIN TOKEN}"

# Auth0 Token for Project Manager role.  
# Should have GET privileges for both projects and team and PATCH privileges for projects.
export PM_TOKEN="{YOUR PROJECT MANAGER TOKEN}"

# Auth0 Token for Team Member role.  
# Should have GET privileges for both projects and team.
export TM_TOKEN="{YOUR TEAM MEMBER TOKEN}"