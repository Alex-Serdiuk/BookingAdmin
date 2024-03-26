import "./editUser.scss";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import { AuthContext } from "../../../context/AuthContext";

const EditUser = ({ inputs, title }) => {
  const [file, setFile] = useState("");
 
  const location = useLocation();
  const path = capitalizeWord(location.pathname.split("/")[1]);
  const id = location.pathname.split("/")[3];
 
  const { data, loading, error } = useFetch(`/${path}/${id}`);
  const [info, setInfo] = useState(
   {}
  );
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  // console.log(data);
  console.log(info)

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
    const { name, value } = e.target;
    setInfo(prevData => ({
      ...prevData,
      [name]: value
    }))
  };

  const deleteImage = async (publicId) => {
    try {
      await axios.delete(`https://api.cloudinary.com/v1_1/alex-s/image/upload/${publicId}`);
      console.log("Изображение успешно удалено");
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
    }
  };

  const handleClick = async e=>{
    e.preventDefault()
    const data = new FormData()
    data.append("file",file)
    data.append("upload_preset","upload")
    try{
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/alex-s/image/upload",
        data
      );

      const {url} = uploadRes.data;

      const newUser = {
        ...info,
        img: url,
      };

      await axios.post("/Account/Register", newUser);
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

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input onChange={handleChange}
                    type={input.type}
                    // placeholder={input.placeholder}
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
