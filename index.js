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
        message: `\n============================\nEMPLOYEE TRACKER HOME:\nWhat would you like to do?\n============================\n`,
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
        choices: ["All Employees", "Employees by Manager", "Utilized Department Budget", "Go Back"],
        name: "viewChoice"
    }]).then(({ viewChoice }) => {
        switch (viewChoice) {
            case "All Employees":
                readThis();
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
const readThis = () => {
    connection.query(`SELECT employees.first_name, employees.last_name, roles.title, roles.salary, departments.name AS department FROM employees INNER JOIN roles ON (roles.id = employees.role_id) INNER JOIN departments ON (departments.id = roles.department_id) ORDER BY employees.first_name`, function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        console.log("===============================================\n You can find all employee information above.\n===============================================");
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
                    var chosenMana;
                    for (var i = 0; i < emps.length; i++) {
                        if ((emps[i].first_name + " " + emps[i].last_name) === managerID) {
                            chosenMana = emps[i];
                        }
                    }
                    connection.query(`SELECT employees.first_name, employees.last_name FROM employees WHERE manager_id = ${chosenMana.id}`, function (err, res) {
                        console.table(res);
                        console.log("====================================================\n You can find the requested information above.\n If blank, this employee is not assigned as a manager. \n You can go HOME and assign them in the UPDATE window.\n====================================================");
                        nowWhat();
                    });
            }
        });
    })
}

const readUtilDeptBudget = () => {
    connection.query("SELECT employees.first_name, employees.last_name, roles.title, roles.salary, departments.name FROM employees INNER JOIN roles ON (employees.role_id = roles.id) INNER JOIN departments ON (roles.department_id = departments.id)", function (err, res) {
        if (err) throw err
        inquirer.prompt([{
            type: "list",
            message: "Which department's utilized budget would you like to see?",
            choices: () => {
                const tempArr = [];
                for (let i = 0; i < res.length; i++) {
                    tempArr.push(res[i].name)
                }
                let deptArr = [...new Set(tempArr)];
                return deptArr
            },
            name: "deptChoice"
        }]).then(({ deptChoice }) => {
            var salArr = [];

            for (var i = 0; i < res.length; i++) {
                if (res[i].name === deptChoice) {
                    salArr.push(res[i].salary);
                }
            }
            var utilBudget = salArr.reduce((total, num) => total + num);
            console.log(`===============================================================\n The utilized budget for the ${deptChoice} department is $${utilBudget} \n===============================================================`);
            nowWhat();
        })
    })
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
    connection.query("SELECT * FROM employees", function (err, emps) {
        if (err) throw err;
        connection.query("SELECT * FROM roles", function (err, rols) {
            if (err) throw err;
            inquirer.prompt([{
                type: "rawlist",
                message: "Which employee would you like to update?",
                choices: () => {
                    const choiceArr = [];
                    for (var i = 0; i < emps.length; i++) {
                        choiceArr.push(emps[i].first_name + " " + emps[i].last_name);
                    }
                    return choiceArr
                },
                name: "empChoice"
            }, {
                type: "list",
                message: "What would you like their new role to be?",
                choices: () => {
                    const roleArr = [];
                    for (var i = 0; i < rols.length; i++) {
                        roleArr.push(rols[i].title);
                    }
                    return roleArr
                },
                name: "newRole"
            }]).then((answers) => {
                var chosenRole;
                for (var i = 0; i < rols.length; i++) {
                    if (rols[i].title === answers.newRole) {
                        chosenRole = rols[i];
                    }
                }
                var chosenEmp;
                for (var i = 0; i < emps.length; i++) {
                    if ((emps[i].first_name + " " + emps[i].last_name) === answers.empChoice) {
                        chosenEmp = emps[i];
                    }
                }
                connection.query("UPDATE employees SET ? WHERE ?", [{ role_id: chosenRole.id }, { id: chosenEmp.id }], function (err) {
                    if (err) throw err
                })
                console.log(`===================================================\n${answers.empChoice}'s role was successfully updated!\n===================================================`);
                init();
            })
        })
    })
}

