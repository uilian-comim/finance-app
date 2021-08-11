function loadTheme() {
   if (JSON.parse(localStorage.getItem("dark-theme")) == "true") {
      Modal.DarkTheme.activeDarkTheme();
   }
   else {

   }
}

let Modal = {
   DarkTheme: {
      activeDarkTheme() {
         const body = document.querySelector('body');
         body.classList.add("dark-theme");
      }
   },
   changeTheme() {
      const body = document.querySelector('body')
      if (body.classList.contains("dark-theme")) {
         body.classList.remove("dark-theme");
         localStorage.setItem("dark-theme", JSON.stringify("false"));
      }else {
         body.classList.add("dark-theme");
         localStorage.setItem("dark-theme", JSON.stringify("true"));
      }
   },
   Toogle() {
      const modalOverlay = document.querySelector(".modal-overlay");

      if (modalOverlay.classList.contains("active")) {
         modalOverlay.classList.remove("active");
      }
      else {
         modalOverlay.classList.add("active");
      }
   },
   ToogleEdit() {
      const modalOverlay = document.querySelector(".modal-overlay-edit");

      if (modalOverlay.classList.contains("active")) {
         modalOverlay.classList.remove("active");
      }
      else {
         modalOverlay.classList.add("active");
      }
   },
   EditTransaction(index) {
      Modal.ToogleEdit();
      const transactionContainer = {
         description: Transaction.all[index].description,
         amount: Transaction.all[index].amount,
         date: Transaction.all[index].date,
         typeTransaction: Transaction.all[index].typeTransaction,
      }

      const descriptionInput = document.querySelector("#description-edit");
      const pay = document.querySelector("#pay-edit");
      const receive = document.querySelector("#receive-edit");
      const amount = document.querySelector("#amount-edit");
      const date = document.querySelector("#date-edit");

      if (transactionContainer.typeTransaction == "pay") {
         pay.checked = true;
      }
      else if (transactionContainer.typeTransaction == "receive") {
         receive.checked = true;
      }

      date.value = Utils.defaultDate(transactionContainer.date);
      descriptionInput.value = transactionContainer.description;
      amount.value = transactionContainer.amount / 100;
   }
}

const Storage = {
   get() {
      return JSON.parse(localStorage.getItem("dev_finances_transactions")) || []
   },
   set(transactions) {
      localStorage.setItem("dev_finances_transactions", JSON.stringify(transactions))
   }
}

const Transaction = {
   all: Storage.get(),

   add(transaction) {
      Transaction.all.push(transaction)
      App.reload();
   },

   addEdit(index, transaction) {
      Transaction.all[index] = transaction;
      App.reload();
   },

   remove(index) {
      Transaction.all.splice(index, 1);

      App.reload();
   },
   edit(index) {
      Utils.index = index;
      Modal.EditTransaction(index);
   },
   incomes() {
      let income = 0;

      Transaction.all.forEach((transactions) => {
         if (transactions.typeTransaction == "receive") {
            income += transactions.amount;
         }
      })

      return income
   },
   expenses() {
      let expense = 0;

      Transaction.all.forEach((transactions) => {
         if (transactions.typeTransaction == "pay") {
            expense += transactions.amount;
         }
      })

      return expense
   },
   total() {
      if (Transaction.expenses() > Transaction.incomes()) {
         document.querySelector(".card.total").classList.add("red");
      } else {
         if (document.querySelector(".card.total").classList.contains("red")) {
            document.querySelector(".card.total").classList.remove("red");
         }
      }
      return Transaction.incomes() - Transaction.expenses();
   }
}

const DOM = {
   transactionsContainer: document.querySelector("#data-table tbody"),

   addTransaction(transaction, index) {
      const tr = document.createElement('tr');
      tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
      tr.dataset.index = index;
      DOM.transactionsContainer.appendChild(tr)
   },

   innerHTMLTransaction(transaction, index) {
      const CSSclass = transaction.typeTransaction == "receive" ? "income" : "expense";

      const amount = Utils.formatCurrency(transaction.amount, transaction.typeTransaction);

      const html = `
         <td class="description">${transaction.description}</td>
         <td class="${CSSclass}">${amount}</td>
         <td class="date">${transaction.date}</td>
         <td>
            <img onclick="Transaction.edit(${index})" title="Editar transação" src="./assets/edit.svg" alt="Editar transação">
         </td>
         <td>
            <img onclick="Transaction.remove(${index})" title="Remover transação" src="./assets/minus.svg" alt="Remover transação">
         </td>
      `

      return html

   },

   messageBox(type, message) {
      const messageError = document.querySelector(".message");
      const imgMessage = document.querySelector(".message img");
      const progressBar = document.querySelector(".message div");
      const messageH3 = document.querySelector(".message h3 strong");
      imgMessage.setAttribute("src", `./assets/${type}.svg`)
      messageError.classList.add(`${type}`);
      progressBar.classList.add(`${type}`);
      messageH3.innerHTML = `${message}`;
      setTimeout(() => { messageError.classList.remove(`${type}`); imgMessage.setAttribute("src", ""); progressBar.classList.remove(`${type}`); messageH3.innerHTML = "" }, 10000)
   },

   updateBalance() {
      document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes());
      document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses());
      document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total());
   },
   clearTransactions() {
      DOM.transactionsContainer.innerHTML = "";
   }
}

