var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",
    password: "password",
    database: "employee_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    init();
});

// Init Function: Prompts the user to choose what they'd like to do
const init = () => {
    inquirer.prompt([{
        type: "list",
        message: `EMPLOYEE TRACKER HOME: What would you like to do?`,
        choices: ["ADD (department, role, or employee)", "VIEW (department, role, employee or utilized budget)", "UPDATE (assigned roles or managers)", "DELETE (department, role, or employee)", "QUIT Tracker"],
        name: "initChoice"
    }]).then(({ initChoice }) => {
        switch (initChoice) {
            case "ADD (department, role, or employee)":
                create();
                break;
            case "VIEW (department, role, employee or utilized budget)":
                read();
                break;
            case "UPDATE (assigned roles or managers)":
                update();
                break;
            case "DELETE (department, role, or employee)":
                deleter();
                break;
            case "QUIT Tracker":
                console.log("Thank you for using the EMPLOYEE TRACKER. Goodbye.");
                connection.end();
                break;
        }
    })
}

// CREATE Prompt: Add dept, role or employee?
const create = () => {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to ADD?",
        choices: ["Department", "Role", "Employee", "Go Back"],
        name: "addChoice"
    }]).then(({ addChoice }) => {
        switch (addChoice) {
            case "Department":
                addDept();
                break;
            case "Role":
                addRole();
                break;
            case "Employee":
                addEmp();
                break;
            case "Go Back":
                init();
                break;
        }
    })
}
// CREATE Functions
const addDept = () => {
    inquirer.prompt([{
        type: "input",
        message: "What is the new department's name?",
        name: "deptName",
        // validate: (value) => {
        //     if ((value) !== '') {
        //         return true;
        //     }
        //     console.log("Please enter a department name.");
        //     return false;
        // }
    }]).then(({ deptName }) => {
        connection.query(
            "INSERT INTO departments SET ?",
            {
                name: deptName
            },
            function (err) {
                if (err) throw err;
                console.log("The new department was added successfully!");
                init();
            }
        );
    })
}

const addRole = () => {
    inquirer.prompt([{
        type: "input",
        message: "What is the title of the new role?",
        name: "title",
        // validate: (value) => {
        //     if ((value) !== '') {
        //         return true;
        //     }
        //     console.log("Err: Please enter a DEPARTMENT NAME.");
        //     return false;
        // }
    }, {
        type: "number",
        message: "What is the salary of this role?",
        name: "salary",
        // validate: function(value) {
        //     if (isNaN(value) === false) {
        //       return true;
        //     }
        //     console.log("Err: Please enter a NUMBER for the salary.");
        //     return false;
        //   }
    }, {
        type: "number",
        message: "What is the department id for this role?",
        name: "deptID",
        // validate: function(value) {
        //     if (isNaN(value) === false) {
        //       return true;
        //     }
        //     console.log("Err: Please enter a NUMBER for the department id.");
        //     return false;
        //   }
    }]).then((answers) => {
        connection.query(
            "INSERT INTO roles SET ?",
            {
                title: answers.title,
                salary: answers.salary,
                department_id: answers.deptID
            },
            function (err) {
                if (err) throw err;
                console.log("The new role was added successfully!");
                init();
            }
        );
    })
}

const addEmp = () => {
    inquirer.prompt([{
        type: "input",
        message: "What is the FIRST NAME of this new employee?",
        name: "first_name",
        // validate: (value) => {
        //     if ((value) !== '') {
        //         return true;
        //     }
        //     console.log("Err: Please enter a DEPARTMENT NAME.");
        //     return false;
        // }
    }, {
        type: "input",
        message: "What is the LAST NAME of this new employee?",
        name: "last_name",
        // validate: (value) => {
        //     if ((value) !== '') {
        //         return true;
        //     }
        //     console.log("Err: Please enter a DEPARTMENT NAME.");
        //     return false;
        // }
    }, {
        type: "number",
        message: "What is the role id for this employee?",
        name: "roleID",
        // validate: function(value) {
        //     if (isNaN(value) === false) {
        //       return true;
        //     }
        //     console.log("Err: Please enter a NUMBER for the role id.");
        //     return false;
        //   }
    }, {
        type: "number",
        message: "What is the manager id for this employee?",
        name: "managerID",
        // validate: function(value) {
        //     if (isNaN(value) === false) {
        //       return true;
        //     }
        //     console.log("Err: Please enter a NUMBER for the manager id.");
        //     return false;
        //   }
    }]).then((answers) => {
        connection.query(
            "INSERT INTO employees SET ?",
            {
                first_name: answers.first_name,
                last_name: answers.last_name,
                role_id: answers.roleID,
                manager_id: answers.managerID
            },
            function (err) {
                if (err) throw err;
                console.log("The new employee was added successfully!");
                init();
            }
        );
    })
}

// READ Prompt: View dept, role, employee, employee by manager or utilized department budget?
const read = () => {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to VIEW?",
        choices: ["Departments", "Roles", "Employees", "Employees by Manager", "Utilized Department Budget", "Go Back"],
        name: "viewChoice"
    }]).then(({ viewChoice }) => {
        switch (viewChoice) {
            case "Departments":
                readThis(viewChoice);
                break;
            case "Roles":
                readThis(viewChoice);
                break;
            case "Employees":
                readThis(viewChoice);
                break;
            case "Employees by Manager":
                readEmpByManager();
                break;
            case "Utilized Department Budget":
                readUtilDeptBudget();
                break;
            case "Go Back":
                init();
                break;
        }
    })
}
// READ Functions
const readThis = (viewChoice) => {
    connection.query(`SELECT * FROM ${viewChoice}`, function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        console.log("===============================================\n You can find the requested information above.\n===============================================");
        nowWhat();
    })
}

const readEmpByManager = () => {
    inquirer.prompt({
        type:number,
        message:"Enter the manager's id",
        name:managerID
    }).then(({managerID}) => {
        connection.query(`SELECT * FROM employees WHERE employees.manager_id === ${managerID}`, function (err,res){

        });
    });
}

const readUtilDeptBudget = () => {

}

const nowWhat = () => {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to do next?",
        choices: ["Go HOME", "VIEW (something else)", "QUIT Tracker"],
        name: "nextChoice"
    }]).then(({ nextChoice }) => {
        switch (nextChoice) {
            case "Go HOME":
                init();
                break;
            case "VIEW (something else)":
                read();
                break;
            case "QUIT Tracker":
                console.log("Thank you for using the EMPLOYEE TRACKER. Goodbye.");
                connection.end();
                break;
        }
    })
}

// Update: employees.role_id, employees.manager_id
// Delete: dept, role, employee