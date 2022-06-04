import { useState } from 'react';
import axios from "axios";

import logo from "../assets/img/LineBee-logo-yellow-black.png"

function Login(props) {

    const [loginForm, setloginForm] = useState({
      email: "",
      password: ""
    })

    const [loginButton, setLoginButton] = useState("Sign in")
    const [loginButtonDisabled, setLoginButtonDisabled] = useState(false)
    const [formErrors, setFormErrors] = useState(null)

    function logMeIn(event) {
      setLoginButton("Signing In")
      setLoginButtonDisabled(true)

      axios({
        method: "POST",
        url:"/token",
        data:{
          email: loginForm.email,
          password: loginForm.password
         }
      })
      .then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data.user))
        props.setUser(response.data.user)
        props.setToken(response.data.access_token)
      }).catch((error) => {
        if (error.response) {
          // console.log(error.response)
          console.log(error.response.status)
          setFormErrors(error.response.data.msg)
          setLoginButton("Sign in")
          setLoginButtonDisabled(false)
          }
      })

      // setloginForm(({
      //   email: "",
      //   password: ""}))

      event.preventDefault()
    }

    function handleChange(event) {
      const {value, name} = event.target

      setloginForm(prevNote => ({
          ...prevNote, [name]: value})
      )}



    return (
      <div className="App container-fluid">
        <div className="row">
          <div className="col-0 col-md-4" />
          <div className="col-12 col-md-4">
            <img className="login-logo" src={logo} />
          </div>
          <div className="col-0 col-md-4" />
        </div>
        <div className="row text-center">
          <div className="col-md-6 col-12">
            Register
          </div>
          <div className="col-md-6 col-12">
          <form className="login">
            <div className="row">
              <div className="col-3"></div>
              <div className="col-6">
                <h4 className="mb-3">Sign in with your email address</h4>
                <input type="email" name="email" className="form-control form-control-lg my-2" placeholder="Email address" aria-label="Email address" text={loginForm.email} value={loginForm.email} onChange={handleChange} />
                <input type="password" name="password" className="form-control form-control-lg my-2" placeholder="Password" aria-label="Password" value={loginForm.password} onChange={handleChange} />
                <div className="form-text text-danger">{formErrors}</div>
                <button className="btn btn-primary btn-lg my-2" disabled={loginButtonDisabled} onClick={logMeIn}>{loginButton}</button>
              <div className="col-3"></div>
              </div>
            </div>
          </form>
          </div>
        </div>
      </div>

    );
}

export default Login;
