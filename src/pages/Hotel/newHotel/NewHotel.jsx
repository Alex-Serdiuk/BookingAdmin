import "./newHotel.scss";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useContext, useState, useEffect } from "react";
import { hotelInputs } from "../../../formSource";
import useApi from "../../../hooks/useApi";
import { AuthContext } from "../../../context/AuthContext";

const NewHotel = () => {
  const [files, setFiles] = useState(null);
  const [info, setInfo] = useState({
    name: "",
    title: "",
    description: "",
    city: "",
    address: "",
    distance: "",
    cheapestPrice: "",
    featured: false,
  });
  const [rooms, setRooms] = useState([]);
  const { user } = useContext(AuthContext);

  const { data, loading, error, get: fetchRooms } = useApi("/Room");
  const { post: createHotel } = useApi("/Hotel");
  const { cloudinaryFetch } = useApi();

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setRooms(value);
  };

  const uploadImages = async (files) => {
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
  };

  const handleClick = async (e) => {
    e.preventDefault();
    let list = [];

    try {
      if (files) {
        list = await uploadImages(files);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      return;
    }

    const Hotel = {
      ...info,
      rooms,
      photos: list
    };

    try {
      await createHotel(Hotel);
    } catch (err) {
      console.log("Error creating hotel:", err);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>Add New Hotel</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                files
                  ? URL.createObjectURL(files[0])
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
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
                    value={info[input.id] || ""}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Featured</label>
                <select id="featured" onChange={handleChange} value={info.featured}>
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>
              <div className="selectRooms">
                <label>Rooms</label>
                <select id="rooms" multiple onChange={handleSelect}>
                  {loading ? "loading" : data && data.map((room) => (
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
      </div>
    </div>
  );
};

export default NewHotel;
