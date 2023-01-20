//===================================================================================================================================
//Wordle Pog - app.js
//Authors: Joshua Lin, Ethan Leung
//Date: 01/19/2023
//JavaScript, VS Code
//===================================================================================================================================
//Problem Definition: In spite of its phenomenal initial success, New York Times’ hit 
//                    game Wordle began to stagnate as quickly as it came to fame. Commonly used as an 
//                    icebreaker and a great way to test English vocabulary, many people came to love the 
//                    simple yet fun game, but its popularity did not last. With no updates to its core gameplay 
//                    since its inception, the game became lacking and players quickly grew bored of the game. 
//                    This comes as no surprise, as games with as little depth as the original Wordle become rather 
//                    repetitive. As such, we decided to take matters into our own hands by redesigning the classic 
//                    to include mechanics that transform Wordle into something fresh and different. Users will find 
//                    that our spin on Wordle, named Wordle POG (Player Oriented Gameplay), will focus on our 
//                    players’ growth and entertainment. We believe that this variation of Wordle will encourage 
//                    players to dig deeper into their knowledge of English vocabulary and inspire them to learn new 
//                    one’s as they play through the game. By implementing daily challenges, unlimited replays, timed runs, 
//                    and competitive gameplay, our hope is to reignite the passion that people once had for Wordle. 
//===================================================================================================================================

//Declare variables for timers
let timer;
let challengeTimer;
const ele = document.getElementById("timer");
let timerON = false;
let challengeMode = false;
let sec = 0, minutes = 0;

//Declare other game variables
const wordLength = 5;
const FLIP_ANIMATION_DURATION = 500;
let correctWord;
let wordVis = [false, false, false, false, false];
let letterMap = new Map();

//Declare grid and keyboard variables
const guessGrid = document.querySelector("[data-guess-grid]");
const keyboard = document.querySelector("[data-keyboard]");

//Declare popup menu variables
const winPopup = document.getElementById("win-popup");
const losePopup = document.getElementById("lose-popup");
const challengePopup = document.getElementById("challenge-popup");
const answerDisplay = document.getElementById("answer-display");

//Start Program, allow user input and fetch a word
startInteraction();
getWordle();

/**letterCount method
* Function for counting the number of times a letter appears in the correct word, prevents double character bugs
* 
* List of Local Variables
* count - variable that keeps track of how many times the letter appears
* @param <type char>
* @return int
*/
function letterCount(letter){
    let count = 0;
    for(let k = 0; k<correctWord.length; k++){
       if(correctWord[k] === letter){
            count++;
       }
    }
    return count;
}

/**getWordle method
* Function fetches a random 5 letter word using an API
* 
* @param N/A
* @return void
*/
function getWordle(){                                         
    fetch('http://localhost:8000/word')
        .then(response => response.json())
        .then(json => {    
            console.log(json);
            correctWord = json.toUpperCase();
            answerDisplay.textContent = "The answer was: " + correctWord;
        })
        .catch(err => console.log(err))
}

/**startInteraction method
* Sets up event listerns for keyboard and mouse clicks
* 
* @param N/A
* @return void
*/
function startInteraction(){
    document.addEventListener("click", mouseClick);
    document.addEventListener("keydown", keyPress);
}

/**stopInteraction method
* Removes event listerns for keyboard and mouse clicks
* 
* @param N/A
* @return void
*/
function stopInteraction(){
    document.removeEventListener("click", mouseClick);
    document.removeEventListener("keydown", keyPress);
}

/**stopKeyboard method
* Removes event listeners for just the keyboard
* 
* @param N/A
* @return void
*/
function stopKeyboard(){
    document.removeEventListener("keydown", keyPress);
}

/**startKeyboard method
* Sets up event listeners for just the keyboard
* 
* @param N/A
* @return void
*/
function startKeyboard(){
    document.addEventListener("keydown", keyPress);
}

/**openWinPopup method
* Function for making the win popup visible
* 
* @param N/A
* @return void
*/
function openWinPopup(){
    winPopup.classList.add("open-popup");
    stopKeyboard();
    keyboard.classList.add("disabled");
    //Resets timers
    clearInterval(timer);
    clearInterval(challengeTimer);
    timerON = false;
}
/**closeWinPopup method
* Function that hides the win popup
* 
* @param N/A
* @return void
*/
function closeWinPopup(){
    winPopup.classList.remove("open-popup");
}

/**openLosePopup method
* Function that makes the lose popup visible
* 
* @param N/A
* @return void
*/
function openLosePopup(){
    losePopup.classList.add("open-popup");
    stopKeyboard();
    keyboard.classList.add("disabled");
    //Resets timers
    clearInterval(timer);
    clearInterval(challengeTimer);
    timerON = false;
}

