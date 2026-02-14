// ============================
// GLOBAL ANIMATION FUNCTION
// ============================
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;

    if (end === 0) {
        obj.innerText = "₹ 0";
        return;
    }

    let range = end - start;
    let current = start;
    let increment = end > start ? 1 : -1;
    let stepTime = Math.abs(Math.floor(duration / Math.abs(range)));
    if (stepTime < 10) stepTime = 10;

    let timer = setInterval(function () {
        current += increment;
        obj.innerText = "₹ " + current;
        if (current == end) clearInterval(timer);
    }, stepTime);
}


// ============================
// LOGIN PAGE
// ============================
function saveName(event) {
    event.preventDefault();
    const name = document.getElementById("username").value;

    if (name.trim() === "") {
        alert("Please enter your name!");
        return;
    }

    localStorage.setItem("username", name);
    window.location.href = "setup.html";
}


// ============================
// SETUP PAGE
// ============================
function saveSetup(event) {
    event.preventDefault();

    const budget = parseFloat(document.getElementById("budget").value);
    const goal = parseFloat(document.getElementById("goal").value);

    if (!budget || !goal) {
        alert("Please enter both Budget and Goal");
        return;
    }

    localStorage.setItem("budget", budget);
    localStorage.setItem("goal", goal);
    localStorage.setItem("expenses", JSON.stringify([]));
    localStorage.setItem("income", 0);

    window.location.href = "index.html";
}


// ============================
// DASHBOARD PAGE
// ============================
if (window.location.pathname.includes("index.html")) {

    const name = localStorage.getItem("username") || "Student";
    const budget = parseFloat(localStorage.getItem("budget")) || 0;
    const income = parseFloat(localStorage.getItem("income")) || 0;
    const goal = parseFloat(localStorage.getItem("goal")) || 0;
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    const totalAvailable = budget + income;
    const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
    const remaining = totalAvailable - totalSpent;

    document.getElementById("welcome").innerText =
        "Welcome back, " + name + " 👋";

    document.getElementById("budgetDisplay").innerText = "₹ " + budget;
    animateValue("spentDisplay", 0, totalSpent, 1000);
    document.getElementById("remainingDisplay").innerText = "₹ " + remaining;
    document.getElementById("goalDisplay").innerText = "₹ " + goal;

    const usagePercent = totalAvailable > 0
        ? ((totalSpent / totalAvailable) * 100).toFixed(1)
        : 0;

    const savingsProgress = goal > 0
        ? ((remaining / goal) * 100).toFixed(1)
        : 0;

    document.getElementById("budgetUsageInsight").innerText =
        "📊 You have used " + usagePercent + "% of your total budget.";

    document.getElementById("savingsProgressInsight").innerText =
        "💰 You are " + savingsProgress + "% towards your savings goal.";
}


// ============================
// EXPENSE PAGE
// ============================
if (window.location.pathname.includes("expenses.html")) {

    const budget = parseFloat(localStorage.getItem("budget")) || 0;
    const income = parseFloat(localStorage.getItem("income")) || 0;
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    let chart;

    window.handleCategoryChange = function () {
        const category = document.getElementById("category").value;
        const customInput = document.getElementById("customCategory");

        if (category === "Other") {
            customInput.style.display = "block";
        } else {
            customInput.style.display = "none";
            customInput.value = "";
        }
    };

    function updateUI() {

        let totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
        let remaining = budget + income - totalSpent;

        document.getElementById("totalSpent").innerText = "₹ " + totalSpent;
        document.getElementById("currentBalance").innerText = "₹ " + remaining;

        const list = document.getElementById("expenseItems");
        list.innerHTML = "";

        expenses.forEach(item => {
            const li = document.createElement("li");
            li.innerText =
                new Date(item.date).toLocaleDateString() +
                " | " + item.category +
                " | ₹ " + item.amount;
            list.appendChild(li);
        });

        updateChart();
    }


    window.addExpense = function () {

        const amount = parseFloat(document.getElementById("amount").value);
        let category = document.getElementById("category").value;
        const customCategory =
            document.getElementById("customCategory").value;

        if (!amount || category === "") {
            alert("Please fill all fields");
            return;
        }

        if (category === "Other") {
            if (customCategory.trim() === "") {
                alert("Please enter custom category");
                return;
            }
            category = customCategory.trim();
        }

        expenses.push({
            amount: amount,
            category: category,
            date: new Date()
        });

        localStorage.setItem("expenses", JSON.stringify(expenses));

        document.getElementById("amount").value = "";
        document.getElementById("category").value = "";
        document.getElementById("customCategory").value = "";
        document.getElementById("customCategory").style.display = "none";

        updateUI();
    };


    function updateChart() {

        const baseCategories =
            ["Food", "Travel", "Shopping", "Academic"];

        let totals = {
            Food: 0,
            Travel: 0,
            Shopping: 0,
            Academic: 0,
            Other: 0
        };

        expenses.forEach(e => {
            if (baseCategories.includes(e.category)) {
                totals[e.category] += e.amount;
            } else {
                totals["Other"] += e.amount;
            }
        });

        if (chart) chart.destroy();

        const ctx =
            document.getElementById("expenseChart").getContext("2d");

        chart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: Object.keys(totals),
                datasets: [{
                    data: Object.values(totals),
                    backgroundColor: [
                        "#8A947B",
                        "#D6B0A6",
                        "#b7e2c2",
                        "#6F7863",
                        "#F4EDE4"
                    ]
                }]
            }
        });
    }

    updateUI();
}


