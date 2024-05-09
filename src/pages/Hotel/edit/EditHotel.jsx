import "./EditHotel.scss";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useContext, useEffect, useState } from "react";
import { hotelInputs } from "../../../formSource";
import useFetch from "../../../hooks/useFetch";
// import { capitalizeWord } from "../../../functions/capitalizeWord";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import Datatable from "../../../components/datatable/Datatable";
import { roomColumns } from "../../../datatablesource";
import DatatableRooms from "../datatableRooms/DatatableRooms";
import DatatableImages from "../datatableImages/DatatableImages.jsx";
import { hotelImageColumns } from "../../../datatablesource";

const EditHotel = () => {
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  // const [dataRooms, setDataRooms] = useState([]);
  const location = useLocation();
  const path = capitalizeWord(location.pathname.split("/")[1]);
  const id = location.pathname.split("/")[3];
  
  const { data: roomData, loading: roomLoading, error: roomError } = useFetch("/Room");
  // setDataRooms(data);
  const { data: hotelData, loading: hotelLoading, error: hotelError } = useFetch(`/${path}/${id}`);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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

    // console.log(hotelData);

    useEffect(()=>{
      if (!hotelLoading && !hotelError && hotelData) {
        setInfo(hotelData); // Оновлюємо стан даними, якщо дані були успішно завантажені з сервера
      }
    }, [hotelData, hotelLoading, hotelError]);

  const handleChange = e =>{
    setInfo(prev=>({...prev,[e.target.id]:e.target.value}))
  };

  const handleSelect = e =>{
    const value = Array.from(
      e.target.selectedOptions, 
      (option)=>option.value
    );
      setRooms(value);
  };

  const uploadImages = async (files) => {
    try{
      // Видаляємо заголовок авторизації перед виконанням запиту на Cloudinary
      delete axios.defaults.headers.common['Authorization'];
      const list = await Promise.all(
        Object.values(files).map(async (file)=>{
          const data = new FormData();
          data.append("file",file);
          data.append("upload_preset","upload");
          const uploadRes = await axios.post(
            "https://api.cloudinary.com/v1_1/alex-s/image/upload",
            data
          );
    
          const {url} = uploadRes.data;
          return url;
        })
      );

      return list;
    }catch (error){
      console.error("Ошибка при загрузке изображения:", error);
      throw error;
    } finally {
      const token = user.token;
      axios.defaults.headers.common = {'Authorization': `bearer ${token}`};
    }
  }

  const handleClick = async e =>{
    e.preventDefault()
    try{
      let list=[]; 
      if(!files){
        const Hotel ={
          ...info,
          rooms,
          photos:list
        };
        await axios.put(`/Hotel/${id}`, Hotel);
        return;
      }
      // const list = await Promise.all(
      //   Object.values(files).map(async (file)=>{
      //     const data = new FormData();
      //     data.append("file",file);
      //     data.append("upload_preset","upload");
      //     const uploadRes = await axios.post(
      //       "https://api.cloudinary.com/v1_1/alex-s/image/upload",
      //       data
      //     );
    
      //     const {url} = uploadRes.data;
      //     return url;
      //   })
      // );
      list = await uploadImages(files);

      const Hotel ={
        ...info,
        rooms,
        photos:list
      };

      await axios.put(`/Hotel/${id}`, Hotel);
    }catch(err){
      console.log(err)
    }
  }

  // console.log(files);

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Edit Hotel</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                files
                  ? URL.createObjectURL(files[0])
                  : (hotelData.hotelImages && hotelData.hotelImages.length > 0 ? hotelData.hotelImages[0]?.url : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg")
                  // : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Add New Images: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  style={{ display: "none" }}
                />
              </div>

              {hotelInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input 
                    id={input.id}
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                    value={info[input.id]} />
                </div>
              ))}
              <div className="formInput">
                  <label>Featured</label>
                  <select 
                  id="featured"
                  onChange={handleChange}
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>
                <div className="selectRooms">
                  <label>Add Exist Rooms</label>
                  <select
                  id="rooms"
                  multiple
                  onChange={handleSelect}
                  >
                    {roomLoading ? "loading"
                     : roomData &&
                     roomData.map((room) => (
                       <option key={room.id} value={room.id}>
                         {room.title}
                       </option>
                     ))}
                  </select>
                </div>
              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
        <DatatableRooms columns={roomColumns}/>
        <DatatableImages columns={hotelImageColumns}/>
      </div>
    </div>
  );
};

export default EditHotel;
