var mysql = require("mysql");
var inquirer = require("inquirer");

//UPDATE Functions
const updateRole = (callback, connection) => {
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
                console.log(`\n===================================================\n${answers.empChoice}'s role was successfully updated!\n===================================================`);
                callback();
            })
        })
    })
}

const updateManager = (callback, connection) => {
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
            console.log(`\n===================================================================\n${answers.empChoice}'s manager was successfully updated to ${answers.manaChoice}!\n===================================================================`);
            callback();
        })
    })
}

module.exports = { updateRole, updateManager }