// ============================
// SAVINGS PAGE
// ============================
if (window.location.pathname.includes("savings.html")) {

    const budget = parseFloat(localStorage.getItem("budget")) || 0;
    const goal = parseFloat(localStorage.getItem("goal")) || 0;
    let income = parseFloat(localStorage.getItem("income")) || 0;
    const expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    let savingsChart;

    function calculateSavings() {
        const totalSpent =
            expenses.reduce((sum, item) => sum + item.amount, 0);
        return budget + income - totalSpent;
    }

    function updateSavingsUI() {

        const currentSavings = calculateSavings();

        animateValue("currentSavings", 0, currentSavings, 1000);
        document.getElementById("savingsGoal").innerText = "₹ " + goal;

        updateSavingsChart();
    }

    function updateSavingsChart() {

        const currentSavings = calculateSavings();
        const ctx =
            document.getElementById("savingsChart").getContext("2d");

        if (savingsChart) savingsChart.destroy();

        savingsChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Start", "Current", "Goal"],
                datasets: [{
                    data: [0, currentSavings, goal],
                    borderColor: "#8A947B",
                    tension: 0.4,
                    fill: true
                }]
            }
        });
    }

    window.addIncome = function () {

        const amount =
            parseFloat(document.getElementById("incomeAmount").value);

        if (!amount || amount <= 0) {
            alert("Enter valid amount");
            return;
        }

        income += amount;
        localStorage.setItem("income", income);

        document.getElementById("incomeAmount").value = "";
        updateSavingsUI();
    };

    updateSavingsUI();
}
// ============================
// CALENDAR PAGE
// ============================

if (window.location.pathname.includes("calendar.html")) {

    let currentDate = new Date();

    const budget = parseFloat(localStorage.getItem("budget")) || 0;
    const income = parseFloat(localStorage.getItem("income")) || 0;
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    function renderCalendar() {

        const calendar = document.getElementById("calendar");
        const monthTitle = document.getElementById("monthTitle");
        const monthlyTotalDisplay = document.getElementById("monthlyTotal");
        const progressFill = document.getElementById("progressFill");

        if (!calendar) return;

        calendar.innerHTML = "";

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthTitle.innerText =
            currentDate.toLocaleString("default", { month: "long" }) +
            " " +
            year;

        let monthlyTotal = 0;

        // Empty boxes before first day
        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement("div");
            calendar.appendChild(emptyDiv);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {

            let totalForDay = 0;

            expenses.forEach(exp => {
                let expDate = new Date(exp.date);

                if (
                    expDate.getDate() === day &&
                    expDate.getMonth() === month &&
                    expDate.getFullYear() === year
                ) {
                    totalForDay += exp.amount;
                }
            });

            monthlyTotal += totalForDay;

            const dayBox = document.createElement("div");
            dayBox.classList.add("calendar-day");

            dayBox.innerHTML =
                '<div class="day-number">' + day + '</div>' +
                '<div class="day-amount">' +
                (totalForDay > 0 ? "₹" + totalForDay : "") +
                '</div>';

            calendar.appendChild(dayBox);
        }

        monthlyTotalDisplay.innerText = "₹ " + monthlyTotal;

        let totalAvailable = budget + income;

        let percentage =
            totalAvailable > 0
                ? (monthlyTotal / totalAvailable) * 100
                : 0;

        progressFill.style.width = "0%";

        setTimeout(() => {
            progressFill.style.width = percentage + "%";
        }, 300);
    }

    window.changeMonth = function (direction) {
        currentDate.setMonth(currentDate.getMonth() + direction);
        renderCalendar();
    };

    renderCalendar();
}

