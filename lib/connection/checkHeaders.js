import getUUIDs from "./getUUIDs.js";

export default async function checkHeaders(headers) {
    console.log(headers["authentication"])
    const uuids = await getUUIDs();
    for(var i = 0; i < uuids.length; i++) {
        if(headers["authentication"] === uuids[i]) {
            return true;
        }
    }
    return false;
}