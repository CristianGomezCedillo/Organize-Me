# Organize-Me

Expo Tutorial: https://docs.expo.dev/tutorial/build-a-screen/
DO NOT create a new expo project.
MAKE SURE YOU HAVE THIS REPO OPENED RATHER THAN CREATING A NEW EXPO PROJECT!
Navigate into the inner Organize-Me folder and type `npmx expo start`

-P.S Make sure you have the expo CLI  installed

Run the this command to install expo `npm install --global expo-cli`

This will install expo command line and expo allowing you to use the expo start command at the beginning 

Before it will allow you to run the appp it will ask you to install the depenedencies use the:
`npm install` command to catch up to date

It should only need to be ran once.

JUST REFRESH BROWSER TO SEE CHANGES (localhost:8081)

#Set Up GitHub

Clone your forked repository

`git clone https://github.com/YOUR-GITHUB-USERNAME/Organize-Me.git`
`cd Organize-Me`
Add Cristian's repository as the Upstream Branch
`git remote add upstream https://github.com/LatinKiri11/Organize-Me.git`
See if it is set up

`git remote -v`

Fetch changes from Cristian's repo and then push changes

`git fetch upstream`

`git checkout main`
Optional: Add your own branch


QUESTIONS! 

Do we want a login?

-Yes, because we have a database and we don't want users to have other user tasks overlayed on to thier app. 
This is for security reasons.

`git add .`

`git commit -m MESSAGE`

`git push origin YOUR_BRANCH_NAME`

