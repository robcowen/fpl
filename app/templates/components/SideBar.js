
import axios from "axios";

import { NavLink } from 'react-router-dom'

import Login from './Login'

function SideBar(props) {

  function logMeOut() {
    console.log("Logging out")
    axios({
      method: "POST",
      url:"/logout",
    })
    .then((response) => {
       props.removeToken()
       localStorage.clear()
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
        }
    })}

  // // If logged out
  // if (!props.token && props.token!=="" && props.token!== undefined) {
  //   navbar = (
  //     <div>
  //       // <ul className="nav navbar-nav d-xl-flex mr-3">
  //       //     <li role="presentation" className="nav-item"><a className="nav-link" href="#product">Product</a></li>
  //       //     <li role="presentation" className="nav-item"><a className="nav-link" href="#pricing">Pricing</a></li>
  //       //     <li role="presentation" className="nav-item"><a className="nav-link" href="#">About Us</a></li>
  //       // </ul>
  //       <ul className="nav navbar-nav">
  //           <li role="presentation" className="nav-item"><a href="{{url_for('login')}}" className="btn btn-outline-light mr-2" type="button">Sign In</a></li>
  //           <li role="presentation" className="nav-item"><a href="{{ url_for('details') }}" className="btn btn-light" type="button">Get Started</a></li>
  //       </ul>
  //     </div>
  //   )
  // }
  //
  // else {
  //   navbar = (
  //     <ul className="nav navbar-nav d-xl-flex mr-3">
  //       <a className="nav-item nav-link" href="{{ url_for('index') }}">Home</a>
  //       <a className="nav-item nav-link" href="{{ url_for('view_data') }}">View data</a>
  //
  //         <li className="nav-item dropdown">
  //           <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
  //             Admin
  //           </a>
  //           <div className="dropdown-menu" aria-labelledby="navbarDropdown">
  //             <a className="nav-item nav-link" href="{{ url_for('manage_users') }}">Manage users</a>
  //             <a className="nav-item nav-link" href="{{ url_for('manage_hubs') }}">Manage hubs</a>
  //             <a className="nav-item nav-link" href="{{ url_for('manage_sensors') }}">Manage sensors</a>
  //             <a className="nav-item nav-link" href="{{ url_for('manage_products') }}">Manage products</a>
  //             <a className="nav-item nav-link" href="{{ url_for('manage_product_runs') }}">Manage production</a>
  //             <a className="nav-item nav-link" href="{{ url_for('scan_qr') }}">Scan QR code</a>
  //           </div>
  //         </li>
  //
  //         <a className="nav-item nav-link" href="{{ url_for('manage_clients') }}">Manage clients</a>
  //
  //       <a className="nav-item nav-link" href="#" onClick={logMeOut}>Sign out</a>
  //     </ul>
  //   )
  // }


  return(
      <header>
        <ul className="nav nav-pills flex-column align-items-center align-items-md-start mt-3 mb-auto">
          <li className="nav-item">
            <NavLink to="/" className={({isActive}) => "nav-link link-dark" + (isActive ? " active" : "")} aria-current="page" >
              <i className="fa-solid fa-chart-line fa-fw"></i><span className="d-none d-md-inline"> Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/devices" className={({isActive}) => "nav-link link-dark" + (isActive ? " active" : "")} aria-current="page" >
              <i className="fa-solid fa-router fa-fw"></i><span className="d-none d-md-inline"> Manage devices</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/users" className={({isActive}) => "nav-link link-dark" + (isActive ? " active" : "")} aria-current="page" >
              <i className="fa-solid fa-users fa-fw"></i><span className="d-none d-md-inline"> Manage users</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/user" className={({isActive}) => "nav-link link-dark" + (isActive ? " active" : "")} aria-current="page" >
              <i className="fa-solid fa-user fa-fw"></i><span className="d-none d-md-inline"> {props.user != null ? props.user.first_name +" "+ props.user.last_name : null}</span>
            </NavLink>
          </li>
          <li>
            <a href="#" onClick={logMeOut} className="nav-link link-dark">
              <i className="fa-solid fa-arrow-right-from-bracket fa-fw"></i><span className="d-none d-md-inline"> Sign out</span>
            </a>
          </li>
        </ul>
      </header>
  )
}

export default SideBar;
