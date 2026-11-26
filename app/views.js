var Views = (() => {
  const { money, sumMoney } = Store;
  const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
  const shortMonthFormat = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const dateWithYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  const percentFormat = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });
  const split = { need: 50, want: 30, savings: 20 };
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  const iconPaths = {
    income: '<path d="M18 6 6 18m0-8v8h8"/>',
    expense: '<path d="M6 18 18 6m-8 0h8v8"/>',
    balance: '<path d="M3.5 8V6a2 2 0 0 1 2-2l11-1v4M4 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2.5 2.5 0 0 1-2.5-2.5V8.5A2.5 2.5 0 0 1 6 6h12"/><path d="M20 12h-4a2 2 0 0 0 0 4h4"/>',
    savings: '<path d="M12 5V3m0 3c-2.2 0-3.5 1.1-3.5 2.7 0 3.4 7 1.5 7 5 0 1.7-1.5 2.8-3.5 2.8s-3.5-1-3.5-2.5M12 17v2"/><circle cx="12" cy="11" r="9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h13m-5-5 5 5-5 5"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5"/>',
    search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4.5 4.5"/>',
    download: '<path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/>',
    calendar: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 4v4m8-4v4M4 10h16m-10 5h4"/>',
    house: '<path d="m3 11 9-8 9 8m-3-2v11H6V9m4 11v-6h4v6"/>',
    basket: '<path d="M3 10h18l-2 10H5L3 10Zm4 0 4-6m6 6-4-6m-4 9v4m6-4v4"/>',
    bolt: '<path d="m13 2-8 12h6l-1 8 9-12h-6l1-8Z"/>',
    car: '<path d="m5 10 2-5h10l2 5M4 17v3m16-3v3M4 10h16v7H4zm3 3h2m6 0h2"/>',
    plate: '<path d="M4 4v6a2 2 0 0 0 4 0V4m-2 0v16M16 4c-2 2-3 5-3 9h4m0-9v16"/>',
    heart: '<path d="M20 8c0 3.6-4 6.8-8 10-4-3.2-8-6.4-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1Z"/>',
    book: '<path d="M12 6c-2-2-5-2-9-1v14c4-1 7-1 9 1 2-2 5-2 9-1V5c-4-1-7-1-9 1Zm0 0v14"/>',
    spark: '<path d="M12 3c1 5 3 7 9 9-6 2-8 4-9 9-1-5-3-7-9-9 6-2 8-4 9-9Z"/>',
    sofa: '<path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 17v3m14-3v3M3 10h4v4h10v-4h4v7H3Z"/>',
    shield: '<path d="M12 3 4.5 6v5c0 4 3 7.5 7.5 10 4.5-2.5 7.5-6 7.5-10V6L12 3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    coast: '<circle cx="16.5" cy="7.5" r="3.5"/><path d="M3 14c2.5 0 2.5-2 4.5-2s2.5 2 4.5 2 2.5-2 4.5-2 2 2 4.5 2M3 19c2.5 0 2.5-2 4.5-2s2.5 2 4.5 2 2.5-2 4.5-2 2 2 4.5 2"/>',
    alert: '<path d="M12 8v5m0 3v.1M10.5 4.5 3 18a1 1 0 0 0 .9 1.5h16.2A1 1 0 0 0 21 18L13.5 4.5a1.7 1.7 0 0 0-3 0Z"/>',
    trend: '<path d="M4 18h16M5 14l5-5 3 3 6-7m-5 0h5v5"/>',
    edit: '<path d="m14 6 4 4M4 20l4-.8L20 7l-3-3L4.8 16 4 20Z"/>',
  };
  const categoryIcons = {
    Housing: "house", Groceries: "basket", Utilities: "bolt", Transport: "car",
    "Dining Out": "plate", Health: "heart", "Kids & School": "book", Fun: "spark", Home: "sofa",
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => entities[character]);
  }

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
  }

  function iconTile(name, tone = "teal") {
    return `<span class="icon-tile tone-${tone}">${icon(name)}</span>`;
  }

  function asDate(date) {
    return new Date(`${date}T00:00:00Z`);
  }

  function monthName(month) {
    return monthFormat.format(asDate(`${month}-01`));
  }

  function monthLabel(month) {
    return `${monthName(month)} ${month.slice(0, 4)}`;
  }

  function shortMonth(month) {
    return shortMonthFormat.format(asDate(`${month}-01`));
  }

  function monthEnd() {
    const [year, month] = Store.month.split("-").map(Number);
    return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  }

  function percent(value) {
    return Number.isFinite(value) ? percentFormat.format(value / 100) : "—";
  }

  function signedMoney(amount) {
    return amount < 0 ? `−${money(-amount)}` : `+${money(amount)}`;
  }

  function progress(value, label, { over = false, amber = false } = {}) {
    const width = Math.max(0, Math.min(value, 100));
    return `<progress class="progress${over ? " progress-over" : ""}${amber ? " progress-amber" : ""}" max="100"
      value="${width}" aria-label="${escapeHtml(label)}" aria-valuetext="${percent(value)}">${percent(value)}</progress>`;
  }

  function pageHeading(title, detail = "") {
    return `<header class="page-heading"><h1 tabindex="-1">${title}</h1>${detail ? `<p>${detail}</p>` : ""}</header>`;
  }

  function link(label, target) {
    return `<a class="panel-link" href="${target}">${label}${icon("arrow")}</a>`;
  }

  function changeLabel(current, previous, previousMonth) {
    const difference = sumMoney([current, -previous]);
    return `${difference ? signedMoney(difference) : money(0)} vs ${shortMonth(previousMonth)}`;
  }

  function transactionRow(entry, full = false) {
    const income = entry.type === "income";
    const description = escapeHtml(entry.description);
    const date = asDate(entry.date);
    return `<tr class="entry-row">
      <td class="entry-date" role="cell"><time datetime="${escapeHtml(entry.date)}">${(full ? dateWithYear : dateFormat).format(date)}</time></td>
      <td class="entry-description" role="cell">${description}</td>
      <td class="entry-category" role="cell"><span class="category-tag">${escapeHtml(entry.category)}</span></td>
      ${full ? `<td class="entry-type" role="cell"><span class="type-label ${income ? "type-income" : ""}">${income ? "Income" : "Expense"}</span></td>` : ""}
      <td class="entry-amount ${income ? "amount-income" : ""}" role="cell">${signedMoney(income ? entry.amount : -entry.amount)}</td>
      ${full ? `<td class="entry-action" role="cell"><button class="delete-button" type="button" data-delete="${escapeHtml(entry.id)}"
        aria-label="Delete ${description}" title="Delete transaction">${icon("trash")}<span>Delete</span></button></td>` : ""}
    </tr>`;
  }

  function recentTable(entries) {
    if (!entries.length) return '<p class="empty-state">There are no transactions for this month yet.</p>';
    return `<table class="ledger-table recent-table" role="table" aria-label="Recent transactions">
      <thead><tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col">Category</th><th scope="col" class="align-right">Amount</th></tr></thead>
      <tbody>${entries.map((entry) => transactionRow(entry)).join("")}</tbody>
    </table>`;
  }

  function upcomingBills() {
    const [year, month] = Store.month.split("-").map(Number);
    const bills = Store.bills.sort((a, b) => a.dueDay - b.dueDay);
    const next = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 7);
    return `<section class="panel bills-panel" aria-labelledby="bills-title">
      <header class="panel-heading"><div><h2 id="bills-title">Upcoming bills</h2><p>Due in ${monthName(next)}</p></div></header>
      <ul class="bill-list">${bills.map(({ name, dueDay, amount }) => {
        const date = String(dueDay).padStart(2, "0");
        return `<li><time datetime="${next}-${date}" class="bill-date"><span>${shortMonth(next)}</span><strong>${date}</strong></time>
          <strong class="bill-name">${escapeHtml(name)}</strong><span class="bill-amount">${money(amount)}</span></li>`;
      }).join("")}</ul>
      <div class="bill-total"><span>Scheduled total</span><strong>${money(sumMoney(bills.map(({ amount }) => amount)))}</strong></div>
    </section>`;
  }

  function overview() {
    const { income, spending, net, savingsRate } = Store.totals();
    const history = Store.history();
    const previous = history.at(-2);
    const month = monthName(Store.month);
    const budgets = Store.budgetStatus();
    const topBudgets = budgets.filter(({ spent }) => spent > 0).sort((a, b) => b.spent - a.spent).slice(0, 5);
    const recent = Store.recentTransactions(5, Store.month);
    const latestDate = recent[0]?.date;
    const calendarDaysLeft = Number(monthEnd().slice(-2)) - Number(latestDate?.slice(-2) ?? 0);
    const daysLeft = Math.max(1, calendarDaysLeft);
    const dayCount = `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
    const daysDescription = latestDate
      ? `${dayCount} after ${dateFormat.format(asDate(latestDate))}${calendarDaysLeft === 0 ? " (the month-end minimum)" : ""}`
      : `all ${dayCount} in the month`;
    const remaining = sumMoney(budgets.map((item) => item.remaining));
    const metrics = [
      ["Income", money(income), changeLabel(income, previous.income, previous.month), "income", "teal"],
      ["Spending", money(spending), changeLabel(spending, previous.spending, previous.month), "expense", "amber"],
      ["Net balance", money(net), changeLabel(net, sumMoney([previous.income, -previous.spending]), previous.month), "balance", "sage"],
      ["Savings rate", percent(savingsRate), savingsRate === null ? "No income recorded" : `${split.savings}% savings guide`, "savings", "amber"],
    ];

    return `<section class="hero">
      <div class="hero-pattern" aria-hidden="true"><span></span><i></i></div>
      <div><p class="hero-household">${escapeHtml(Store.household)}</p><h1 tabindex="-1">${month} overview</h1></div>
      <a class="button button-amber hero-action" href="#/transactions">${icon("plus")} Add transaction</a>
    </section>
    <div class="metric-grid" aria-label="Monthly totals">
      ${metrics.map(([label, value, detail, symbol, tone]) => `<article class="panel metric-card">
        <h2>${iconTile(symbol, tone)}${label}</h2><strong class="metric-value">${value}</strong><p>${detail}</p>
      </article>`).join("")}
    </div>
    <section class="panel daily-budget" aria-labelledby="daily-budget-title">
      ${iconTile("calendar", "amber")}
      <h2 id="daily-budget-title">Safe to spend per day</h2>
      <strong class="daily-budget-value${remaining < 0 ? " over-text" : ""}">${money(remaining / daysLeft)}</strong>
      <p>We divide the ${money(remaining)} left in the ${month} budget by ${daysDescription}.</p>
    </section>
    <div class="overview-grid">
      <section class="panel cash-panel" aria-labelledby="cash-title">
        <header class="panel-heading"><div><h2 id="cash-title">Cash flow</h2>
          <p>${shortMonth(history[0].month)}–${shortMonth(Store.month)} ${Store.month.slice(0, 4)}</p></div>
          <div class="bar-legend"><span><i class="legend-income"></i>Income</span><span><i class="legend-spending"></i>Spending</span></div>
        </header>
        ${Charts.barChart(history)}
      </section>
      <section class="panel top-panel" aria-labelledby="top-title">
        <header class="panel-heading"><h2 id="top-title">Top spending</h2>${link("All budgets", "#/budgets")}</header>
        ${topBudgets.length ? `<ul class="top-budgets">${topBudgets.map((item) => `<li>
          <div class="top-budget-line"><strong>${escapeHtml(item.category)}</strong>
            <span class="${item.over ? "over-text" : ""}"><strong>${money(item.spent)}</strong> <span>/ ${money(item.limit)}</span></span></div>
          ${progress(item.percent, `${item.category} budget used`, { over: item.over })}
        </li>`).join("")}</ul>` : '<p class="empty-state">No expenses recorded this month.</p>'}
      </section>
      <section class="panel recent-panel" aria-labelledby="recent-title">
        <header class="panel-heading"><h2 id="recent-title">Recent transactions</h2>${link("View all", "#/transactions")}</header>
        ${recentTable(recent)}
      </section>
      ${upcomingBills()}
    </div>`;
  }

  function categoryOptions(categories, selected = "") {
    return categories.map((category) => `<option value="${escapeHtml(category)}"${category === selected ? " selected" : ""}>${escapeHtml(category)}</option>`).join("");
  }

  function transactionResults(filters = {}) {
    const filtered = filters.category || filters.query?.trim();
    const entries = Store.filteredTransactions(filters);
    const income = sumMoney(entries.filter(({ type }) => type === "income").map(({ amount }) => amount));
    const spending = sumMoney(entries.filter(({ type }) => type === "expense").map(({ amount }) => amount));

    return `<div class="ledger-toolbar">
        <p class="result-count">${entries.length} ${entries.length === 1 ? "transaction" : "transactions"}</p>
        <button id="export-csv" class="button button-secondary" type="button">${icon("download")} Export CSV</button>
      </div>
      <table class="ledger-table full-table" role="table" aria-label="Household transactions">
        <thead><tr><th scope="col">Date</th><th scope="col">Description</th><th scope="col">Category</th>
          <th scope="col">Type</th><th scope="col" class="align-right">Amount</th><th scope="col"><span class="sr-only">Actions</span></th></tr></thead>
        <tbody>${entries.length ? entries.map((entry) => transactionRow(entry, true)).join("") :
          `<tr class="empty-row"><td colspan="6">${filtered ? "No transactions match these filters." : "Add a transaction to start the ledger."}</td></tr>`}</tbody>
        <tfoot><tr class="totals-row"><th scope="row" colspan="2">${filtered ? "Filtered totals" : "Totals"}</th>
          <td colspan="4"><dl class="table-totals">
            <div><dt>Income</dt><dd>${money(income)}</dd></div><div><dt>Spending</dt><dd>${money(spending)}</dd></div>
            <div><dt>Net</dt><dd>${money(sumMoney([income, -spending]))}</dd></div>
          </dl></td></tr></tfoot>
      </table>`;
  }

  function transactions(filters = {}) {
    return `${pageHeading("Transactions", "Filter the ledger to see totals for the entries shown.")}
      <div class="transactions-layout">
        <section class="panel add-panel" aria-labelledby="add-title">
          <header class="panel-heading"><h2 id="add-title">Add a transaction</h2>${iconTile("plus")}</header>
          <form id="transaction-form" class="entry-form">
            <label class="full-field">Description<input name="description" placeholder="e.g. Weekly grocery shop" maxlength="120" required></label>
            <label>Date<input type="date" name="date" value="${monthEnd()}" required></label>
            <label>Type<select name="type" id="transaction-type"><option value="expense">Expense</option><option value="income">Income</option></select></label>
            <label>Category<select name="category" id="transaction-category" required>${categoryOptions(Store.categories("expense"))}</select></label>
            <label>Amount (USD)<input name="amount" type="number" inputmode="decimal" min="0.01" step="0.01" placeholder="0.00" required></label>
            <p class="form-error full-field" role="alert" data-error></p>
            <button type="submit" class="button button-primary full-field">${icon("plus")} Add transaction</button>
          </form>
        </section>
        <section class="panel ledger-panel" aria-labelledby="ledger-title">
          <header class="panel-heading"><h2 id="ledger-title">Household ledger</h2></header>
          <div class="filters">
            <label>Search<span class="search-field">${icon("search")}<input type="search" id="transaction-search" placeholder="Search transactions" value="${escapeHtml(filters.query ?? "")}"></span></label>
            <label>Category<select id="category-filter"><option value="">All categories</option>${categoryOptions(Store.categories(), filters.category)}</select></label>
          </div>
          <div id="transaction-results">${transactionResults(filters)}</div>
        </section>
      </div>`;
  }

  function budgets() {
    const categories = Store.budgetStatus();
    // Show over-budget categories first, then sort each group by percent of its limit used.
    categories.sort((a, b) => Number(b.over) - Number(a.over) || b.percent - a.percent);
    const limit = sumMoney(categories.map((item) => item.limit));
    const spent = sumMoney(categories.map((item) => item.spent));
    const remaining = sumMoney([limit, -spent]);
    const overCount = categories.filter((item) => item.over).length;

    return `${pageHeading("Budgets")}
      <section class="panel budget-summary" aria-labelledby="budget-summary-title">
        <div class="budget-summary-main"><h2 id="budget-summary-title">${monthName(Store.month)} budget</h2>
          <div><strong>${money(spent)}</strong> <span>of ${money(limit)} allocated</span></div>
          ${progress(Store.percentUsed(spent, limit), "Total budget used", { over: remaining < 0 })}</div>
        <dl class="summary-facts"><div><dt>Remaining</dt><dd class="${remaining < 0 ? "over-text" : ""}">${money(remaining)}</dd></div>
          <div><dt>Over budget</dt><dd>${overCount} <small>of ${categories.length} categories</small></dd></div></dl>
      </section>
      <div class="budget-grid">${categories.map((item) => `<article class="panel budget-card">
        <header class="card-heading">${iconTile(categoryIcons[item.category], item.kind === "want" ? "amber" : "teal")}
          <h2>${escapeHtml(item.category)}</h2>${item.over ? `<span class="badge badge-over">${icon("alert")} Over budget</span>` : ""}
        </header>
        <div class="budget-figures"><div><strong>${money(item.spent)}</strong> <span>of ${money(item.limit)}</span></div>
          <span>${item.limit ? percent(item.percent) : "No allocation"}</span></div>
        ${progress(item.percent, `${item.category} budget used`, { over: item.over })}
        <div class="budget-card-foot"><span>Remaining</span><strong class="${item.over ? "over-text" : ""}">${money(item.remaining)}</strong></div>
        <details class="budget-editor">
          <summary>${icon("edit")} Edit limit</summary>
          <form class="inline-form" data-budget="${escapeHtml(item.category)}">
            <label>Limit (USD)<input name="amount" type="number" inputmode="decimal" min="0" step="0.01" value="${item.limit.toFixed(2)}" required></label>
            <button type="submit" class="button button-primary">Save limit</button><p class="form-error" role="alert" data-error></p>
          </form>
        </details>
      </article>`).join("")}</div>`;
  }

  function goals() {
    const symbols = { emergency: "shield", coast: "coast", sofa: "sofa" };
    return `${pageHeading("Savings goals", "Record money you’ve already set aside for each goal.")}
      <div class="goals-grid">${Store.goals.map((goal, index) => {
        const remaining = sumMoney([goal.target, -goal.saved]);
        const percentage = Store.percentUsed(goal.saved, goal.target);
        return `<article class="panel goal-card">
          ${iconTile(symbols[goal.id], goal.id === "coast" ? "amber" : "teal")}
          <h2>${escapeHtml(goal.name)}</h2>
          <div class="goal-value"><strong>${money(goal.saved)}</strong> <span>of ${money(goal.target)}</span></div>
          ${progress(percentage, `${goal.name} funded`, { amber: goal.id === "coast" })}
          <div class="goal-progress-label"><span>${percent(percentage)} funded</span><strong>${remaining > 0 ? `${money(remaining)} to go` : "Target reached"}</strong></div>
          <form class="inline-form goal-form" data-goal="${escapeHtml(goal.id)}" aria-label="Add funds to ${escapeHtml(goal.name)}">
            <label for="goal-amount-${index}">Amount (USD)<input id="goal-amount-${index}" name="amount" type="number" inputmode="decimal"
              min="0.01" step="0.01" placeholder="0.00" required></label>
            <button type="submit" class="button button-primary">${icon("plus")} Add funds</button><p class="form-error" role="alert" data-error></p>
          </form>
        </article>`;
      }).join("")}</div>`;
  }

  function insights() {
    const totals = Store.totals();
    const categories = Store.budgetStatus();
    const highestOver = categories.filter(({ over }) => over).sort((a, b) => a.remaining - b.remaining)[0];
    const closest = [...categories].sort((a, b) => b.percent - a.percent)[0];
    const biggest = Store.recentTransactions(Infinity, Store.month).filter((entry) => entry.type === "expense")
      .sort((a, b) => b.amount - a.amount)[0];
    const previous = Store.history().at(-2);
    const change = sumMoney([totals.spending, -previous.spending]);
    const targetCents = Math.ceil(Math.round(totals.income * 100) * (split.savings / 100));
    const gap = sumMoney([targetCents / 100, -totals.net]);
    const belowGuide = totals.net < 0 ? `Spending exceeds income by ${money(-totals.net)}.` :
      `You kept ${percent(totals.savingsRate)} of income after expenses.`;
    const advice = [
      ["alert", "Category limits", highestOver ?
        `${escapeHtml(highestOver.category)} is the most over budget at ${money(-highestOver.remaining)} above its limit. Pause purchases in that category to keep the gap from growing.` :
        closest.spent ? `${escapeHtml(closest.category)} is closest to its limit with ${money(closest.remaining)} left. Check that balance before the next purchase.` :
          "There are no expenses in the ledger this month. Add an expense to see how it affects its category limit."],
      ["savings", "Savings rate", totals.savingsRate === null ? "Record income to see how much of it is available for savings." :
        totals.savingsRate >= split.savings ? `Your ${percent(totals.savingsRate)} savings rate meets the ${split.savings}% guide. You have ${money(totals.net)} left after expenses to put toward your goals.` :
          `${belowGuide} Freeing up ${money(gap)} would bring you to the ${split.savings}% savings guide.`],
      ["house", "Biggest expense", biggest ? `${escapeHtml(biggest.description)} was ${money(biggest.amount)}, or ${percent((biggest.amount / totals.spending) * 100)} of the month’s spending. Plan for this amount if the expense recurs.` :
        "Your largest purchase will appear here once you record an expense."],
      ["trend", "Spending since last month", change ? `Spending is ${money(Math.abs(change))} ${change > 0 ? "higher" : "lower"} than ${monthName(previous.month)}${previous.spending ? ` (${percent((Math.abs(change) / previous.spending) * 100)})` : ""}. ${change > 0 ? "Review the largest categories when planning next month." : "Consider putting the difference toward a savings goal."}` :
        `Spending is steady at ${money(totals.spending)}, the same as ${monthName(previous.month)}.`],
    ];
    const spending = Store.spendingByCategory();
    const buckets = [["Needs", "need"], ["Wants", "want"], ["Savings", "savings"]];

    return `${pageHeading("Insights")}
      <div class="insight-grid">
        <section class="panel donut-panel" aria-labelledby="mix-title">
          <header class="panel-heading"><div><h2 id="mix-title">Spending mix</h2><p>${monthLabel(Store.month)}</p></div></header>
          ${Charts.donutChart(spending)}${Charts.donutChart(spending, { compact: true })}
        </section>
        <section class="panel advice-panel" aria-labelledby="advice-title"><header class="panel-heading"><h2 id="advice-title">What to watch</h2></header>
          <ul class="advice-list">${advice.map(([symbol, title, detail]) => `<li>${iconTile(symbol, symbol === "alert" && highestOver ? "amber" : "teal")}
            <div><h3>${title}</h3><p>${detail}</p></div></li>`).join("")}</ul>
        </section>
      </div>
      <section class="panel rule-panel" aria-labelledby="rule-title">
        <header class="panel-heading"><h2 id="rule-title">The 50/30/20 check</h2></header>
        <p class="rule-intro">The guide divides take-home income into essentials, optional spending, and savings. Savings here is the amount left after expenses.</p>
        ${totals.income ? "" : '<p class="rule-intro">Record income to see each share as a percentage.</p>'}
        <div class="rule-grid">${buckets.map(([label, kind]) => {
          const items = categories.filter((item) => item.kind === kind);
          const amount = kind === "savings" ? totals.net : sumMoney(items.map(({ spent }) => spent));
          const percentage = totals.income ? (amount / totals.income) * 100 : null;
          return `<article class="rule-card rule-${kind}"><h3>${label}</h3><div><strong>${percent(percentage)}</strong><span>${money(amount)}</span></div>
            <p>${split[kind]}% guide · ${kind === "savings" ? "Income after expenses" : escapeHtml(items.map(({ category }) => category).join(", "))}</p></article>`;
        }).join("")}</div>
      </section>`;
  }

  return Object.freeze({ overview, transactions, budgets, goals, insights, categoryOptions, transactionResults, monthLabel });
})();
