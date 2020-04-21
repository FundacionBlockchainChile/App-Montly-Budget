// BUDGET CONTROLLER ********************************************************************************
const budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function (type) {
    let sum = 0;
    data.allItems[type].forEach(function (element) {
      sum += element.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      let newItem, ID;

      //   Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new Item
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //   Push it into our data structure
      data.allItems[type].push(newItem);
      // console.log(data)

      //   Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      let ids, index

      ids = data.allItems[type].map(function(current) {
        return current.id
      })
      index = ids.indexOf(id)

      if ( index !== -1) {
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function () {
      // Calculate Total incom and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // Calculate the Budget: income - expense
      data.budget = data.totals.inc - data.totals.exp;
      // calculate the percentage of income that
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

// UI CONTROLLER ************************************************************************************
const UIControler = (function () {
  let DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentaeLabel: ".budget__expenses--percentage",
    container: ".container",
  };
  // Some code
  return {
    getinput: function () {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      // Create HTML string with placeholder text
      let html, newHtml, element;

      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace te placholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      // Insert the HTML to the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {

      let element = document.getElementById(selectorID)
      element.parentNode.removeChild(element)
    },

    clearFields: function () {
      // This is one form of clear fields
      // document.querySelector(DOMStrings.inputDescription).value = ''
      // document.querySelector(DOMStrings.inputValue).value = '',
      // document.querySelector(DOMStrings.descriptionType).focus()

      // Jonas form
      let fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMStrings.expensesLabel).textContent =
        obj.totalExp;
      document.querySelector(DOMStrings.percentaeLabel).textContent =
        obj.percentage;
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentaeLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentaeLabel).textContent = "---";
      }
    },

    getDOMStrings: function () {
      return DOMStrings;
    },
  };
})();

// GLOBAL APP CONTROLLER ***************************************************************************
const controller = (function (budgetCtrl, UICtrl) {
  const setupEventListeners = () => {
    const DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", (event) => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  const updateBudget = function () {
    // Calculate the Budget
    budgetCtrl.calculateBudget();
    // return the Budget
    const budget = budgetCtrl.getBudget();
    // Display the budget on the UI
    UIControler.displayBudget(budget);
  };

  const ctrlAddItem = () => {
    let input, newItem;
    // Get the field input data
    input = UICtrl.getinput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // Add the item to controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      console.log(newItem);
      // Add item to UI
      UIControler.addListItem(newItem, input.type);
      UIControler.clearFields();
      // Calculate & Update Budget
      updateBudget();
    }
  };

  const ctrlDeleteItem = function (event) {
    let itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    // console.log(itemID);
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete item from data structure
      budgetCtrl.deleteItem(type, ID)
      // delete item from the UI
      UICtrl.deleteListItem(itemID)
      // Update the new budget
      updateBudget();

    }
  };

  return {
    init: function () {
      UIControler.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0,
      });
      setupEventListeners();
      console.log("Aplication has started");
    },
  };

  // Selectors

  // Functions
})(budgetController, UIControler);

controller.init();
