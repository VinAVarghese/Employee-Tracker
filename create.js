var mysql = require("mysql");
var inquirer = require("inquirer");

// CREATE Functions
const addDept = (callback, connection) => {
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
                console.log(`\n====================================================\n${deptName} was successfully added as a department!\n====================================================`);
                callback()
            }
        );
    })
}

const addRole = (callback, connection) => {
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
                return [...choiceArr, "Go HOME: I need to ADD a new department first"]
            },
            name: "deptID",
        }]).then((answers) => {
            switch (answers.deptID) {
                case "Go HOME: I need to ADD a new department first":
                    callback();
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
                            console.log(`\n===============================================\n${answers.title} was successfully added as a new role!\n===============================================`);
                            callback()
                        }
                    );
            }
        })
    })
}

const addEmp = (callback, connection) => {
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
                                console.log(`\n================================================\n${answers.first_name} ${answers.last_name} was successfully added!\n================================================`);
                                callback()
                            }
                        );
                        break;
                }
            })
        })
    })
}


module.exports = { addDept, addRole, addEmp }