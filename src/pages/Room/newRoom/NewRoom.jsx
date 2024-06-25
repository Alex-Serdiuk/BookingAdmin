import "./newRoom.scss";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useContext, useEffect, useState } from "react";
import { roomInputs } from "../../../formSource";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import useApi from "../../../hooks/useApi";

const NewRoom = () => {
  const [files, setFiles] = useState("");
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState(undefined);
  const [rooms, setRooms] = useState([]);
  const { user } = useContext(AuthContext);

  const { data, loading, error, get: fetchHotels } = useApi("/Hotel");
  
  const { cloudinaryFetch } = useApi();

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

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
          const uploadRes = await cloudinaryFetch("https://api.cloudinary.com/v1_1/alex-s/image/upload", "POST", data);
          return uploadRes.url;
        })
      );

      return list;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
  }
  const { post: createRoom } = useApi(`/Room/createRoom/${hotelId}`);
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      let roomNumbers = [];
      if (rooms && typeof rooms === 'string' && rooms.trim() !== "") {
        roomNumbers = rooms.split(",").map(room => {
          const parsedNumber = parseInt(room.trim(), 10);
          if (isNaN(parsedNumber)) {
            throw new Error(`Invalid room number: ${room}`);
          }
          return { number: parsedNumber };
        });
      }

      let list = [];
      if (files.length > 0) {
        list = await uploadImages(files);
      }

      const Room = {
        ...info,
        roomNumbers,
        photos: list
      };

      await createRoom(Room, `/Room/createRoom/${hotelId}`);
    } catch (err) {
      console.log(err);
    }
  };

  const isFormValid = hotelId !== undefined && hotelId !== "";

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
                  : (data && data.roomImages && data.roomImages.length > 0 ? data.roomImages[0]?.url 
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
                    value={info[input.id] || ""}
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
              <button onClick={handleClick} disabled={!isFormValid}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;
