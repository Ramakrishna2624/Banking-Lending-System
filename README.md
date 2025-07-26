### Bank Lending System: Design & Reference Document

This document outlines the design for a simple bank lending system. It covers the system architecture, API design, data model, and the core logic as per the assignment requirements.

### 1. System Architecture

We will use a simple three-tier architecture, which is a standard and effective pattern for web-based applications.

- **Presentation Layer (Client):** A **React.js** single-page application (SPA) running in the user's web browser. This client will consume the backend RESTful API.
- **Application Layer (Backend Server):** This is the core of our system. It will be a **Node.js with Express.js** web server that exposes the RESTful API endpoints. It will handle all business logic, including loan creation, payment processing, and ledger generation.
- **Data Layer (Database):** A persistent storage system to hold all the data related to customers, loans, and payments. We will use a relational **SQL database** (like PostgreSQL or SQLite) for its structured nature, which is well-suited for financial data.

### 2. RESTful API Design

The API will be the public interface for our system. We'll define clear, resource-oriented endpoints.

**Base URL:** `/api/v1`

### **2.1. `LEND`: Create a new loan**

- **Endpoint:** `POST /loans`
- **Description:** Creates a new loan for a customer.
- **Request Body:**
    
    ```
    {
      "customer_id": "string",
      "loan_amount": "number",
      "loan_period_years": "number",
      "interest_rate_yearly": "number"
    }
    
    ```
    
- **Calculations:**
    1. `Total Interest (I) = P * N * (R / 100)`
    2. `Total Amount (A) = P + I`
    3. `Monthly EMI = A / (N * 12)`
- **Success Response (201 Created):**
    
    ```
    {
      "loan_id": "unique_loan_identifier",
      "customer_id": "string",
      "total_amount_payable": "number",
      "monthly_emi": "number"
    }
    
    ```
    
- **Error Response (400 Bad Request):** If input data is invalid.

### **2.2. `PAYMENT`: Record a payment for a loan**

- **Endpoint:** `POST /loans/{loan_id}/payments`
- **Description:** Records a payment (EMI or lump sum) against a specific loan.
- **Request Body:**
    
    ```
    {
      "amount": "number",
      "payment_type": "enum"
    }
    
    ```
    
- **Logic:**
    - The payment amount is recorded and linked to the `loan_id`.
    - This amount will be deducted from the outstanding balance.
    - For lump-sum payments, the number of remaining EMIs will be recalculated.
- **Success Response (200 OK):**
    
    ```
    {
      "payment_id": "unique_payment_identifier",
      "loan_id": "string",
      "message": "Payment recorded successfully.",
      "remaining_balance": "number",
      "emis_left": "number"
    }
    
    ```
    
- **Error Response (404 Not Found):** If `loan_id` does not exist.

### **2.3. `LEDGER`: View loan details and transaction history**

- **Endpoint:** `GET /loans/{loan_id}/ledger`
- **Description:** Retrieves the complete transaction history and current status of a loan.
- **Success Response (200 OK):**
    
    ```
    {
      "loan_id": "string",
      "customer_id": "string",
      "principal": "number",
      "total_amount": "number",
      "monthly_emi": "number",
      "amount_paid": "number",
      "balance_amount": "number",
      "emis_left": "number",
      "transactions": [
        {
          "transaction_id": "string",
          "date": "timestamp",
          "amount": "number",
          "type": "string"
        }
      ]
    }
    
    ```
    
- **Error Response (404 Not Found):** If `loan_id` does not exist.

### **2.4. `ACCOUNT OVERVIEW`: View all loans for a customer**

- **Endpoint:** `GET /customers/{customer_id}/overview`
- **Description:** Provides a summary of all loans associated with a customer.
- **Success Response (200 OK):**
    
    ```
    {
      "customer_id": "string",
      "total_loans": "number",
      "loans": [
        {
          "loan_id": "string",
          "principal": "number",
          "total_amount": "number",
          "total_interest": "number",
          "emi_amount": "number",
          "amount_paid": "number",
          "emis_left": "number"
        }
      ]
    }
    
    ```
    
- **Error Response (404 Not Found):** If `customer_id` has no loans or does not exist.

### 3. Data Model / Database Schema

We'll use three main tables in our SQL database.

**Table: `Customers`**

- `customer_id` (Primary Key, TEXT)
- `name` (TEXT)
- `created_at` (TIMESTAMP)

**Table: `Loans`**

- `loan_id` (Primary Key, TEXT, UUID)
- `customer_id` (Foreign Key to Customers, TEXT)
- `principal_amount` (DECIMAL)
- `total_amount` (DECIMAL)
- `interest_rate` (DECIMAL)
- `loan_period_years` (INTEGER)
- `monthly_emi` (DECIMAL)
- `status` (TEXT, e.g., 'ACTIVE', 'PAID_OFF')
- `created_at` (TIMESTAMP)

**Table: `Payments`**

- `payment_id` (Primary Key, TEXT, UUID)
- `loan_id` (Foreign Key to Loans, TEXT)
- `amount` (DECIMAL)
- `payment_type` (TEXT, 'EMI' or 'LUMP_SUM')
- `payment_date` (TIMESTAMP)

### 4. Assumptions and Design Decisions

1. **Interest Calculation:** We are using Simple Interest as specified: `I = P * N * R`.
2. **EMI Calculation:** The EMI is calculated as `(Principal + Total Simple Interest) / Total Number of Months`.
3. **Lump Sum Payments:** When a lump sum is paid, it reduces the `total_amount` outstanding. The number of remaining EMIs is then recalculated by dividing the new outstanding balance by the fixed `monthly_emi`.
4. **Customer Management:** The system assumes customers are pre-existing.
5. **Data Persistence:** A relational SQL database is chosen for data integrity.
6. **Statelessness:** The API is stateless.

### 5. Recommended Technology Stack

- **Frontend Framework:**
    - **React.js:** A powerful library for building user interfaces.
- **Backend Framework:**
    - **Node.js with Express.js:** A popular choice for building lightweight and fast REST APIs.
- **Database:**
    - **PostgreSQL:** A powerful, open-source relational SQL database.
    - **SQLite:** A serverless, file-based SQL database perfect for a simple, self-contained project.
- **For this assignment, the recommended stack is a React.js frontend, a Node.js with Express.js backend API, and a SQL database like PostgreSQL or SQLite.**