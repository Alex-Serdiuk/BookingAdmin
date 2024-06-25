import "./editRoom.scss";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useContext, useEffect, useState } from "react";
import { roomInputs } from "../../../formSource";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import DatatableRoomNumbers from "../datatableRoomNumbers/DatatableRoomNumbers";
import { hotelImageColumns, roomNumberColumns } from "../../../datatablesource";
import DatatableRoomImages from "../datatableImages/DatatableRoomImages";
import useApi from "../../../hooks/useApi";


const EditRoom = () => {
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState(undefined);
  const [rooms, setRooms] = useState([]);
  const location = useLocation();
  const path = capitalizeWord(location.pathname.split("/")[1]);
  const id = location.pathname.split("/")[3];
  // const { data: hotelData, loading: hotelLoading, error: hotelError } = useFetch("/Hotel");
  const { data: roomData, loading: roomLoading, error: roomError, get: fetchRoomData, put: updateRoomData } = useApi(`/${path}/${id}`);
  const { cloudinaryFetch } = useApi();

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomData();
  }, [fetchRoomData]);

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
    if (!roomLoading && !roomError && roomData) {
      setInfo(roomData); // Оновлюємо стан даними, якщо дані були успішно завантажені з сервера
    }
  }, [roomData, roomLoading, roomError]);

  const handleChange = (e) => {
    setInfo((prev) => ({...prev, [e.target.id]: e.target.value}))
  };

  const uploadImages = async (files) => {
    try {
      const list = await Promise.all(
        Object.values(files).map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "upload");
          const uploadRes = await cloudinaryFetch(
            "https://api.cloudinary.com/v1_1/alex-s/image/upload",
            "POST",
            data
          );

          const { url } = uploadRes;
          return url;
        })
      );

      return list;
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
      throw error;
    }
  }

  const handleClick = async (e) => {
      e.preventDefault();
      
      try{
        let roomNumbers = [];
        let list=[];
        // Перевірка, чи є rooms рядком і чи не є він порожнім
    if (rooms && typeof rooms === 'string' && rooms.trim() !== "") {
      roomNumbers = rooms.split(",").map(room => {
        const parsedNumber = parseInt(room.trim(), 10);
        if (isNaN(parsedNumber)) {
          throw new Error(`Invalid room number: ${room}`);
        }
        return { number: parsedNumber };
      });
    }
    if (files) {
      list = await uploadImages(files);
    }

    const Room = {
      ...info,
      roomNumbers,
      photos: list
    };

    await updateRoomData(Room);
      }catch(err){
        console.log(err);
      }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Edit Room</h1>
        </div>
        <div className="bottom">
        <div className="left">
            <img
              src={
                files
                  ? URL.createObjectURL(files[0])
                  : (roomData && roomData.roomImages && roomData.roomImages.length > 0 ? roomData.roomImages[0]?.url : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg")
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

              {roomInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input 
                    id={input.id} 
                    type={input.type} 
                    placeholder={input.placeholder} 
                    onChange={handleChange}
                    value={info[input.id] || ''}
                  />
                </div>
              ))}
              <div className="formInput">
                  <label>Add New RoomNumbers</label>
                  <textarea onChange={e=>setRooms(e.target.value)}
                   placeholder="give comma between room numbers"/>
                </div>
              {/* <div className="formInput">
                  <label>Choose a hotel</label>
                  <select 
                    id="hotelId"
                    onChange={(e) => setHotelId(e.target.value)}
                  >
                     {hotelLoading
                    ? "loading"
                    : hotelData &&
                      hotelData.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>{hotel.name} ({hotel.city})</option>
                      ))}
                  </select>
                </div> */}
              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
        <DatatableRoomNumbers columns={roomNumberColumns}/>
        <DatatableRoomImages columns={hotelImageColumns}/>
      </div>
    </div>
  );
};

export default EditRoom;