/**closeLosePopup method
* Function that hides the lose popup
* 
* @param N/A
* @return void
*/
function closeLosePopup(){
    losePopup.classList.remove("open-popup");
}

/**openChallengePopup method
* Function that makes the challenge popup visible
* 
* @param N/A
* @return void
*/
function openChallengePopup(){
    challengePopup.classList.add("open-popup");
    stopKeyboard();
    keyboard.classList.add("disabled");
}

/**closeChallengePopup method
* Function that hides the challenge popup
* 
* @param N/A
* @return void
*/
function closeChallengePopup(){
    challengePopup.classList.remove("open-popup");
    startKeyboard();
    keyboard.classList.remove("disabled");
}

/**getActiveTiles method
* Function that returns the data of all the typable tiles that currently have letters in them
* 
* @param N/A
* @return NodeList
*/
function getActiveTiles(){
    return guessGrid.querySelectorAll('[data-state="active"]');
}

/**getAllTiles method
* Function that returns all data of the tiles in the grid
* 
* @param N/A
* @return NodeList
*/
function getAllTiles(){
    return guessGrid.querySelectorAll(".tile");
}

/**getAllKeys method
* //Function that returns all the data of the keys in the keyboard
* 
* @param N/A
* @return NodeList
*/
function getAllKeys(){
    return keyboard.querySelectorAll(".key");
}

/**getAllKeys method
* //Function that returns all the data of the keys in the keyboard
* 
* @param N/A
* @return NodeList
*/
//Function that switches the game to challenge mode
function startChallenge(){
    //Reset Timers
    clearInterval(timer);
    clearInterval(challengeTimer);
    //Reset game state 
    playAgain();
    challengeMode = true;
    sec = 30;
    //Update timer value
    ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');
}

/**playAgain method
* Function that resets the game state back to default to allow the user to play again
* 
* List of Local Variables
* allTiles - An array that holds all the data of the guessGrid
* allKeys - An array that holds all the data of the keys
* @param N/A
* @return void
*/
function playAgain(){
    console.log("Play Again");
    
    //Close menus
    closeWinPopup();
    closeLosePopup();

    //Reset all data in grid and keyboard
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

    //Fetch a new word
    getWordle();
    //Re-enable keyboard
    keyboard.classList.remove("disabled");
    startKeyboard();

    //Reset timers
    clearInterval(challengeTimer);
    clearInterval(timer);
    timerON = false;
    minutes = 0;
    sec = 0;
    ele.innerHTML = minutes + ':' + sec.toString().padStart(2, '0');

    //Exit challenge mode
    challengeMode = false;
}

/**startTimer method
* Function that initializes normal game timer
* 
* @param N/A
* @return void
*/
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

/**startChallengeTimer method
* Function that initializes challenge mode game timer
* 
* @param N/A
* @return void
*/
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

