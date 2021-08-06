const Modal = {
    toggle(){
        document.querySelector('.modal-overlay').classList.toggle('active')
    }
    /*Existe a possibilidade de fazer o processo acima com apenas uma função chamada toggle! (já fiz, segue abaixo o jeito antigo:)
  open(){
        //abrir modal e adicionar a class active ao modal
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close(){
        //fechar o modal e remover a classe active do modal
        document.querySelector('.modal-overlay').classList.remove('active')
    },
*/
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] //JSON.parse: transforma de volta em array 
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) //JSON.stringify: transforma o array em string para q o localstorage consiga receber
    },
}

const Transaction = {
    all: Storage.get(),
    
    // passo 3 : salvar dados
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0){
                income += transaction.amount
            }
        })
        return income
    },

    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0){
                expense += transaction.amount
            }
        })
        return expense
    },

    total() {
        return Transaction.incomes()+Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Sinal de menos, remover transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }

}

const Utils = {
    //os valores enviados pelo formulário sao strings, então o amount precisa virar um numero e virar real XXX CORREÇÃO: O input type:number já retorna um número, não uma string, não precisa fazer a conversão para número, apenas um truquezinho para não das bug com valores só de centavos.
    formatAmount(value) {

        value = value * 100
        return Math.round(values) //arredonda o valor e não buga centavos
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "") //O '\D' na expessão regular selecina tudo que não for numero, e nesse caso, substitui por nada. Isso foi feito para tirar o sinal de -
        value = Number(value)/100
        value = value.toLocaleString("pt-BR", {style: "currency", currency: "BRL"})
        //Essa estratégio de trataento de dados é muito importante e facilita a conversão dos números
        
        return signal+value
    }
}

const Form = {

    description:document.querySelector('input#description'),
    amount:document.querySelector('input#amount'),
    date:document.querySelector('input#date'), //essas linhas de código estão puxando os inputs, abaixo, o cógido vai puxar os valores

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    // passo: 1: verificar se tudo foi preenchido
    validateFields() {
        const {description,amount, date} = Form.getValues() //seria o mesmo que fazer: const description = Form.getValues().description" e repetir isso para amount e para date

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

     //passo 2: formatar dados
    formatValues() {
        let {description,amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }

    },

    // passo 4: limpar formulário
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
         //faz com q o submit n assuma o comportamento pradrão de enviar para o outa página, e o que eu quero que aconteça será determinado abaixo, por meio de código 

         try {
        // passo: 1: verificar se tudo foi preenchido
        Form.validateFields()

        // passo 2: formatar dados
        const transaction = Form.formatValues()

        // passo 3: salvar dados e atualizar aplicação
        Transaction.add(transaction)

        // passo 4: limpar formulário
        Form.clearFields()

        // passo 5: fechar o modal
        Modal.toggle()


         } catch (error) {
            alert(error.message)
         }
    }
}

const App = {
    /*for (let i = 0; i < transactions.length; i++){
    DOM.addTransaction(transactions[i])
    }
    Uma forma resumida de fazer o for acima é usar a funcionalidade 'forEach', que faz o for de um array qualquer */
    init(){
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()






