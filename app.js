
startInteraction();
getWordle();

let timer;
const ele = document.getElementById("timer");
let timerON = false;
let sec = 0, minutes = 0;

const guessGrid = document.querySelector("[data-guess-grid]");
const keyboard = document.querySelector("[data-keyboard]");
const wordLength = 5;
const FLIP_ANIMATION_DURATION = 500;
let correctWord;

const winPopup = document.getElementById("win-popup");
const losePopup = document.getElementById("lose-popup");

function getWordle(){                                           //Fetches a random 5 letter word using an API
    fetch('http://localhost:8000/word')
        .then(response => response.json())
        .then(json => {
            console.log(json);
            correctWord = json.toUpperCase();
            document.getElementById('answer-display').InnerHTML = "The answer was: " + correctWord;
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

function playAgain(){
    console.log("Play Again");
    closeWinPopup();
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
    keyboard.classList.remove("disabled");
    startKeyboard();
    getWordle();
    timerON = false;
    minutes = 0;
    sec = 0;
    ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');
}

function startTimer(){
    timer = setInterval(()=>{
        ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');
        if(sec < 59){
            sec++;
        }else{
            sec = 0;
            minutes++;
        }
    }, 1000);
}

function openWinPopup(){
    winPopup.classList.add("open-popup");
}

function closeWinPopup(){
    winPopup.classList.remove("open-popup");
}

function openLosePopup(){
    losePopup.classList.add("open-popup");
}

function closeLosePopup(){
    losePopup.classList.remove("open-popup");
}

function mouseClick(e){                                         //Handles user mouse clicks
    if(e.target.matches("[data-key]")){
        if(!timerON){
            startTimer();
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
            startTimer();
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

function getActiveTiles(){                                           //Function for returning the tiles that currently have letters in them
    return guessGrid.querySelectorAll('[data-state="active"]');
}

function getAllTiles(){
    return guessGrid.querySelectorAll(".tile");
}

function getAllKeys(){
    return keyboard.querySelectorAll(".key");
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
    activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess){
    const letter = tile.dataset.letter.toUpperCase();
    const key = keyboard.querySelector(`[data-key="${letter}"]`);
    setTimeout(() => {                                              //Start flip animation
        tile.classList.add("flip");
    }, index *  FLIP_ANIMATION_DURATION /2);

    tile.addEventListener("transitionend", () => {                  //When flip animation ends, remove the flip animation state
        tile.classList.remove("flip");
        if(correctWord[index] === letter){                          //Check if the letter is in the right spot or not
            tile.dataset.state = "correct";
            key.classList.add("correct");
        }else if(correctWord.includes(letter)){
            tile.dataset.state = "wrong-location";
            key.classList.add("wrong-location");
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
        clearInterval(timer);
        openWinPopup();
        stopKeyboard();
        keyboard.classList.add("disabled");
        return;
    }
    
    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");   //If user has already submitted 6 guesses, then they lose
    if(remainingTiles === 0){
        clearInterval(timer);
        openLosePopup();
        stopKeyboard();
        keyboard.classList.add("disabled");
        return;
    }
}
