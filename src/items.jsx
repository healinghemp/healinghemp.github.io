import React from 'react';
import {Component} from 'react';
import {formatPrice} from './utils.js';
import {formatDate} from './utils.js';
import NewItemOverlay from './newItemOverlay.jsx';
import './items.css';

class Items extends Component {

	state = {
		inventory: null,
		quantities: null,
		master: null,
		orders: null,
		selectedItemOrders: null,
		stores: [],
		selectedStore: 0,
		selectedOrder: 0,
		okDelete: false
	}

	/*
	TODO: 
		- add stock modifier on item page
		- add rename item on item page
		- add Create new item button (item name, price, count, category)
	*/

	async componentDidMount() {
		await this.initializeStoreInventory(this.state.selectedStore);
	   	let stores = await this.fetchStores();
      	this.setState({stores: stores});
      	this.populateStoreSelect();
      	const box = document.getElementById("itemSearchBox");
      	this.onclick = function(e) {
			this.closeAllLists(e.target, box);
		}
		document.addEventListener("click", this.onclick.bind(this));
	}

	async initializeStoreInventory(store) {
		const box = document.getElementById("itemSearchBox");
		var now = new Date();
		var before = new Date(now.getTime());
		before.setDate(before.getDate() - 31)
		before.setHours(0, 0, 0, 0);
	    let stock = await this.fetchStock(store);
	    let stockCounts = await this.fetchInventoryCounts(store);
	    let orders = await this.fetchOrders(before, now);
	    this.setState({inventory: stock.elements});
	    this.setState({quantities: stockCounts.elements});
	    this.setState({orders: orders.elements});
	    this.syncInventoryCounts();
	    this.autocomplete(box, this.state.inventory);
	}

	itemOverlayOn() {
		document.getElementById("addItemOverlay").style.display = "block";
	}

	itemOverlayOff() {
		const totalOverlay = document.getElementById("addItemOverlay");
		totalOverlay.addEventListener("click", function(event) {
			if (event.target === this) {
				totalOverlay.style.display = "none";
			}
		});
	}

	syncInventoryCounts() {
	    var inventory = {};
	    const quantities = this.state.quantities;
	    const inv = this.state.inventory;
	    for (var i=0; i<quantities.length; i++) {
	      inventory[quantities[i].item.id] = ['', quantities[i].stockCount, null];
	    }
	    for (var i=0; i<inv.length; i++)  { // reason for this is inventory contains prices while quantities contains correct stock counts
	      if (inventory[inv[i].id]) {
	        inventory[inv[i].id][0] = inv[i].name;
	        inventory[inv[i].id][2] = formatPrice(inv[i].price);
	      }
	    }
	    this.setState({master: inventory});
	}

	async fetchStores() {
		let stores = await fetch("/api/getStoreNames");
	    return stores.json();
	}

	async fetchStock(store) {
	    let data = await fetch("/api/stock", {
	    	method: 'post',
		    headers: {'Content-Type': 'application/json'},
		    body: JSON.stringify({
		    	store: store
		    })
	    });
	    return data.json();
	}

	async fetchInventoryCounts(store) {
    let data = await fetch("/api/stockCounts", {
    	method: 'post',
      	headers: {'Content-Type': 'application/json'},
      	body: JSON.stringify({
        	store: store
      	})
    });
    return data.json();
  }

  	async updateItemCategory(store, item, catId) {
	    let update = await fetch('/api/addItemToCat', {
	    	method: 'post',
	      	headers: {'Content-Type': 'application/json'},
	      	body: JSON.stringify({
	        	store: store,
	        	itemId: item,
	        	catId: catId
	      	})
	    });
	    return update.json();
 	}

	// So Clover is really dumb and doesn't seem to let you add category or quantity in the same call. 
	// so first create, then update the quantity, then update the category....
	async createNewItem() {
		let init = await fetch("/api/createItem", {
      		method: 'post',
      		headers: {'Content-Type': 'application/json'},
      			body: JSON.stringify({
        		store: this.state.selectedStore,
        		itemName: "Strawberry Tang Cookies Hour",
        		price: 999 // in cents
      		})
    	});
    	let item = await init.json();
    	this.updateStock(this.state.selectedStore, item.id, 50);
    	this.updateItemCategory(this.state.selectedStore, item.id, '0D7E48VKRWZ14');

	}

