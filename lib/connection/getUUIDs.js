import * as fs from 'fs/promises';

import checkUsersCorruption from '../util/checkUsersCorruption.js';
import path from "path";

const __dirname = path.resolve()

export default async function getUUIDs() {
    let uuids = [];
    var usersFile = await fs.readFile(path.join(__dirname, "users.json"), "utf-8")

    try {
        usersFile = JSON.parse(usersFile);
    } catch(e) {
        await checkUsersCorruption();
    }
    
    for (var i = 0; i < usersFile.length; i++){
        var obj = usersFile[i];
        if(obj["has-access"] === true) {
            uuids.push(obj["token"]);
        }
    }
    return uuids;
}

