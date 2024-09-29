var answer, 
    guess,
    guessVal = "",
    guessNum,
    maxGuesses,
    guessTimeout,
    guessTimerInterval,
    gameTimeout,
    gameTimerInterval;
const statisticsList = document.querySelectorAll(".statisticRow span"),
    settingList = document.querySelectorAll(".settingsRow input"),
    settingsDefault = [6, 0, 0]
    guessTable = document.getElementById("guessTable"), 
    alphabet = document.getElementById("alphabet"),
    wordList = ["about", "other", "which", "their", "there", "first", "would", "these", "click", "price", "state", "email", "world", "music", "after", "video", "where", "books", "links", "years", "order", "items", "group", "under", "games", "could", "great", "hotel", "store", "terms", "right", "local", "those", "using", "phone", "forum", "based", "black", "check", "index", "being", "women", "today", "south", "pages", "found", "house", "photo", "power", "while", "three", "total", "place", "think", "north", "posts", "media", "since", "guide", "board", "white", "small", "times", "sites", "level", "hours", "image", "title", "shall", "class", "still", "money", "every", "visit", "tools", "reply", "value", "press", "learn", "print", "stock", "point", "sales", "large", "table", "start", "model", "human", "movie", "march", "yahoo", "going", "study", "staff", "again", "april", "never", "users", "topic", "below"],
    qwerty = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];

function startup() {
    for (let i = 0; i < settingList.length; i++) {
        settingList[i].onchange = () => {changeSetting(settingList[i].id)};
        settingList[i].value = localStorage.getItem(settingList[i].id) || settingsDefault[i];
        changeSetting(settingList[i].id);
    }
    statisticsList[0].innerText = localStorage.getItem("gamesPlayed") || 0;
    statisticsList[1].innerText = localStorage.getItem("gamesWon") || 0;
    statisticsList[2].innerText = localStorage.getItem("winRate") || "0%";
    setupPlay(null, true);
}

function setupPlay(e, isStartUp) {
    maxGuesses = settingList[0].value;
    guessNum = 0;
    setupGuess();
    setupAlphabet();
    guess.removeEventListener("onclick", setupPlay);
    if (isStartUp) {
        disableSettings(false);
        setupGameResult("startup");
    } else {
        if (answer) {
            updateLastAnswer();
        }
        answer = wordList[Math.floor(Math.random() * 100)];
        guess.unblur = () => {guess.focus()};
        guess.addEventListener("keypress", validateInput);
        guess.focus();
        if (settingList[1].value > 0) {
            settingList[1].parentElement.children[1].innerHTML = settingList[1].value;
            guessTimeout = setTimeout(timedOutGuess, parseInt(settingList[1].value) * 1000);
            guessTimerInterval = setInterval(() => tickTimer(settingList[1].parentElement.children[1]), 1000);
        }
        if (settingList[2].value > 0) {
            settingList[2].parentElement.children[1].innerHTML = settingList[2].value;
            gameTimeout = setTimeout(timedOutGame, parseInt(settingList[2].value) * 1000);
            gameTimerInterval = setInterval(() => tickTimer(settingList[2].parentElement.children[1]), 1000);
        }
    }
}

function setupGuess() {
    guess = document.getElementById("guess");
    if (guess == null) {
        gameResult = document.getElementById("gameResult");
        guess = document.createElement("input");
        guess.type = "text";
        guess.id = "guess";
        guess.pattern = "pattern='[A-Za-z]*'";
        if (gameResult) {
            gameResult.replaceWith(guess);
        } else {
            document.getElementById("game").appendChild(guess);
        }
    }
    guessTable.innerHTML = "";
    for (let i = 0; i < maxGuesses; i++) {
        const row = document.createElement("div");
        row.classList.add("guessRow");
        row.id = "guess" + i;
        guessTable.appendChild(row);
        for (let i = 0; i < 5; i++) {
            const letter = document.createElement("div");
            letter.classList.add("guessLetter");
            row.appendChild(letter);
        }
    }
    disableSettings(true);
}

