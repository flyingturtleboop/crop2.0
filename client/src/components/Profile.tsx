import React, { useState, useEffect } from "react";
import axios from "axios";

interface ProfileProps {
  token: string;
  setToken: (token: string) => void;
}

interface ProfileData {
  profile_name: string;
  profile_email: string;
  occupation_me: string;
}

interface ProfileResponse {
  access_token?: string;
  name: string;
  email: string;
  occupation: string;
}

const Profile: React.FC<ProfileProps> = (props) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const email = localStorage.getItem("email");

  function getUsers(): void {
    axios({
      method: "GET",
      url: `http://127.0.0.1:5000/profile/${email}`,
      headers: {
        Authorization: "Bearer " + props.token,
      },
    })
      .then((response) => {
        console.log(response);
        const res: ProfileResponse = response.data;
        if (res.access_token) {
          props.setToken(res.access_token);
        }
        setProfileData({
          profile_name: res.name,
          profile_email: res.email,
          occupation_me: res.occupation,
        });
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response);
          console.log(error.response.status);
          console.log(error.response.headers);
        }
      });
  }

  const imgs = [
    "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp",
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-center items-center h-1/2">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow mb-3">
            {profileData && (
              <div className="flex flex-col md:flex-row">
                {/* Left section: Profile image & basic info */}
                <div className="md:w-1/3 bg-green-500 text-center text-white flex flex-col items-center justify-center p-4">
                  <img
                    src={imgs[0]}
                    alt="Profile"
                    className="my-5"
                    style={{ width: "150px" }}
                  />
                  <h5 className="text-lg font-semibold">
                    {profileData.profile_name}
                  </h5>
                  <p className="text-base">Coder</p>
                  <i className="far fa-edit mb-5"></i>
                </div>

                {/* Right section: Profile details */}
                <div className="md:w-2/3">
                  <div className="p-4">
                    <h6 className="text-lg font-medium mb-2">
                      Your profile details:
                    </h6>
                    <div className="flex flex-wrap pt-1">
                      <div className="w-1/2 mb-3">
                        <h6 className="font-semibold">Email</h6>
                        <p className="text-gray-600">
                          {profileData.profile_email}
                        </p>
                      </div>
                      <div className="w-1/2 mb-3">
                        <h6 className="font-semibold">Phone</h6>
                        <p className="text-gray-600">123 456 789</p>
                      </div>
                    </div>
                    <h6 className="font-semibold">Occupation</h6>
                    <div className="flex justify-start">
                      {profileData.occupation_me}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
