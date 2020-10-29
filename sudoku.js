const randomIndex = array => Math.floor(Math.random()*array.length)
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// main solver tool, calls other utility functions
// recursion without fear of stack overflow!
const sudokuSolver = sud => {
    // turns two dimensional array into one dimensional
    // new array presents data as position objects with value, row, column and palace info
    const input = getPositionObjects(sud)
    // solve with basic logic
    let output = solve(input)
    
    // if there are still unsolved parts, start guessing
    // i.e. backtracking algo starts
    while(!output.every( v => typeof v.value === "number" ))
    {
        output = guess(output)
    }
    
    // format result back to matrix 
    const res = [...Array(9).keys()].map( n => [] )
    output.map( ({ row, column, value }) => {
        res[row][column] = value
    })

    return res
}

// caller function to employ logic recursively without fear of stack overflow
const solve = sudoku => {
    let { s, d } = possibles(sudoku)
    if(d)
    {
        return s
    }
    else
    {
        return solve(s)
    }
}

// basic logic, check row/column/palace individually
const check = row => {
    const newRow = []
    row.map( content => {
        const { value } = content
        // if not number, analysis needed
        if(typeof value !== "number")
        {
            let lack
            if(value === "")
            {
                lack = numbers
            }
            // turn current possibles into array to be processed
            else
            {
                lack = value.split("").map( num => parseInt(num) )
            }

            // check row and new row to look for possibles
            lack = lack.filter( num => !row.some( e => e.value === num ) ).filter( num => !newRow.some( e => e.value === num ))

            // if only one possible turn to num
            if(lack.length == 1)
            {
                newRow.push({...content, value: lack[0]})
                return 0
            }

            newRow.push({...content, value: lack.join("")})
            return 0
        }
        else
        {
            newRow.push(content)
            return 0
        }
    })

    // check for duplicate possibles in newRow

    // get all strings, filter out undefines and sort
    let blanks = newRow.map( ({ value }, i) => {
        if(typeof value === "string")
        {
            return {
                index: i, 
                value
            }
        }
    }).filter( val => val ).sort()

    // find reps of the same possiblity combination
    const findDups = (sortedArr, i, dup = 1) => {
        if(!sortedArr[i+1])
        {
            return dup
        }
        else if(sortedArr[i].value === sortedArr[i+1].value)
        {
            return findDups(sortedArr, i+1, dup+1)
        }
        else
        {
            return dup
        }
    }

    // for each blank
    for (let x = 0; x < blanks.length; x++)
    {
        //find duplicates of current val
        const dup = findDups(blanks, x)
        if(dup == blanks[x].value.length)
        {
            // get array of substrings of current value
            const cur = blanks[x].value.split("")

            // check all blanks and rid all other blanks of nums in cur
            blanks = blanks.map( ({index, value}) => {
                if(value != blanks[x].value)
                {
                    return {
                        index, 
                        value: value.split("").filter( str => !cur.includes(str) ).join("")
                    }
                }
                else
                {
                    return { index, value }
                }
            })

            x += (dup - 1)
        }
    }

    blanks.map( ({index, value}) => {
        newRow[index] = {...newRow[index], value}
    })

    return newRow
}

// extract row/column/palace to form one array of 9 items and run func on it
const extract = (sud, key, func) => {
    const newSud = []
    for(let i = 0; i < 9; i++)
    {
        //create one dimensional array
        let arr = sud.filter( v => v[key] === i )
        arr = func(arr)
        arr.map( v => {
            newSud[v.row * 9 + v.column] = v
        })
    }
    return newSud
}

// external caller function to lower stack size for solve() 
// narrows down for possibilities of each row/column/palace
// then finds unique possiblities and apply them
// then check inter-regional contradictions 
const possibles = sudoku => {
    // basic possibility elimination logic on each row, column and palace
    let newSudoku = extract(extract(extract(sudoku, "row", check), "column", check), "palace", check)

    // if no further elimination was possible, then basic elimination process is done for now
    let done = deepCompare(newSudoku, sudoku)

    // if done, further logic, else continue elimination logic
    if(done)
    {
        newSudoku = extract(extract(extract(newSudoku, "row", unique), "column", unique), "palace", unique)
        done = deepCompare(newSudoku, sudoku)
    }
    
    // done with find unique logic, go to regional elimination logic
    if(done)
    {
        newSudoku = regional(newSudoku)
        done = deepCompare(newSudoku, sudoku)
    }

    return { s: newSudoku, d: done }
}

// find unique possibilities in a row/column/palace
const unique = row => {
    // make copy of row
    const newRow = row.map( v => v )

    // get unsolved squares ( ones that are not numbers )
    const blanks = row.map( (v, i) => {
        if(typeof v.value === "string")
        {
            return {
                index: i, 
                v
            }
        }
    }).filter( val => val )

    blanks.map( ({ v, index}, i) => {
        const { value } = v
        
        // check each possibility to see if there are unique ones
        // if a number is only possible in one square, then that must be the solution to that square
        value.split("").map( num => {
            let rep = false
            for(let x = 0; x < blanks.length; x++)
            {
                if(x == i) continue
                // if any of the same row has this possibility, then not unique and break
                if(blanks[x].v.value.includes(num))
                {
                    rep = true
                    break
                }
            }

            if(!rep)
            {
                blanks[i].v.value = num
                newRow[index] = {...v, value: num}
            }
            else
            {
                newRow[index] = v
            }
        })
    })
    return newRow
}

