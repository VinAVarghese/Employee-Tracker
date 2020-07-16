var mysql = require("mysql");
var inquirer = require("inquirer");

// DELETE Functions
const deleteDept = (callback, callback2, connection) => {
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
                    console.log(`\n=============================================================================\nYou cannot delete ${deptChoice} because there are employees and roles assigned to it!\nTry deleting nested employees and roles first. \n=============================================================================`);
                    callback2();
                } else {
                    console.log(`\n==========================================================\n${deptChoice} was successfully deleted from the tracker!\n==========================================================`);
                    callback();
                }
            })
        })
    })
}

const deleteRole = (callback, callback2, connection) => {
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
                    console.log(`\n=====================================================================\nYou cannot delete ${roleChoice} because there are employees assigned to it! \nTry deleting nested employees first.\n=====================================================================`);
                    callback2();
                } else {
                    console.log(`\n=============================================================\n${roleChoice} was successfully deleted from the tracker!\n=============================================================`);
                    callback();
                }
            })
        })
    })
}

const deleteEmp = (callback, callback2, connection) => {
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
                    console.log(`\n=================================================================================\nYou cannot delete ${empChoice} because they are a manager with assigned employees! \nTry reassigning new managers to nested employees first.\n=================================================================================`);
                    callback2();
                } else { 
                    console.log(`\n===============================================================\n${empChoice} was successfully deleted from the tracker!\n===============================================================`);
                    callback();
                }
            })
        })
    })
}

module.exports = { deleteDept, deleteRole, deleteEmp }