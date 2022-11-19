# Crossword Puzzle Generator

Browser-based Javascript program to create crosswords.

The crossword generated is a rectangular grid containing lettered and black squares along with a list of clues. 
The lettered squares form horizontal and vertical answers that match the given clues.
A valid crossword is obtained when all of the cells are filled.

NOTE: this program does not solve puzzles, it generates them.

To use, simply open cw.html in a modern browser, which brings in all other files to dynamically generate a dense crossword puzzle.

![filled crossword](filled_crossword.png)

## License
MIT. Use the code freely.

## Staus - version 0.0.1
- Full-sized dense crossword puzzles
- Run completely in a modern browser
- Multiple board templates
- Real words and challenging clues
- Quick and easy to use

## Getting Started
Download all of the files to a single directory, then open "cw.html" in any browser that supports Javascript/ECMAscript.
The HTML file includes its support files from the current directory.

The dictionary (words.js) is a JSON file of over 70,000 English words/clues.
New clues can be easily added by using any text editor.

## Overview of the project

This project generates crossword puzzles, not solves them.
The board for the puzzle is randomly selected from internal board patterns.
More board patterns can be added easily to the program.
The program attempts to completely fill in the crossword board with words from the dictionary file.

In particular, this project generates **dense** puzzles, like the puzzles often seen in newspapers.
Dense puzzles are much harder to generate than sparse puzzles because the adjacent words greatly expand the search space and increase constraints.

Crosswords are a type of constraint satisfaction problem.
In general, crossword construction is NP-complete.
For example, assuming for each entry there are 1,000 possible words of the right length in the database but only 50 match the constraints.
Then to generate a puzzle with 30 words, a brute force solution needs 50 ^ (30-1) iterations.

Heuristics can be used to generate a puzzle more efficiently for small board sizes and large dictionaries.
The current code has a few heuristics.
Future version will add more. (TBD)

NOTE: The computational complexity for dense puzzles is proably higher than chess, because the number of choices for word placement is much higher than the number of legal chess moves.

*(Any theorist want to do a proof of this complexity supposition?)*

Generating a dense puzzle is computationally very challenging.
The current version generates a complete puzzle in less than a fraction of a second.
If no word fits into a space, the clue just lists the length of the space, eg. "[LEN 3]".

## Project versions

  * **Version 1**:
The first approach used Brute Force and randomness to place words.
This naive approach tries all combinations to fill in the grid with words from the dictionary.
Unfortunately, while this is computationally efficient, not all puzzles can be solved.
When a solution is blocked, it is common to backtrack repeatedly, sometimes endlessly.

    While approach #1 mostly succeeded, its failures were very costly
because the code could get into an endless loop of trying.
Overall success was about 50%.

 * **Version 2**:
The version used backtracking when searching through all possible moves.
Backtracking solves problems recursively by trying to build a solution incrementally, one word at a time, by removing those solutions that fail to satisfy the constraints.
The second approach combined backtracking with dependencies:
>     Pick a starting word.
>     while (Puzzle is not finished)
>      For each path from the starting word.
>         check if selected path is safe, if yes select it
>         and make recursive call to rest of the puzzle
>         If recursive calls returns true,
>           then return true.
>         else
>           undo the current move and return false.
>      End For
>     If none of the moves work out, return false, NO SOLUTON.

    Backtracking improved the success rate to about 70%, but the complexity level grew very quickly.
Complexity of backtracking : O(N * M * P^D)
>     where:
>     N is the number of words to be filled in the grid,
>     M is the average length of a word,
>     P is the lists of possible word to be tested for the crossword
>       constraint,
>     D = intersection point(s) between horizontal and vertical words.

 * **Version 3**:
Instead of backtracking, this version attempts to fix words that failed.
Each failed word looks at intersecting words to find pairs that fit.
The success rate was improved while the generation remained very fast.

 * **Version Future?**:
Instead of filling in a complete word and then trying to fit crossing words, this approach tries to fill in single letters by negotiating between the crossing words.
This approach is much finer-grained, so mismatched words should be fewer.


