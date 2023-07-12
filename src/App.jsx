import React from 'react';
import { useState, useEffect } from 'react';
import {formatPrice} from './utils.js';
import './App.css';

function App() {
    const [access, setAccess] = useState(0);
    const [inv, setInv] = useState([]);
    const [quants, setQuants] = useState([]);
    const [master, setMaster] = useState({});
    const [cats, setCats] = useState([]);
    const [stockCount, setStockCount] = useState(null);

    useEffect(() => {
        async function init() {
            await initializeStoreInventory(null);
            initializeDrop();
            setAccess(1);
            populateStoreSelect();
            document.addEventListener("wheel", function(event) {
                if (document.activeElement.type === "number") {
                    document.activeElement.blur();
                }
            });
        }
        init();
    }, []);

    useEffect(() => {
        syncInventoryCounts();
    }, [inv, quants])

    useEffect(() => {
        populateInventoryTable();
    }, [inv, quants, master])

    useEffect(() => {
        populateCategories();
    }, [cats])

    const initializeStoreInventory = async (store) => {
        let stock = await fetchStock(store);
        let stockCounts = await fetchInventoryCounts(store);
        let c = await getCategories(store);
        setInv(stock);
        setQuants(stockCounts);
        setCats(c);
    }

    const fetchStock = async (store) => {
        let data = await fetch("https://wn3wi3unbslxd4mjapbvk5reba0rerbo.lambda-url.us-east-2.on.aws", {
            method: 'post',
            body: JSON.stringify({fnkey: localStorage.getItem('fnkey')})
        });
        return data.json();
    }

    const uploadStock = (stockArray) => {
        for (const id in stockArray) {
            let elem = document.getElementById("stockNumber" + id);
            let elem2 = document.getElementById("comment" + id);
            if (elem == null || elem2 == null) {
                continue;
            }
            elem.value = stockArray[id][1];
            elem2.value = stockArray[id][5];
            addStockListener(id, elem.value);
            addCommentListener(id, elem2.value);
        }
    }

    const fetchInventoryCounts = async (store) => {
        let data = await fetch("https://jhclcj3li2pg6b6uek4nczlnwm0zodsk.lambda-url.us-east-2.on.aws", {
            method: 'post',
            body: JSON.stringify({fnkey: localStorage.getItem('fnkey')})
        });
        return data.json();
    }
    
    const emptyDropdown = (elem) => {
        var i, L = elem.options.length - 1;
        for (i = L; i >= 0; i--) {
            elem.remove(i);
        }
    }

    const populateCategories = () => {
        if (!cats.elements) { return; }
        let select = document.getElementById("categories");
        emptyDropdown(select);
        cats.elements.forEach(function(category) {
          var option = document.createElement("option");
          option.value = category.id;
          option.text = category.name;
          select.appendChild(option);
        });
    }

    const populateStoreSelect = () => {
        let select = document.getElementById("storesSelectApp");
        let option = document.createElement("option");
        option.value = 0;
        option.text = '384 Somerville Ave';
        select.appendChild(option);
    }

    const getCategories = async (store) => {
        let categories = await fetch("https://2uoloirhyg4lujtdvqexfz6aum0bkoai.lambda-url.us-east-2.on.aws", {
            method: 'post',
            body: JSON.stringify({
            fnkey: localStorage.getItem('fnkey'),
            type: 0
            })
        });
        return categories.json();
    }

    const initializeDrop = () => {
        var all = document.getElementById("all");
        let that = this;
        all.addEventListener('dragover', function(e) {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        });
        all.addEventListener('drop', function(e) {
          e.stopPropagation();
          e.preventDefault();
          var files = e.dataTransfer.files; // Array of all files
          for (var i=0, file; file=files[i]; i++) {
              if (file.type.match(/text.*/)) {
                  var reader = new FileReader();
                  reader.onload = function(e2) {
                      // finished reading file data.
                      uploadStock(JSON.parse(e2.target.result));
                  }
                  reader.readAsText(file); // start reading the file data.
              }
          }
    })}

    const sortInventory = (inventory) => {
        var prerolls = [];
        var indoor = [];
        var outdoor = [];
        var carts = [];
        var wax = [];
        var edibles = [];
        var tincs = [];
        var leftovers = [];
        if (!inv) {
            return;
        }
        for (var i=0; i<inventory.length; i++) {
          let check = inventory[i].tags.elements;
          if (check.length == 0) {
            leftovers.push(inventory[i]);
            continue;
          }
          if (check[0].name === "Prerolls") {
            prerolls.push(inventory[i]);
            continue;
          }
          if (check[0].name === "Indoor Flower") {
            indoor.push(inventory[i]);
            indoor = splitTimes(indoor);
            continue;
          }
          if (check[0].name === "Cartridges") {
            carts.push(inventory[i]);
            carts = splitTimes(carts);
            continue;
          }
          if (check[0].name === "Wax") {
            wax.push(inventory[i]);
            continue;
          }
          if (check[0].name === "Tinctures") {
            tincs.push(inventory[i]);
            tincs = splitTimes(tincs);
            continue;
          }
          if (check[0].name === "Edibles") {
            edibles.push(inventory[i]);
            edibles = splitTimes(edibles);
            continue;
          }
          if (check[0].name === "Outdoor Flower") {
            outdoor.push(inventory[i]);
            outdoor = splitTimes(outdoor);
            continue;
          }
        };
        leftovers = outdoor.concat(leftovers);
        leftovers = edibles.concat(leftovers);
        leftovers = tincs.concat(leftovers);
        leftovers = wax.concat(leftovers);
        leftovers = carts.concat(leftovers);
        leftovers = indoor.concat(leftovers);
        leftovers = prerolls.concat(leftovers);
        inventory = {elements: leftovers};
        return inventory;
      }
    
      const syncInventoryCounts = () => {
        if (!inv.elements || !quants.elements) {
            return;
        }
        var inventory = {};
        const quantities = quants.elements;
        const inv2 = inv.elements;
        for (var i=0; i<quantities.length; i++) {
          inventory[quantities[i].item.id] = ['', quantities[i].stockCount, null];
        }
        for (var i=0; i<inv2.length; i++)  { // reason for this is inventory contains prices while quantities contains correct stock counts
          if (inventory[inv2[i].id]) {
            inventory[inv2[i].id][0] = inv2[i].name;
            inventory[inv2[i].id][2] = formatPrice(inv2[i].price);
          }
        }
        setMaster(inventory);
    }

   const splitTimes = (items) => {
        var sorted = [];
        var hours = [];
        var halfdays = [];
        var days = [];
        var weeks = [];
        var months = [];
        for (var i=0; i<items.length; i++) {
          let check = items[i].name.substr(-7);
          if (check.includes("Hour")) {
            hours.push(items[i]);
            continue;
          }
          if (check.includes("1\\2 Day")) {
            halfdays.push(items[i]);
            continue;
          }
          if (check.includes("Day")) {
            days.push(items[i]);
            continue;
          }
          if (check.includes("Week")) {
            weeks.push(items[i]);
            continue;
          }
          if (check.includes("Month")) {
            months.push(items[i]);
            continue;
          }
          sorted.push(items[i]);
        };
        sorted = months.concat(sorted);
        sorted = weeks.concat(sorted);
        sorted = days.concat(sorted);
        sorted = halfdays.concat(sorted);
        sorted = hours.concat(sorted);
        return sorted;
    }

    const fetchCategory = async (category, store) => {
        let data = await fetch("https://2uoloirhyg4lujtdvqexfz6aum0bkoai.lambda-url.us-east-2.on.aws", {
          method: 'post',
          body: JSON.stringify({
            fnkey: localStorage.getItem('fnkey'),
            category: category,
            type: 1
          })
        });
        return data.json();
      }

    const updateCategory = async () => {
        let select = document.getElementById("categories");
        let items = await fetchCategory(select.value, null);
        setInv(items);
        syncInventoryCounts();
        populateInventoryTable();
        
        //this.getLowStock();
    }

    const populateInventoryTable = () => {
        if (!inv.elements || !quants.elements || !Object.keys(master).length) {
            return;
        }

        clearTable();
        let stockCount = {};
        var table = document.getElementById("inventoryTable").getElementsByTagName('tbody')[0];
        let inventory = inv.elements;
        inventory = sortInventory(inventory).elements;

        const inflateRow = () => {
            var row = table.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            cell1.className = 'name';
            cell2.className = 'stock';
            cell3.className = 'inventory';
            const countData = master[inventory[i].id];
            let count = cell3.innerHTML = countData ? countData[1] : -1
        
            cell4.id = inventory[i].id;
            cell4.className = 'offcount';
            cell6.className = "comment";
            cell1.innerHTML = inventory[i].name; // NOTE: THIS ASSUMES SORT ORDER WILL ALWAYS BE THE SAME across 2 diff api calls - something to keep in mind
            cell2.innerHTML = "<input type='number' class='stockInput' id='stockNumber" + inventory[i].id + "'></input>";
            cell2.children[0].onchange = function() {
                addStockListener(cell4.id, this.value);
            }
            cell6.innerHTML = "<input type='text' class='commentInput' id='comment" + inventory[i].id + "'></input>";
            cell6.children[0].onchange = function() {
                addCommentListener(cell4.id, this.value); 
            }
            stockCount = {...stockCount, [inventory[i].id]: [inventory[i].name, '', count, '', '', '']}
        }

        for (var i=0; i<inventory.length; i++) {
            inflateRow();
        };
        setStockCount(stockCount);
    }

    const clearTable = () => {
        let old_tbody = document.getElementById("stockTable");
        old_tbody.innerHTML = '';
    }

    const selectStore = () => {
        let select = document.getElementById("storesSelectApp");
        // this.initializeStoreInventory(select.value);
        // this.setState({selectedStore: select.value})
    }

    const addStockListener = (id, stock) => {
        let elem = document.getElementById(id);
        let inventory = master[id];
        if (!inventory) {return;}
        var lossElem = elem.parentNode.children[4];
        let stockCount = {...stockCount};
        let s = stockCount[id];
        s[0] = inventory[0];
        s[1] = stock;
        s[2] = inventory[1];
        s[3] = s[1] - s[2]; // s[1] is string, s[2] is int
    
        if ((stock - inventory[1] !== 0) && stock.length !== 0) {
            elem.innerHTML = stock - inventory[1];
            const loss = (stock - inventory[1]) * inventory[2];
            lossElem.innerHTML = loss.toFixed(2);
            s[4] = loss;
        }
        else {
            elem.innerHTML = '';
            lossElem.innerHTML = '';
            s[4] = '';
        }
        stockCount[id] = s;
        setStockCount(stockCount);
    }

    const addCommentListener = (id, comment) => {
        let stockCount = {...this.state.stockCount};
        let s = [...stockCount[id]];
        s[5] = comment;
        stockCount[id] = s;
        setStockCount(stockCount);
    }

    const saveStock = () => {
        let a = document.createElement("a");
        let file = new Blob([JSON.stringify(stockCount, null, " ")], {type: 'text/plain'});
        a.href = URL.createObjectURL(file);
        let d = new Date();
        a.download = d.getTime();
        a.click();
    }

    return (
        <div className="App" id="all">
          <div className="table">
            <div className="selectBar">
              <p>Select category</p>
              <select name="categories" id="categories" onChange={updateCategory}>
              </select>
              <div className="masterStoreSelect">
                  <p>Select store</p>
                  <select name="storesSelectApp" id="storesSelectApp" onChange={selectStore}>
                  </select>
              </div>
              <button className="save" onClick={saveStock}>Save counts</button>
            </div>        
            <table className="inventoryTable" id="inventoryTable">
                <thead>
                  <tr className="Top">
                    <th>Name</th>
                    <th>Stock</th>
                    <th>Inventory</th>
                    <th>Offcount</th>
                    <th className='loss'>Loss</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody id="stockTable">    
                </tbody>
            </table>
          </div>
        </div>
      );
}
export default App;
