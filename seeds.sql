-- TEST DATA

INSERT INTO departments (name)
VALUES ("Legal"), ("Engineering"), ("Sales"), ("Accounting"), ("Operations");

INSERT INTO roles (title, salary, department_id)
VALUES ("Operations Lead", 130000, 5), ("Senior Engineer", 130000, 2), ("Junior Engineer", 80000, 2), ("Administrative Assistant (Operations)", 65000, 3); 

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Greg", "Martin", 1, null), ("Sam", "Smith", 2, null), ("Barney", "Stinson", 3, 2), ("Carter", "Blake", 4, 1);



