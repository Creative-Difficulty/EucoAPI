# EucoAPI
<<<<<<< HEAD
 API for computer parameters
 
## Docker 🐳
 
 After successfully cloning (```git clone git clone https://github.com/Creative-Difficulty/EucoAPI/ ```) this repository, you can use 
=======

 API for computer parameters

## Docker 🐳

 After successfully cloning (```git clone git clone https://github.com/Creative-Difficulty/EucoAPI/```) this repository, you can use

>>>>>>> parent of 30b702b (Update README.md)
 ```bash
 docker build . -t creative-difficulty/eucoapi_1
 ```
 to build a container (this might take a while). To verify that you have installed the image successfully, run ```docker images```. You should see ```creative-difficulty/eucoapi_1``` in the list.
Now run 
 ```bash
docker run -p 49160:8082 -d creative-difficulty/eucoapi_1
 ```
 to run the container.
 You can replace ```8082``` with the physical port you want EucoAPI running at.
 to view the console output of EucoAPI, first get its CONTAINER ID (```docker ps```).
 Then run ```docker logs <CONTAINER ID>```. 
 
 Happy Docking!