function setupAlphabet() {
    alphabet.innerHTML = "";
    let alphabetRow;
    for (i = 0; i < 26; i++) {
        if (qwerty[i] === "q" || qwerty[i] === "a" || qwerty[i] === "z") {
            alphabetRow = document.createElement("div");
            alphabetRow.classList.add("alphabetRow");
            alphabet.appendChild(alphabetRow);
        }
        alphabetLetter = document.createElement("div");
        alphabetLetter.classList.add("alphabetLetter");
        alphabetLetter.id = qwerty[i] + "Letter";
        alphabetLetter.innerText = qwerty[i];
        if (qwerty[i] === "a") {
            alphabetLetter.style.marginLeft = "30px";
        } else if (qwerty[i] === "l") {
            alphabetLetter.style.marginRight = "30px";
        } else if (qwerty[i] === "z") {
            alphabetLetter.style.marginLeft = "80px";
        } else if (qwerty[i] === "m") {
            alphabetLetter.style.marginRight = "80px";

        }
        alphabetRow.appendChild(alphabetLetter);
    }
}

function setupGameResult(gameResult) {
    clearTimeout(guessTimeout);
    clearInterval(guessTimerInterval);
    clearInterval(gameTimerInterval);
    result = document.createElement("button");
    result.classList.add(gameResult);
    result.onclick = setupPlay;
    result.innerText = gameResult == "win" ? "you win" : gameResult == "startup" ? "play" : "answer: " + answer;
    result.id = "gameResult";
    guess.replaceWith(result);
    if (gameResult == "startup") {
        return;
    }
    disableSettings(false);
    updateStatistics(gameResult == "win" ? true : false);
}

function validateInput(event) {
    if (event.keyCode === 13 && event.currentTarget.value.length === 5) {
        guess.addEventListener("keyup", performGuess);
    } else if (event.currentTarget.value.length >= 5 && guess.selectionStart - guess.selectionEnd === 0) {
        return event.preventDefault();
    } else if ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)) {
        return;
    } else {
        event.preventDefault();
    }
}

function performGuess() {
    guess.removeEventListener("keyup", performGuess);
    guessVal = guess.value;
    if (answer === guessVal) {
        for (let i = 0; i < 5; i++) {
            writeLetter(guessTable.children[guessNum].children[i], guessVal[i], "correct");
        }
        setupGameResult("win");
    } else {
        let correctLetters = [];
        for (let i = 0; i < 5; i++) {
            if (guessVal.charCodeAt(i) >= 65 && guessVal.charCodeAt(i) <= 90) {
                guessVal = guessVal.slice(0, i) + String.fromCharCode(guessVal.charCodeAt(i) + 32) + guessVal.slice(i + 1);
            }
            if (guessVal[i] == answer[i]) {
                correctLetters.push(i);
            }
        }
        for (let i = 0; i < 5; i++) {
            let status = "";
            if (guessVal[i] == answer[i]) {
                status = "correct";
            } else if (answer.indexOf(guessVal[i]) == -1) {
                status = "incorrect";
            } else {
                const answerCharFreq = buildCharFreq(answer, correctLetters), guessCharIndex = buildCharFreq(guessVal.slice(0, i + 1), correctLetters);
                if (guessCharIndex[guessVal[i]] <= answerCharFreq[guessVal[i]]) {
                    status = "found";
                } else {
                    status = "incorrect";
                }
            }
            writeLetter(guessTable.children[guessNum].children[i], guessVal[i], status);
        }
        guessNum += 1;
        if (guessNum >= maxGuesses) {
            setupGameResult("lose");
        } else {
            guess.value = "";
            if (settingList[1].value > 0) {
                clearInterval(guessTimeout);
                clearInterval(guessTimerInterval);
                settingList[1].parentElement.children[1].innerHTML = settingList[1].value;
                guessTimeout = setTimeout(timedOutGuess, parseInt(settingList[1].value) * 1000);
                guessTimerInterval = setInterval(() => tickTimer(settingList[1].parentElement.children[1]), 1000);
            }
        }
    }
}

function timedOutGuess() {
    clearInterval(guessTimerInterval);
    guessVal = "-----";
    for (let i = 0; i < 5; i++) {
        writeLetter(guessTable.children[guessNum].children[i], guessVal[i], "incorrect");
    }
    guessNum += 1;
    if (guessNum >= maxGuesses) {
        settingList[1].parentElement.children[1].innerHTML = 0;
        clearInterval(guessTimeout);
        clearInterval(gameTimerInterval);
        setupGameResult("lose");
    } else {
        settingList[1].parentElement.children[1].innerHTML = settingList[1].value;
        guessTimeout = setTimeout(timedOutGuess, parseInt(settingList[1].value) * 1000);
        guessTimerInterval = setInterval(() => tickTimer(settingList[1].parentElement.children[1]), 1000);
    }
}

