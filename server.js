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

        } else if(option === 'View all roles'){
            showRoles()

        } else if(option === 'View all employees'){
            showEmployees()

        }
    })

}

// Function for SHOWING DEPARTMENTS
const showDepartments = () => {
    createQueryHeader('Viewing All Departments')
    const showDeptQuery = `
    SELECT 
        dept_id AS 'Dept ID', 
        dept_name AS Department 
    FROM departments`

    db.query(showDeptQuery, (err, rows) => {
        if(err) throw err
        console.table(rows)
    })
}

// Function for showing ALL ROLES
const showRoles = () => {
    createQueryHeader('Viewing All Roles')
    const showRolesQuery = `
    SELECT 
        role_id AS 'Role ID', 
        title AS 'Title', 
        salary AS 'Salary', 
        dept_name AS Department 
    FROM roles 
    INNER JOIN departments 
        ON roles.dept_id = departments.dept_id;`

    db.query(showRolesQuery, (err, rows) => {
        if(err) throw err
        console.table(rows)
    })
}

// Function for showing ALL EMPLOYEES
// const showEmployees = () => {
//     createQueryHeader('Viewing All Employees')
//     const showRolesQuery = `
//     SELECT 
//         emp_id AS 'EID', 
//         first_name AS 'First', 
//         last_name AS 'Last', 
//         title AS Title,
//         dept_name AS Department,
//         salary AS Salary,
//     FROM employees
//     LEFT JOIN roles
//         ON employees.role_id = roles.role_id
//     LEFT JOIN departments
//         ON employees.dept_id = departments.dept_id;`

//     db.query(showRolesQuery, (err, rows) => {
//         if(err) throw err
//         console.table(rows)
//     })
// }








// Helper Functions
const createQueryHeader = (queryName) => {
    console.log(`____________________________`)
    console.log(`                            `)
    console.log(`\n${queryName}\n`)
    console.log(`____________________________`)
    console.log(`                            `)
}