const updateManager = () => {
    connection.query("SELECT * FROM employees", function (err, emps) {
        if (err) throw err;
        inquirer.prompt([{
            type: "rawlist",
            message: "Which employee would you like to update?",
            choices: () => {
                const empArr = [];
                for (var i = 0; i < emps.length; i++) {
                    empArr.push(emps[i].first_name + " " + emps[i].last_name);
                }
                return empArr
            },
            name: "empChoice"
        }, {
            type: "list",
            message: "Who will be their new manager?",
            choices: () => {
                const manaArr = [];
                for (var i = 0; i < emps.length; i++) {
                    manaArr.push(emps[i].first_name + " " + emps[i].last_name);
                }
                return manaArr
            },
            name: "manaChoice"
        }]).then((answers) => {
            var newManager;
            for (var i = 0; i < emps.length; i++) {
                if ((emps[i].first_name + " " + emps[i].last_name) === answers.manaChoice) {
                    newManager = emps[i];
                }
            }
            var chosenEmp;
            for (var i = 0; i < emps.length; i++) {
                if ((emps[i].first_name + " " + emps[i].last_name) === answers.empChoice) {
                    chosenEmp = emps[i];
                }
            }
            connection.query("UPDATE employees SET ? WHERE ?", [{ manager_id: newManager.id }, { id: chosenEmp.id }], function (err) {
                if (err) throw err
            })
            console.log(`===================================================================\n${answers.empChoice}'s manager was successfully updated to ${answers.manaChoice}!\n===================================================================`);
            init();
        })
    })
}

// Delete Prompt: Delete dept, role, employee?
const deleter = () => {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to DELETE from the tracker?",
        choices: ["A department", "A role", "An employee", "Go Back"],
        name: "addChoice"
    }]).then(({ addChoice }) => {
        switch (addChoice) {
            case "A department":
                deleteDept();
                break;
            case "A role":
                deleteRole();
                break;
            case "An employee":
                deleteEmp();
                break;
            case "Go Back":
                init();
                break;
        }
    })
}
// DELETE Functions
const deleteDept = () => {
    connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err
        inquirer.prompt([{
            type: "list",
            message: "Which department would you like to delete?",
            choices: () => {
                const deptArr = [];
                for (var i = 0; i < res.length; i++) {
                    deptArr.push(res[i].name);
                }
                return deptArr
            },
            name: "deptChoice"
        }]).then(({deptChoice})=>{
            connection.query("DELETE FROM departments WHERE ?", {name:deptChoice}, function (err,res) {
                if (err) {    
                    console.log(`===================================================================\nYou cannot delete ${deptChoice} because there are employees and roles assigned to it!\nTry deleting nested employees and roles first. \n===================================================================`);
                    deleter();
                } else {
                    console.log(`===================================================================\n${deptChoice} was successfully deleted from the tracker!\n===================================================================`);
                    init();
                }
            })
        })
    })
}

const deleteRole = () => {
    connection.query("SELECT * FROM roles", function (err, res) {
        if (err) throw err
        inquirer.prompt([{
            type: "list",
            message: "Which role would you like to delete?",
            choices: () => {
                const roleArr = [];
                for (var i = 0; i < res.length; i++) {
                    roleArr.push(res[i].title);
                }
                return roleArr
            },
            name: "roleChoice"
        }]).then(({roleChoice})=>{
            connection.query("DELETE FROM roles WHERE ?", {title:roleChoice}, function (err,res) {
                if (err) {
                    console.log(`===================================================================\nYou cannot delete ${roleChoice} because there are employees assigned to it! \nTry deleting nested employees first.\n===================================================================`);
                    deleter();
                } else {
                    console.log(`===================================================================\n${roleChoice} was successfully deleted from the tracker!\n===================================================================`);
                    init();
                }
            })
        })
    })
}

const deleteEmp = () => {
    connection.query("SELECT * FROM employees", function (err, res) {
        if (err) throw err
        inquirer.prompt([{
            type: "list",
            message: "Which emp would you like to delete?",
            choices: () => {
                const empArr = [];
                for (var i = 0; i < res.length; i++) {
                    empArr.push(res[i].first_name + " " + res[i].last_name);
                }
                return empArr
            },
            name: "empChoice"
        }]).then(({empChoice})=>{
            var chosenEmp;
            for (var i = 0; i < res.length; i++) {
                if ((res[i].first_name + " " + res[i].last_name) === empChoice) {
                    chosenEmp = res[i].id;
                }
            }
            connection.query("DELETE FROM employees WHERE ?", {id:chosenEmp}, function (err,res) {
                if (err) {
                    console.log(`===================================================================\nYou cannot delete ${empChoice} because they are a manager with assigned employees! \nTry deleting their nested employees first.\n===================================================================`);
                    deleter();
                } else { 
                    console.log(`===================================================================\n${empChoice} was successfully deleted from the tracker!\n===================================================================`);
                    init();
                }
            })
        })
    })
}



// TODO:

// Modularize to spread out code (figure out why init function won't export)


