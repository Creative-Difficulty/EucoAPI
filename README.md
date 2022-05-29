# EucoAPI
   A JSON REST API for computer parameters and performance built with NodeJS and using [express](https://www.npmjs.com/package/express), [node-os-utils](https://www.npmjs.com/package/node-os-utils), [cpu-benchmark](https://www.npmjs.com/package/cpu-benchmark), [systeminformation](https://www.npmjs.com/package/systeminformation) and [special raspberry Pi-only features](https://www.npmjs.com/package/detect-rpi). Other used utility packages include [os](https://www.npmjs.com/package/os), [ip](https://www.npmjs.com/package/ip) (to check if a string is an IP), [fetch](https://www.npmjs.com/package/node-fetch) (to get JSON data)
   A JSON REST API for computer parameters and performance built with NodeJS and using [express](https://www.npmjs.com/package/express), [node-os-utils](https://www.npmjs.com/package/node-os-utils), [cpu-benchmark](https://www.npmjs.com/package/cpu-benchmark), [systeminformation](https://www.npmjs.com/package/systeminformation) and [special raspberry Pi-only features](https://www.npmjs.com/package/detect-rpi). Other used utility packages include [os](https://www.npmjs.com/package/os), [ip](https://www.npmjs.com/package/ip) (to check if a string is an IP) and [fetch](https://www.npmjs.com/package/node-fetch) (to get JSON data)

 ## Installation
 Simply clone (```git clone https://github.com/Creative-Difficulty/EucoAPI/```) this repository and ```cd``` into it. Now run either ```npm run monitoring``` or ```npm run website```.
  
## Next release⚡️:
* Migrate to node-native fetch
* use [pi-printemps](https://www.npmjs.com/package/pi-printemps) to get Raspberry Pi-only data
* simplify response structure
 
## Docker 🐳
 
 After successfully cloning (```git clone https://github.com/Creative-Difficulty/EucoAPI/```) this repository, first run ```bash cd EucoAPI```.
 Run ```bash
 docker build . -t creative-difficulty/eucoapi_1``` to build the container (this might take a while). To verify that you have installed the image successfully, run ```docker images```. You should see ```creative-difficulty/eucoapi_1``` in the list.
Now type 
 ```bash
docker run -p 8081:8082 -d creative-difficulty/eucoapi_1
 ```
 to run the container.
 Replace ```8082``` with the physical port you want EucoAPI running at and ```8081``` with the virtual port (in the container).
 Your command should be formatted like this: 
 ```bash docker run -p <VIRTUAL PORT>:<PHYSICAL PORT> -d creative-difficulty/eucoapi_1```
 
 to view the console output of EucoAPI, first get its CONTAINER ID (```docker ps```).
 Then run ```docker logs <CONTAINER ID>```.
 To access the API, go to ```http://localhost:<PHYSICAL PORT>``` (if you havent modified anything its ```8082```)
 If you want to make it accessible outside of your network you can [port forward](https://portforward.com) the ```<PHYSICAL PORT>```!
 
 Happy Docking!
