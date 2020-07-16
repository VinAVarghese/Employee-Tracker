var mysql = require("mysql");
var inquirer = require("inquirer");
var c = require("./create");
var r = require("./read");
var u = require("./update");
var d = require("./deleter");

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
    console.log(`\n============================\nEMPLOYEE TRACKER: HOME MENU\n============================`);
    inquirer.prompt([{
        type: "list",
        message: "What would you like to do?",
        choices: ["ADD (department, role, or employee)", "VIEW (employees or utilized budgets)", "UPDATE (assigned roles or managers)", "DELETE (department, role, or employee)", "QUIT Tracker"],
        name: "initChoice"
    }]).then(({ initChoice }) => {
        switch (initChoice) {
            case "ADD (department, role, or employee)":
                create();
                break;
            case "VIEW (employees or utilized budgets)":
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
    console.log(`\n============================\nEMPLOYEE TRACKER: ADD MENU\n============================`);
    inquirer.prompt([{
        type: "list",
        message: "What would you like to ADD?",
        choices: ["Department", "Role", "Employee", "Go HOME"],
        name: "addChoice"
    }]).then(({ addChoice }) => {
        switch (addChoice) {
            case "Department":
                c.addDept(init, connection);
                break;
            case "Role":
                c.addRole(init, connection);
                break;
            case "Employee":
                c.addEmp(init, connection);
                break;
            case "Go HOME":
                init();
                break;
        }
    })
}

// READ Prompt: View dept, role, employee, employee by manager or utilized department budget?
const read = () => {
    console.log(`\n============================\nEMPLOYEE TRACKER: VIEW MENU\n============================`);
    inquirer.prompt([{
        type: "list",
        message: "What would you like to VIEW?",
        choices: ["All Employees", "Employees by Manager", "Utilized Department Budget", "Go HOME"],
        name: "viewChoice"
    }]).then(({ viewChoice }) => {
        switch (viewChoice) {
            case "All Employees":
                r.readThis(init, read, connection);
                break;
            case "Employees by Manager":
                r.readEmpByManager(init, read, connection);
                break;
            case "Utilized Department Budget":
                r.readUtilDeptBudget(init, read, connection);
                break;
            case "Go HOME":
                init();
                break;
        }
    })
}

// UPDATE Prompt: Update employees.role_id or employees.manager_id?
const update = () => {
console.log(`\n=============================\nEMPLOYEE TRACKER: UPDATE MENU\n=============================`);
    inquirer.prompt([{
        type: "list",
        message: "What would you like to UPDATE?",
        choices: ["Update an employee's role", "Update an employee's manager", "Go HOME"],
        name: "update"
    }]).then(({ update }) => {
        switch (update) {
            case "Update an employee's role":
                u.updateRole(init,connection);
                break;
            case "Update an employee's manager":
                u.updateManager(init,connection);
                break;
            case "Go HOME":
                init();
                break;
        }
    })
}

// Delete Prompt: Delete dept, role, employee?
const deleter = () => {
    console.log(`\n=============================\nEMPLOYEE TRACKER: DELETE MENU\n=============================`);
    inquirer.prompt([{
        type: "list",
        message: "What would you like to DELETE from the tracker?",
        choices: ["A department", "A role", "An employee", "Go HOME"],
        name: "addChoice"
    }]).then(({ addChoice }) => {
        switch (addChoice) {
            case "A department":
                d.deleteDept(init, deleter, connection);
                break;
            case "A role":
                d.deleteRole(init, deleter, connection);
                break;
            case "An employee":
                d.deleteEmp(init, deleter, connection);
                break;
            case "Go HOME":
                init();
                break;
        }
    })
}