const Utils = {
   index: "",
   formatDate(date) {
      const splittedDate = date.split("-")
      return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
   },
   defaultDate(date) {
      const defaultDate = date.split("/");
      return defaultDate[2] + "-" + defaultDate[1] + "-" + defaultDate[0];
   },
   formatAmount(value) {
      value = Number(value) * 100
      return Math.round(value)
   },
   formatCurrency(value, typeTransaction) {
      const signal = typeTransaction == "pay" ? "-" : ""

      value = String(value).replace(/\D/g, "")

      value = Number(value) / 100

      value = value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

      return signal + value;
   }
}

const Form = {
   description: document.querySelector("input#description"),
   amount: document.querySelector("input#amount"),
   date: document.querySelector("input#date"),
   getTypeTransaction() {
      const typeTransaction = document.querySelector("input#pay");
      if (typeTransaction.checked) {
         return typeTransaction;
      }
      else {
         return document.querySelector("#receive");
      }
   },

   getValues() {
      return {
         description: Form.description.value,
         amount: Form.amount.value,
         date: Form.date.value,
         typeTransaction: Form.getTypeTransaction().value,
      }
   },
   validateFields() {
      const { description, amount, date, typeTransaction } = Form.getValues();
      if (description.trim() === "") {
         DOM.messageBox("error", "Defina uma descrição ao item para continuar.");
         throw new Error("Preencha todos os campos.");
      } else if (amount.trim() === "") {
         DOM.messageBox("error", "Defina uma quantidade de dinheiro para continuar.");
         throw new Error("Preencha todos os campos.");
      } else if (date === "") {
         DOM.messageBox("error", "Selecione a data do pagamento/recebimento para continuar.");
         throw new Error("Preencha todos os campos.");
      } else if (typeTransaction == "") {
         DOM.messageBox("error", "Selecione se você está pagando algo/alguém ou recebendo o dinheiro para continuar.");
         throw new Error("Preencha todos os campos.");
      }
   },
   formatValues() {
      let { description, amount, date, typeTransaction } = Form.getValues()

      amount = Utils.formatAmount(amount);

      date = Utils.formatDate(date);

      return { description, amount, date, typeTransaction }
   },
   clearFields() {
      Form.description.value = ""
      Form.amount.value = ""
      Form.date.value = ""
   },
   submit(event) {
      event.preventDefault();
      try {
         Form.validateFields();
         const transaction = Form.formatValues();
         Transaction.add(transaction);
         DOM.messageBox("success", `Item ${transaction.description} adicionado com sucesso.`)
         Form.clearFields();
         Modal.Toogle();
      } catch (error) {

      }
   }
}

const FormEdit = {
   description: document.querySelector("input#description-edit"),
   amount: document.querySelector("input#amount-edit"),
   date: document.querySelector("input#date-edit"),
   getTypeTransaction() {
      const typeTransaction = document.querySelector("input#pay-edit");
      if (typeTransaction.checked) {
         return typeTransaction;
      }
      else {
         return document.querySelector("#receive-edit");
      }
   },
   formatValues() {
      let { description, amount, date, typeTransaction } = FormEdit.getValues()

      amount = Utils.formatAmount(amount);

      date = Utils.formatDate(date);

      return { description, amount, date, typeTransaction }
   },
   getValues() {
      return {
         description: FormEdit.description.value,
         amount: FormEdit.amount.value,
         date: FormEdit.date.value,
         typeTransaction: FormEdit.getTypeTransaction().value,
      }
   },
   validateFields() {
      const { description, amount, date, typeTransaction } = FormEdit.getValues();
      if (description.trim() === "") {
         DOM.messageBox("error", "Defina uma descrição ao item para continuar.");
         throw new Error("Preencha todos os campos.");
      } else if (amount.trim() === "") {
         DOM.messageBox("error", "Defina uma quantidade de dinheiro para continuar.");
         throw new Error("Preencha todos os campos.");
      } else if (date === "") {
         DOM.messageBox("error", "Selecione a data do pagamento/recebimento para continuar.");
         throw new Error("Preencha todos os campos.");
      } else if (typeTransaction == "") {
         DOM.messageBox("error", "Selecione se você está pagando algo/alguém ou recebendo o dinheiro para continuar.");
         throw new Error("Preencha todos os campos.");
      }
   },
   clearFields() {
      FormEdit.description.value = ""
      FormEdit.amount.valque = ""
      FormEdit.date.value = ""
   },
   submit(event) {
      event.preventDefault();
      try {
         FormEdit.validateFields();
         const transaction = FormEdit.formatValues();
         Transaction.addEdit(Utils.index, transaction);
         DOM.messageBox("success", `Item ${transaction.description} editado com sucesso.`);
         FormEdit.clearFields();
         Modal.ToogleEdit();
      }
      catch (error) {
         console.log(error);
      }
   }
}

const App = {
   init() {
      Transaction.all.forEach(DOM.addTransaction);

      DOM.updateBalance();
      Storage.set(Transaction.all);
   },
   reload() {
      DOM.clearTransactions()
      App.init();
   },
}

App.init();