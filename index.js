const PORT = 8000;
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.get('/word', (req, res) =>{                                                     //API request for retrieving a random word
    
    const options = {
    method: 'GET',
    url: 'https://random-words5.p.rapidapi.com/getMultipleRandom',
    params: {count: '1', wordLength: '5'},
    headers: {
        'X-RapidAPI-Key': '07a6470341msh12490ac7802a581p15745ajsn077fbe14954a',
        'X-RapidAPI-Host': 'random-words5.p.rapidapi.com'
    }
    };

    axios.request(options).then((response) =>{
        console.log(response.data);
        res.json(response.data[0]);
    }).catch((error) =>{
        console.error(error);
    });
});

app.get('/check', (req, res) =>{                                                //API request that sends a query to check if its in the dictionary
    const word = req.query.word;

    const options = {
    method: 'GET',
    url: 'https://twinword-word-graph-dictionary.p.rapidapi.com/association/',
    params: {entry: word},
    headers: {
        'X-RapidAPI-Key': '07a6470341msh12490ac7802a581p15745ajsn077fbe14954a',
        'X-RapidAPI-Host': 'twinword-word-graph-dictionary.p.rapidapi.com'
    }
    };

    axios.request(options).then((response) => {
        console.log(response.data);
        res.json(response.data.result_msg);
    }).catch((error) => {
        console.error(error);
    });
});
    
app.listen(PORT, () => console.log('Server running on port ' + PORT));