/**mouseClick method
* Function that handles user mouse clicks
* 
* @param <type pointerEvent>
* @return void
*/
function mouseClick(e){
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

/**keyPress method
* Function that handles user keyboard input
* 
* @param <type pointerEvent>
* @return void
*/
function keyPress(e){
    //if the key pressed is in between a-z, case insensitive
    if(e.key.match(/^[a-z]$/) || e.key.match(/^[A-Z]$/)){
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

/**printKey method
* Function that Prints user input into grid
* 
* List of Local Variables
* activeTiles - A nodelist that holds all the data of the active tiles
* nextTile - An element of the next empty tile
* @param - <type char>
* @return void
*/
function printKey(key){
    const activeTiles = getActiveTiles();
    //Don't allow the user to type more than 5 letters at a time
    if(activeTiles.length >= wordLength){return;}
    //Make the next selected tile the first one without a data letter in it
    const nextTile = guessGrid.querySelector(":not([data-letter])");  
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key;
    nextTile.dataset.state = "active";
}

/**deleteKey method
* Function for deleting keys when user hits backspace
* 
* List of Local Variables
* activeTiles - A nodelist that holds all the data of the active tiles
* lastTile - An element that holds the data of the last tile in activeTiles
* @param N/A
* @return void
*/
function deleteKey(){
    const activeTiles = getActiveTiles();
    const lastTile = activeTiles[activeTiles.length - 1];
    //Once there are no longer any active tiles, don't allow user to backspace
    if(lastTile == null){return;}
    lastTile.textContent = "";
    delete lastTile.dataset.state;
    delete lastTile.dataset.letter;
}

/**checkGuess method
* Function that checks if the submitted guess is an actual word using an API
* 
* List of Local Variables
* activeTiles - A nodelist that holds all the data of the active tiles
* guess - A String that contains the user's submitted guess
* @param N/A
* @return void
*/
function checkGuess(){                                              
    const activeTiles = [...getActiveTiles()];
    //Returns if the word is not long enough
    if(activeTiles.length !== wordLength){                          
        console.log("Not long enough");
        return;
    }

    //Turns current active tiles into a string variable
    const guess = activeTiles.reduce((word, tile) =>{               
        return word + tile.dataset.letter;
    }, "");

    fetch('http://localhost:8000/check/?word=' + guess)
        .then(response => response.json())
        .then(json => {
            console.log(json);
            //If submitted guess is not an actual word, then return
            //If submitted guess is a word, call a function that submits the guess
            if(json === 'Entry word not found'){                    
                return;
            }else{
                console.log('guess submitted');                     
                submitGuess(guess);
            }
        })
}

/**submitGuess method
* Function that calls the flipTile function for each active tile
* 
* List of Local Variables
* activeTiles - A nodelist that holds all the data of the active tiles
* temp - A variable that temporarily holds the char value of a certain index of the correctWord
* @param <type String>
* @return void
*/
function submitGuess(guess){                                        
    const activeTiles = [...getActiveTiles()];
    //Stops user input
    stopInteraction();
    //Initializes lettercount HashMap for game logic
    for(let k = 0; k<correctWord.length; k++){
        let temp = correctWord[k];
        letterMap.set(temp, letterCount(temp));
    }
    activeTiles.forEach((...params) => flipTile(...params, guess));
}

/**flipTile method
* Function that starts flip animation and checks letter positions
* 
* List of Local Variables
* letter - variable that holds the character data of the tile
* key - variable that holds the key data of the key that corresponds with the letter
* a - variable that holds the character data of the correct word
* temp - a variable that temporarily holds a value of a certain key in letterMap
* @param <type element, type int, type char[], type String>
* @return void
*/
function flipTile(tile, index, array, guess){
    //declare variable that holds the character data of the tile
    const letter = tile.dataset.letter.toUpperCase();
    //declare variable that holds the key data of the key that corresponds with the letter
    const key = keyboard.querySelector(`[data-key="${letter}"]`);
    //declare variable that holds the character data of the correct word
    const a = correctWord[index];

    //Start flip animation
    setTimeout(() => {
        tile.classList.add("flip");
    }, index *  FLIP_ANIMATION_DURATION /2);

    console.log(a + " " + letterMap.get(a));

    //When flip animation ends, remove the flip animation state and check if it is in the right position or not
    tile.addEventListener("transitionend", () => {                  
        tile.classList.remove("flip");

        //Check if the letter is in the right spot or not, if the first index of the guess corresponds to the first index of the correct word, and the letter has not been checked yet
        if(a === letter && letterMap.get(a) !== 0){                          
            tile.dataset.state = "correct";
            key.classList.add("correct");
            //Update lettercount hashmap to indicate that this letter can be visited 1 less time
            let temp = letterMap.get(letter) - 1;
            letterMap.set(letter, temp)
            console.log(letter + " " + letterMap.get(a));
        //Check if the letter exists in the correct word, and if the letter can still be visited
        }else if(correctWord.includes(letter) && letterMap.get(letter) !== 0){
            tile.dataset.state = "wrong-location";
            key.classList.add("wrong-location");
            //Update lettercount hashmap to indicate that this letter can be visited 1 less time
            let temp = letterMap.get(letter) - 1;
            letterMap.set(letter, temp)
            console.log(letter + " " + letterMap.get(letter));
        //If neither, then the letter is not in the word
        }else{                                                      
            tile.dataset.state = "wrong";
            key.classList.add("wrong");
        }
        //Once all 5 letters have been flipped and updated, restart user interaction and check if the user has won
        if(index === array.length - 1){                             
            tile.addEventListener("transitionend", () => {
                startInteraction();
                checkWinLose(guess);
            }, {once: true});
        }
    }, {once: true});
}

/**checkWinLose method
* Function that checks if the user has won or lost after each guess
* 
* List of Local Variables
* remainingTiles - a nodelist that holds all the data of the empty tiles
* @param <type String> 
* @return void
*/
function checkWinLose(guess){
    //If submitted guess matches with the correct word, they win
    if(guess.toUpperCase() === correctWord){                                    
        openWinPopup();
        return;
    }
    
    //If user has already submitted 6 guesses, then they lose
    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");   
    if(remainingTiles.length === 0){
        openLosePopup();
        return;
    }
}
