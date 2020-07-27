// Define variables for ranking.
let LEVEL_PERCENTS = [0.7, 0.55, 0.4, 0.25, 0.2, 0.15, 0.1, 0.05, 0];
let LEVEL_NAMES = [
  "Genius",
  "Exceptional",
  "Fabulous",
  "Superb",
  "Very Good",
  "Good",
  "Okay",
  "Novice",
  "Beginner",
];

if (hmm()) {
  LEVEL_NAMES = [
    "!!!",
    "You Rock",
    "Amazing",
    "Delightful",
    "How Nice",
    "Talented",
    "Rising Up",
    "Intrepid",
    "Beginner",
  ];
}

// Get progress rank number, where 8 is lowest (Beginner) and 0 is highest (Genius).
function getRankNumber(progress) {
  for (i of Array(LEVEL_PERCENTS.length)
  .fill()
  .map((x, i) => i)) {
    if (progress >= Math.floor(window.game.total_score * LEVEL_PERCENTS[i])) {
      return i;
    }
  }
}

// Change progress bar progress.
function changeProgress(progress) {
  let maximum = window.game.total_score;
  for (i of Array(LEVEL_PERCENTS.length)
    .fill()
    .map((x, i) => i)) {
    if (progress >= Math.floor(maximum * LEVEL_PERCENTS[i])) {
      element("progress-name").textContent = LEVEL_NAMES[i];
      element("progress-current-score").textContent = progress;
      element("progress-current").style.left = `calc(${9 - i - 1} * 100% / 9)`;
      let dots = element("progress-dots").children;
      for (j of Array(LEVEL_PERCENTS.length)
        .fill()
        .map((x, i) => i)) {
        let dot = dots[j].children[0];
        if (j < 9 - i - 1) {
          dot.classList.remove("progress-incomplete");
          dot.classList.add("progress-complete");
        } else {
          dot.classList.remove("progress-complete");
          dot.classList.add("progress-incomplete");
        }
      }

      // Trigger victory if we get to the highest rank.
      if (progress == maximum && window.game.show_all_popup) {
        showAllPopup();
        window.game.showVictoryPopup = false;
      } else if (i == 0 && window.game.show_victory_popup) {
        showVictoryPopup();
      }

      break;
    }
  }
}

