// ###############################################################
// ########################## SETUP ###############################
// ###############################################################

const express = require('express');
const app = express();
const PORT = 8088;

// Database connector
const db = require('./database/db-connector');

// Handlebars
const { engine } = require('express-handlebars');

app.engine('.hbs', engine({
    extname: '.hbs',
    helpers: {
        eq: (a, b) => a == b
    }
}));

app.set('view engine', '.hbs');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


// ###############################################################
// ########################## ROUTES ##############################
// ###############################################################


// ------------------------- HOME -------------------------
app.get('/', async (req, res) => {
    try {
        res.render('home');
    } catch (err) {
        console.error('Error rendering home:', err);
        res.status(500).send('Error loading home page.');
    }
});


// ------------------------- BUSINESSES -------------------------
app.get('/Businesses', async (req, res) => {
    try {
        const [[businesses]] = await db.query("CALL sp_get_businesses()");
        const [[frequencies]] = await db.query("CALL sp_get_payroll_frequencies()");

        res.render('businesses', { businesses, frequencies });

    } catch (err) {
        console.error('Error loading Businesses:', err);
        res.status(500).send('Error loading businesses.');
    }
});

// CREATE Business
app.post('/Businesses/create', async (req, res) => {
    try {
        let data = req.body;

        if (isNaN(parseInt(data.payrollFrequencyID)))
            data.payrollFrequencyID = null;

        const query = `CALL sp_CreateBusiness(?, ?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query, [
            data.businessName,
            data.email,
            data.payrollFrequencyID
        ]);

        console.log(`Created Business ID: ${rows.new_id}`);

        res.redirect('/Businesses');

    } catch (err) {
        console.error('Error creating business:', err);
        res.status(500).send('Error creating business.');
    }
});

// DELETE Business
app.post('/Businesses/delete', async (req, res) => {
    try {
        const { businessID } = req.body;

        const query = `CALL sp_delete_business(?, @deleted);`;
        const [[[rows]]] = await db.query(query, [businessID]);

        console.log(`Deleted Business ID: ${businessID}`);

        res.redirect('/Businesses');

    } catch (err) {
        console.error("Error deleting business:", err);
        res.status(500).send("Error deleting business.");
    }
});

// PREFILL Business (load data for update)
app.post('/Businesses/prefill', async (req, res) => {
    try {
        const { businessID } = req.body;

        const query = `CALL sp_get_business_by_id(?);`;
        const [[business]] = await db.query(query, [businessID]);

        const [[frequencies]] = await db.query("CALL sp_get_payroll_frequencies()");

        res.render('businessesUpdate', {
            business: business[0],
            frequencies
        });

    } catch (err) {
        console.error("Error pre-filling business:", err);
        res.status(500).send("Error loading business for update.");
    }
});

// UPDATE Business
app.post('/Businesses/update', async (req, res) => {
    try {
        let data = req.body;

        if (isNaN(parseInt(data.payrollFrequencyID)))
            data.payrollFrequencyID = null;

        const query = `CALL sp_update_business(?, ?, ?, ?, @updated);`;

        const [[[rows]]] = await db.query(query, [
            data.businessID,
            data.businessName,
            data.email,
            data.payrollFrequencyID
        ]);

        console.log(`Updated Business ID: ${data.businessID}`);

        res.redirect('/Businesses');

    } catch (err) {
        console.error("Error updating business:", err);
        res.status(500).send("Error updating business.");
    }
});

// ------------------------- BUSINESS PHONES -------------------------
app.get('/BusinessPhones', async (req, res) => {
    try {
        const [[phones]] = await db.query("CALL sp_get_business_phones()");
        const [[businesses]] = await db.query("CALL sp_get_business_list()");

        res.render('businessPhones', { phones, businesses });

    } catch (err) {
        console.error('Error loading BusinessPhones:', err);
        res.status(500).send('Error loading business phones.');
    }
});


// CREATE Phone
app.post('/BusinessPhones/create', async (req, res) => {
    try {
        const { businessID, phone } = req.body;

        const query = `CALL sp_insert_business_phone(?, ?, @new_id);`;
        const [[[rows]]] = await db.query(query, [businessID, phone]);

        console.log("New phone ID:", rows.new_id);

        res.redirect('/BusinessPhones');

    } catch (err) {
        console.error('Error creating phone:', err);
        res.status(500).send('Error adding phone number.');
    }
});



// DELETE Phone
app.post('/BusinessPhones/delete', async (req, res) => {
    try {
        const { phoneID } = req.body;

        const query = `CALL sp_delete_business_phone(?, @deleted);`;
        const [[[rows]]] = await db.query(query, [phoneID]);

        console.log("Deleted phone ID:", phoneID);

        res.redirect('/BusinessPhones');

    } catch (err) {
        console.error('Error deleting phone:', err);
        res.status(500).send('Error deleting phone number.');
    }
});

// UPDATE Phone
app.post('/BusinessPhones/update', async (req, res) => {
    try {
        const { phoneID, businessID, phone } = req.body;

        const query = `CALL sp_update_business_phone(?, ?, ?, @updated);`;

        const [[[rows]]] = await db.query(query, [
            phoneID,
            businessID,
            phone
        ]);

        console.log(`Updated phone ID: ${phoneID}`);

        res.redirect('/BusinessPhones');

    } catch (err) {
        console.error('Error updating phone:', err);
        res.status(500).send('Error updating phone.');
    }
});

// ------------------------- EMPLOYEES -------------------------

app.get('/Employees', async (req, res) => {
    try {
        const [[employees]] = await db.query("CALL sp_get_employees()");
        const [[businesses]] = await db.query("CALL sp_get_business_list()");

        res.render('employees', { employees, businesses });

    } catch (err) {
        console.error("Error loading Employees:", err);
        res.status(500).send("Error loading employees.");
    }
});

// CREATE Employee
app.post('/Employees/create', async (req, res) => {
    try {
        let data = req.body;

        if (isNaN(parseFloat(data.hourlyRate)))
            data.hourlyRate = null;

        const query = `CALL sp_insert_employee(?, ?, ?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query, [
            data.firstName,
            data.lastName,
            data.hourlyRate,
            data.businessID
        ]);

        console.log("New Employee ID:", rows.new_id);

        res.redirect('/Employees');

    } catch (err) {
        console.error("Error creating employee:", err);
        res.status(500).send("Error creating employee.");
    }
});

