document.addEventListener('DOMContentLoaded', () => {
    const buyPremiumButton = document.getElementById('buyPremiumButton');
    // Check if user is premium on page load
    checkUserPremiumStatus();

    // Add event listener to the "Buy Premium" button
    buyPremiumButton.addEventListener('click', initiatePremiumPayment);
});


async function checkUserPremiumStatus() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/checkPremium', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.isPremium) {
            showPremiumUserStatus();
        }
    } catch (error) {
        console.error("Error checking premium status:", error);
    }
}

function showPremiumUserStatus() {
    const buyPremiumButton = document.getElementById('buyPremiumButton');
    buyPremiumButton.textContent = "You are a Premium User";
    buyPremiumButton.disabled = true;
    loadAllUsersExpenses(); // Load expenses leaderboard for premium users
}

async function initiatePremiumPayment() {
    const token = localStorage.getItem('token');

    try {
        // Request server to initiate payment
        const response = await fetch('/initiatePremiumPayment', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('Payment data:', data); // Debugging line

        if (response.ok) {
            // Open Razorpay payment window
            const options = {
                key: 'rzp_test_N8ErFdSrLpInkD', // Razorpay key ID
                amount: data.amount, // Amount in paisa
                currency: "INR",
                name: "Expense App",
                description: "Upgrade to Premium",
                order_id: data.order_id, // Order ID generated on server
                handler: async (paymentResponse) => {
                    await confirmPremiumPayment(paymentResponse);
                },
                prefill: {
                    email: data.email // Prefill email if available
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const razorpay = new Razorpay(options);
            razorpay.open();
        } else {
            alert("Failed to initiate payment.");
        }
    } catch (error) {
        console.error("Error initiating premium payment:", error);
        alert("Failed to initiate payment.");
    }
}

async function confirmPremiumPayment(paymentResponse) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/confirmPremium', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentResponse)
        });

        if (response.ok) {
            showPremiumUserStatus();
            alert("Congratulations! You are now a premium user.");
        } else {
            alert("Payment verification failed. Please try again.");
        }
    } catch (error) {
        console.error("Error confirming payment:", error);
        alert("Error confirming premium status.");
    }
}

async function loadAllUsersExpenses() {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error("Token is not available.");
        return;
    }

    try {
        const response = await fetch('/expense/leaderboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.expenses)) {
                console.log(data.expenses);
                displayExpensesLeaderboard(data.expenses);
            } else {
                console.error("Unexpected response format from leaderboard endpoint.");
            }
        } else {
            console.error("Error loading expenses leaderboard: HTTP status", response.status);
        }
    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}

function displayExpensesLeaderboard(expenses) {
    const leaderboardContainer = document.getElementById('leaderboard');
    leaderboardContainer.innerHTML = ''; // Clear previous data

    if (expenses.length === 0) {
        leaderboardContainer.textContent = "No expenses available.";
        return;
    }

    expenses.forEach(expense => {
        const userRow = document.createElement('div');
        userRow.className = 'user-expense-row';
        userRow.textContent = `${expense.username}: ₹${expense.total_expenses}`;
        leaderboardContainer.appendChild(userRow);
    });
}
