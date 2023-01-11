const router = require('express').Router();
const axios = require("axios");
const redis = require('redis');

let redisClient;

(async () => {
    redisClient = redis.createClient();

    redisClient.on('error', (error) => console.log(error));

    await redisClient.connect();
})();


async function fetchData(species) {
    const apiResponse = await axios.get(
      `https://www.fishwatch.gov/api/species/${species}`
    );
    console.log("Request sent to the API");
    return apiResponse.data;
}

router.get('/:species', async (req, res) => {
    try {
        let fromCache = false;
        const species = req.params.species;
        let data;
        const cachedResults = await redisClient.get(species);
        if (cachedResults){
            fromCache = true;
            data = cachedResults;
        } else {
            data = await fetchData(species);
            await redisClient.set(species, JSON.stringify(data), {EX: 60, NX: true});
        }
        res.json({fromCache: fromCache, data: data});       
    } catch (err){
        res.status(404).json({message: err.message});
    }    
});

module.exports = router;