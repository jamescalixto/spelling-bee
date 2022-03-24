# Spelling Bee

Repository for my [Spelling Bee](https://jamescalixto.com/spelling-bee/) project. Check it out!

## Background

This is a homegrown version of the New York Times' [Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee) puzzle, licensed with the MIT License.

## Design decisions

### Pangram pickin'

Since the puzzle runs entirely client-side, I had to balance performance (how long the puzzle takes to load) against storage (the size of the file to download, which also affects performance) by cleverly doing the work ahead of time. The `data/process.py` script is the (inefficient) script I used to generate the final `data/words.csv` file.

Recall that an ideal puzzle has at least one pangram (a word that uses all seven letters) and has a total score in some large range (I used 50 to 270 points). Words used in the puzzle need to have at least four letters and can't have more than seven unique letters, and also can't be proper nouns or hyphenated. It would also be nice for the pangram to be fairly common, as "hypopnea" is less fun to solve for than "backlog".

Thus I was able to preprocess the word list by eliminating words that didn't meet the criteria, then taking every pangram and checking each letter to see if that combination of pangram and required letter would make a valid puzzle. This takes a few hours to run but results in a streamlined word list, where capitalized letters in a word indicate valid required letters for that pangram. Complicated? Perhaps, but it is efficient on the end user client-side.

### Uh oh spaghetti code

Every time I make one of these projects I tell myself that I'm going to master React or some other framework, and this project might just be the one that makes me do it. This was written in completely vanilla JS (aside from a csv parsing library and a seeded PRNG) so the logic to track dropdowns, background blurs, and practically everything is convoluted and redundant. Not my best coding work, but it works. I need to get better at separating application logic from interface logic, and I am running up against the limits of what I can do if I don't do that.

### What the hex

While I copied most of the original's layout, I tweaked spacing and positioning to make it tighter and crisper. One design detail that was too much of a hassle to replicate was the nesting hexagon keys. I tried different approaches — defining it in CSS, using an svg element, using a large Unicode character — but wasn't happy with any of them. The rounded letters I ended up with matched the other rounded elements better. Or maybe that's how I rationalized not having hexagons.

### Daily puzzle

I have opted to make the puzzles daily, much like the original. I have implemented this using a seeded pseudorandom number generator that uses the day to select a random pangram and central letter combination to use as the day's puzzle.I originally wanted to put in a date picker, to give the user access to all the puzzles, but I couldn't find a good way to implement it. Daily puzzle it is.

## Directories and files

### `data`

Holds the list of words used for the actual puzzle, `words.csv`, as well as the `process.py` script used to generate it. I did have to manually remove quite a few vulgar and offensive words from the SCOWL list. To use it, [create a customized word list](http://app.aspell.net/create) at the SCOWL website and provide the files as arguments.

### `img`

Holds the favicon and assorted vector images used throughout the puzzle.

### `js`

While I tried to separate functions into logical files, I did not do the best job. `words.js` has most of the functions related to word manipulation, such as scoring words. `interface.js` has functions related to the interface, which happens to be most of them. `main.js` has functions related to setup of new games as well as helpful utility functions.

### `main.html`, `styles.css`

These files make up the structure and styling of the project.
