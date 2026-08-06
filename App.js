const request  = require('request');

const url = 'https://api.weatherstack.com/current?access_key=1d52082d523753a40f55caf888e653f8&query=-1.286389,2036.817223'

request({ url:url}, (error, response) => {
    const data = JSON.parse(response.body)
    console.log(data)
})

const getDataFromApi= async (url)=>{
    try{
        let result = await requestPromise(url);
         return JSON.parse(result);
    }catch(err){
        throw err;
    }
}

  


