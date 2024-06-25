import "./editRoomnumber.scss";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useContext, useEffect, useState } from "react";
import useFetch from "../../../../hooks/useFetch";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
// import DatatableRoomNumbers from "../datatableUnavailableDates/DatatableUnavailableDates";
import { roomNumberColumns, unavailableDateColumns } from "../../../../datatablesource";
import DatatableUnavailableDates from "../datatableUnavailableDates/DatatableUnavailableDates";
import { roomNumberInputs } from "../../../../formSource";
import useApi from "../../../../hooks/useApi";


const EditRoomNumber = () => {
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState(undefined);
  const [rooms, setRooms] = useState([]);
  const location = useLocation();
  const path = capitalizeWord(location.pathname.split("/")[1]);
  const id = location.pathname.split("/")[3];
  // const { data: hotelData, loading: hotelLoading, error: hotelError } = useFetch("/Hotel");
  const { data: roomData, loading: roomLoading, error: roomError, get: fetchRoom } = useApi(`/${path}/${id}`);
  const { put: updateRoom } = useApi(); // Separate useApi call for PUT request

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

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(()=>{
    if (!roomLoading && !roomError && roomData) {
      setInfo(roomData); // Оновлюємо стан даними, якщо дані були успішно завантажені з сервера
    }
  }, [roomData, roomLoading, roomError]);

  const handleChange = (e) => {
    setInfo((prev) => ({...prev, [e.target.id]: e.target.value}))
  };

  const handleClick = async (e) => {
      e.preventDefault();
      
      try{
        let roomNumbers = [];
        if(rooms){
          // roomNumbers = rooms.split(",").map((room) => ({ number: room }));
          roomNumbers = rooms.includes(",")
            ? rooms.split(",").map((room) => ({ number: room }))
            : [{ number: rooms }];
        }
          await axios.put(`/Room/updateRoomNumber/${id}`, {...info, roomNumbers})
      }catch(err){
        console.log(err)
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
          <div className="right">
            <form>
              {roomNumberInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input 
                    id={input.id} 
                    type={input.type} 
                    placeholder={input.placeholder} 
                    onChange={handleChange}
                    value={info[input.id] || ""}
                  />
                </div>
              ))}
              {/* <div className="formInput">
                  <label>Add New RoomNumbers</label>
                  <textarea onChange={e=>setRooms(e.target.value)}
                   placeholder="give comma between room numbers"/>
                </div> */}
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
              {/* <button onClick={handleClick}>Send</button> */}
            </form>
          </div>
        </div>
        <DatatableUnavailableDates columns={unavailableDateColumns}/>
      </div>
    </div>
  );
};

export default EditRoomNumber;
