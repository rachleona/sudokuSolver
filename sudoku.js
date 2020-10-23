const randomIndex = array => Math.floor(Math.random()*array.length)
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const sudokuSolver = sud => {
    const input = getPositionObjects(sud)
    let output = solve(input)

    while(!output.every( v => typeof v.value === "number" ))
    {
        output = guess(output)
        output = solve(output)
    }

    const res = [...Array(9).keys()].map( n => [] )
    output.map( ({ row, column, value }) => {
        res[row][column] = value
    })

    return res
}

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

const possibles = sudoku => {
    // basic possibility elimination logic on each row, column and palace
    let newSudoku = extract(extract(extract(sudoku, "row", check), "column", check), "palace", check)

    // if not further elimination was possible, then elimination process is done for now
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

const unique = row => {
    const newRow = [...row]

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
        value.split("").map( num => {
            let rep = false
            for(let x = 0; x < blanks.length; x++)
            {
                if(x == i) continue
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

const deepCompare = (a, b) => {
    return !a.some( (v, i) => {
        return b[i].value !== v.value
    })
}

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

const regional = sud => {
    const newSudoku = sud.map( ({ value, row, column, palace }) => { return { value, row, column, palace}} )

    for(let x = 0; x < newSudoku.length; x++)
    {
        const { value, row, column, palace } = newSudoku[x]
        if(typeof value !== "string") continue

        let thisRow = sud.filter( v => v.row === row && typeof v.value === "string")
        let thisCol = sud.filter( v => v.column === column && typeof v.value === "string")
        let thisPal = sud.filter( v => v.palace === palace  && typeof v.value === "string")

        value.split("")
        .map( n => {
            // process palace first
            let commonPosibility = thisPal.filter( v => v.value.split("").includes(n) )
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
            else if(commonPosibility.every( v => v.row === row ))
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
                    v.row === row ? v : 
                    { 
                        ...v, 
                        value: v.value.split("").filter( num => num !== n ).join("") 
                    }
                )
            }

        })
        
        const newStuff = [...thisCol, ...thisRow, ...thisPal]

        newStuff.map( ({v, r, c, p}) => {
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

const guess = sud => {
    const cur = sud.find( v => typeof v.value !== "number" )
    const pos =  cur.value.split("").map( v => parseInt(v) )
    for(let x = 0; x < pos.length; x++)
    {
        sud[cur.row * 9 + cur.column].value = pos[x]
        let res = possibles(sud)
        while(!res.d)
        {
            res = possibles(res.s)
        }

        if(res.s.find( v => v.value == ''))
        {
            sud[cur.row][cur.column] = cur.value
            continue
        }
        else
        {
            return res.s
        }
    }
}