function timedOutGame() {
    clearInterval(guessTimeout);
    clearInterval(guessTimerInterval);
    clearInterval(gameTimerInterval);
    settingList[2].parentElement.children[1].innerHTML = 0;
    guessVal = guessVal != "" ? guessVal : "-----";
    setupGameResult("lose");
}

function tickTimer(element) {
    element.innerText = parseInt(element.innerText) - 1;
}

function buildCharFreq(str, correctLetters) {
    let charFreq = {};
    for (let i = 0; i < str.length; i++) {
        if (!correctLetters.includes(i)) {
            charFreq[str[i]] = (charFreq[str[i]] || 0) + 1;
        }
    }
    return charFreq;
}

function writeLetter(element, value, status) {
    element.innerText = value;
    element.classList.add(status);
    element.style.fontWeight = 'bold';
    if (value != "-" && element.classList.contains("guessLetter")) {
        updateAlphabet(value, status);
    }
}

function updateAlphabet(value, status) {
    let letter = document.getElementById(value + "Letter");
    if ((status === "incorrect" && (letter.classList.contains("correct") || letter.classList.contains("found"))) || (status === "found" && letter.classList.contains("correct"))) {
        return;
    } else if (status === "correct") {
        letter.classList.remove("found");
        letter.classList.remove("incorrect");
    } else if (status === "found") {
        letter.classList.remove("incorrect");
    }
    letter.classList.add(status);
}

function updateStatistics(isWin) {
    statisticsList[0].innerText = parseInt(statisticsList[0].innerText) + 1;
    localStorage.setItem("gamesPlayed", statisticsList[0].innerText);
    statisticsList[1].innerText = isWin ? parseInt(statisticsList[1].innerText) + 1 : statisticsList[1].innerText;
    localStorage.setItem("gamesWon", statisticsList[1].innerText);
    statisticsList[2].innerText = (parseFloat(statisticsList[1].innerText) / parseFloat(statisticsList[0].innerText) * 100).toFixed(2) + "%";
    localStorage.setItem("winRate", statisticsList[2].innerText);
}

function updateLastAnswer() {
    statisticsList[3].innerHTML = "";
    for (let i = 0; i < 5; i++) {
        let letter = document.createElement("span");
        statisticsList[3].appendChild(letter);
    }
    if (answer === guessVal) {
        for (let i = 0; i < 5; i++) {
            writeLetter(statisticsList[3].children[i], answer[i], "correct");
        }
    } else {
        let correctLetters = [];
        for (let i = 0; i < 5; i++) {
            if (guessVal[i] == answer[i]) {
                correctLetters.push(i);
            }
        }
        for (let i = 0; i < 5; i++) {
            let status = "";
            if (answer[i] == guessVal[i]) {
                status = "correct";
            } else if (guessVal.indexOf(answer[i]) == -1) {
                status = "incorrect";
            } else {
                const guessCharFreq = buildCharFreq(guessVal, correctLetters), answerCharIndex = buildCharFreq(answer.slice(0, i + 1), correctLetters);
                if (answerCharIndex[answer[i]] <= guessCharFreq[answer[i]]) {
                    status = "found";
                } else {
                    status = "incorrect";
                }
            }
            writeLetter(statisticsList[3].children[i], answer[i], status);
        }
    }
}

function changeSetting(setting) {
    switch (setting) {
        case "maxGuesses": 
            if (settingList[0].value <= 0) {
                settingList[0].value = 1;
            } else if (settingList[0].value > 20) {
                settingList[0].value = 20;
            }
            localStorage.setItem(setting, settingList[0].value);
            setupPlay(null, true);
            break;
        case "guessTimeLimit": 
            if (settingList[1].value <= 0) {
                settingList[1].value = 0;
                settingList[1].parentElement.children[1].innerHTML = "∞"
            } else {
                settingList[1].parentElement.children[1].innerHTML = settingList[1].value;
            }
            localStorage.setItem(setting, settingList[1].value);
            break;
        case "gameTimeLimit": 
            if (settingList[2].value <= 0) {
                settingList[2].value = 0;
                settingList[2].parentElement.children[1].innerHTML = "∞"
            } else {
                settingList[2].parentElement.children[1].innerHTML = settingList[2].value;
            }
            localStorage.setItem(setting, settingList[2].value);
                break;
    }
}

function disableSettings(isDisable) {
    for (let i = 0; i < settingList.length; i++) {
        settingList[i].disabled = isDisable;
    }
}

addEventListener("DOMContentLoaded", startup);