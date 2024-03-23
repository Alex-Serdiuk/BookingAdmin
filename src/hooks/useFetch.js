import { useEffect, useState } from "react";
import axios from "axios";

const useFetch = (url) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // // Отримання JWT токену з локального сховища (наприклад, localStorage)
        // const token = localStorage.getItem('access_token');

        // // Перевірка, чи токен існує
        // if (!token) {
        //   throw new Error('Токен відсутній');
        // }

        // // Встановлення заголовка з авторизаційним токеном
        // const headers = {
        //   Authorization: `Bearer ${token}`
        // };
        // const res = await axios.get(url, { headers });
        const res = await axios.get(url);
        setData(res.data);
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    };
    fetchData();
  }, [url]);

  const reFetch = async () => {
    setLoading(true);
    try {
      // // Отримання JWT токену з локального сховища (наприклад, localStorage)
      // const token = localStorage.getItem('access_token');

      // // Перевірка, чи токен існує
      // if (!token) {
      //   throw new Error('Токен відсутній');
      // }

      // // Встановлення заголовка з авторизаційним токеном
      // const headers = {
      //   Authorization: `Bearer ${token}`
      // };
      // const res = await axios.get(url, { headers });
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      setError(err);
    }
    setLoading(false);
  };

  return { data, loading, error, reFetch };
};

export default useFetch;