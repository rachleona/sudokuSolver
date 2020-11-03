# sudokuSolver
Partial backtracking JS algorithm to solve sudokus presented as two dimensional matrix

<hr>

__Usage__

Present sudoku as two dimensional array of numbers and '' as blank.
```js
  sudokuSolver(/*sudoku array*/)
  
  //for example
  sudokuSolver([['', '', '', '', '', '', 7, 5, ''],
                [2, '', '', 3, '', 7, 9, 6, ''],
                ['', 8, '', '', '', '', '', '', ''],
                [5, 3, '', 1, '', '', '', '', ''],
                [7, '', '', '', 6, '', '', '', 5],
                ['', '', '', '', '', 5, '', 9, 6],
                ['', '', '', '', '', '', '', 1, ''],
                ['', 5, 3, 7, '', 2, '', '', 4],
                ['', 4, 2, '', '', '', '', '', '']])
                
 /* [[3, 6, 4, 9, 1, 8, 7, 5, 2],
     [2, 1, 5, 3, 4, 7, 9, 6, 8],
     [9, 8, 7, 2, 5, 6, 4, 3, 1],
     [5, 3, 6, 1, 2, 9, 8, 4, 7],
     [7, 9, 8, 4, 6, 3, 1, 2, 5],
     [4, 2, 1, 8, 7, 5, 3, 9, 6],
     [6, 7, 9, 5, 8, 4, 2, 1, 3],
     [1, 5, 3, 7, 9, 2, 6, 8, 4],
     [8, 4, 2, 6, 3, 1, 5, 7, 9]]*/
```

Any suggestion on better efficiency/code structure or anything will be appreciated!
