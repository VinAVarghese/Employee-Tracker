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
        message: `EMPLOYEE TRACKER HOME:\nWhat would you like to do?`,
        choices: ["ADD (department, role, or employee)", "VIEW (departments, roles, employees or utilized budgets)", "UPDATE (assigned roles or managers)", "DELETE (department, role, or employee)", "QUIT Tracker"],
        name: "initChoice"
    }]).then(({ initChoice }) => {
        switch (initChoice) {
            case "ADD (department, role, or employee)":
                create();
                break;
            case "VIEW (departments, roles, employees or utilized budgets)":
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
        validate: (value) => {
            if ((value) !== '') {
                return true;
            }
            console.log("Please enter a department name.");
            return false;
        }
    }]).then(({ deptName }) => {
        connection.query(
            "INSERT INTO departments SET ?",
            {
                name: deptName
            },
            function (err) {
                if (err) throw err;
                console.log("===============================================\nThe new department was added successfully!\n===============================================");
                init();
            }
        );
    })
}

const addRole = () => {
    connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err;
        inquirer.prompt([{
            type: "input",
            message: "What is the title of the new role?",
            name: "title",
            validate: (value) => {
                if ((value) !== '') {
                    return true;
                }
                console.log("Err: Please enter the ROLE NAME.");
                return false;
            }
        }, {
            type: "number",
            message: "What is the salary of this role?",
            name: "salary",
            // validate: function(value) {
            //     if (isNaN(value) === false) {
            //       return true;
            //     }
            //     console.log("Err: Please enter a NUMBER for the department id.");
            //     return false;
            //   }
        }, {
            type: "list",
            message: "What is the department is this role in?",
            choices: () => {
                const choiceArr = [];
                for (var i = 0; i < res.length; i++) {
                    choiceArr.push(res[i].name);
                }
                return [...choiceArr, "GO BACK: I need to ADD a new department first"]
            },
            name: "deptID",
        }]).then((answers) => {
            switch (answers.deptID) {
                case "GO BACK: I need to ADD a new department first":
                    create();
                    break;
                default:
                    var chosenDept;
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].name === answers.deptID) {
                            chosenDept = res[i];
                        }
                    }
                    connection.query(
                        "INSERT INTO roles SET ?",
                        {
                            title: answers.title,
                            salary: answers.salary,
                            department_id: chosenDept.id
                        },
                        function (err) {
                            if (err) throw err;
                            console.log("===============================================\nThe new role was added successfully!\n===============================================");
                            init();
                        }
                    );
            }
        })
    })
}

