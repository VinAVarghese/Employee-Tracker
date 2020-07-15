-- TEST DATA

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Greg", "Martin", 1), ("Sam", "Smith", 2, 1), ("Test", "End", 3, 1);

INSERT INTO roles (title, salary, department_id)
VALUES ("Manager", 90000, 1), ("Engineer", 80000, 2), ("Assistant", 50000, 2);

INSERT INTO departments (name)
VALUES ("Management"), ("Staff")