function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

document.getElementById('expense_Form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const product_name = document.getElementById('description').value; // Assuming description is used for product_name
    const product_price = document.getElementById('amount').value; // Assuming amount is used for product_price
    const category = document.getElementById('category').value;
    
    try {
        const response = await fetch('/addExpense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_name: product_name,  // Update to match backend expectations
                product_price: product_price, // Update to match backend expectations
                category: category
            })
        });
    

        const data = await response.json();
        if (response.ok) {
            console.log('Expense added successfully');
            document.getElementById('expense_Form').reset();
            fetchExpenses();
        } else {
            
            alert(data.err || "Failed to add expense");
        }
    } catch (err) {
        console.error('Error adding expenses', err);
        alert("Error adding expenses");
    }
});

async function fetchExpenses() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/getExpense', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            const expenseList = document.getElementById('expenseList');
            expenseList.innerHTML = ""; // Clear existing expenses
            // Loop through the expenses and display items
            data.expenses.forEach(expense => {
                const listItem = document.createElement('li');
                listItem.textContent = `${expense.product_name} - Rs ${expense.product_price} (${expense.category})`; // Adjusted keys
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteExpense(expense.id)); // Pass expense ID to delete

                // Append delete button to the list item
                listItem.appendChild(deleteButton);
                expenseList.appendChild(listItem);
            });
        } else {
            alert(data.error || 'Failed to fetch expenses');
        }
    } catch (err) {
        console.log('Error fetching expenses', err);
    }
}

async function deleteExpense(expenseId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/deleteExpense/${expenseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('Expense deleted successfully');
            fetchExpenses(); // Refresh the expense list
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete expense');
        }
    } catch (err) {
        console.error('Error deleting expense', err);
        alert("Error deleting expense");
    }
}

function greetUser() {
    const token = localStorage.getItem('token'); // Get JWT token
    const userGreeting = document.getElementById('userGreeting');

    if (token) {
        const decodedToken = parseJwt(token); // Decode the JWT token
        userGreeting.textContent = `Welcome, ${decodedToken.username}!`;
    } else {
        userGreeting.textContent = `Welcome, Guest!`;
    }
}

document.getElementById('logoutbuttonid').addEventListener('click', function() {
    localStorage.removeItem('token'); // Remove JWT token from localStorage
    alert('You have been logged out!');
    window.location.href = '/login'; // Redirect to the login page
});

window.onload = function() {
    fetchExpenses();
    greetUser(); 
}
