# CW #

Crossword generator

## Requirements - version 1.0.1: ##

1. Produce a full-sized crossword puzzle.

2. It should run completely in a modern browser.

3. Support multiple board patterns.

4. Real words and challenging clues.

5. It must be quick and easy to use.


## Overview of the design ##

A browser opens cw.html, which brings in all other files to fynamically generate a dense crossword puzzle.

The board for the puzzle is randomly selected.
More framesboards can be added easily.

The dictionary is a JSON file of over 40,000 English words/clues.
Other languages can be used instead.

Generating a dense puzzle is computationally very challenging.
The current version generates a complete puzzle in less than a second.

Approach 1:
The first approach uses randomness to place words.
Unfortunately, while this is computationally efficient, not all puzzles can be solved.
When a solution is blocked, it is common to backtrack many times.

Approach 2:
The second approach uses backtracking:
Pick a starting point.
   while (Problem is not solved)
      For each path from the starting point.
         check if selected path is safe, if yes select it
         and make recursive call to rest of the problem
         If recursive calls returns true, 
           then return true.
         else 
           undo the current move and return false.
      End For
 If none of the move works out, return false, NO SOLUTON.

xWords.js can be reused elsewhere independent of the rest of the code on the site for crossword puzzle generation.
