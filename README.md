# EucoAPI
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> parent of 465ad9d (Revert "Update README.md")
 API for computer parameters
=======
  A JSON REST API for computer parameters and performance built with NodeJS and using [express](https://www.npmjs.com/package/express), [node-os-utils](https://www.npmjs.com/package/node-os-utils), [cpu-benchmark](https://www.npmjs.com/package/cpu-benchmark), [systeminformation](https://www.npmjs.com/package/systeminformation) and [special raspberry Pi-only features](https://www.npmjs.com/package/detect-rpi). Other used utility packages include [os](https://www.npmjs.com/package/os), [ip](https://www.npmjs.com/package/ip) (to check if a string is an IP), [fetch](https://www.npmjs.com/package/node-fetch) (to get JSON data)
  
## Installation
Simply clone (```git clone https://github.com/Creative-Difficulty/EucoAPI/ ```) this repository and ```cd``` into it. now run either ```npm run monitoring``` or ```npm run website```.
  
## Next release⚡️:
* Migrate to node-native fetch
* use [pi-printemps](https://www.npmjs.com/package/pi-printemps) to get Raspberry Pi-only data
* simplify response structure
>>>>>>> parent of 59afdb3 (Update README.md)
 
## Docker 🐳
 
 After successfully cloning (```git clone git clone https://github.com/Creative-Difficulty/EucoAPI/ ```) this repository, you can use 
=======

<<<<<<< HEAD
=======
>>>>>>> parent of fe711bc (update readme)
 API for computer parameters
 
## Docker 🐳
<<<<<<< HEAD
=======
 API for computer parameters

## Docker 🐳
>>>>>>> parent of 465ad9d (Revert "Update README.md")

 After successfully cloning (```git clone git clone https://github.com/Creative-Difficulty/EucoAPI/```) this repository, you can use

>>>>>>> parent of 30b702b (Update README.md)
<<<<<<< HEAD
=======
 
 After successfully cloning (```git clone git clone https://github.com/Creative-Difficulty/EucoAPI/ ```) this repository, you can use 
>>>>>>> parent of fe711bc (update readme)
=======
>>>>>>> parent of 465ad9d (Revert "Update README.md")
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