// Capitalize initial letter for formatting.
function capitalizeInitial(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Enter word.
function addWordToEntered(word) {
  let entered_words = element("entered-words");
  if (window.game.entered.length == 0) {
    entered_words.textContent = "";
    entered_words.classList.remove("entered-words-start");
  }
  window.game.entered.push(word.toUpperCase());

  let elem = document.createElement("span");
  elem.classList.add("entered-word");
  elem.textContent = capitalizeInitial(word);
  if (isPangram(word)) {
    elem.classList.add("highlight-background");
    elem.style.color = "var(--color-text-gray-highlight)";
  }
  entered_words.insertBefore(elem, entered_words.firstChild);
  setCookie();
}

// Populate entered word display from array.
function populateEnteredWords(arr) {
  // Reset words.
  let entered_words = element("entered-words");
  entered_words.textContent = "";
  for (word of arr) {
    let elem = document.createElement("span");
    elem.classList.add("entered-word");
    elem.textContent = capitalizeInitial(word);
    if (isPangram(word)) {
      elem.classList.add("highlight-background");
      elem.style.color = "var(--color-text-gray-highlight)";
    }
    entered_words.insertBefore(elem, entered_words.firstChild);
  }
}

// Populate entered word display from array, alphabetizing first.
function populateAlphabetizedWords(arr) {
  let arr_copy = arr.slice(); // make copy to not modify original.
  arr_copy.sort();
  arr_copy.reverse(); // in reverse order due to how words are entered.
  populateEnteredWords(arr_copy);
}

// Load words from cookie, if cookie exists.
function addWordsToEntered() {
  let cookie_entered = getCookie();
  if (cookie_entered !== null) {
    window.game.entered = getCookie();
    window.game.current_score = 0;
    populateEnteredWords(cookie_entered);
    for (word of window.game.entered) {
      window.game.current_score += getScore(word);
    }
    changeProgress(window.game.current_score);
  }
}

// Set up dropdown.
function setUpDropdown() {
  let entered_words = element("entered-words");

  if (window.game.entered.length == 0) {
    entered_words.textContent = "Your words...";
    entered_words.classList.add("entered-words-start");
  }
  let chevron = element("entered-toggle");
  chevron.onclick = toggleEnteredDropdown;
  entered_words.onclick = toggleEnteredDropdown;
}

// Toggle entered dropdown.
function toggleEnteredDropdown() {
  let chevron = element("entered-toggle");
  let entered_words = element("entered-words");
  let entered_container = element("entered-container");
  let below_entered = element("below-entered-container");
  if (!chevron.classList.contains("entered-toggle-expanded")) {
    chevron.classList.add("entered-toggle-expanded");
    entered_words.classList.add("entered-words-expanded");
    entered_container.classList.add("entered-container-expanded");
    below_entered.classList.add("below-entered-container-hidden");
    populateAlphabetizedWords(window.game.entered);

    let elem = document.createElement("span");
    elem.classList.add("entered-word-number");
    elem.textContent =
      "You have found " +
      window.game.entered.length +
      (window.game.entered.length == 1 ? " word" : " words");
    entered_words.insertBefore(elem, entered_words.firstChild);
  } else {
    chevron.classList.remove("entered-toggle-expanded");
    entered_words.classList.remove("entered-words-expanded");
    entered_container.classList.remove("entered-container-expanded");
    below_entered.classList.remove("below-entered-container-hidden");
    populateEnteredWords(window.game.entered);
    if (window.game.entered.length == 0) {
      entered_words.textContent = "Your words...";
      entered_words.classList.add("entered-words-start");
    }
  }
}

// Show a message, of a certain type.
// 0 = bad, 1 = good, 2 = pangram
function showMessage(message, message_type) {
  container = element("message");
  container.textContent = message;
  container.style.opacity = 1;

  switch (message_type) {
    case 0:
      container.classList.add("message-bad");
      break;
    case 1:
      container.classList.add("message-good");
      break;
    case 2:
      container.classList.add("message-pangram");
      break;
  }

  setTimeout(function () {
    container.style.opacity = 0;
  }, 1000);

  setTimeout(function () {
    container.style.opacity = 0;
    switch (message_type) {
      case 0:
        container.classList.remove("message-bad");
        break;
      case 1:
        container.classList.remove("message-good");
        break;
      case 2:
        container.classList.remove("message-pangram");
        break;
    }
  }, 1200);
}

// Set up keyboard input function.
function setUpKeyboardInput() {
  document.addEventListener("keydown", function (e) {
    // Only input letters or recognize backspaces and enter keys.
    // Don't recognize it when popups or dropdown are active.
    if (
      !window.game.popup_active &&
      !element("entered-toggle").classList.contains("entered-toggle-expanded")
    ) {
      if (isLetter(e.key)) {
        simulateKeyPress(e.key);
        addLetterEntry(e.key);
      } else if (e.key == "Backspace") {
        event.preventDefault();
        simulateNavPress("button-delete");
        removeLetterEntry();
      } else if (e.key == "Enter") {
        event.preventDefault();
        simulateNavPress("button-enter");
        enterWord();
      } else if (e.keyCode == 32) {
        event.preventDefault();
        simulateNavPress("button-shuffle");
        shuffleScreenKeys();
      }
    }
  });
}

// Make a letter key blink.
function simulateKeyPress(letter) {
  for (k of Array(6)
    .fill()
    .map((x, i) => i + 1)) {
    let key_name = "keys-" + k;
    if (element(key_name).textContent.toLowerCase() == letter.toLowerCase()) {
      element(key_name).style.animation = "keys-button-press 0.1s 1";
      setTimeout(function () {
        element(key_name).style.animation = "";
      }, 100);
      return;
    }
  }

  if (element("keys-middle").textContent.toLowerCase() == letter.toLowerCase()) {
    element("keys-middle").style.animation = "keys-button-middle-press 0.1s 1";
    setTimeout(function () {
      element("keys-middle").style.animation = "";
    }, 100);
  }
}

// Make a nav button blink.
function simulateNavPress(button_name) {
  let pressed = element(button_name);
  pressed.style.animation = "nav-button-press 0.1s 1";
  setTimeout(function () {
    pressed.style.animation = "";
  }, 100);
}

// Add letter to entry.
function addLetterEntry(letter) {
  let MAX_ENTRY_LETTERS = 17;
  let holder = element("entry-container-holder");
  if (holder.childElementCount < MAX_ENTRY_LETTERS) {
    let node = document.createElement("span");
    if (window.game.pangram.includes(letter.toUpperCase())) {
      node.classList.add("highlight");
    } else if (
      !window.game.pangram.toUpperCase().includes(letter.toUpperCase())
    ) {
      node.classList.add("invalid");
    }
    node.textContent = letter.toUpperCase();
    holder.appendChild(node);
  }
  rescaleLetterEntry();
}

// Remove letter from entry.
function removeLetterEntry() {
  let current = element("entry-container-holder");
  if (current.childElementCount > 0) {
    current.removeChild(current.lastChild);
  }
  rescaleLetterEntry();
}

// Rescale entry text width.
function rescaleLetterEntry() {
  const MAX_SIZE = 1.7;
  const STEP = 0.1;
  let current_size = MAX_SIZE;

  let container = element("entry-container");
  let holder = element("entry-container-holder");
  holder.style.fontSize = MAX_SIZE + "em";
  if (holder.offsetWidth >= container.offsetWidth) {
    while (holder.offsetWidth >= container.offsetWidth) {
      current_size -= STEP;
      holder.style.fontSize = current_size + "em";
    }
  }
}

// Get word from entry by aggregating letters.
function getWordEntry() {
  let combined = "";
  for (elem of element("entry-container-holder").children) {
    combined += elem.textContent;
  }
  return combined;
}

// Clear letters from entry. Return the word that was there.
function clearEntry() {
  let word = getWordEntry();
  element("entry-container-holder").textContent = ""; // clears children.
  rescaleLetterEntry();
  return word;
}

// Set up on-screen keyboard. Takes the first capitalized letter of a provided iterable as the center. Takes a reset_middle flag which indicates whether the middle key should be cleared as well.
function setUpScreenKeys(letters, reset_middle) {
  // Shuffle letters and make into set to fill letters.
  letters = letters.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = letters[i];
    letters[i] = letters[j];
    letters[j] = temp;
  }
  letters = new Set(letters);

  for (k of Array(6)
    .fill()
    .map((x, i) => i + 1)) {
    let key_name = "keys-" + k;
    element(key_name).style.color = "#00000000";
  }

  if (reset_middle) {
    element("keys-middle").style.color = "#00000000";
  }

  setTimeout(function () {
    let key_num = 1;
    for (letter_loop of letters) {
      let letter = letter_loop; // declare in loop to allow closure.
      if (letter == letter.toUpperCase()) {
        if (reset_middle) {
          let km = element("keys-middle");
          km.textContent = letter.toUpperCase();
          km.style.color = "var(--color-keys-button-middle)";
          km.onclick = function () {
            addLetterEntry(letter);
          };
        }
      } else {
        let k = element("keys-" + key_num);
        k.textContent = letter.toUpperCase();
        k.style.color = "var(--color-black)";
        k.onclick = function () {
          addLetterEntry(letter);
        };
        key_num += 1;
      }
    }
  }, 300);
}

