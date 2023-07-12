import {Component} from 'react';
import React from 'react'
import './newItemOverlay.css';

class NewItemOverlay extends Component {

	state = {
		stores: [],
		selectedStore: 0
	}

	async componentDidMount() {
		let stores = await this.fetchStores();
		this.setState({stores: stores});
		this.populateStoreSelect();
	}

	async createItem(event) {
		const f = document.getElementById("newItemForm");
		event.preventDefault();
		const form = new FormData(event.target);
		let data = await fetch('/api/createItem', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				itemName: form.get('name'),
				price: form.get('price'),
				store: this.state.selectedStore
			})
		});
		let res = await data.json();
		this.props.updateStock(this.state.selectedStore, res.id, form.get('quantity'));
		f.submit();
		return false;
	}

	async fetchStores() {
		let stores = await fetch("/api/getStoreNames");
		return stores.json();
	}

	async populateStoreSelect() {
		let select = document.getElementById("stores");
		for (var i=0; i<this.state.stores.length; ++i) {
			var option = document.createElement("option");
			option.value = i;
			option.text = this.state.stores[i].storename;
			select.appendChild(option);
		}
	}

	selectStore() {
		let select = document.getElementById("stores");
		this.setState({selectedStore: select.value})
	}

	render() {
		return (
			<div className="userWindow">
				<div className="newUserBar">
					<h2>New Item</h2>
				</div>
				<div className="inputs">
					<form id="newItemForm" className="newItemForm" action="/api/testCreateItem" autoComplete="off"
					onSubmit={this.createItem.bind(this)} method="post">
						<div className="inputField">
							<h4>Name</h4>
							<input className="newNameField" type="text" name="name" required>
							</input>
						</div>
						<div className="inputField">
							<h4>Price</h4>
							<input className="newPriceField" type="number" name="price" required>
							</input>
						</div>
						<div className="inputField">
							<h4>Quantity</h4>
							<input className="newQuantField" type="number" name="quantity" required></input>
						</div>
						<div className="inputField">
							<h4>Store</h4>
							<select name="stores" id="stores" onChange={this.selectStore.bind(this)}>
							</select>
						</div>
						<input type="image" src="../images/check.png" alt="check" height="30" width="30" title="Create item">
						</input>
					</form>
				</div>
			</div>
		);
	}
}

export default NewItemOverlay;