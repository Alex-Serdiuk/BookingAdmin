import { useState, useCallback } from "react";
import axios from "axios";

const useApi = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const baseUrl = process.env.REACT_APP_API_URL;
  const url = endpoint ? `${baseUrl}${endpoint}` : null;

  const apiInstance = axios.create();

  apiInstance.interceptors.request.use((config) => {
    if (config.url.startsWith(baseUrl)) {
      const token = localStorage.getItem("authToken"); // Retrieve the token from localStorage or any other storage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      delete config.headers.Authorization;
    }
    return config;
  });

  const fetchData = async (method, body = null, fetchUrl = url) => {
    setLoading(true);
    try {
      const options = {
        method,
        url: fetchUrl,
        data: body,
      };
      const response = await apiInstance(options);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response ? err.response.data : err.message);
    }
    setLoading(false);
  };

  const get = useCallback(() => fetchData('GET'), [url]);
  const post = useCallback((body) => fetchData('POST', body), [url]);
  const put = useCallback((body) => fetchData('PUT', body), [url]);
  const del = useCallback((fetchUrl) => fetchData('DELETE', null, `${baseUrl}${fetchUrl}`), [baseUrl]);

  const cloudinaryFetch = async (fetchUrl, method, data) => {
    try {
      const response = await apiInstance({ url: fetchUrl, method, data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return { data, loading, error, get, post, put, del, cloudinaryFetch };
};

export default useApi;
