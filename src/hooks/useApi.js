import { useState, useCallback } from "react";
import axios from "axios";

const useApi = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const baseUrl = process.env.REACT_APP_API_URL;
  const url = endpoint ? `${baseUrl}${endpoint}` : null;

  const fetchData = async (method, body = null, fetchUrl = url) => {
    setLoading(true);
    try {
      const options = {
        method,
        url: fetchUrl,
        data: body,
      };
      const response = await axios(options);
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
  // const del = useCallback((fetchUrl) => fetchData('DELETE', null, fetchUrl), [url]);
  const del = useCallback((relativeUrl) => fetchData('DELETE', null, `${baseUrl}${relativeUrl}`), [baseUrl]);

  const cloudinaryFetch = async (fetchUrl, method, data) => {
    const token = axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['Authorization'];

    try {
      const response = await axios({ url: fetchUrl, method, data });
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      axios.defaults.headers.common['Authorization'] = token;
    }
  };

  return { data, loading, error, get, post, put, del, cloudinaryFetch };
};

export default useApi;