// Shuffle screen keys.
function shuffleScreenKeys() {
  setUpScreenKeys(window.game.pangram, false);
  element("button-shuffle").disabled = true;

  setTimeout(function () {
    element("button-shuffle").disabled = false;
  }, 500);
}

// Enter word.
function enterWord() {
  let required_letter = element("keys-middle").textContent;
  let entered = clearEntry();

  // Check if word is too short.
  if (entered.length < 4) {
    showMessage("Too short", 0);
    return;
  }

  // Check if required letter is present.
  if (!entered.toUpperCase().includes(required_letter)) {
    showMessage("Missing center letter", 0);
    return;
  }

  // Check if invalid letters are present.
  for (letter of entered.toUpperCase()) {
    if (!window.game.pangram.toUpperCase().includes(letter.toUpperCase())) {
      showMessage("Bad letters", 0);
      return;
    }
  }

  // Check if it is a valid word.
  if (
    !window.game.words
      .map((x) => x.toUpperCase())
      .includes(entered.toUpperCase())
  ) {
    showMessage("Not in word list", 0);
    return;
  }

  // Check if already entered.
  if (window.game.entered.includes(entered.toUpperCase())) {
    showMessage("Already found", 0);
    return;
  }

  entered_score = getScore(entered);
  if (hmm() && entered.toLowerCase() == "calixto") {
    showMessage("Happy birthday!", 2);
  } else {
    showMessage("+" + entered_score, isPangram(entered) ? 2 : 1);
  }
  window.game.current_score += entered_score;
  addWordToEntered(entered);
  changeProgress(window.game.current_score);
}

