import "./newRoom.scss";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { roomInputs } from "../../../formSource";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";


const NewRoom = () => {
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState(undefined);
  const [rooms, setRooms] = useState([]);

  const { data, loading, error } = useFetch("/Hotel");

  const handleChange = (e) => {
    setInfo((prev) => ({...prev, [e.target.id]: e.target.value}))
  };

  const handleClick = async (e) => {
      e.preventDefault()
      
      try{
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
          const roomNumbers = rooms.split(",").map((room) => ({ number: room}));
          await axios.post(`/Room/createRoom/${hotelId}`, {...info, roomNumbers, photos:list})
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
          <h1>Add New Room</h1>
        </div>
        <div className="bottom">
        <div className="left">
            <img
              src={
                files
                  ? URL.createObjectURL(files[0])
                  : (data.roomImages && data.roomImages.length > 0 ? data.roomImages[0]?.url 
                    : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                    )
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
                  />
                </div>
              ))}
              <div className="formInput">
                  <label>Rooms</label>
                  <textarea onChange={e=>setRooms(e.target.value)}
                   placeholder="give comma between room numbers"/>
                </div>
              <div className="formInput">
                  <label>Choose a hotel</label>
                  <select 
                    id="hotelId"
                    onChange={(e) => setHotelId(e.target.value)}
                  >
                     {loading
                    ? "loading"
                    : data &&
                      data.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>{hotel.name} ({hotel.city})</option>
                      ))}
                  </select>
                </div>
              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;
