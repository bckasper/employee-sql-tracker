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
                'Update an employee role',
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

        } else if(option === 'Add a department'){
            addDepartment()

        } else if(option === 'Add a role'){
            addRole()

        } else if(option === 'Add an employee'){
            addEmployee()

        } else if(option === 'Update an employee role'){
            updateEmployee()

        } else if(option === 'Quit'){
            console.log('Goodbye')
            db.end()
            process.exit()
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
        initialize()
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
        initialize()
    })
}

// Function for showing ALL EMPLOYEES
const showEmployees = () => {
    createQueryHeader('Viewing All Employees')
    const showRolesQuery = `
    SELECT 
        emp_id AS 'EID', 
        first_name AS 'First', 
        last_name AS 'Last', 
        title AS Title,
        dept_name AS Department,
        salary AS Salary,
        manager_id AS 'Manager ID'
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.role_id
    LEFT JOIN departments ON roles.dept_id = departments.dept_id;`

   db.query(showRolesQuery, (err, rows) => {
        if(err) throw err
        console.table(rows)
        initialize()
    })
}

// Function for showing ADDING A NEW DEPARTMENT
const addDepartment = () => {
    createQueryHeader('Adding a new department')
    
    inquirer.prompt(
        {
            type: 'input',
            message: 'What is the name of the department you would like to add?',
            name: 'newDepartment'
        }
    )
        .then(response => {
            const newDept = response.newDepartment
            const addDepartmentQuery = `
                INSERT INTO departments (dept_name)
                VALUES ("${newDept}");`
        
                db.query(addDepartmentQuery, (err) => {
                        if(err) throw err
                        createMessage(`${newDept} added to the departments table!`)
                        initialize()
                    })
            })     
}

// Function for ADDING A NEW ROLE
const addRole = () => {
    createQueryHeader('Adding a new role')
    
    const depts = []
    const deptQuery = `SELECT * FROM departments`
    db.query(deptQuery, (err, rows) => {
        if(err) throw err
        for(let i = 0; i<rows.length; i++){
            depts.push(rows[i].dept_name)
        }
        return depts
    })

    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the new role you would like to add?',
            name: 'roleName',
            validate: roleName => {
                if(roleName){
                    return true
                } else {
                    console.log('\nPlease enter valid a role name.\n')
                    return false
                }
            }
        },
        {
            type: 'input',
            message: 'What is the salary for the new role you are adding?',
            name: 'newSalary',
            validate: newSalary => {
                if(isNaN(newSalary) || !newSalary){
                    console.log('\nPlease enter a number.\n')
                    return false
                } else {
                    return true
                }
            }
        },
        {
            type: 'list',
            message: 'Please select a department for this role.',
            name: 'newRoleDept',
            choices: depts
        }
    ])
        .then(response => {
            const roleName = response.roleName
            const newSalary = response.newSalary
            const newRoleDept = response.newRoleDept
            
            const getDeptID = `SELECT dept_id FROM departments WHERE dept_name = '${newRoleDept}'`

            const addRoleQuery = `
                INSERT INTO roles (title, salary, dept_id)
                VALUES ("${roleName}", ${newSalary}, (${getDeptID}));`
        
                db.query(addRoleQuery, (err) => {
                        if(err) throw err
                        createMessage(`${roleName} added to the roles table!`)
                        initialize()
                    })
            })     
}

// Function for ADDING A NEW EMPLOYEE
const addEmployee = () => {
    createQueryHeader('Adding a new role')
    
    const depts = []
    const deptQuery = `SELECT * FROM departments`
    db.query(deptQuery, (err, rows) => {
        if(err) throw err
        for(let i = 0; i<rows.length; i++){
            depts.push(rows[i].dept_name)
        }
        return depts
    })

    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the new role you would like to add?',
            name: 'roleName',
            validate: roleName => {
                if(roleName){
                    return true
                } else {
                    console.log('\nPlease enter valid a role name.\n')
                    return false
                }
            }
        },
        {
            type: 'input',
            message: 'What is the salary for the new role you are adding?',
            name: 'newSalary',
            validate: newSalary => {
                if(isNaN(newSalary) || !newSalary){
                    console.log('\nPlease enter a number.\n')
                    return false
                } else {
                    return true
                }
            }
        },
        {
            type: 'list',
            message: 'Please select a department for this role.',
            name: 'newRoleDept',
            choices: depts
        }
    ])
        .then(response => {
            const roleName = response.roleName
            const newSalary = response.newSalary
            const newRoleDept = response.newRoleDept
            
            const getDeptID = `SELECT dept_id FROM departments WHERE dept_name = '${newRoleDept}'`

            const addRoleQuery = `
                INSERT INTO roles (title, salary, dept_id)
                VALUES ("${roleName}", ${newSalary}, (${getDeptID}));`
        
                db.query(addRoleQuery, (err) => {
                        if(err) throw err
                        createMessage(`${roleName} added to the roles table!`)
                        initialize()
                    })
            })     
}



// Helper Functions
const createQueryHeader = (queryName) => {
    console.log(`____________________________`)
    console.log(`                            `)
    console.log(`\n${queryName}\n`)
    console.log(`____________________________`)
    console.log(`                            `)
}

const createMessage = (message) => {
    console.log(`                            `)
    console.log(`****************************`)
    console.log(`\n${message}\n`)
    console.log(`****************************`)
    console.log(`                            `)
}