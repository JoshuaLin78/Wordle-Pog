let timer;
let challengeTimer;
const ele = document.getElementById("timer");
let timerON = false;
let challengeMode = false;
let sec = 0, minutes = 0;

const wordLength = 5;
const FLIP_ANIMATION_DURATION = 500;
let correctWord;
let wordVis = [false, false, false, false, false];
let letterMap = new Map();

const guessGrid = document.querySelector("[data-guess-grid]");
const keyboard = document.querySelector("[data-keyboard]");

const winPopup = document.getElementById("win-popup");
const losePopup = document.getElementById("lose-popup");
const challengePopup = document.getElementById("challenge-popup");
const answerDisplay = document.getElementById("answer-display");

startInteraction();
getWordle();

function letterCount(letter){
    let count = 0;
    for(let k = 0; k<correctWord.length; k++){
       if(correctWord[k] === letter){
            count++;
       }
    }
    return count;
}

function getWordle(){                                           //Fetches a random 5 letter word using an API
    fetch('http://localhost:8000/word')
        .then(response => response.json())
        .then(json => {
            console.log(json);
            correctWord = json.toUpperCase();
            answerDisplay.textContent = "The answer was: " + correctWord;
        })
        .catch(err => console.log(err))
}

function startInteraction(){                                    //Constantly checks for user interaction
    document.addEventListener("click", mouseClick);
    document.addEventListener("keydown", keyPress);
}

function stopInteraction(){                                     //Stops user interaction
    document.removeEventListener("click", mouseClick);
    document.removeEventListener("keydown", keyPress);
}

function stopKeyboard(){
    document.removeEventListener("keydown", keyPress);
}

function startKeyboard(){
    document.addEventListener("keydown", keyPress);
}

function openWinPopup(){
    winPopup.classList.add("open-popup");
    stopKeyboard();
    keyboard.classList.add("disabled");
    clearInterval(timer);
    clearInterval(challengeTimer);
    timerON = false;
}

function closeWinPopup(){
    winPopup.classList.remove("open-popup");
}

function openLosePopup(){
    losePopup.classList.add("open-popup");
    stopKeyboard();
    keyboard.classList.add("disabled");
    clearInterval(timer);
    clearInterval(challengeTimer);
    timerON = false;
}

function closeLosePopup(){
    losePopup.classList.remove("open-popup");
}

function openChallengePopup(){
    challengePopup.classList.add("open-popup");
    stopKeyboard();
    keyboard.classList.add("disabled");
}

function closeChallengePopup(){
    challengePopup.classList.remove("open-popup");
    startKeyboard();
    keyboard.classList.remove("disabled");
}

function getActiveTiles(){                                           //Function for returning the tiles that currently have letters in them
    return guessGrid.querySelectorAll('[data-state="active"]');
}

function getAllTiles(){
    return guessGrid.querySelectorAll(".tile");
}

function getAllKeys(){
    return keyboard.querySelectorAll(".key");
}

function startChallenge(){
    clearInterval(timer);
    clearInterval(challengeTimer);
    playAgain();
    challengeMode = true;
    sec = 30;
    ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');
}

function playAgain(){
    clearInterval(challengeTimer);
    clearInterval(timer);
    console.log("Play Again");
    closeWinPopup();
    closeLosePopup();
    const allTiles = [...getAllTiles()];
    const allKeys = [...getAllKeys()];
    for(let k = 0; k<allTiles.length; k++){
        delete allTiles[k].dataset.state;
        delete allTiles[k].dataset.letter;
        allTiles[k].textContent = "";
    }
    for(let k = 0; k<allKeys.length; k++){
        allKeys[k].classList.remove("correct");
        allKeys[k].classList.remove("wrong-location");
        allKeys[k].classList.remove("wrong");
    }

    getWordle();
    keyboard.classList.remove("disabled");
    startKeyboard();
    timerON = false;
    challengeMode = false;
    minutes = 0;
    sec = 0;
    ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');

}

function startTimer(){
    timer = setInterval(()=>{
        sec++;
        if(sec === 60){
            sec = 0;
            minutes++;
        }
        ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');
    }, 1000);
}

function startChallengeTimer(){
    challengeTimer = setInterval(()=>{
        sec--;
        if(sec === 0){
            ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');
            clearInterval(challengeTimer);
            openLosePopup();
        }
        ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');
    }, 1000);
}
function mouseClick(e){                                         //Handles user mouse clicks
    if(e.target.matches("[data-key]")){
        if(!timerON){
            if(challengeMode){
                startChallengeTimer();
            }else{
                startTimer();
            }
            timerON = true;
        }
        printKey(e.target.dataset.key);
        return;
    }

    if(e.target.matches("[data-enter]")){
        checkGuess();
        return;
    }

    if(e.target.matches("[data-delete]")){
        deleteKey();
        return;
    }
}

