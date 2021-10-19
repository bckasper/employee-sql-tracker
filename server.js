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
    
    // Process to get all of the departments into an array for the inquirer choices
    const depts = []
    const deptQuery = `SELECT * FROM departments`
    db.query(deptQuery, (err, rows) => {
        if(err) throw err
        for(let i = 0; i<rows.length; i++){
            depts.push(rows[i].dept_name)
        }
        return depts
    })

    // Inquirer Prompt
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the name of the new role you would like to add?',
            name: 'roleName',
            validate: roleName => {
                if(roleName){
                    return true
                } else {
                    console.log('\nPlease enter a valid role name.\n')
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
    createQueryHeader('Adding a new employee')
    
    // Process to get all of the roles into an array for the inquirer choices
    const rolesArray = []
    const rolesQuery = `SELECT * FROM roles`
    db.query(rolesQuery, (err, rows) => {
        if(err) throw err
        for(let i = 0; i<rows.length; i++){
            rolesArray.push(rows[i].title)
        }
        return rolesArray
    })

    // Process to get all of the employees into an array for the inquirer choices of managers
    const empArray = ['None']
    const empQuery = `SELECT emp_id, first_name, last_name FROM employees WHERE (emp_id IN (SELECT manager_id FROM employees))`
    db.query(empQuery, (err, rows) => {
        if(err) throw err
        for(let i = 0; i<rows.length; i++){
            empArray.push(rows[i].first_name + ' ' + rows[i].last_name)
        }
        return empArray
    })

    // Inquirer prompts
    inquirer.prompt([
        {
            type: 'input',
            message: `What is the employee's first name?`,
            name: 'firstName',
            validate: firstName => {
                if(firstName){
                    return true
                } else {
                    console.log('\nPlease enter a first name.\n')
                    return false
                }
            }
        },
        {
            type: 'input',
            message: `What is the employee's last name?`,
            name: 'lastName',
            validate: lastName => {
                if(lastName){
                    return true
                } else {
                    console.log('\nPlease enter a first name.\n')
                    return false
                }
            }
        },
        {
            type: 'list',
            message: `Please select the employee's role.`,
            name: 'newEmpRole',
            choices: rolesArray
        },
        {
            type: 'list',
            message: `Please select the employee's manager.`,
            name: 'newEmpMgr',
            choices: empArray,
        }
    ])
        .then(response => {
            const firstName = response.firstName
            const lastName = response.lastName
            const newEmpRole = response.newEmpRole
            const newEmpMgr = response.newEmpMgr

            const getRoleID = `SELECT role_id FROM roles WHERE title = '${newEmpRole}'`
            
            // This is the path if the user selects "None" for a manager
            if(newEmpMgr === 'None'){
                // Query to insert the employee into the employees table
                const addEmpQuery = `
                    INSERT INTO employees (first_name, last_name, role_id, manager_id)
                    VALUES ("${firstName}", "${lastName}", (${getRoleID}), Null);`
    
                // Query execution of inserting the employee into the employee table
                db.query(addEmpQuery, (err) => {
                        if(err) throw err
                        createMessage(`${firstName} ${lastName} added to the employees table!`)
                        initialize()
                    })
            
            // This is the path if the user selects someone as a manager
            } else {

                // Query that will get the employee ID of the manager from the concat of first_name and last_name
                db.query(`SELECT emp_id FROM employees WHERE CONCAT(first_name, " ",last_name) = '${newEmpMgr}'`, (err, row) => {
                    if(err) throw err
                    
                    
                    // Result from the query to get the employee ID of the manager
                    const mgrID =  row[0].emp_id
    
                    // Query to insert the employee into the employees table
                    const addEmpQuery = `
                        INSERT INTO employees (first_name, last_name, role_id, manager_id)
                        VALUES ("${firstName}", "${lastName}", (${getRoleID}), (${mgrID}));`
        
                    // Query execution of inserting the employee into the employee table
                    db.query(addEmpQuery, (err) => {
                            if(err) throw err
                            createMessage(`${firstName} ${lastName} added to the employees table!`)
                            initialize()
                        })
                    })     
                }
            })           
            
}

const updateEmployee = () => {
    createQueryHeader('Updating an employee')

    // Process to get all of the roles into an array for the inquirer choices
    const rolesArray = []
    const rolesQuery = `SELECT * FROM roles`
    db.query(rolesQuery, (err, rows) => {
        if(err) throw err
        for(let i = 0; i<rows.length; i++){
            rolesArray.push(rows[i].title)
        }
        return rolesArray
    })

    // Process to get all of the employees into an array for the inquirer choices of managers
    const empArray = []
    const empQuery = `SELECT emp_id, first_name, last_name FROM employees`
    db.query(empQuery, (err, rows) => {
        if(err) throw err
        for(let i = 0; i<rows.length; i++){
            empArray.push(rows[i].first_name + ' ' + rows[i].last_name)
        }
        return empArray
    })

    // Inquirer Prompt
    inquirer.prompt([
        {
            type: 'list',
            message: `Which employee would you like to update?`,
            name: 'employee',
            choices: empArray
        },
        {
            type: 'list',
            message: `Which role would you like to assign to this employee?`,
            name: 'employee',
            choices: rolesArray
        }
    ])
      .then((responses) => {
          
      })

}







// Helper Functions
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

// Make a query header in the terminal
const createQueryHeader = (queryName) => {
    console.log(`____________________________`)
    console.log(`                            `)
    console.log(`\n${queryName}\n`)
    console.log(`____________________________`)
    console.log(`                            `)
}

// Create  message in the terminal
const createMessage = (message) => {
    console.log(`                            `)
    console.log(`****************************`)
    console.log(`\n${message}\n`)
    console.log(`****************************`)
    console.log(`                            `)
}