// UPDATE Employee
app.post('/Employees/update', async (req, res) => {
    try {
        let data = req.body;

        if (isNaN(parseFloat(data.hourlyRate)))
            data.hourlyRate = null;

        const query = `CALL sp_update_employee(?, ?, ?, ?, ?, @updated);`;

        const [[[rows]]] = await db.query(query, [
            data.employeeID,
            data.firstName,
            data.lastName,
            data.hourlyRate,
            data.businessID
        ]);

        console.log("Updated Employee ID:", data.employeeID);

        res.redirect('/Employees');

    } catch (err) {
        console.error("Error updating employee:", err);
        res.status(500).send("Error updating employee.");
    }
});

// DELETE Employee
app.post('/Employees/delete', async (req, res) => {
    try {
        const { employeeID } = req.body;

        const query = `CALL sp_delete_employee(?, @deleted);`;
        const [[[rows]]] = await db.query(query, [employeeID]);

        console.log("Deleted Employee ID:", employeeID);

        res.redirect('/Employees');

    } catch (err) {
        console.error("Error deleting employee:", err);
        res.status(500).send("Error deleting employee.");
    }
});

// ------------------------------
// Payroll Frequencies (READ)
// ------------------------------
app.get('/PayrollFrequencies', async (req, res) => {
    try {
        const [[frequencies]] = await db.query("CALL sp_get_payroll_frequencies()");
        res.render('payrollFrequencies', { frequencies });

    } catch (err) {
        console.error("Error loading Payroll Frequencies:", err);
        res.status(500).send("Error loading Payroll Frequencies.");
    }
});

// CREATE Payroll Frequency
app.post('/PayrollFrequencies/create', async (req, res) => {
    try {
        const { frequencyName } = req.body;

        const query = `CALL sp_insert_payroll_frequency(?, @new_id);`;
        const [[[rows]]] = await db.query(query, [frequencyName]);

        console.log("New Payroll Frequency ID:", rows.new_id);

        res.redirect('/PayrollFrequencies');

    } catch (err) {
        console.error("Error creating payroll frequency:", err);
        res.status(500).send("Error creating payroll frequency.");
    }
});

// ########################## Time Entries #######################

app.get('/TimeEntries', async (req, res) => {
    try {
        const [[entries]] = await db.query("CALL sp_get_time_entries()");
        const [[employees]] = await db.query("CALL sp_get_employee_list()");

        res.render('timeEntries', { entries, employees });

    } catch (err) {
        console.error("Error loading Time Entries:", err);
        res.status(500).send("Error loading Time Entries.");
    }
});

