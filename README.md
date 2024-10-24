# Organize-Me

#Run Project
Install libraries if changed `npm install`
Navigate inside of Organize-Me folder, start: `npx expo start`
View changes: (localhost:8081)

#First Time Install
Run the this command to install expo `npm install --global expo-cli`

Before it will allow you to run the appp it will ask you to install the depenedencies use the:
`npm install` command to catch up to date

#Web Build
https://latinkiri11.github.io/Organize-Me/
Deploy new web build: `npm run deploy`

This will run pre-configured GIT commands which will push to gh-pages branch, where the web build deploys from

#Use the Plant Message popup
-imports: '''
import PlantMessage from "../../components/PlantMessage";
import React, { useState, useEffect, useRef} from 'react';
'''
-At start of page body: '''
const messageRef = useRef(null);
'''
-When you want to show: '''
messageRef.current.changeMessage('Task deleted successfully!');
messageRef.current.changeImageSource("../../assets/images/Plants/plant2_complete.png")
messageRef.current.show(); // Show the modal
'''
-within the View: '''
<PlantMessage ref={messageRef} initialText="Initial Message" />
'''

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


Note: If you run into an issue and you want to deploy make sure you run these to commands first:

`npm install --save-dev gh-pages`

`npm install`

Afterwords in order to deploy changes to the webpage run this command:

`npm run deploy`


`git add .`

`git commit -m MESSAGE`

`git push origin YOUR_BRANCH_NAME`

