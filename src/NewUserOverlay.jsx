import {Component} from 'react';
import React from 'react'
import './newUserOverlay.css';

class NewUserOverlay extends Component {

	state = {
		stores: [],
		selectedStore: 0
	}

	async componentDidMount() {
		let stores = await this.fetchStores();
		this.setState({stores: stores});
		this.populateStoreSelect();
	}

	async createUser(event) {
		const user = new FormData(event.target);
		fetch('/api/createUser', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				name: user.get('name'),
				username: user.get('username'),
				password: user.get('pw'),
				store: this.state.selectedStore
				//userId: localStorage.getItem('userId')
			})
		});
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
					<h2>New User</h2>
				</div>
				<div className="inputs">
					<form id="newUserForm" className="newUserForm" action="/api/testCreateUser" autoComplete="off"
					onSubmit={this.createUser.bind(this)} method="post">
						<div className="inputField">
							<h4>Name</h4>
							<input className="newNameField" type="text" name="name" pattern="[A-Za-z]*" required>
							</input>
						</div>
						<div className="inputField">
							<h4>Username</h4>
							<input className="newUsernameField" type="text" name="username" pattern="[A-Za-z]*" required>
							</input>
						</div>
						<div className="inputField">
							<h4>Password</h4>
							<input className="newPWField" type="password" name="pw" required></input>
						</div>
						<div className="inputField">
							<h4>Store</h4>
							<select name="stores" id="stores" onChange={this.selectStore.bind(this)}>
							</select>
						</div>
						<input type="image" src="../images/check.png" alt="check" height="30" width="30" title="Save user">
						</input>
					</form>
				</div>
			</div>
		);
	}
}

export default NewUserOverlay;