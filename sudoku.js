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
