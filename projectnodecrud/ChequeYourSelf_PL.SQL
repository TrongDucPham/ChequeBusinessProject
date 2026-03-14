-- OSU CS340 Intro to Databases
-- PL/SQL Stored Procedures
-- Group 36
-- Neighborhood Exchange (Business Payroll System)

------------------------------------------------------------
-- SP: Create Business
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_CreateBusiness;
DELIMITER //
CREATE PROCEDURE sp_CreateBusiness(
    IN p_businessName VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_payrollFrequencyID INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO Businesses (businessName, email, payrollFrequencyID)
    VALUES (p_businessName, p_email, p_payrollFrequencyID);

    SELECT LAST_INSERT_ID() INTO p_id;
    SELECT LAST_INSERT_ID() AS 'new_id';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Delete Business
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_business;
DELIMITER //
CREATE PROCEDURE sp_delete_business(
    IN p_businessID INT,
    OUT p_deleted INT
)
BEGIN
    DELETE FROM Businesses 
    WHERE businessID = p_businessID;

    SELECT ROW_COUNT() INTO p_deleted;
    SELECT ROW_COUNT() AS 'deleted';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Delete Business Phone
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_business_phone;
DELIMITER //
CREATE PROCEDURE sp_delete_business_phone(
    IN p_phoneID INT,
    OUT p_deleted INT
)
BEGIN
    DELETE FROM BusinessPhones 
    WHERE phoneID = p_phoneID;

    SELECT ROW_COUNT() INTO p_deleted;
    SELECT ROW_COUNT() AS 'deleted';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Delete Deduction
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_deduction;
DELIMITER //
CREATE PROCEDURE sp_delete_deduction(
    IN p_deductionID INT,
    OUT p_deleted INT
)
BEGIN
    DELETE FROM Deductions 
    WHERE deductionID = p_deductionID;

    SELECT ROW_COUNT() INTO p_deleted;
    SELECT ROW_COUNT() AS 'deleted';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Delete Employee
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_employee;
DELIMITER //
CREATE PROCEDURE sp_delete_employee(
    IN p_employeeID INT,
    OUT p_deleted INT
)
BEGIN
    DELETE FROM Employees 
    WHERE employeeID = p_employeeID;

    SELECT ROW_COUNT() INTO p_deleted;
    SELECT ROW_COUNT() AS 'deleted';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Delete Employee Deduction
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_employee_deduction;
DELIMITER //
CREATE PROCEDURE sp_delete_employee_deduction(
    IN p_employeeID INT,
    IN p_deductionID INT,
    OUT p_deleted INT
)
BEGIN
    DELETE FROM EmployeeDeductions
    WHERE employeeID = p_employeeID
      AND deductionID = p_deductionID;

    SELECT ROW_COUNT() INTO p_deleted;
    SELECT ROW_COUNT() AS 'deleted';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Delete Time Entry
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_delete_time_entry;
DELIMITER //
CREATE PROCEDURE sp_delete_time_entry(
    IN p_timeEntryID INT,
    OUT p_deleted INT
)
BEGIN
    DELETE FROM TimeEntries 
    WHERE timeEntryID = p_timeEntryID;

    SELECT ROW_COUNT() INTO p_deleted;
    SELECT ROW_COUNT() AS 'deleted';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Business by ID
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_business_by_id;
DELIMITER //
CREATE PROCEDURE sp_get_business_by_id(IN p_businessID INT)
BEGIN
    SELECT businessID, businessName, email, payrollFrequencyID
    FROM Businesses
    WHERE businessID = p_businessID;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Business List
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_business_list;
DELIMITER //
CREATE PROCEDURE sp_get_business_list()
BEGIN
    SELECT businessID, businessName 
    FROM Businesses;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Business Phones
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_business_phones;
DELIMITER //
CREATE PROCEDURE sp_get_business_phones()
BEGIN
    SELECT bp.phoneID, bp.phone, b.businessName, b.businessID
    FROM BusinessPhones bp
    JOIN Businesses b ON bp.businessID = b.businessID;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Businesses (Full Info)
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_businesses;
DELIMITER //
CREATE PROCEDURE sp_get_businesses()
BEGIN
    SELECT b.businessID, b.businessName, b.email, pf.frequencyName
    FROM Businesses b
    LEFT JOIN PayrollFrequencies pf 
        ON b.payrollFrequencyID = pf.payrollFrequencyID;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Calculation Methods
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_calculation_methods;
DELIMITER //
CREATE PROCEDURE sp_get_calculation_methods()
BEGIN
    SELECT methodID, methodName
    FROM CalculationMethods;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Deduction Categories
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_deduction_categories;
DELIMITER //
CREATE PROCEDURE sp_get_deduction_categories()
BEGIN
    SELECT categoryID, categoryName 
    FROM DeductionCategories;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Deductions (Full Info)
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_deductions;
DELIMITER //
CREATE PROCEDURE sp_get_deductions()
BEGIN
    SELECT d.deductionID, d.deductionName, d.jurisdiction, d.deductionType,
           b.businessID, b.businessName,
           c.categoryID, c.categoryName,
           m.methodID, m.methodName
    FROM Deductions d
    JOIN Businesses b ON d.businessID = b.businessID
    JOIN DeductionCategories c ON d.categoryID = c.categoryID
    JOIN CalculationMethods m ON d.methodID = m.methodID
    ORDER BY b.businessName, d.deductionName;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Deductions (Simple)
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_deductions_simple;
DELIMITER //
CREATE PROCEDURE sp_get_deductions_simple()
BEGIN
    SELECT deductionID, deductionName, jurisdiction
    FROM Deductions;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Employee Deductions
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_employee_deductions;
DELIMITER //
CREATE PROCEDURE sp_get_employee_deductions()
BEGIN
    SELECT ed.employeeID, ed.deductionID, ed.deductionValue,
           e.firstName, e.lastName,
           d.deductionName, d.jurisdiction, d.deductionType
    FROM EmployeeDeductions ed
    JOIN Employees e ON ed.employeeID = e.employeeID
    JOIN Deductions d ON ed.deductionID = d.deductionID
    ORDER BY e.lastName, d.deductionName;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Employee List
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_employee_list;
DELIMITER //
CREATE PROCEDURE sp_get_employee_list()
BEGIN
    SELECT employeeID, firstName, lastName 
    FROM Employees;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Employees (Full Info)
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_employees;
DELIMITER //
CREATE PROCEDURE sp_get_employees()
BEGIN
    SELECT e.employeeID, e.firstName, e.lastName, e.hourlyRate,
           b.businessName, b.businessID
    FROM Employees e
    JOIN Businesses b ON e.businessID = b.businessID;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Payroll Frequencies
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_payroll_frequencies;
DELIMITER //
CREATE PROCEDURE sp_get_payroll_frequencies()
BEGIN
    SELECT payrollFrequencyID, frequencyName
    FROM PayrollFrequencies;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Get Time Entries
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_get_time_entries;
DELIMITER //
CREATE PROCEDURE sp_get_time_entries()
BEGIN
    SELECT t.timeEntryID, t.workDate, t.hoursWorked,
           e.employeeID, e.firstName, e.lastName
    FROM TimeEntries t
    JOIN Employees e ON t.employeeID = e.employeeID
    ORDER BY t.workDate DESC;
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Insert Business Phone
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_business_phone;
DELIMITER //
CREATE PROCEDURE sp_insert_business_phone(
    IN p_businessID INT,
    IN p_phone VARCHAR(20),
    OUT p_id INT
)
BEGIN
    INSERT INTO BusinessPhones (businessID, phone)
    VALUES (p_businessID, p_phone);

    SELECT LAST_INSERT_ID() INTO p_id;
    SELECT LAST_INSERT_ID() AS 'new_id';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Insert Calculation Method
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_calculation_method;
DELIMITER //
CREATE PROCEDURE sp_insert_calculation_method(
    IN p_methodName VARCHAR(255),
    OUT p_id INT
)
BEGIN
    INSERT INTO CalculationMethods (methodName)
    VALUES (p_methodName);

    SELECT LAST_INSERT_ID() INTO p_id;
    SELECT LAST_INSERT_ID() AS 'new_id';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Insert Deduction
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_deduction;
DELIMITER //
CREATE PROCEDURE sp_insert_deduction(
    IN p_deductionName VARCHAR(255),
    IN p_jurisdiction VARCHAR(255),
    IN p_deductionType VARCHAR(255),
    IN p_businessID INT,
    IN p_categoryID INT,
    IN p_methodID INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO Deductions (deductionName, jurisdiction, deductionType, businessID, categoryID, methodID)
    VALUES (p_deductionName, p_jurisdiction, p_deductionType, p_businessID, p_categoryID, p_methodID);

    SELECT LAST_INSERT_ID() INTO p_id;
    SELECT LAST_INSERT_ID() AS 'new_id';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Insert Deduction Category
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_deduction_category;
DELIMITER //
CREATE PROCEDURE sp_insert_deduction_category(
    IN p_categoryName VARCHAR(255),
    OUT p_id INT
)
BEGIN
    INSERT INTO DeductionCategories (categoryName)
    VALUES (p_categoryName);

    SELECT LAST_INSERT_ID() INTO p_id;
    SELECT LAST_INSERT_ID() AS 'new_id';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Insert Employee
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_employee;
DELIMITER //
CREATE PROCEDURE sp_insert_employee(
    IN p_firstName VARCHAR(255),
    IN p_lastName VARCHAR(255),
    IN p_hourlyRate DECIMAL(10,2),
    IN p_businessID INT,
    OUT p_id INT
)
BEGIN
    INSERT INTO Employees (firstName, lastName, hourlyRate, businessID)
    VALUES (p_firstName, p_lastName, p_hourlyRate, p_businessID);

    SELECT LAST_INSERT_ID() INTO p_id;
    SELECT LAST_INSERT_ID() AS 'new_id';
END //
DELIMITER ;

------------------------------------------------------------
-- SP: Insert Employee Deduction
------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_insert_employee_deduction;
DELIMITER //
CREATE PROCEDURE sp_insert_employee_deduction(
    IN p_employeeID INT,
    IN p_deductionID INT,
    IN p_deductionValue DECIMAL(10,2),
    OUT p_id INT
)
BEGIN
    INSERT INTO EmployeeDeductions (employeeID, deductionID, deductionValue)
    VALUES (p_employeeID, p_deductionID, p_deductionValue);

    -- No auto-increment ID; return success flag
    SELECT 1 INTO p_id;
    SELECT 1 AS 'new_id';
END //
DELIMITER ;

