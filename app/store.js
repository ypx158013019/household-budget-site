// Manages household state, saves it to localStorage, and exposes selectors for the views.
var Store = (() => {
  const storageKey = "hearthledger.v1";
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  let persistent = false;
  let state = load();

  function save(snapshot) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
      persistent = true;
    } catch {
      persistent = false;
    }
  }

  function freshState() {
    const snapshot = JSON.parse(JSON.stringify(SEED));
    save(snapshot);
    return snapshot;
  }

  function load() {
    try {
      const snapshot = JSON.parse(localStorage.getItem(storageKey));
      if (snapshot?.month && ["transactions", "budgets", "history", "goals", "bills", "incomeCategories"]
        .every((key) => Array.isArray(snapshot[key]))) {
        persistent = true;
        return snapshot;
      }
    } catch {
      // A damaged or unavailable save should still open the demo.
    }
    return freshState();
  }

  function toCents(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return NaN;
    const [decimal, exponent = "0"] = Math.abs(number).toString().split("e");
    // Shift the decimal before rounding, including for values written with an exponent.
    return Math.sign(number) * Math.round(Number(`${decimal}e${Number(exponent) + 2}`));
  }

  function roundMoney(value) {
    const cents = toCents(value);
    return cents === 0 ? 0 : cents / 100;
  }

  function sumMoney(amounts) {
    return amounts.reduce((total, amount) => total + toCents(amount), 0) / 100;
  }

  function money(value) {
    return usd.format(roundMoney(value));
  }

  function categories(type) {
    const expenses = state.budgets.map(({ category }) => category);
    if (type === "expense") return expenses;
    if (type === "income") return [...state.incomeCategories];
    return [...expenses, ...state.incomeCategories];
  }

  function transactionsFor(month) {
    return state.transactions.filter(({ date }) => !month || date.slice(0, 7) === month);
  }

  function recentTransactions(limit = Infinity, month) {
    return transactionsFor(month).reverse()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit)
      .map((entry) => ({ ...entry }));
  }

  function filteredTransactions({ category = "", query = "" } = {}) {
    const needle = query.trim().toLowerCase();
    return recentTransactions().filter((entry) => {
      return (!category || entry.category === category) && (!needle ||
        [entry.description, entry.category, entry.date, entry.type].some((value) => value.toLowerCase().includes(needle)));
    });
  }

  function totals(month = state.month) {
    let incomeCents = 0;
    let spendingCents = 0;
    for (const entry of transactionsFor(month)) {
      if (entry.type === "income") incomeCents += toCents(entry.amount);
      else spendingCents += toCents(entry.amount);
    }
    const netCents = incomeCents - spendingCents;
    return {
      income: incomeCents / 100,
      spending: spendingCents / 100,
      net: netCents / 100,
      savingsRate: incomeCents ? (netCents / incomeCents) * 100 : null,
    };
  }

  function history() {
    return state.history.map(({ month, income, spending }) => {
      const ledger = totals(month);
      // November has a full ledger. Earlier months start with archived totals.
      return month === state.month ? { month, income: ledger.income, spending: ledger.spending } : {
        month,
        income: sumMoney([income, ledger.income]),
        spending: sumMoney([spending, ledger.spending]),
      };
    });
  }

  function spendingByCategory(month = state.month) {
    const centsByCategory = new Map(categories("expense").map((category) => [category, 0]));
    for (const entry of transactionsFor(month)) {
      if (entry.type !== "expense") continue;
      const cents = (centsByCategory.get(entry.category) ?? 0) + toCents(entry.amount);
      centsByCategory.set(entry.category, cents);
    }
    return Array.from(centsByCategory, ([category, cents]) => ({ category, spent: cents / 100 }));
  }

  function percentUsed(amount, limit) {
    if (limit) return (amount / limit) * 100;
    return amount > 0 ? Infinity : 0;
  }

  function budgetStatus(month = state.month) {
    const spending = new Map(spendingByCategory(month).map(({ category, spent }) => [category, spent]));
    return state.budgets.map((budget) => {
      const spent = spending.get(budget.category) ?? 0;
      return {
        ...budget,
        spent,
        percent: percentUsed(spent, budget.limit),
        remaining: sumMoney([budget.limit, -spent]),
        over: spent > budget.limit,
      };
    });
  }

  function addTransaction({ date, description, category, type, amount }) {
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsedDate.valueOf()) ||
        parsedDate.toISOString().slice(0, 10) !== date) {
      throw new Error("Enter a valid transaction date.");
    }
    const name = String(description ?? "").trim();
    if (!name) throw new Error("Enter a description for the transaction.");
    if (!["income", "expense"].includes(type) || !categories(type).includes(category)) {
      throw new Error("Choose a type and a matching category.");
    }
    const cents = toCents(amount);
    if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("Enter a positive USD amount.");

    const id = Array.from(crypto.getRandomValues(new Uint32Array(4)), (part) => part.toString(16)).join("-");
    const entry = { id, date, description: name, category, type, amount: cents / 100 };
    state.transactions.push(entry);
    save(state);
    return { ...entry };
  }

  function deleteTransaction(id) {
    const index = state.transactions.findIndex((entry) => entry.id === id);
    if (index === -1) return false;
    state.transactions.splice(index, 1);
    save(state);
    return true;
  }

  function addGoalFunds(id, amount) {
    const goal = state.goals.find((item) => item.id === id);
    if (!goal) throw new Error("Choose an existing savings goal.");
    const cents = toCents(amount);
    const savedCents = toCents(goal.saved) + cents;
    if (cents <= 0 || !Number.isSafeInteger(cents) || !Number.isSafeInteger(savedCents)) {
      throw new Error("Enter a positive USD amount.");
    }
    goal.saved = savedCents / 100;
    save(state);
    return { ...goal };
  }

  function setBudgetLimit(category, amount) {
    const budget = state.budgets.find((item) => item.category === category);
    if (!budget) throw new Error("Choose an existing budget category.");
    const cents = toCents(amount);
    if (amount === "" || !Number.isSafeInteger(cents) || cents < 0) {
      throw new Error("Enter a USD limit of zero or more.");
    }
    budget.limit = cents / 100;
    save(state);
    return { ...budget };
  }

  return Object.freeze({
    get month() { return state.month; },
    get household() { return state.household; },
    get goals() { return state.goals.map((goal) => ({ ...goal })); },
    get bills() { return state.bills.map((bill) => ({ ...bill })); },
    get persistent() { return persistent; },
    categories,
    recentTransactions,
    filteredTransactions,
    totals,
    history,
    spendingByCategory,
    budgetStatus,
    percentUsed,
    roundMoney,
    sumMoney,
    money,
    addTransaction,
    deleteTransaction,
    addGoalFunds,
    setBudgetLimit,
    reset() { state = freshState(); },
  });
})();
