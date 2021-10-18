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
            ]
        }
    )
}