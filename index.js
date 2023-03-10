//===================================================================================================================================
//Wordle Pog - index.js
//Authors: Joshua Lin, Ethan Leung
//Date: 01/19/2023
//JavaScript, VS Code
//===================================================================================================================================

//Variables for setting up a simple server using the Express library in Node.js (import axios, express and cors)
const PORT = 8000;
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

//API request for retrieving a random word
app.get('/word', (req, res) =>{                                                     
    
    const options = {
        method: 'GET',
        url: 'https://random-words5.p.rapidapi.com/getMultipleRandom',
        //1 word, 5 letters long
        params: {count: '1', wordLength: '5'},
        headers: {
          'X-RapidAPI-Key': 'cce7031bb2mshd7bbc8eb567bc2ep142c54jsn05658ee5d167',
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

//API request that sends a query to check if its in the dictionary
app.get('/check', (req, res) =>{                                                
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

//Once server starts running, let the dev know on the console
app.listen(PORT, () => console.log('Server running on port ' + PORT));
