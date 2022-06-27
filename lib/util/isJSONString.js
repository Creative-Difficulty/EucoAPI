
/**
@function isJsonString
@param {String}
@returns {Promise<boolean>} Boolean that idicates whether the provided string is valid JSON
@version 0.0.3
@author Creative-Difficulty
*/
export default function isJsonString(str) {
    return new Promise((resolve, reject) => {
        try {
            JSON.parse(str);
            resolve(true);
        } catch (e) {
            resolve(false);
        }
    })
}