// Set up button functions.
function setUpButtonFunctions() {
  element("button-delete").onclick = removeLetterEntry;
  element("button-shuffle").onclick = shuffleScreenKeys;
  element("button-enter").onclick = enterWord;
}

// Blur or unblur background elements.
function setBlur(make_blurry) {
  window.game.popup_active = make_blurry;
  if (make_blurry) {
    element("header").classList.add("blur");
    element("container").classList.add("blur");
  } else {
    element("header").classList.remove("blur");
    element("container").classList.remove("blur");
  }
}

// Set up ranking in the progress popup.
function setUpProgressPopup() {
  let ranking = element("progress-popup-ranking");
  let max_score = window.game.total_score;
  ranking.textContent = ""; // clear children.
  for (i of Array(LEVEL_PERCENTS.length)
    .fill()
    .map((x, i) => i)) {
    let elem = document.createElement("li");
    if (hmm()) {
      elem.textContent =
      LEVEL_NAMES[i].substring(1) +
      " (" +
      Math.floor(LEVEL_PERCENTS[i] * max_score) +
      " points)";
      let boldy = document.createElement("b");
      boldy.textContent = LEVEL_NAMES[i].substring(0,1);
      elem.insertBefore(boldy, elem.firstChild);
    } else {
      elem.textContent =
      LEVEL_NAMES[i] +
      " (" +
      Math.floor(LEVEL_PERCENTS[i] * max_score) +
      " points)";
    }
    ranking.insertBefore(elem, ranking.firstChild);
  }
}

// Show progress popup.
function showProgressPopup() {
  element("progress-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideProgressPopup;
  setBlur(true);
}

// Hide progress popup.
function hideProgressPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("progress-popup").classList.add("hidden");
  setBlur(false);
}

// Set up about popup.
function setUpAboutPopup() {
  if (hmm()) {
    element("popup-content-text-hmm").textContent = " with a special exception once a year";
    element("name-hmm").classList.add("bold");
    element("explanation-hmm").textContent = " Yes, even today.";
  } else {
    element("popup-content-text-hmm").textContent = "";
    element("explanation-hmm").textContent = "";
  }
}

// Show about popup.
function showAboutPopup() {
  element("about-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideAboutPopup;
  setBlur(true);
}

// Hide about popup.
function hideAboutPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("about-popup").classList.add("hidden");
  setBlur(false);
}

// Set up prev popup.
function setUpPrevPopup() {
  // Get yesterday's entered words, if they are present.
  let prev_entered_array = getCookie(-1);
  let prev_entered = new Set(prev_entered_array);
  if (prev_entered.size != 0) {
    element("popup-content-text-entered").classList.remove("hidden");
  }

  // Show pangram.
  let prev_pangram = getTargetPangram(window.game.data, -1);
  let prev_pangram_set = new Set(prev_pangram);
  let prev_pangram_array = Array.from(prev_pangram_set);
  prev_pangram_array.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  let prev_letters_container = element("prev-letters-container");
  prev_letters_container.textContent = ""; // clears content.
  for (letter of prev_pangram_array) {
    let elem = document.createElement("span");
    elem.classList.add("prev-entered-letter");
    if (letter == letter.toUpperCase()) {
      elem.classList.add("highlight");
    }
    elem.textContent = letter.toUpperCase();
    prev_letters_container.appendChild(elem);
  }

  // Set up total words and points.
  let prev_words = getWords(window.game.data, prev_pangram);
  prev_words.sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
  element("prev-stats-words").textContent = prev_words.length;
  let prev_points = getTotalScore(window.game.data, prev_pangram);
  element("prev-stats-points").textContent = prev_points;

  // Set up found words and points, if present.
  if (prev_entered_array.length > 0) {
    element("prev-stats-words-found").textContent =
      prev_entered_array.length + " of ";
    element("prev-stats-points-found").textContent =
      getArrayScore(prev_entered_array) + " of ";
  }

  // Show words.
  let prev_words_container = element("prev-words-container");
  prev_words_container.textContent = ""; // clears content.
  for (word of prev_words) {
    let elem = document.createElement("a");
    elem.classList.add("prev-entered-word");
    if (isPangram(word)) {
      elem.classList.add("highlight-background");
      elem.style.color = "var(--color-text-gray-highlight)";
    }
    if (prev_entered.has(word.toUpperCase())) {
      elem.classList.add("bolded");
    }
    elem.href = "https://www.merriam-webster.com/dictionary/" + word;
    elem.target = "_blank";
    elem.textContent = capitalizeInitial(word);
    prev_words_container.appendChild(elem);
  }
}