// compare two sudokus to see if logic is exhausted
const deepCompare = (a, b) => {
    return !a.some( (v, i) => {
        return b[i].value !== v.value
    })
}

// convert sudoku matrix into one dimensional array of position objects
const getPositionObjects = sudoku => {
    const res =  sudoku.map( (row, rowNum) => {
        return row.map( (val, colNum) => {
            return {
                value: val,
                row: rowNum, 
                column: colNum, 
                palace: Math.floor(colNum / 3) + 3 * Math.floor(rowNum / 3)
            }
        })
    })
    return res.reduce( (final, row) => [...final, ...row], [])
}

// inter-regional elimination logic
const regional = sud => {
    // make copy of sud
    const newSudoku = sud.map( ({ value, row, column, palace }) => { return { value, row, column, palace}} )
    
    // for each square
    for(let x = 0; x < newSudoku.length; x++)
    {
        // initialise basic info
        const { value, row, column, palace } = newSudoku[x]
        // if current is solved, move on
        if(typeof value !== "string") continue
        
        // filter to get all the values in the same region (row, column, palace)
        // that are also unsolved
        // solved ones don't need to be considered because the possibilities would have
        // been eliminated in check() anyway
        let thisRow = newSudoku.filter( v => v.row === row && typeof v.value === "string")
        let thisCol = newSudoku.filter( v => v.column === column && typeof v.value === "string")
        let thisPal = newSudoku.filter( v => v.palace === palace  && typeof v.value === "string")
    
        value.split("")
        .map( n => {
            // process palace first
            let commonPosibility = thisPal.filter( v => v.value.split("").includes(n) )
            // e.g. if all the squares that might be 3 in this palace are all in the same row
            // then the 3 of this row must be in this palace, so all squares in that row that 
            // is not in this palace cannot bee three
            // by this logic eliminate 3 from possiblities of all other squares of this row
            // same logic applies for each block below
            if(commonPosibility.every( v => v.row === row ))
            {
                thisRow = thisRow.map( v => 
                    v.palace === palace ? v : 
                    { 
                        ...v, 
                        value: v.value.split("").filter( num => num !== n ).join("") 
                    }
                )
            }
            else if(commonPosibility.every( v => v.column === column ))
            {
                thisCol = thisCol.map( v => 
                    v.palace === palace ? v : 
                    { 
                        ...v, 
                        value: v.value.split("").filter( num => num !== n ).join("") 
                    }
                )
            }

            // process row 
            commonPosibility = thisRow.filter( v => v.value.split("").includes(n) )
            if(commonPosibility.every( v => v.palace === palace ))
            {
                thisPal = thisPal.map( v => 
                    v.row === row ? v : 
                    { 
                        ...v, 
                        value: v.value.split("").filter( num => num !== n ).join("") 
                    }
                )
            }

            // process column 
            commonPosibility = thisCol.filter( v => v.value.split("").includes(n) )
            if(commonPosibility.every( v => v.palace === palace ))
            {
                thisPal = thisPal.map( v => 
                    v.column === column ? v : 
                    { 
                        ...v, 
                        value: v.value.split("").filter( num => num !== n ).join("") 
                    }
                )
            }

        })
        
        // put all the stuff into one array then add them back to newSudoku
        const newStuff = [...thisCol, ...thisRow, ...thisPal]

        newStuff.map( ({value: v, row: r, column: c, palace: p}) => {
            newSudoku[r * 9 + c] = { 
                value: v,
                row: r,
                column: c,
                palace: p
            }
        })
    }

    return newSudoku
}

// backtracking logic
const guess = sud => {
    // find the first instance of an unsolved square
    const cur = sud.find( v => typeof v.value !== "number" )
    // save initial value
    const val = cur.value
    const pos =  cur.value.split("").map( v => parseInt(v) )
    
    // iterate over each possible value
    for(let x = 0; x < pos.length; x++)
    {
        // let's pretend that pos[x] is the correct value for this square
        sud[cur.row * 9 + cur.column].value = pos[x]
        
        // try solving it with this value
        let res = possibles(sud)
        while(!res.d)
        {
            res = possibles(res.s)
        }
    
        // if there are any squares that cannot be filled then this value is wrong, backtrack and try next possible value
        if(res.s.find( v => v.value == ''))
        {
            sud[cur.row * 9 + cur.column].value = val
            continue
        }
        // if every value is a number
        else if(res.s.every( v => typeof v.value === "number"))
        {
            // and is a valid solution, then this is the answer
            if(isSafe(res.s)) return res.s
            // else backtrack and try next possible value
            sud[cur.row * 9 + cur.column].value = val
            continue
        }
        // no impossible squares and not yet solved
        else
        {
            // guess again
            res = guess(res.s)
            // if cannot be solved, backtrack and try next possible value
            if(!res)
            {
                continue
            }
            // else this is the answer
            return res
        }
    }
    
    // none of the possible values work, therefore cannot be solved
    return false
}

// double checking for invalid solutions
const isSafe = (sud, keys=["row", "column", "palace"]) => {
    return !keys.some( key => {
        //create one dimensional array
        for(let i = 0; i < 9; i++)
        {
            let arr = sud.filter( v => v[key] === i ).map( v => v.value )
            // set values must be unique, so if set length is not then, there must have been repetition of a number
            arr = new Set(arr)
            if(arr.size !== 9)
            {
                return true
            }
        }
    })
}