// CREATE Time Entry
app.post('/TimeEntries/create', async (req, res) => {
    try {
        let data = req.body;

        if (isNaN(parseFloat(data.hoursWorked)))
            data.hoursWorked = null;

        const query = `CALL sp_insert_time_entry(?, ?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query, [
            data.employeeID,
            data.workDate,
            data.hoursWorked
        ]);

        console.log("New Time Entry ID:", rows.new_id);

        res.redirect('/TimeEntries');

    } catch (err) {
        console.error("Error creating time entry:", err);
        res.status(500).send("Error creating time entry.");
    }
});

// UPDATE Time Entry
app.post('/TimeEntries/update', async (req, res) => {
    try {
        let data = req.body;

        if (isNaN(parseFloat(data.hoursWorked)))
            data.hoursWorked = null;

        const query = `CALL sp_update_time_entry(?, ?, ?, ?, @updated);`;

        const [[[rows]]] = await db.query(query, [
            data.timeEntryID,
            data.employeeID,
            data.workDate,
            data.hoursWorked
        ]);

        console.log("Updated Time Entry ID:", data.timeEntryID);

        res.redirect('/TimeEntries');

    } catch (err) {
        console.error("Error updating time entry:", err);
        res.status(500).send("Error updating time entry.");
    }
});

// DELETE Time Entry
app.post('/TimeEntries/delete', async (req, res) => {
    try {
        const { timeEntryID } = req.body;

        const query = `CALL sp_delete_time_entry(?, @deleted);`;
        const [[[rows]]] = await db.query(query, [timeEntryID]);

        console.log("Deleted Time Entry ID:", timeEntryID);

        res.redirect('/TimeEntries');

    } catch (err) {
        console.error("Error deleting time entry:", err);
        res.status(500).send("Error deleting time entry.");
    }
});

// ########################### Deductions ########################

app.get('/Deductions', async (req, res) => {
    try {
        const [[deductions]] = await db.query("CALL sp_get_deductions()");
        const [[businesses]] = await db.query("CALL sp_get_business_list()");
        const [[categories]] = await db.query("CALL sp_get_deduction_categories()");
        const [[methods]] = await db.query("CALL sp_get_calculation_methods()");

        res.render('deductions', {
            deductions,
            businesses,
            categories,
            methods
        });

    } catch (err) {
        console.error("Error loading Deductions:", err);
        res.status(500).send("Error loading Deductions.");
    }
});


// CREATE Deduction
app.post('/Deductions/create', async (req, res) => {
    try {
        let data = req.body;

        const query = `CALL sp_insert_deduction(?, ?, ?, ?, ?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query, [
            data.deductionName,
            data.jurisdiction,
            data.deductionType,
            data.businessID,
            data.categoryID,
            data.methodID
        ]);

        console.log("New Deduction ID:", rows.new_id);

        res.redirect('/Deductions');

    } catch (err) {
        console.error("Error creating deduction:", err);
        res.status(500).send("Error creating deduction.");
    }
});

// UPDATE Deduction
app.post('/Deductions/update', async (req, res) => {
    try {
        let data = req.body;

        const query = `CALL sp_update_deduction(?, ?, ?, ?, ?, ?, ?, @updated);`;

        const [[[rows]]] = await db.query(query, [
            data.deductionID,
            data.deductionName,
            data.jurisdiction,
            data.deductionType,
            data.businessID,
            data.categoryID,
            data.methodID
        ]);

        console.log("Updated Deduction ID:", data.deductionID);

        res.redirect('/Deductions');

    } catch (err) {
        console.error("Error updating deduction:", err);
        res.status(500).send("Error updating deduction.");
    }
});

// DELETE Deduction
app.post('/Deductions/delete', async (req, res) => {
    try {
        const { deductionID } = req.body;

        const query = `CALL sp_delete_deduction(?, @deleted);`;
        const [[[rows]]] = await db.query(query, [deductionID]);

        console.log("Deleted Deduction ID:", deductionID);

        res.redirect('/Deductions');

    } catch (err) {
        console.error("Error deleting deduction:", err);
        res.status(500).send("Error deleting deduction.");
    }
});

// ########################### EmployeeDeductions ########################

app.get('/EmployeeDeductions', async (req, res) => {
    try {
        const [[employeeDeductions]] = await db.query("CALL sp_get_employee_deductions()");
        const [[employees]] = await db.query("CALL sp_get_employee_list()");
        const [[deductions]] = await db.query("CALL sp_get_deductions_simple()");

        res.render('employeeDeductions', {
            employeeDeductions,
            employees,
            deductions
        });

    } catch (err) {
        console.error("Error loading EmployeeDeductions:", err);
        res.status(500).send("Error loading EmployeeDeductions.");
    }
});