function keyPress(e){                                          //Handles user keyboard input
    if(e.key.match(/^[a-z]$/) || e.key.match(/^[A-Z]$/)){      //if the key pressed is in between a-z, case insensitive
        if(!timerON){
            if(challengeMode){
                startChallengeTimer();
            }else{
                startTimer();
            }
            timerON = true;
        }
        printKey(e.key.toLowerCase());
        return;
    }

    if(e.key === "Enter"){
        checkGuess();
        return;
    }

    if(e.key === "Backspace" || e.key === "Delete"){
        deleteKey();
        return;
    }
}

function printKey(key){                                              //Prints user input into grid
    const activeTiles = getActiveTiles();
    if(activeTiles.length >= wordLength){return;}
    const nextTile = guessGrid.querySelector(":not([data-letter])"); //Make the next selected tile the first one without a data letter in it
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = "active";
}

function deleteKey(){                                               //Function for deleting keys when user hits backspace
    const activeTiles = getActiveTiles();
    const lastTile = activeTiles[activeTiles.length - 1];
    if(lastTile == null){return;}
    lastTile.textContent = "";
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;
}

function checkGuess(){                                              //Checks if the submitted guess is an actual word using an API
    const activeTiles = [...getActiveTiles()];
    if(activeTiles.length !== wordLength){                          //Returns if the word is not long enough
        console.log("Not long enough");
        return;
    }

    const guess = activeTiles.reduce((word, tile) =>{               //Turns current active tiles into a string variable
        return word + tile.dataset.letter;
    }, "");

    fetch('http://localhost:8000/check/?word=' + guess)
        .then(response => response.json())
        .then(json => {
            console.log(json);
            if(json === 'Entry word not found'){                    //If submitted guess is not an actual word, then return
                return;
            }else{
                console.log('guess submitted');                     //If submitted guess is a word, call a function that submits the guess
                submitGuess(guess);
            }
        })
}

function submitGuess(guess){                                        //Function that calls the flipTile function for each active tile
    const activeTiles = [...getActiveTiles()];
    stopInteraction();
    for(let k = 0; k<correctWord.length; k++){
        let temp = correctWord[k];
        letterMap.set(temp, letterCount(temp));
    }
    for (var [key, value] of letterMap) {
        console.log(key + " = " + value);
    }
    activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess){
    const letter = tile.dataset.letter.toUpperCase();
    const key = keyboard.querySelector(`[data-key="${letter}"]`);
    const a = correctWord[index];
    setTimeout(() => {                                              //Start flip animation
        tile.classList.add("flip");
    }, index *  FLIP_ANIMATION_DURATION /2);

    console.log(a + " " + letterMap.get(a));
    console.log(letterMap.get(a) !== 0);

    tile.addEventListener("transitionend", () => {                  //When flip animation ends, remove the flip animation state
        tile.classList.remove("flip");
        if(a === letter && letterMap.get(a) !== 0){                          //Check if the letter is in the right spot or not
            tile.dataset.state = "correct";
            key.classList.add("correct");
            let temp = letterMap.get(letter) - 1;
            letterMap.set(letter, temp)
            console.log(letter + " " + letterMap.get(a));
        }else if(correctWord.includes(letter) && letterMap.get(a) !== 0){
            tile.dataset.state = "wrong-location";
            key.classList.add("wrong-location");
            let temp = letterMap.get(letter) - 1;
            letterMap.set(letter, temp)
            console.log(letter + " " + letterMap.get(a));
        }else{                                                      //If not, then the letter is not in the word
            tile.dataset.state = "wrong";
            key.classList.add("wrong");
        }

        if(index === array.length - 1){                             //Once all 5 letters have been flipped and updated, restart user interaction and check if the user has won
            tile.addEventListener("transitionend", () => {
                startInteraction();
                checkWinLose(guess, array);
            }, {once: true});
        }
        
    }, {once: true});
}

function checkWinLose(guess, tiles){
    if(guess.toUpperCase() === correctWord){                                    //If submitted guess matches with the correct word, they win
        openWinPopup();
        return;
    }
    
    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");   //If user has already submitted 6 guesses, then they lose
    console.log(remainingTiles);
    if(remainingTiles.length === 0){
        openLosePopup();
        return;
    }
}
