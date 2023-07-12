import React from 'react';
import {Component} from 'react';
import Router from './router.jsx';
import './home.css';

class Home extends Component {

  state = {
    login: false,
    access: null
  }

  setLogin(data) {
    localStorage.setItem('loginHH', true);
    localStorage.setItem('userIdHH', data.userId);
    localStorage.setItem('name', data.name);
    localStorage.setItem('access', data.access);
    localStorage.setItem('empId', data.empId);
    this.setState({login: true});
  }

  async handleLogout() {
    localStorage.clear();
    this.setState({login: false});
  }

  async handleLogin(event) {
    event.preventDefault();
    const loginInfo = new URLSearchParams(new FormData(event.target));
    const username = loginInfo.get('username');
    const pw = loginInfo.get('password');

    if (username === '' || pw === '') {
      return;
    }
    const loginData = {
        "username": username,
        "password": pw
    }
    document.getElementById("loginBox").reset(); // double check when to actually reset for clean UI
    const login = await fetch("https://lymvqokf533piot3jiai5miohi0oyzmo.lambda-url.us-east-2.on.aws", {
      method: 'post',
      body: JSON.stringify(loginData)
    });
    const loginStatus = await login.json();
    if (loginStatus.userId) {
      this.setLogin(loginStatus);
      localStorage.setItem('username', username);
      localStorage.setItem('fnkey', loginStatus.fnkey)
    }
    else {
      alert("Bad login!")
    };
  }

  render() {
     if (localStorage.getItem('loginHH') === 'true') {
      return (
          <Router name={localStorage.getItem("name")} logout={this.handleLogout.bind(this)}>
          </Router>
      );
    }
    else {
      return (
        <div className="login">
          <form id="loginBox" onSubmit={this.handleLogin.bind(this)}>
            <input type="text" name="username" placeholder="Username"/><br></br>
            <input type="password" name="password" placeholder="Password"/><br></br>
          </form>
          <input form="loginBox" id="login" type="submit" value="Login"/>
        </div>
      );
    }
  }
}

export default Home;
