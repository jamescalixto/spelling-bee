import argparse
from itertools import permutations
import string
import pandas as pd
from timebudget import timebudget


def get_words(data, letters):
    """Get all words in the data that can be made with the provided letters and have all capitalized letters."""
    all_letters = {letter.lower() for letter in letters}
    required_letters = {
        letter.lower() for letter in letters if letter == letter.upper()
    }
    return [
        word
        for word in data
        if set(word.lower()) <= all_letters and required_letters <= set(word.lower())
    ]


def is_pangram(word):
    return len(set(word)) == 7


def get_pangrams(data, letters):
    """Get all pangrams in the data that can be made with the provided letters and have all capitalized letters."""
    return [word for word in get_words(data, letters) if is_pangram(word)]


def get_score(word):
    """Score a given word."""
    if len(word) == 4:
        return 1
    else:
        score = len(word)
        if len(set(word)) == 7:
            score += 7
        return score


def get_total_score(data, letters):
    """Given an iterable dictionary and letters, returns the total score of all
    words that 1) can be made using the letters, and 2) have all capitalized letters
    in the string."""
    return sum(get_score(word) for word in get_words(data, letters))


def is_boring(arr):
    """Given an array of pangrams, return True if any two of those pangrams are boring, False otherwise."""
    arr = [s.lower() for s in arr]
    for i, j in permutations(arr, r=2):
        if set(i) == set(j) and (
            i == j + "s"
            or j == i + "s"
            or i == j + "r"
            or j == i + "r"
            or i == j + "d"
            or j == i + "d"
        ):
            return True
    return False


def capitalize(word, letters):
    """Given a word and some letters, return the word lowercased with all letters in uppercase."""
    letters = [letter.lower() for letter in letters]
    return "".join(
        letter.upper() if letter.lower() in letters else letter.lower()
        for letter in word
    )


def preprocess(df):
    # Eliminate non-alphabetic words and those with uppercase.
    alphabet = set(string.ascii_lowercase)
    df = df[[len(alphabet.union(set(word))) == 26 for word in df["words"]]]

    # Eliminate words that are too short.
    df = df[[len(word) >= 4 for word in df["words"]]]

    # Eliminate words with too many unique letters.
    df = df[[len(set(word)) <= 7 for word in df["words"]]]

    # Eliminate words with s in them, because they're too easy.
    df = df[["s" not in word for word in df["words"]]]

    return df


def filter(dictionary, usable, max_pangrams, min_score, max_score):
    """Given a dataframe of words, filter out all of the words invalid for Spelling Bee
    and capitalize all letters in usable pangrams (words with exactly seven unique letters that
    meet certain criteria)."""

    # Create set of usable pangrams.
    replace_words = {}
    for word in usable:
        word = word.lower()
        if is_pangram(word):
            valid_letters = set()
            for letter in set(word):
                capitalized = capitalize(word, letter)
                pangrams = get_pangrams(dictionary, capitalized)
                if (
                    min_score <= get_total_score(dictionary, capitalized) <= max_score
                    and len(pangrams) <= max_pangrams
                    and not is_boring(pangrams)
                ):
                    valid_letters.add(letter)
            if len(valid_letters) > 0:
                replace_words[word] = capitalize(word, valid_letters)

    # Use set of usable pangrams.
    dictionary = pd.Series(
        [
            replace_words.get(word) if word in replace_words else word.lower()
            for word in dictionary
        ]
    )
    return dictionary


@timebudget
def main(dictionary_path, usable_path, output_path, max_pangrams, min_score, max_score):
    # Read list of words. Needs keep_default_na because "null" is a word and we need to
    # make sure it doesn't get turned into a null.
    dictionary = pd.read_csv(dictionary_path, keep_default_na=False, header=None)
    dictionary.columns = ["words"]
    dictionary = preprocess(dictionary)["words"]

    usable = pd.read_csv(usable_path, keep_default_na=False, header=None)
    usable.columns = ["words"]
    usable = preprocess(usable)["words"]

    df = filter(dictionary, usable, max_pangrams, min_score, max_score)
    df.to_csv(output_path, header=False, index=None)


if __name__ == "__main__":
    """Takes in two arguments: a dictionary, which defines every valid word a person can
    enter, and a usable list, which includes all words that can be usable pangrams to
    draw from. Two lists are necessary because we don't want there to be only be a
    difficult pangram, but we do want to recognize it as a word if it comes up."""
    parser = argparse.ArgumentParser(description="process lists of words")
    parser.add_argument(
        "--dictionary", help="file containing all words to recognize as valid",
    )
    parser.add_argument(
        "--usable", help="file including all usable pangrams",
    )
    parser.add_argument(
        "--output", help="output file path",
    )
    parser.add_argument(
        "--max_pangrams",
        type=int,
        default=3,
        help="maximum number of pangrams in puzzle",
    )
    parser.add_argument(
        "--min_score", type=int, default=50, help="minimum total score of puzzle",
    )
    parser.add_argument(
        "--max_score", type=int, default=270, help="maximum total score of puzzle",
    )
    args = parser.parse_args()
    main(
        args.dictionary,
        args.usable,
        args.output,
        args.max_pangrams,
        args.min_score,
        args.max_score,
    )
