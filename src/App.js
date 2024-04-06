import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/User/single/Single";
import New from "./pages/User/new/New";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { hotelInputs, productInputs, roomInputs, userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import { hotelColumns, roomColumns, userColumns } from "./datatablesource";
import NewHotel from "./pages/Hotel/newHotel/NewHotel";
import NewRoom from "./pages/Room/newRoom/NewRoom";
import SingleHotel from "./pages/Hotel/singleHotel/SingleHotel";
import SingleRoom from "./pages/Room/singleRoom/SingleRoom";
import EditUser from "./pages/User/edit/EditUser";
import EditHotel from "./pages/Hotel/edit/EditHotel";
import EditRoom from "./pages/Room/EditRoom/EditRoom";

function App() {
  const { darkMode } = useContext(DarkModeContext);

  const ProtectedRoute = ({children}) =>{
    const {user} = useContext(AuthContext);

    if(!user){
      return <Navigate to="/login"/>
    }

    return children;
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route 
              index 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
            } 
            />
            
            <Route path="users">
              <Route index element={
                <ProtectedRoute>
                  <List columns={userColumns}/>
                </ProtectedRoute>} />
              <Route path=":userId" element={
                <ProtectedRoute>
                  <Single inputs={userInputs}/>
                </ProtectedRoute>} />
                <Route path="edit/:userId" element={
                <ProtectedRoute>
                <EditUser inputs={userInputs} title="Edit User"/>
              </ProtectedRoute>} />
                  
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <New inputs={userInputs} title="Add New User"/>
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="hotels">
              <Route index element={
                <ProtectedRoute>
                  <List columns={hotelColumns}/>
                </ProtectedRoute>} />
              <Route path=":hotelId" element={
                <ProtectedRoute>
                    <SingleHotel/>
                </ProtectedRoute>} />
                <Route path="edit/:hotelId" element={
                <ProtectedRoute>
                <EditHotel inputs={hotelInputs} title="Edit Hotel"/>
              </ProtectedRoute>} />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewHotel />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="rooms">
              <Route index element={
                <ProtectedRoute>
                  <List columns={roomColumns}/>
                </ProtectedRoute>} />
              <Route path=":roomId" element={
                <ProtectedRoute>
                    <SingleRoom />
                </ProtectedRoute>} />
                <Route path="edit/:roomId" element={
                <ProtectedRoute>
                <EditRoom inputs={roomInputs} title="Edit Room"/>
              </ProtectedRoute>} />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <NewRoom />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
