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