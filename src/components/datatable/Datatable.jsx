import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns, userRows } from "../../datatablesource";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

const Datatable = ({columns}) => {
  const location = useLocation();
  const [list, setList] = useState();
  const path = capitalizeWord(location.pathname.split("/")[1]);
  const { data, loading, error } = useFetch(`/${path}`);

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
    setList(data);
  }, [data]);


  const handleDelete = async (id) => {
    try{
      
      await axios.delete(`/${path}/${id}`);
      setList(list => list.filter((item) => item.id !== id));
    }catch(err){
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
            <Link to="/users/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">View</div>
            </Link>
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
        Add New User
        <Link to="/users/new" className="link">
          Add New
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={list}
        columns={columns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
        getRowId={row=>row.id}
      />
    </div>
  );
};

export default Datatable;
