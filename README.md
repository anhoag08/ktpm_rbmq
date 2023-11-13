# ATU Message Queue<br>
## Introduction
This is a small application developed by Hoang An, Minh Tuan and Hanh Uyen as a part of Software Architecture course's project. ATU Message Queue allows users to download image with specific resolution. 
All things users need to do is to enter an image URL and choose desired resolutions.<br>
## Installation
Prerequisites: Nodejs, Docker
Firstly, clone this project
```
git clone https://github.com/anhoag08/ktpm_rbmq.git
```
After that, run Docker, go to the directory of the project, then use the below command to build an image for RabbitMQ
```
docker run -d --hostname rmq --name rabbit-server -p 6060:15672 -p 5672:5672 rabbitmq:3-management
```
Finally, run the index.html and run the app.js
```
node app.js
```
