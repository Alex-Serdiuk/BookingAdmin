import "./datatableRoomImages.scss";
import { DataGrid } from "@mui/x-data-grid";
// import { userColumns, userRows } from "../src/datatablesource";
import { userColumns, userRows, hotelImageColumns } from "../../../datatablesource";
import { Link, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import useFetch from "../../../hooks/useFetch";
import axios from "axios";
import { sha1 } from "crypto-hash";
import cloudinaryConfig from "../../../cloudinary-config";
import { AuthContext } from "../../../context/AuthContext";
import useApi from "../../../hooks/useApi";

const DatatableRoomImages = ({columns}) => {
  const location = useLocation();
  const [list, setList] = useState();
  const path = capitalizeWord(location.pathname.split("/")[1]);
  const id = location.pathname.split("/")[3];
  const { data, loading, error, get: fetchRoomImages } = useApi(`/Room/GetRoomImagesByRoomId/${id}`);
  const { cloudName, apiKey, apiSecret } = cloudinaryConfig;
  const { del: deleteRoomImage, cloudinaryFetch } = useApi();
  const { user } = useContext(AuthContext);

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
    fetchRoomImages();
  }, [fetchRoomImages]);

  useEffect(() => {
    setList(data || []);
  }, [data]);

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

  const handleDeleteImage = async ( publicId ) => {
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

  const handleDelete = async (id) => {
    try {
      const image = extractImageId(data.find(item => item.id === id).url);
      await handleDeleteImage(image);
      await deleteRoomImage(`/RoomImage/${id}`);
      setList(list.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete the image:", err);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            {/* <Link to={`/hotelImages/${params.row.id}`} style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
            <Link to={`/hotelImages/edit/${params.row.id}`} style={{ textDecoration: "none" }}>
              <div className="editButton">Edit</div>
            </Link> */}
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      <div className="datatableTitle">
      Images
        {/* <Link to={`/hotelImages/new`} className="link">
          Add New
        </Link> */}
      </div>
      <DataGrid
        className="datagrid"
        rows={list || []}
        columns={columns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={row=>row.id}
      />
    </div>
  );
};

export default DatatableRoomImages;