	async updateStock(store, item, count) {
	    let update = await fetch('/api/updateItemStock', {
	    	method: 'post',
	      	headers: {'Content-Type': 'application/json'},
	      	body: JSON.stringify({
	        	store: store,
	        	itemId: item,
	        	count: count
	      	})
	    });
 	}

 	async renameItem(store, item, newName) {
 		let update = await fetch('/api/renameItem', {
 			method: 'post',
 			headers: {'Content-Type': 'application/json'},
 			body: JSON.stringify({
 				store: store,
 				itemId: item,
 				newName: newName
 			})
 		});
 		return update.json();
 	}

 	async updateItemCat(store, item, catId) {
		let update = await fetch('/api/addItemToCat', {
 			method: 'post',
 			headers: {'Content-Type': 'application/json'},
 			body: JSON.stringify({
 				store: store,
 				itemId: item,
 				catId: catId
 			})
 		});
 		return update.json();
	}

 	async tagItem(store, item, tag) {
		let update = await fetch('/api/addItemTag', {
 			method: 'post',
 			headers: {'Content-Type': 'application/json'},
 			body: JSON.stringify({
 				store: store,
 				itemId: item,
 				tagId: tag
 			})
 		});
 		return update.json();
	}

 	async deleteItem(store, item) {
 		if (!this.state.okDelete) {
 			let btn = document.getElementById("deleteItemButton");
 			btn.innerHTML = "Click again if sure";
 			this.setState({okDelete: true}); // have to hit delete twice
 			return;
 		}
 		let update = await fetch('/api/deleteItem', {
 			method: 'post',
 			headers: {'Content-Type': 'application/json'},
 			body: JSON.stringify({
 				store: store,
 				itemId: item
 			})
 		});
 		this.setState({okDelete: false});
 		return update.json();
 	}

	selectStore() {
	    let select = document.getElementById("storesSelectApp");
	   	this.setState({selectedStore: select.value})
	    this.initializeStoreInventory(select.value);
	}

	async populateStoreSelect() {
	    let select = document.getElementById("storesSelectApp");
	    for (var i=0; i<this.state.stores.length; ++i) {
	      var option = document.createElement("option");
	      option.value = i;
	      option.text = this.state.stores[i].storename;
	      select.appendChild(option);
	    }
	 }

