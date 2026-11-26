(() => {
  "use strict";

  const app = document.querySelector("#app");
  const month = document.querySelector("#active-month");
  const navLinks = document.querySelectorAll(".site-nav a");
  const storageStatus = document.querySelector("#storage-status");
  const notice = document.querySelector("#notice");
  const routes = new Map([
    ["#/", { title: "Overview", view: Views.overview }],
    ["#/transactions", { title: "Transactions", view: Views.transactions }],
    ["#/budgets", { title: "Budgets", view: Views.budgets }],
    ["#/goals", { title: "Savings goals", view: Views.goals }],
    ["#/insights", { title: "Insights", view: Views.insights }],
  ]);
  const filters = { category: "", query: "" };
  let noticeTimer;

  function showStorageStatus() {
    storageStatus.textContent = Store.persistent ? "Saved on this device" : "Changes last until this tab closes";
    storageStatus.classList.toggle("storage-unavailable", !Store.persistent);
  }

  function announce(message) {
    clearTimeout(noticeTimer);
    notice.textContent = message;
    noticeTimer = setTimeout(() => { notice.textContent = ""; }, 4500);
  }

  function render(focusHeading = false) {
    const path = routes.has(location.hash) ? location.hash : "#/";
    const { title, view } = routes.get(path);
    app.innerHTML = view(filters);
    document.title = `${title} · HearthLedger`;
    month.dateTime = Store.month;
    month.textContent = Views.monthLabel(Store.month);
    for (const link of navLinks) {
      if (link.hash === path) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    showStorageStatus();
    if (focusHeading) {
      window.scrollTo(0, 0);
      app.querySelector("h1").focus({ preventScroll: true });
    }
  }

  function renderTransactionResults() {
    // Keep the form and filters in place so typing does not lose focus.
    app.querySelector("#transaction-results").innerHTML = Views.transactionResults(filters);
    showStorageStatus();
  }

  function csvField(value) {
    return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
  }

  function exportTransactions() {
    const rows = Store.filteredTransactions(filters).map(({ date, description, category, type, amount }) =>
      [date, description, category, type, amount.toFixed(2)].map(csvField).join(","));
    const csv = ["date,description,category,type,amount", ...rows].join("\r\n") + "\r\n";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const download = document.createElement("a");
    download.href = url;
    download.download = "hearthledger-transactions.csv";
    document.body.append(download);
    download.click();
    download.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  app.addEventListener("input", (event) => {
    if (event.target.id === "transaction-search") {
      filters.query = event.target.value;
      renderTransactionResults();
    }
  });

  app.addEventListener("change", (event) => {
    if (event.target.id === "category-filter") {
      filters.category = event.target.value;
      renderTransactionResults();
    }
    if (event.target.id === "transaction-type") {
      app.querySelector("#transaction-category").innerHTML = Views.categoryOptions(Store.categories(event.target.value));
    }
  });

  app.addEventListener("submit", (event) => {
    const form = event.target;
    const { goal, budget } = form.dataset;
    if (form.id !== "transaction-form" && !goal && !budget) return;

    event.preventDefault();
    const fields = Object.fromEntries(new FormData(form));
    const error = form.querySelector("[data-error]");
    error.textContent = "";

    try {
      if (goal) {
        const updated = Store.addGoalFunds(goal, fields.amount);
        render();
        app.querySelector(`form[data-goal="${CSS.escape(goal)}"] input`).focus({ preventScroll: true });
        announce(`Added ${Store.money(fields.amount)} to ${updated.name}.`);
      } else if (budget) {
        const updated = Store.setBudgetLimit(budget, fields.amount);
        render();
        const editor = app.querySelector(`form[data-budget="${CSS.escape(budget)}"]`);
        editor.previousElementSibling.focus();
        announce(`${updated.category} limit saved at ${Store.money(updated.limit)}.`);
      } else {
        const entry = Store.addTransaction(fields);
        form.elements.description.value = "";
        form.elements.amount.value = "";
        renderTransactionResults();
        form.elements.description.focus({ preventScroll: true });
        const visible = app.querySelector(`[data-delete="${CSS.escape(entry.id)}"]`);
        announce(visible ? `${entry.description} added.` : `${entry.description} added. Adjust filters to show it.`);
      }
    } catch (problem) {
      error.textContent = problem.message;
    }
  });

  app.addEventListener("click", (event) => {
    if (event.target.closest("#export-csv")) {
      exportTransactions();
      return;
    }
    const button = event.target.closest("[data-delete]");
    if (!button || !Store.deleteTransaction(button.dataset.delete)) return;

    const position = Array.from(app.querySelectorAll("[data-delete]")).indexOf(button);
    renderTransactionResults();
    const buttons = app.querySelectorAll("[data-delete]");
    const nextFocus = buttons[Math.min(position, buttons.length - 1)] ?? app.querySelector("#transaction-search");
    nextFocus.focus({ preventScroll: true });
    announce("Transaction deleted.");
  });

  document.querySelector(".skip-link").addEventListener("click", (event) => {
    event.preventDefault();
    app.focus();
  });

  document.querySelector("#reset-demo").addEventListener("click", () => {
    Store.reset();
    filters.category = "";
    filters.query = "";
    render();
    announce("Demo data restored.");
  });

  window.addEventListener("hashchange", () => render(true));
  render();
})();