const addEmp = () => {
    connection.query("SELECT * FROM employees", function (err, emps) {
        if (err) throw err;
        connection.query("SELECT * FROM roles", function (err, rols) {
            if (err) throw err;

            inquirer.prompt([{
                type: "input",
                message: "What is the FIRST NAME of this new employee?",
                name: "first_name",
                validate: (value) => {
                    if ((value) !== '') {
                        return true;
                    }
                    console.log("Err: Please enter a FIRST NAME.");
                    return false;
                }
            }, {
                type: "input",
                message: "What is the LAST NAME of this new employee?",
                name: "last_name",
                validate: (value) => {
                    if ((value) !== '') {
                        return true;
                    }
                    console.log("Err: Please enter a LAST NAME.");
                    return false;
                }
            }, {
                type: "list",
                message: "What is this employee's role?",
                choices: () => {
                    const roleArr = [];
                    for (var i = 0; i < rols.length; i++) {
                        roleArr.push(rols[i].title);
                    }
                    return [...roleArr]
                },
                name: "roleID",
            }, {
                type: "list",
                message: "Does this employee have a manager?",
                choices: () => {
                    const empArr = [];
                    for (var i = 0; i < emps.length; i++) {
                        empArr.push(emps[i].first_name + " " + emps[i].last_name);
                    }
                    return [...empArr, "None"]
                },
                name: "managerID",
            }]).then((answers) => {
                switch (answers) {
                    default:
                        var chosenRole;
                        for (var i = 0; i < rols.length; i++) {
                            if (rols[i].title === answers.roleID) {
                                chosenRole = rols[i];
                            }
                        }
                        var chosenMana = answers.managerID;
                        for (var i = 0; i < emps.length; i++) {
                            if ((emps[i].first_name + " " + emps[i].last_name) === answers.managerID) {
                                chosenMana = emps[i];
                            }
                        }
                        chosenMana === "None" ? chosenMana.id = null : console.log("\n");
                        connection.query(
                            "INSERT INTO employees SET ?",
                            {
                                first_name: answers.first_name,
                                last_name: answers.last_name,
                                role_id: chosenRole.id,
                                manager_id: chosenMana.id
                            },
                            function (err) {
                                if (err) throw err;
                                console.log("===============================================\nThe new employee was added successfully!\n===============================================");
                                init();
                            }
                        );
                        break;
                }
            })
        })
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
    connection.query("SELECT * FROM employees", function (err, emps) {
        if (err) throw err;
        inquirer.prompt({
            type: "list",
            message: "Choose employee(s) by manager.",
            choices: () => {
                const manaArr = [];
                for (var i = 0; i < emps.length; i++) {
                    manaArr.push(emps[i].first_name + " " + emps[i].last_name);
                }
                return [...manaArr, "Manager Option Not Here"]
            },
            name: "managerID"
        }).then(({ managerID }) => {
            switch (managerID) {
                case "Manager Option Not Here":
                    console.log("=========================================================\n It seems you did not see a manager option or the correct manager on file. We sent you back to the home screen. \n Here, you can assign managers in the UPDATE window or ADD a new employee to be assigned as a manager. \n=========================================================");
                    init();
                    break;
                default:
                        var chosenMana = managerID;
                        for (var i = 0; i < emps.length; i++) {
                            if ((emps[i].first_name + " " + emps[i].last_name) === answers.managerID) {
                                chosenMana = emps[i];
                            }
                        }
                        chosenMana === "None" ? chosenMana.id = null : console.log("\n");
                    connection.query(`SELECT * FROM employees WHERE manager_id = ${managerID}`, function (err, res) {
                        console.table(res);
                        console.log("===============================================\n You can find the requested information above.\n===============================================");
                        nowWhat();
                    });
            }
        });
    })
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

// UPDATE Prompt: Update employees.role_id or employees.manager_id?
const update = () => {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to UPDATE?",
        choices: ["Update an employee's role", "Update an employee's manager", "Go Back"],
        name: "update"
    }]).then(({ update }) => {
        switch (update) {
            case "Update an employee's role":
                updateRole();
                break;
            case "Update an employee's manager":
                updateManager();
                break;
            case "Go Back":
                init();
                break;
        }
    })
}
//UPDATE Functions
const updateRole = () => {
    connection.query("SELECT employees.role_id, employees.first_name, employees.last_name, roles.title, roles.id FROM employees INNER JOIN roles ON (employees.role_id = roles.id)", function (err, res) {
        if (err) throw err;
        inquirer.prompt([{
            type: "rawlist",
            message: "Which employee would you like to update?",
            choices: () => {
                const choiceArr = [];
                for (var i = 0; i < res.length; i++) {
                    choiceArr.push(res[i].first_name + " " + res[i].last_name);
                }
                return choiceArr
            },
            name: "empChoice"
        }, {
            type: "list",
            message: "What would you like their role to changed to?",
            choices: () => {
                const roleArr = [];
                for (var i = 0; i < res.length; i++) {
                    roleArr.push(res[i].title);
                }
                return roleArr
            },
            name: "newRole"
        }]).then(({ empChoice, newRole }) => {
            console.log(empChoice);
            console.log(newRole);
            connection.query("UPDATE employees SET ? WHERE ?", [{}, {}])
        })
    })
}

// Delete: dept, role, employee

// TODO:
// Figure out how to SELECT employees table AND roles table so the update function can inquirer which employee and which role to change to.
// readEmpByManager
    // Need to work on linking employee as manager and their id number as the manager_id value
// readUtilDeptBudget
// Update: employees.manager_id
// Delete: dept, role, employee


