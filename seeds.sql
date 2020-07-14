-- Test Data
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Greg", "Martin", 1, 1), ("Sam", "Smith", 2, 2), ("Test", "End", 3, 2);

INSERT INTO role (title, salary, department_id)
VALUES ("Manager", 90000, 1), ("Engineer", 80000, 2), ("Assistant", 50000, 2);

INSERT INTO department (name)
VALUES ("Management"), ("Staff")