// Show prev popup.
function showPrevPopup() {
  element("prev-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hidePrevPopup;
  setBlur(true);
}

// Hide prev popup.
function hidePrevPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("prev-popup").classList.add("hidden");
  setBlur(false);
}

// Show about popup.
function showResetPopup() {
  element("reset-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideResetPopup;
  setBlur(true);
}

// Hide about popup.
function hideResetPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("reset-popup").classList.add("hidden");
  setBlur(false);
}

// Set up victory popup.
function setUpCountdown(elem) {
  let target = getDateWithOffset(1);
  let countdown_interval = setInterval(function () {
    let now = new Date().getTime();
    let dt = target - now;

    let hours = Math.floor((dt % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((dt % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((dt % (1000 * 60)) / 1000);

    document.getElementById(elem).textContent =
      hours + "h " + minutes + "m " + seconds + "s";

    if (dt < 0) {
      clearInterval(countdown_interval);
      document.getElementById(elem).textContent =
        "a sec— actually, it's midnight! Refresh the page";
      location.reload();
    }
  }, 1000);
}

// Set up return popup.
function setUpReturnPopup() {
  setUpCountdown("return-countdown-span");
}

// Show return popup.
function showReturnPopup() {
  element("return-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideReturnPopup;
  element("return-rank").textContent = LEVEL_NAMES[getRankNumber(window.game.current_score)];
  element("return-words").textContent = window.game.entered.length + (window.game.entered.length == 1 ? " word" : " words");
  element("return-points").textContent = window.game.current_score + (window.game.current_score == 1 ? " point" : " points");
  setBlur(true);
}

// Hide return popup.
function hideReturnPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("return-popup").classList.add("hidden");
  setBlur(false);
}

// Set up victory popup.
function setUpVictoryPopup() {
  setUpCountdown("victory-countdown-span");
}

// Show victory popup.
function showVictoryPopup() {
  element("victory-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideVictoryPopup;
  element("victory-words").textContent = window.game.entered.length + " words";
  element("victory-points").textContent = window.game.current_score + " points";
  setBlur(true);
  window.game.show_victory_popup = false;
}

// Hide victory popup.
function hideVictoryPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("victory-popup").classList.add("hidden");
  setBlur(false);
}

// Set up all popup.
function setUpAllPopup() {
  setUpCountdown("all-countdown-span");
  element("all-words").textContent = window.game.words.length + " words";
  element("all-points").textContent = window.game.total_score + " points";
}

// Show all popup.
function showAllPopup() {
  element("all-popup").classList.remove("hidden");
  element("popup-click-bg").classList.remove("hidden");
  element("popup-click-bg").onclick = hideAllPopup;
  setBlur(true);
  window.game.show_all_popup = false;
}

// Hide all popup.
function hideAllPopup() {
  element("popup-click-bg").classList.add("hidden");
  element("all-popup").classList.add("hidden");
  setBlur(false);
}

// Toggle dark mode.
function toggleDarkMode() {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    element("toggle-dark").textContent = "dark";
    setDarkCookie();
  } else {
    document.body.classList.add("dark");
    element("toggle-dark").textContent = "light";
    setDarkCookie();
  }
}

// Switch dark mode.
function switchDarkMode(param) {
  if (param == "light") {
    document.body.classList.remove("dark");
    element("toggle-dark").textContent = "dark";
    setDarkCookie();
  } else if (param == "dark") {
    document.body.classList.add("dark");
    element("toggle-dark").textContent = "light";
    setDarkCookie();
  }
}

// Doot
function doot() {
  console.log("doot");
}
