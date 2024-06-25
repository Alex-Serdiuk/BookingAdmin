import "./login.scss"
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const { loading, error, dispatch } = useContext(AuthContext);

  const navigate = useNavigate();
  const { post: login, data: loginData, error: loginError } = useApi("/Account/Login");

  useEffect(() => {
    if (loginData) {
      dispatch({ type: "LOGIN_SUCCESS", payload: loginData.details });
      navigate("/");
    }
  }, [loginData, dispatch, navigate]);

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };
  // console.log("API URL:", apiUrl); // Добавьте этот вывод для отладки
  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });
    try {
      await login(credentials);
      // dispatch({ type: "LOGIN_SUCCESS", payload: loginData.details });
      // navigate("/")
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: loginError });
    }
  };

  const isFormValid = Object.values(credentials).every((value) => value !== "");
      
  return (
    <div className="login">
      <div className="lContainer">
        <input
          type="text"
          placeholder="username"
          id="username"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          onChange={handleChange}
          className="lInput"
        />
        <button 
        disabled={loading || !isFormValid} 
        onClick={handleClick} 
        className="lButton">
          Login
        </button>
        {error && <span>{error.message}</span>}
      </div>
    </div>
  )
}

export default Login