	 async fetchOrders(start, end) {
		let employees = await fetch('/api/getAllOrders', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				store: this.state.selectedStore,
				startTime: start ? start.getTime() : null,
				endTime: start ? end.getTime() : null
			})
		});
		return employees.json();
	}

	createP(t) {
		var p = document.createElement("p");
		var text = document.createTextNode(t);
		p.appendChild(text);
		return p;
	}

	showOrders() {
		let elem = document.getElementById("allOrder");
		elem.innerHTML = "";
		let o = this.state.selectedItemOrders;
		var total = 0;
		let that = this;
		for (var i=0; i<o.length; i++) {
			(function () {
				if (o[i].manualTransaction) {
					return;
				}
				var j = i;
				total += o[i].total;
				var order = document.createElement("DIV");
				order.id = "employeeOrder";
				order.appendChild(that.createP("Order " + o[i].id));
				order.appendChild(that.createP("$" + formatPrice(o[i].total)));
				order.appendChild(that.createP(formatDate(o[i].clientCreatedTime)));
				order.addEventListener("click", function() {
					that.setState({selectedOrder: o[j]});
					that.fillOrderDetails();
				});
				elem.appendChild(order);
			}());
		}
		this.setState({total: formatPrice(total)});
	}

	fillOrderDetails() {
		let elem = document.getElementById("orderDetails");
		let w = document.getElementById("itemOrderDetailsWindow");
		w.style.visibility = "visible";
		elem.innerHTML = "";
		let order = this.state.selectedOrder;
		let items = order.lineItems;
		let discounts = order.discounts;
		let payments = order.payments;
		var total = 0;
		if (items) {
			for (var i=0; i<items.elements.length; i++) {
				let textDiv = document.createElement("DIV");
				textDiv.id = "itemSummary";
				let name = document.createElement("p");
				let price = document.createElement("p");
				name.id = "nameP";
				price.id = "priceP";
				name.innerHTML = items.elements[i].name;
				price.innerHTML = "$" + formatPrice(items.elements[i].price);
				total += items.elements[i].price;
				textDiv.appendChild(name);
				textDiv.appendChild(price);
				elem.appendChild(textDiv);
			}
		}
		if (discounts) {
			for (var i=0; i<discounts.elements.length; i++) {
				let textDiv = document.createElement("DIV");
				textDiv.id = "itemSummary";
				let name = document.createElement("p");
				let price = document.createElement("p");
				name.id = "nameP";
				price.id = "discountP";
				name.innerHTML = discounts.elements[i].name;
				if (discounts.elements[i].amount) {
					price.innerHTML = "-$" + formatPrice(Math.abs(discounts.elements[i].amount));
				}
				if (discounts.elements[i].percentage) {
					const perc = discounts.elements[i].percentage;
					price.innerHTML = "- $" + formatPrice(total * (perc / 100));
				} 
				textDiv.appendChild(name);
				textDiv.appendChild(price);
				elem.appendChild(textDiv);
			}
		}
		if (payments) {
			let textDiv = document.createElement("DIV");
			textDiv.id = "itemSummary";
			let name = document.createElement("p");
			let price = document.createElement("p");
			name.id = "nameP";
			price.id = "taxP";
			name.innerHTML = "Tax";
			price.innerHTML = "$" + formatPrice(payments.elements[0].taxAmount);
			textDiv.appendChild(name);
			textDiv.appendChild(price);
			elem.appendChild(textDiv);
		}
	}

	removeActive(x) {
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove("autocomplete-active");
		}
	}

	addActive(x, currentFocus) {
		if (!x) return false;
		this.removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (x.length - 1);
		x[currentFocus].classList.add("autocomplete-active");
	}

	closeAllLists(elem, inp) {
		var x = document.getElementsByClassName("autocomplete-list");
		for (var i = 0; i < x.length; i++) {
			if (elem !== x[i] && elem !== inp) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}

	appendItems(listElement, input, c) {
		const box = document.getElementById("itemSearchBox");
		for (var i = 0; i < c.length; i++) {
	        if (c[i].name.substr(0, input.length).toUpperCase() === input.toUpperCase()) {
	        	var b = document.createElement("DIV");
	        	b.setAttribute("class", "autocomplete-items");
		        b.innerHTML = c[i].name;
		        b.innerHTML += "<input type='hidden' value='" + c[i].id + "' name='" + c[i].name + "'>";
	         	let that = this;
	         	b.addEventListener("click", function(e) {
	         		var orders = [];
	         		let v = this.getElementsByTagName("input")[0].value; // item id
	         		let n = this.getElementsByTagName("input")[0].name; // item name
	         		let allOrders = that.state.orders;
	         		for (var j=0; j<allOrders.length; j++) {
	         			if (!allOrders[j].lineItems) {continue;}
	         			let l = allOrders[j].lineItems.elements.length;
	         			let currentItem = '';
	         			for (var k=0; k<l; k++) {
	         				if (!allOrders[j].lineItems.elements[k].item) {continue;}
	         				if (allOrders[j].lineItems.elements[k].item.id == v && currentItem != v) {
	         					orders.push(allOrders[j]);
	         					currentItem = v;
	         				}
	         			}
	         		}
	         		that.setState({selectedItemOrders: orders});
	         		that.showOrders();
	         		let elem = document.getElementById("itemId");
	         		let count = null;
	         		if (that.state.master[v]) {
	         			count = that.state.master[v][1];
	         		}
	         		elem.innerHTML = "<div class='itemHeader'><p>" + v + "</p><h3>" + n + " (" + count + ")" + 
	         			"</h3><input type='number' id='updateInput'></input>" + 
	         			"<button id='updateItemButton'>Update stock count</button>" +
	         			"<input type='text' id='renameInput'></input><button id='renameItemButton'>Rename</button>" + 
	         			"<input type='text' id='tagInput'></input><button id='tagItemButton'>Add tag</button>" +
	         			"<input type='text' id='catInput'></input><button id='catItemButton'>Add category</button>" +
	         			"<button id='deleteItemButton'>Delete</button></div><hr></hr>";
	         		that.bindUpdate(that.state.selectedStore, v);
	         		that.bindRename(that.state.selectedStore, v);
	         		that.bindTagUpdate(that.state.selectedStore, v);
	         		that.bindCatUpdate(that.state.selectedStore, v);
	         		that.bindDelete(that.state.selectedStore, v);
		            that.closeAllLists('', box);
		            box.value = '';
		        });
		        listElement.appendChild(b);
		    }
		}
	}

	bindUpdate(s, i) {
		let btn = document.getElementById("updateItemButton");
		let c = document.getElementById("updateInput");
		let that = this;
		btn.onclick = function() {
			that.updateStock(s, i, c.value);
		}
	}

	bindRename(s, i) {
		let btn = document.getElementById("renameItemButton");
		let c = document.getElementById("renameInput");
		let that = this;
		btn.onclick = function() {
			that.renameItem(s, i, c.value);
		}
	}

	// for future, add dropdown of Tag names...for right now requires input of actual Tag ID
	bindTagUpdate(s, i) {
		let btn = document.getElementById("tagItemButton");
		let c = document.getElementById("tagInput");
		let that = this;
		btn.onclick = function() {
			that.tagItem(s, i, c.value);
		}
	}

	bindCatUpdate(s, i) {
		let btn = document.getElementById("catItemButton");
		let c = document.getElementById("catInput");
		let that = this;
		btn.onclick = function() {
			that.updateItemCat(s, i, c.value);
		}
	}

	bindDelete(s, i) {
		let btn = document.getElementById("deleteItemButton");
		let that = this;
		btn.onclick = function() {
			that.deleteItem(s, i);
		}
	}

	autocomplete(inp, items) {
	    let that = this;
	    inp.addEventListener("keyup", function(e) {
	    	var val = this.value;
	    	that.closeAllLists('', inp);
	    	if (!val) { return false;}
	        var a = document.createElement("DIV");
	        a.setAttribute("class", "autocomplete-list");
	        this.parentNode.appendChild(a);
	        that.appendItems(a, val, items);
	        // if (a.children.length > 0) {
	        // 	var dropdown = document.getElementById("selectedNames2");
	        // 	dropdown.style.visibility = "hidden";
	        // }
	    });
	}

	render() {
		return (
			<div id="items">
				<div className="newItemOverlay" id="addItemOverlay" onClick={this.itemOverlayOff}>
			  		<div className="itemOverlayBackground" id="itemOverlayBackground">
			  			<NewItemOverlay updateStock={this.updateStock.bind(this)} updateCategory={this.updateItemCategory.bind(this)}>
			  			</NewItemOverlay>
			  		</div>
			  	</div>
				<div id="itemDropDown" className="itemDropDown">
					<div className="masterStoreSelect">
			            <p>Select store</p>
			            <select name="storesSelectApp" id="storesSelectApp" onChange={this.selectStore.bind(this)}>
			            </select>
			            <button id="newItemButton" onClick={this.itemOverlayOn.bind(this)}>New Item</button>
			        </div>
				</div>
				<div className="search">
					<input id="itemSearchBox" type="search" placeholder="Item"></input>
				</div>
				<div id="itemId">
				</div>
				<div className="allItemSales">
					<div className="salesWindow">
						<div id="allOrder">
						</div>
					</div>
					<div id="itemOrderDetailsWindow">
						<div className="orderHeader">
							<h3>Order {this.state.selectedOrder.id}</h3>
							<p>{formatDate(this.state.selectedOrder.clientCreatedTime)}</p>
						</div>
						<div id="orderDetails">
						</div>
						<hr></hr>
						<h5 className="orderTotal">Total: ${formatPrice(this.state.selectedOrder.total)}</h5>
					</div>
				</div>
			</div>
		)
	}
}

export default Items;