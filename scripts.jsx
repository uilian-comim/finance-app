let Modal = {
   Toogle() {
      const modalOverlay = document.querySelector(".modal-overlay");

      if (modalOverlay.classList.contains("active")) {
         modalOverlay.classList.remove("active");
      }
      else {
         modalOverlay.classList.add("active");
      }
   }
}

const Storage = {
   get() {
      return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
   },
   set(transactions) {
      localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
   }
}

const Transaction = {
   all: Storage.get(),

   add(transaction) {
      Transaction.all.push(transaction)
      App.reload();
   },

   remove(index) {
      Transaction.all.splice(index, 1);

      App.reload();
   },

   incomes() {
      let income = 0;

      Transaction.all.forEach((transactions) => {
         if (transactions.amount > 0) {
            income += transactions.amount;
         }
      })

      return income
   },
   expenses() {
      let expense = 0;

      Transaction.all.forEach((transactions) => {
         if (transactions.amount < 0) {
            expense += transactions.amount;
         }
      })

      return expense
   },
   total() {
      return Transaction.incomes() + Transaction.expenses();
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
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
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
      setTimeout(() => { messageError.classList.remove(`${type}`); imgMessage.setAttribute("src", ""); progressBar.classList.remove(`${type}`); messageH3.innerHTML = ""}, 10000)
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
   formatDate(date) {
      const splittedDate = date.split("-")
      return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
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
      }else if (amount.trim() === "") {
         DOM.messageBox("error", "Defina uma quantidade de dinheiro para continuar.");
         throw new Error("Preencha todos os campos.");
      }else if (date === "") {
         DOM.messageBox("error", "Selecione a data do pagamento/recebimento para continuar.");
         throw new Error("Preencha todos os campos.");
      }else if (typeTransaction == "") {
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
         DOM.messageBox("success",  `Item ${transaction.description} adicionado com sucesso.`)
         Form.clearFields();
         Modal.Toogle();
      } catch (error) {

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