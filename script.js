const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const addBtn = document.getElementById("addTransaction");

const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const listEl = document.getElementById("transactionList");
const chartCanvas = document.getElementById("expenseChart");

const currentMonthEl = document.getElementById("currentMonth");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const emptyStateEl = document.getElementById("emptyState");
const incomeExpenseCanvas = document.getElementById("incomeExpenseChart");
const darkToggle = document.getElementById("darkToggle");

let incomeExpenseChart = null;

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chart = null;
let editIndex = null;
let currentDate = new Date();

/* ---------- CATEGORY SETS ---------- */
const incomeCategories = ["Salary", "Bonus", "Freelance", "Interest", "Other"];
const expenseCategories = [
  "Food",
  "Travel",
  "Shopping",
  "Rent",
  "Bills",
  "Education",
  "Entertainment",
  "Healthcare",
  "Other"
];

/* ---------- MODAL ---------- */
openBtn.onclick = () => modal.classList.remove("hidden");
closeBtn.onclick = () => modal.classList.add("hidden");

/* ---------- CATEGORY SWITCH ---------- */
function updateCategoryOptions() {
  categoryInput.innerHTML = "";
  const categories =
    typeInput.value === "income" ? incomeCategories : expenseCategories;

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryInput.appendChild(opt);
  });
}

typeInput.addEventListener("change", updateCategoryOptions);
updateCategoryOptions();

/* ---------- ADD / EDIT TRANSACTION ---------- */
addBtn.onclick = () => {
  const category = categoryInput.value;
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const date = new Date().toISOString();

  if (!category || amount <= 0) {
    alert("Please fill all fields");
    return;
  }

  if (editIndex === null) {
    transactions.push({ category, amount, type, date });
  } else {
    transactions[editIndex] = { category, amount, type, date };
    editIndex = null;
  }

  localStorage.setItem("transactions", JSON.stringify(transactions));
  modal.classList.add("hidden");
  amountInput.value = "";
  updateUI();
};

/* ---------- UI UPDATE ---------- */
function updateUI() {
  listEl.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const filteredTransactions = transactions
    .map((t, i) => ({ ...t, originalIndex: i }))
    .filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

  emptyStateEl.classList.toggle("hidden", filteredTransactions.length !== 0);

  let income = 0;
  let expense = 0;
  let categoryTotals = {};

  filteredTransactions.forEach(t => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${t.category}</span>
      <div>
        <span>${t.type === "expense" ? "-" : "+"}₹${t.amount}</span>
        <button onclick="editTransaction(${t.originalIndex})">✏️</button>
        <button onclick="deleteTransaction(${t.originalIndex})">❌</button>
      </div>
    `;

    listEl.appendChild(li);

    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  incomeEl.textContent = `₹${income}`;
  expenseEl.textContent = `₹${expense}`;
  balanceEl.textContent = `₹${income - expense}`;

  updateChart(categoryTotals);
  updateMonthUI();
  updateIncomeExpenseChart(income, expense);

}

/* ---------- CHART ---------- */
function updateChart(data) {
  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data)
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}
/*-- Income VS Expense Chart --*/
function updateIncomeExpenseChart(income, expense) {
  if (incomeExpenseChart) incomeExpenseChart.destroy();

  incomeExpenseChart = new Chart(incomeExpenseCanvas, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#16a34a", "#dc2626"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}


/* ---------- DELETE ---------- */
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

/* ---------- EDIT ---------- */
function editTransaction(index) {
  const t = transactions[index];
  typeInput.value = t.type;
  updateCategoryOptions();
  categoryInput.value = t.category;
  amountInput.value = t.amount;
  editIndex = index;
  modal.classList.remove("hidden");
}

/* ---------- MONTH NAV ---------- */
function updateMonthUI() {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  currentMonthEl.textContent =
    `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

prevMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateUI();
};

nextMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateUI();
};

/* ---------- INIT ---------- */
updateUI();
// -------- DARK MODE --------
if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark");
  darkToggle.textContent = "☀️";
}

darkToggle.onclick = () => {
  document.body.classList.toggle("dark");

  const enabled = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", enabled ? "enabled" : "disabled");

  darkToggle.textContent = enabled ? "☀️" : "🌙";
};
