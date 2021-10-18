// Application requirements
const mysql = require('mysql2')
const cTable = require('console.table')
const inquirer = require('inquirer')
require('dotenv').config()

// Connection to the database
const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
)
    
db.connect(err => {
    if(err){console.log(err)}       
    else {console.log('Connected to the employees_db database.')}
    createAppHeader();
    initialize();
})

// Make a header in the terminal for the application
function createAppHeader(){
    console.log(`_______________________`)
    console.log(`|                     |`)
    console.log(`|      EMPLOYEE       |`)
    console.log(`|     MANAGEMENT      |`)
    console.log(`|       SYSTEM        |`)
    console.log(`|_____________________|`)
    console.log(`                       `)
    console.log(`                       `)
    console.log(`                       `)
}

// This function will initialize the app by prompting the user what to do; It runs after a successful connection to the DB is made
const initialize = () => {
    inquirer.prompt(
        {
            type: 'list',
            name: 'prompt',
            message: 'What would you like to do?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update and employee role',
                'Quit'
            ]
        }
    )
    .then((response) =>{
        const option = response.prompt
        
        if(option === 'View all departments'){
            showDepartments()
        }
    })

}

// Function for SHOWING DEPARTMENTS
const showDepartments = () => {
    console.log('You have selected to show the departments')
    const showDeptQuery = `SELECT dept_id AS 'Dept ID', dept_name AS Department FROM departments`

    db.query(showDeptQuery, (err, rows) => {
        if(err) throw err
        console.table(rows)
    })
}