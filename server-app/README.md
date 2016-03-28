# DCsense Server

This directory contains the source for a web app hosted at [dcsense.ee.princeton.edu](http://dcsense.ee.princeton.edu). 

It allows both facility owners (i.e. HPCRC staff, EE dept. server room managers, etc.) and admins (Ryan O'Shea, Prof. Wentzlaff) to log in to view sensor data for their facility. The server receives the sensor data from sensor-controller subsystems

## Contents

 - `/backend` contains a Node.js server backend
 - `/frontend` contains an AngularJS application

## How to Run

 1. **Install Dependencies:** Make sure Node.js and MongoDB are installed on the server.
 2. **Start MongoDB:** Either install MongoDB as a service, or run `$ mongod &` to start the MongoDB server in the background.
 3. **Install Node.js Server Dependencies:** From the `/backend` directory, run `$ npm install`.
 4. **Start the Server:** From the `/backend` directory, run `$ nodejs server.js > ~/server.log 2> ~/server.err &`. This will run the server in the background and place the output in files called `server.log` and `server.err` in your home directory. 
 5. **Create a Temporary Admin Account:** You'll need an admin account to log into the app and create more users. You'll need to start with a temporary admin account to be able to access the inside of the app at first. You can delete the account later, but the only way to get started is to manually insert the record yourself.
 
 ```bash
 $ mongo
 > use dcsense
 > db.createCollection('users')
 > db.users.insert({"username" : "testadmin", "token" : "2315635fcc169d8631e7d89c3de6cb031be298a2b06c3990b5ceff4a549c7c7a", "salt" : "W4rUoHnFTzAaC1KXpZFK", "accessLevel" : 3})
 > quit()
 ```
 
 6. **Browse to app:** The app will then be served at localhost:80. Browse to either that (if you're running the server locally for testing) or the hostname/IP address of the server you're running on. You can now log into your temporary admin account using the username `testadmin` and password `password`.
