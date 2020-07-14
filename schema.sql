DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE employees (
  id INT NOT NULL AUTO_INCREMENT,
  first_name varchar(30) NOT NULL,
  last_name varchar(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT,
  PRIMARY KEY (id)
);

CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT,
  title varchar(30) NOT NULL,
  salary decimal NOT NULL,
  department_id INT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE departments (
  id INT NOT NULL AUTO_INCREMENT,
  name varchar(30) NOT NULL,
  PRIMARY KEY (id)
);

