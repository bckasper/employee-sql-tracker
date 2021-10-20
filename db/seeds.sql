-- Department sseds
INSERT INTO departments (dept_name)
VALUES
("Sales"),
("Engineering"),
("Finance"),
("Legal"),
("Marketing");

INSERT INTO roles (title, salary, dept_id)
VALUES
("Sales Lead", 100000, 1),
("Salesperson", 80000, 1),
("Lead Engineer", 150000, 2),
("Software Engineer", 110000, 2),
("Account Manager", 140000, 3),
("Accountant", 70000, 3),
("Legal Director", 200000, 4),
("Paralegal", 65000, 4),
("Product Marketer", 60000, 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
("Super", "Mario", 1, NULL),
("Luigi", "Bros", 2, 1),
("Bowser", "Koopa", 9, NULL),
("Princess", "Peach", 3, NULL),
("Toad", "Mushroom", 4, 4);