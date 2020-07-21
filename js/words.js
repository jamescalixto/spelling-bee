// Word and word array manipulation functions.
// Constants:
PANGRAM_SIZE = 7; // number of unique letters for a pangram.

// Debug function because I'm dumb
function print(val) {
  console.log(val);
}

// Shuffle an array and return it.
function shuffleArray(arr, seed = 0) {
  let rng = new alea(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(rng() * i);
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

// Given an integer N and a seed, shuffle (pseudorandomly) an array with the numbers 0
// through N-1.
function getShuffledNumberArray(n, seed = 0) {
  return shuffleArray(
    Array(n)
      .fill()
      .map((x, i) => i)
  );
}

// Get a target pangram, given data and an optional day offset.
function getTargetPangram(data, offset = 0) {
  // hmm
  if (hmm()) {
    let letter_pick = shuffleArray(['a','c','i','l','o','t','x'], new Date().getFullYear())[0];
    return capitalizeLetter('acilotx', letter_pick);
  }

  function countUpperCase(word) {
    num_uppercase = 0;
    for (letter of word) {
      if (letter == letter.toUpperCase()) {
        num_uppercase += 1;
      }
    }
    return num_uppercase;
  }

  // Pick a random valid pangram. Guaranteed to be a (seeded) pseudorandom choice that
  // cycles through all possible choices every [# num_choices] days.
  valid_pangrams = getAllValidPangrams(data);
  num_choices = valid_pangrams.reduce((acc, elem) => {
    return acc + countUpperCase(elem);
  }, 0);
  choice_arr = getShuffledNumberArray(num_choices);
  choice = choice_arr[getDayNumber(offset) % num_choices];

  // Loop through all valid word/letter combinations to find the choice we obtained.
  counter = 0;
  for (word of valid_pangrams) {
    for (letter of word) {
      if (letter == letter.toUpperCase()) {
        if (counter == choice) {
          return capitalizeLetter(word, letter);
        } else {
          counter += 1;
        }
      }
    }
  }

  print("Pangram finding has gone out of bounds!");
  return "Failure"; // fallback, should never happen. Incidentally a pangram.
}

// Given an array of words and some letters, return an array of all words in the array
// that 1) can be made using solely those letters and 2) contain all capitalized
// letters. Preserves casing.
function getWords(data, letters) {
  all_letters = new Set(letters.toLowerCase());
  required_letters = new Set(
    letters.split("").reduce((acc, elem) => {
      if (elem == elem.toUpperCase()) {
        return acc + elem.toLowerCase();
      } else {
        return acc;
      }
    }, "")
  );

  all_words = data.filter((word) => {
    word = word.toLowerCase();
    word_letters = new Set(word);
    for (letter of word_letters) {
      if (!all_letters.has(letter)) {
        return false;
      }
    }
    for (required_letter of required_letters) {
      if (!word_letters.has(required_letter)) {
        return false;
      }
    }
    return true;
  });

  // hmmmmm
  if (hmm()) {
    all_words.push('calixto');
  }
  return all_words;
}

// Given an array of words and some letters, return an array of all pangrams in the
// array that 1) can be made using solely those letters and 2) contain all capitalized
// letters. Preserves casing.
function getPangrams(data, letters) {
  words = getWords(data, letters);
  return getAllPangrams(words);
}

// Get all pangrams in a given array of words.
function getAllPangrams(data) {
  return data.filter((word) => {
    word = word.toLowerCase();
    return new Set(word).size == PANGRAM_SIZE;
  });
}

// Get all valid pangrams (i.e, those that meet criteria for target pangrams) in a given
// array of words.
function getAllValidPangrams(data) {
  pangrams = getAllPangrams(data);
  return pangrams.filter((word) => {
    return word != word.toLowerCase();
  });
}

// Check if word is a pangram.
function isPangram(word) {
  return new Set(word.toUpperCase()).size == PANGRAM_SIZE;
}

// Score a given word.
function getScore(word) {
  if (word.length == 4) {
    return 1;
  } else {
    score = word.length;
    if (isPangram(word)) {
      score += 7;
    }
    return score;
  }
}

// Score words in an array and return the sum.
function getArrayScore(words) {
  return words.reduce((acc, cur) => acc + getScore(cur), 0);
}

// Given data and a string, returns the total score of all words that 1) can be made
// using the letters in the string, and 2) have all capitalized letters in the string.
function getTotalScore(data, letters) {
  words = getWords(data, letters);
  return total_score = words.reduce((acc, elem) => {
    word = elem.toLowerCase();
    return acc + getScore(word);
  }, 0);
}

// Given a word and a letter, capitalize all instances of that letter in the word and
// lowercase all other letters.
function capitalizeLetter(word, letter) {
  return word.split("").reduce((acc, elem) => {
    if (elem.toLowerCase() == letter.toLowerCase()) {
      return acc + elem.toUpperCase();
    } else {
      return acc + elem.toLowerCase();
    }
  }, "");
}
