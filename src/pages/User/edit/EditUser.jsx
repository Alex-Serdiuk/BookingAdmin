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

const EditUser = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const location = useLocation();
  const path = capitalizeWord(location.pathname.split("/")[1]);
  const id = location.pathname.split("/")[3];
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig;
  const { data, loading, error } = useFetch(`/${path}/${id}`);
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
    const signature = await sha1(
      `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    );
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    // Видаляємо заголовок авторизації перед виконанням запиту на Cloudinary
    delete axios.defaults.headers.common['Authorization'];
    axios
      .post(url, {
        public_id: publicId,
        timestamp: timestamp,
        api_key: apiKey,
        signature: signature
      })
      .then((response) => {
        console.log('Изображение удалено из Cloudinary:', response);
      })
      
      .catch((error) => {
        console.error('Не удалось удалить изображение:', error);
      }).finally(() =>{
        const token =user.token;
        axios.defaults.headers.common = {'Authorization': `bearer ${token}`};
      });
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
      // Видаляємо заголовок авторизації перед виконанням запиту на Cloudinary
      delete axios.defaults.headers.common['Authorization'];
      // Загрузить новое изображение
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "upload");
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/alex-s/image/upload",
        data
      );
      
      const { url } = uploadRes.data;
      console.log(url)
      
      // Вернуть URL нового изображения
      return url;
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
      throw error;
    } finally {
      const token = user.token;
      axios.defaults.headers.common = {'Authorization': `bearer ${token}`};
    }
  };

  const replaceImage = async (file, oldUrl) => {
    try {
      
         const publicId = extractImageId(oldUrl);
        // const publicId = getPublicId(oldUrl);
        console.log(publicId)
        await handleDelete(publicId);
        let url = await uploadImage(file);
        console.log(url);
      // Вернуть URL нового изображения
      return url;
    } catch (error) {
      console.error("Ошибка при замене изображения:", error);
      throw error;
    }
  };

  const handleClick = async e=>{
    e.preventDefault();
    try{
      if (!file) {
        // Якщо файл не вибрано, пропустити post-запит на Cloudinary
        const user = {
          ...info,
          //img: '', // Залишити img порожнім
        };
        // console.log(user);
        try {
          await axios.put(`/User/${id}`, user);
        } catch (err) {
          console.log(err);
        }
        return;
      }
      
      let url;
      if(info.img){
        url = await replaceImage(file, info.img);
        
      }else{
        url  = await uploadImage(file);
      }
      //console.log(url)
      
      const user = {
        ...info,
        img: await url
      };

      await axios.put(`/User/${id}`, user);
     
    }catch(err){
      console.log(err);
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
                  : data.img ? data.img : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
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
                    value={info[input.id]}
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
