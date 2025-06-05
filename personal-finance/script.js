const STORAGE_KEY = 'finance-transactions';

function loadTransactions() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveTransactions(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function calculateSummary(transactions) {
  let income = 0, expenses = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, balance: income - expenses };
}

function renderSummary(summary) {
  document.getElementById('income').textContent = `$${summary.income}`;
  document.getElementById('expenses').textContent = `$${summary.expenses}`;
  document.getElementById('balance').textContent = `$${summary.balance}`;
}

function groupByMonth(transactions) {
  const result = {};
  for (const t of transactions) {
    const month = t.date.slice(0, 7); // YYYY-MM
    if (!result[month]) result[month] = { income: 0, expense: 0 };
    if (t.type === 'income') result[month].income += t.amount;
    else result[month].expense += t.amount;
  }
  return result;
}

let chart;
function renderChart(transactions) {
  const monthly = groupByMonth(transactions);
  const labels = Object.keys(monthly).sort();
  const incomeData = labels.map(l => monthly[l].income);
  const expenseData = labels.map(l => monthly[l].expense);

  const ctx = document.getElementById('chart');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income', backgroundColor: 'rgba(34,197,94,0.5)', data: incomeData },
        { label: 'Expense', backgroundColor: 'rgba(239,68,68,0.5)', data: expenseData }
      ]
    }
  });
}

function addTransaction(event) {
  event.preventDefault();
  const transactions = loadTransactions();
  const amount = parseFloat(document.getElementById('amount').value);
  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;
  const description = document.getElementById('description').value;

  transactions.push({ amount, date, type, description });
  saveTransactions(transactions);

  render();
  event.target.reset();
}

function render() {
  const transactions = loadTransactions();
  renderSummary(calculateSummary(transactions));
  renderChart(transactions);
}

document.getElementById('transaction-form').addEventListener('submit', addTransaction);

render();