// CREATE Employee Deduction
app.post('/EmployeeDeductions/create', async (req, res) => {
    try {
        let data = req.body;

        if (isNaN(parseFloat(data.deductionValue)))
            data.deductionValue = null;

        const query = `CALL sp_insert_employee_deduction(?, ?, ?, @new_id);`;

        const [[[rows]]] = await db.query(query, [
            data.employeeID,
            data.deductionID,
            data.deductionValue
        ]);

        console.log("New Employee Deduction ID:", rows.new_id);

        res.redirect('/EmployeeDeductions');

    } catch (err) {
        console.error("Error creating employee deduction:", err);
        res.status(500).send("Error creating employee deduction.");
    }
});

// UPDATE Employee Deduction
app.post('/EmployeeDeductions/update', async (req, res) => {
    try {
        let data = req.body;

        if (isNaN(parseFloat(data.deductionValue)))
            data.deductionValue = null;

        const query = `CALL sp_update_employee_deduction(?, ?, ?, ?, @updated);`;

        const [[[rows]]] = await db.query(query, [
            data.employeeID,
            data.deductionID,
            data.newDeductionID,
            data.deductionValue
        ]);

        console.log("Updated Employee Deduction:", data.employeeID, data.deductionID);

        res.redirect('/EmployeeDeductions');

    } catch (err) {
        console.error("Error updating employee deduction:", err);
        res.status(500).send("Error updating employee deduction.");
    }
});

// DELETE Employee Deduction
app.post('/EmployeeDeductions/delete', async (req, res) => {
    try {
        const { employeeID, deductionID } = req.body;

        const query = `CALL sp_delete_employee_deduction(?, ?, @deleted);`;
        const [[[rows]]] = await db.query(query, [employeeID, deductionID]);

        console.log("Deleted Employee Deduction:", employeeID, deductionID);

        res.redirect('/EmployeeDeductions');

    } catch (err) {
        console.error("Error deleting employee deduction:", err);
        res.status(500).send("Error deleting employee deduction.");
    }
});

// ########################### Calculation Methods ########################

// CalculationMethods
app.get('/CalculationMethods', async (req, res) => {
    try {
        const [[methods]] = await db.query("CALL sp_get_calculation_methods()");
        res.render('calculationMethods', { methods });

    } catch (err) {
        console.error("Error loading Calculation Methods:", err);
        res.status(500).send("Error loading Calculation Methods.");
    }
});

// CREATE Calculation Method
app.post('/CalculationMethods/create', async (req, res) => {
    try {
        const { methodName } = req.body;

        const query = `CALL sp_insert_calculation_method(?, @new_id);`;
        const [[[rows]]] = await db.query(query, [methodName]);

        console.log("New Calculation Method ID:", rows.new_id);

        res.redirect('/CalculationMethods');

    } catch (err) {
        console.error("Error creating calculation method:", err);
        res.status(500).send("Error creating calculation method.");
    }
});

// ########################### Calculation Methods ########################

app.get('/DeductionCategories', async (req, res) => {
    try {
        const [[categories]] = await db.query("CALL sp_get_deduction_categories()");
        res.render('deductionCategories', { categories });

    } catch (err) {
        console.error("Error loading Deduction Categories:", err);
        res.status(500).send("Error loading Deduction Categories.");
    }
});

// CREATE Deduction Category
app.post('/DeductionCategories/create', async (req, res) => {
    try {
        const { categoryName } = req.body;

        const query = `CALL sp_insert_deduction_category(?, @new_id);`;
        const [[[rows]]] = await db.query(query, [categoryName]);

        console.log("New Deduction Category ID:", rows.new_id);

        res.redirect('/DeductionCategories');

    } catch (err) {
        console.error("Error creating deduction category:", err);
        res.status(500).send("Error creating deduction category.");
    }
});


// ###############################################################
// ########################## RESET ############################
// ###############################################################

app.get('/reset', async (req, res) => {
    try {
        await db.query("CALL sp_reset_database()");
        res.redirect('/');
    } catch (err) {
        console.error("Error resetting database:", err);
        res.status(500).send("Error resetting database.");
    }
});

// ###############################################################
// ########################## LISTENER ############################
// ###############################################################
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://classwork.engr.oregonstate.edu:${PORT}`);
});
