var mysql = require("mysql");
var inquirer = require("inquirer");

// READ Functions
const readThis = (callback, callback2, connection) => {
    connection.query(`SELECT employees.first_name, employees.last_name, roles.title, roles.salary, departments.name AS department FROM employees INNER JOIN roles ON (roles.id = employees.role_id) INNER JOIN departments ON (departments.id = roles.department_id) ORDER BY employees.first_name`, function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        console.log("\n===============================================\n You can find all employee information above.\n===============================================");
        nowWhat(callback, callback2, connection);
    })
}

const readEmpByManager = (callback, callback2, connection) => {
    connection.query("SELECT * FROM employees", function (err, emps) {
        if (err) throw err;
        inquirer.prompt({
            type: "list",
            message: "View employee(s) under which manager?",
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
                    console.log("\n================================================================================\n It seems you did not see a manager option or the correct manager on file. We sent you back to the home screen. \n Here, you can UPDATE assigned managers or ADD a new employee to be assigned as a manager. \n================================================================================");
                    callback();
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
                        console.log(`\n===============================================================\n You can find the employee's ${managerID} manages above.\n\n If blank, ${managerID} is not assigned as a manager. \n You can go to the UPDATE MENU to assign employees to them.\n===============================================================`);
                        nowWhat(callback, callback2, connection);
                    });
            }
        });
    })
}

const readUtilDeptBudget = (callback, callback2, connection) => {
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
            console.log(`\n===============================================================\n The utilized budget for the ${deptChoice} department is $${utilBudget} \n===============================================================`);
            nowWhat(callback, callback2, connection);
        })
    })
}

const nowWhat = (callback, callback2, connection) => {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to do next?",
        choices: ["Go HOME", "VIEW (something else)", "QUIT Tracker"],
        name: "nextChoice"
    }]).then(({ nextChoice }) => {
        switch (nextChoice) {
            case "Go HOME":
                callback();
                break;
            case "VIEW (something else)":
                callback2();
                break;
            case "QUIT Tracker":
                console.log("\nThank you for using the EMPLOYEE TRACKER. Goodbye.");
                connection.end();
                break;
        }
    })
}

module.exports = { readThis, readEmpByManager, readUtilDeptBudget, nowWhat }