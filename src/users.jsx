import React from 'react';
import {Component} from 'react';
import './users.css';
import NewUserOverlay from './NewUserOverlay.jsx';

class Users extends Component {

	state = {
		users: null,
		storeNames: null
	}

	async componentDidMount() {
		let users = await this.fetchUsers();
		this.setState({users: users});
		this.populateUsersTable();
	}

	userOverlayOn() {
		document.getElementById("addUserOverlay").style.display = "block";
	}

	userOverlayOff() {
		const totalOverlay = document.getElementById("addUserOverlay");
		totalOverlay.addEventListener("click", function(event) {
			if (event.target === this) {
				totalOverlay.style.display = "none";
			}
		});
	}

	async fetchUsers() {
		var users = await fetch("/api/getUsers");
		var stores = await fetch("/api/getStoreNames");
		stores = await stores.json();
		users = await users.json();
		for (var i=0; i<users.length; i++) {
			users[i].store = stores[users[i].store].storename;
		}
		return users;
	}

	async newUser() {
		let form = document.getElementById("newUser");
		let create = await fetch("/api/createUser", {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: null
		});
	}

	populateUsersTable() {
		var table = document.getElementById("usersTable").getElementsByTagName('tbody')[0];
	    const users = this.state.users;
	    for (var i=0; i<users.length; i++) {
	      let that = this;
	      (function() {
	        var row = table.insertRow(-1);
	        var cell1 = row.insertCell(0);
	        var cell2 = row.insertCell(1);
	        var cell3 = row.insertCell(2);
	        var cell4 = row.insertCell(3);
	        cell1.className = 'personName';
	        cell2.className = 'username';
	        cell3.className = 'store';
	        cell4.className = 'privileges';
	        cell1.innerHTML = users[i].name;
	        cell2.innerHTML = users[i].username;
	        cell3.innerHTML = users[i].store;
	        cell4.innerHTML = users[i].privileges;
	      }());
	    }
	}

	render() {
		return (
			<div className="users">
				<div className="newUserOverlay" id="addUserOverlay" onClick={this.userOverlayOff}>
			  		<div className="userOverlayBackground" id="userOverlayBackground">
			  			<NewUserOverlay>
			  			</NewUserOverlay>
			  		</div>
			  	</div>
				<div className="uTable">
					<table className="usersTable" id="usersTable">
		              <thead>
		                <tr className="usersTop">
		                  <th>Name</th>
		                  <th>Username</th>
		                  <th>Store</th>
		                  <th>Access</th>
		                </tr>
		              </thead>
		              <tbody>    
		              </tbody>
		          </table>
		        </div>
		        <button id="newUser" className="newUser" onClick={this.userOverlayOn.bind(this)}>Create new user</button>
			</div>
		)
	}
}

export default Users;