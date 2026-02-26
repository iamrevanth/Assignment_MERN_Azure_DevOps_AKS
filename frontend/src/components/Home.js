import React, { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState([]);

  const helloBaseUrl = process.env.REACT_APP_HELLO_BASE_URL;
  const profileBaseUrl = process.env.REACT_APP_PROFILE_BASE_URL;

  useEffect(() => {
    axios
      .get(`${helloBaseUrl}/`)
      .then((response) => {
        setMessage(response.data.msg);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    axios
      .get(`${profileBaseUrl}/fetchUser`)
      .then((response) => {
        setProfile(response.data);
        
      })
      .catch((error) => console.error("Error fetching data:", error));
  },[]);

  

  return (
    <div className="App">
      <h1>{message}</h1>
      <div>
        <h2>Profile</h2>
        {
        profile.map((user) => {
            console.log('user', user)
          return (
            <div>
              <h3>Name: {user.name}</h3>
              <h3>Age: {user.age}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
