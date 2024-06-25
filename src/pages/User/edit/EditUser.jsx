import "./editUser.scss";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import { AuthContext } from "../../../context/AuthContext";
// import { SHA1 } from 'crypto-js';
import { sha1 } from "crypto-hash";
import cloudinaryConfig from "../../../cloudinary-config";
import useApi from "../../../hooks/useApi";

const EditUser = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const location = useLocation();
  const path = capitalizeWord(location.pathname.split("/")[1]);
  const id = location.pathname.split("/")[3];
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig;
  const { data, loading, error, get, put } = useApi(`/${path}/${id}`);
  // const { put: updateUser } = useApi();
  const { cloudinaryFetch } = useApi();
  const [info, setInfo] = useState(
   {}
  );
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // console.log(data);
  // console.log(info)
  
    // console.log(`${cloudName} ${apiKey} ${apiSecret}`)

  function capitalizeWord(word) {
    // Проверяем, является ли аргумент строкой
    if (typeof word !== 'string') {
      throw new Error('Input is not a string');
    }
  
    // Обрезаем последнюю букву
    const trimmedWord = word.slice(0, -1);
  
    // Преобразуем первую букву в заглавную, а остальные в строчные
    const capitalizedWord = trimmedWord.charAt(0).toUpperCase() + trimmedWord.slice(1).toLowerCase();
    return capitalizedWord;
  }

  useEffect(() => {
    get();
  }, [get]);

  useEffect(()=>{
    if (!loading && !error && data) {
      setInfo(data); // Оновлюємо стан даними, якщо дані були успішно завантажені з сервера
    }
  }, [data, loading, error]);

  const handleChange = e =>{
    setInfo(prev=>({...prev,[e.target.id]:e.target.value}))
  };

  const generateSignature = (publicId, apiSecret) => {
    const timestamp = new Date().getTime();
    return `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  };

  const handleDelete = async ( publicId ) => {
    const timestamp = Date.now();
    const signature = await sha1(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

    try {
      await cloudinaryFetch(url, 'POST', {
        public_id: publicId,
        timestamp: timestamp,
        api_key: apiKey,
        signature: signature
      });
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
    }
  };

  const extractImageId = (url) => {
     // Знайти індекс першого входження "upload/"
    const firstIndex = url.indexOf("upload/");
    // Знайти індекс наступного входження "upload/" після першого
    const secondIndex = url.indexOf("upload/", firstIndex + 1);
    // Відрізати рядок з другого входження "upload/" до кінця
    let partialUrl = url.substring(secondIndex);
    // Знайти індекс останнього входження "."
    const lastIndex = partialUrl.lastIndexOf(".");
    // Відрізати розширення
    partialUrl = partialUrl.slice(0, lastIndex);
    return partialUrl;
  };

  const getPublicId = (url) => url.split("/").pop().split(".")[0];

  const uploadImage = async (file) => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "upload");
  
      const response = await cloudinaryFetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        'POST',
        data
      );
   console.log(response);
      return response.url;
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
      throw error;
    }
  };

  const replaceImage = async (file, oldUrl) => {
    try {
      const publicId = extractImageId(oldUrl);
      await handleDelete(publicId);
      const url = await uploadImage(file);
      return url;
    } catch (error) {
      console.error("Ошибка при замене изображения:", error);
      throw error;
    }
  };

  const handleClick = async e=>{
    e.preventDefault();
    try {
      let url = info.img;
      if (file) {
        url = info.img ? await replaceImage(file, info.img) : await uploadImage(file);
      }

      const updatedUser = { ...info, img: url };
      await put(updatedUser);
      navigate(`/users/${id}`);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : (data && data.img ? data.img : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg")
              }
              alt=""
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {info && inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                    id={input.id}
                    value={info[input.id] || ""}
                  />
                </div>
              ))}
              
              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EditUser;
