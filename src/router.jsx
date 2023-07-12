import React, { Component } from 'react';
import {Route, NavLink, BrowserRouter, Routes } from "react-router-dom";
import App from "./App";
import Users from "./users";
import './router.css';

class Router extends Component {

    state = {
        settingsVisible: false
    }

	componentDidMount() {
		var everything = document.getElementById("everything");
		var dropdown = document.getElementById("settings-dropdown");
		everything.addEventListener("click", function(event) {
			if (event.target !== dropdown) {
				dropdown.style.visibility = "hidden";
			}
		});
	}

	displaySettings() {
		var dropdown = document.getElementById("settings-dropdown");
        this.setState({settingsVisible: !this.state.settingsVisible});
		dropdown.style.visibility = this.state.settingsVisible ? "hidden" : "visible";
	}

	render() {
		return (
			<BrowserRouter>
				<div id="everything" className="all">
					<header>
						<div className="routes">
							<img src="../images/hhlogo.png" height="50" width="50"></img>
							<NavLink className="firstRoute" to="/inventory">Inventory</NavLink>
							<div className="rightItems">
								<h3>{this.props.name}</h3>
								<div className="settingsMenu">
									<input id="settingsButton" className="settings" type="image" src="../images/settings.png" 
									alt="settings" height="25" width="25" title="Settings" onClick={this.displaySettings.bind(this)}></input>
									<div id="settings-dropdown">
										<button onClick={this.props.logout}>Logout</button>
									</div>
								</div>
							</div>
						</div>
						<hr className="line_break"></hr>
					</header>
					<main>
                        <Routes>
							<Route path="/" element={<App userId={localStorage.getItem('userId')} name={this.props.name}/>}/>
							<Route path="/inventory" render={() => 
								<App userId={localStorage.getItem('userId')}
								name={this.props.name}
								/>}
							/>
							<Route path="/users" component={Users}/>
                        </Routes>
					</main>
				</div>
			</BrowserRouter>
		);
	}
}

export default Router;