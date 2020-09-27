const randomIndex = array => Math.floor(Math.random()*array.length)
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const solve = sudoku => {
    let { s, d } = checkPossibles(sudoku)
    if(d)
    {
        return s
    }
    else
    {
        return solve(s)
    }
}

const checkPossibles = sudoku => {
    const checkRow = row => {
        const newRow = []
        row.map( (content, index) => {
            // if not number, process
            if(typeof content !== "number")
            {
                let lack
                if(content === '')
                {
                    lack = numbers
                }
                // turn current possibles to array to be processed
                else
                {
                    lack = content.split("").map( num => parseInt(num) )
                }
                
                // check row and new row to look for possibles
                lack = lack.filter( num => !row.includes(num) ).filter( num => !newRow.includes(num) )
                
                // if only one possible turn to num
                if(lack.length == 1){
                    newRow[index] = parseInt(lack)
                    return 0
                }
    
                
                newRow[index] = lack.join("")
                return 0
            }
            else
            {
                newRow[index] = content
                return 0
            }
        })
    
        // check for duplicate possibles in newRow
    
        // get all strings, filter out undefines and sort
        let blanks = newRow.map( (val, i) => {
            if(typeof val === "string")
            {
                return {
                    index: i,
                    value: val
                }
            }
        }).filter( val => val ).sort()
    
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
            
            // find duplicates of current val
            const dup = findDups(blanks, x)
            if(dup == blanks[x].value.length)
            {
                // get array of substrings of current value
                const cur = blanks[x].value.split("")
    
                // check all blanks and rid all other blanks of nums in cur
                blanks = blanks.map( ({index, value}) => {
                    
                    if(value != blanks[x].value)
                    {
                        // split value, allor only !num in cur, parse back tgt 
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
            newRow[index] = value //value.length === 1 ? parseInt(value) : value
        })
        
        return newRow
    }

    const checkCol = sud => {
        const newSud = []
        for(let i = 0; i < 9; i++)
        {   
            // create one dimensional array from column
            let col = sud.map( row => row[i] )
            col = checkRow(col)
            col.map( (num, index) => {
                if(!newSud[index])
                {
                    newSud[index] = []
                }
                newSud[index][i] = num
            })
        }
        return newSud
    }

    const checkPalace = sud => {
        // init output var
        const newSud = []
        let rows
        for(let r = 0; r < 9; r+=3)
        {   
            // get three rows starting from 0/3/6
            rows = [sud[r], sud[r+1], sud[r+2]]
            let palace
            for(let c = 0; c < 9; c+=3)
            {
                // get from rows the content in cols starting from 0/3/6 then reduce to one dimension
                palace = rows.map( row => [row[c], row[c+1], row[c+2]] ).reduce((acc, cur) => [...acc, ...cur], [])
                palace = checkRow(palace)
    
                // return palace to respective slots in sudoku
                palace.map( (num, index) => {
                    // get row category => i + r will be the row it was originally from and (index - i*3) + c will be the original col
                    let i = Math.floor(index / 3)
                    if(!newSud[i+r])
                    {
                        newSud[i+r] = []
                    }
    
                    newSud[i+r][(index-i*3)+c] = num
                })
            }
        }
    
        return newSud
    }

    let newSudoku = sudoku.map( row => {
        return checkRow(row)
    })

    newSudoku = checkPalace(checkCol(newSudoku))

    const done = deepCompare(newSudoku, sudoku)

    if(done)
    {
        //TODO find unique and replace with unique
        newSudoku.map( row => findUnique(row) )

        for(let i = 0; i < 9; i++)
        {   
            // create one dimensional array from column
            let col = newSudoku.map( row => row[i] )
            col = findUnique(col)
            col.map( (num, index) => {
                newSudoku[index][i] = num
            })
        }

        let rows
        for(let r = 0; r < 9; r+=3)
        {   
            // get three rows starting from 0/3/6
            rows = [newSudoku[r], newSudoku[r+1], newSudoku[r+2]]
            let palace
            for(let c = 0; c < 9; c+=3)
            {
                // get from rows the content in cols starting from 0/3/6 then reduce to one dimension
                palace = rows.map( row => [row[c], row[c+1], row[c+2]] ).reduce((acc, cur) => [...acc, ...cur], [])
                palace = findUnique(palace)
    
                // return palace to respective slots in sudoku
                palace.map( (num, index) => {
                    // get row category => i + r will be the row it was originally from and (index - i*3) + c will be the original col
                    let i = Math.floor(index / 3)
                    if(!newSudoku[i+r])
                    {
                        newSudoku[i+r] = []
                    }
    
                    newSudoku[i+r][(index-i*3)+c] = num
                })
            }
        }

    }

    return { s: newSudoku, d: deepCompare(newSudoku, sudoku) }
}

const deepCompare = (arr1, arr2) => {
    let res = true
    let count = 0;

    while(res && count < arr1.length)
    {
        const diff = arr1[count].some( (val, i) => {
            return val != arr2[count][i]
        })

        if(diff)
        {
            res = false
        }

        count++
    }

    return res
}

const findUnique = row => {
    //get blanks in a row
    const newRow = []

    const blanks = row.map( (value, index) => {
        newRow[index] = value
        if(typeof value == "string")
        {
            return { value, index }
        }
    }).filter( v => v )

    blanks.map( ({ value, index }, i) => {
        value.split("").map( num => {
            let rep = false
            for(let x = 0; x < blanks.length; x++)
            {
                if(x == i) continue
                if(blanks[x].value.includes(num))
                {
                    rep = true
                    break
                }
            }

            if(!rep)
            {
                blanks[i].value = num
                newRow[index] = num
            }
        })
    })
    return newRow

}

