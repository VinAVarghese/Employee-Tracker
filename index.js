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
        type: list,
        message: "What would you like to do?",
        choices: ["ADD a department, role, or employee", "VIEW a department, role, employee or utilized budget", "UPDATE assigned roles or managers", "DELETE a department, role, or employee from the tracker", "QUIT Tracker"],
        name: initChoice
    }]).then({ initChoice })
    switch (initChoice) {
        case "ADD a department, role, or employee":
            create();
            break;
        case "VIEW a department, role, employee or utilized budget":
            read();
            break;
        case "UPDATE assigned roles or managers":
            update();
            break;
        case "DELETE a department, role, or employee from the tracker":
            deleter();
            break;
        case "QUIT Tracker":
            console.log("Thank you for using the Employee Tracker. Goodbye.");
            connection.end();
            break;
    }
}

// Create: dept, role, employee
function create() {
    inquirer.prompt([{
        type:list,
        message: "What would you like to ADD?",
        choices: ["Department", "Role", "Employee"],
        name: addChoice
    }]).then ({addChoice})
}

// Read: depts, roles, employees, employee by manager_id, combined salaries of employees in that department
// Update: employees.role_id, employees.manager_id
// Delete: dept, role, employee