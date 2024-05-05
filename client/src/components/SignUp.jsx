import React, { useState } from 'react';
import styled from 'styled-components';
import TextInput from "./TextInput";
import Button from "./Button";
import { UserSignUp } from "../api";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/reducers/userSlice";

const StyledContainer = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 36px;
`;
const Title = styled.div`
  font-size: 30px;
  font-family: Bradley Hand, cursive;
  font-weight: 800;
  color: ${({ theme }) => theme.text_primary};
`;
const StyledSpan = styled.div`
  font-size: 16px;
  font-family: Bradley Hand, cursive;
  font-weight: 400;
  color: ${({ theme }) => theme.text_secondary + 90};
`;

const SignUp = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [name, setName] = useState("");
  const [userEmail, setEmail] = useState("");
  const [userPassword, setPassword] = useState("");

  const validateFields = () => {
    if (!name || !userEmail || !userPassword) {
      alert("Please enter all details");
      return false;
    }
    return true;
  };

  const handelSignUp = async () => {
    setLoading(true);
    setButtonDisabled(true);
    if (validateFields()) {
      await UserSignUp({ name, email: userEmail, password: userPassword })
        .then((res) => {
          dispatch(loginSuccess(res.data));
          alert("Registration Successful");
          setLoading(false);
          setButtonDisabled(false);
        })
        .catch((err) => {
          alert(err.response.data.message);
          setLoading(false);
          setButtonDisabled(false);
        });
    }
  };
  return <StyledContainer>
    <div>
        <Title>Welcome To HealthHive 👋</Title>
        <StyledSpan>Please enter your details</StyledSpan>
    </div>
    <div style={{
          display: "flex",
          gap: "20px",
          flexDirection: "column",
        }}>
        <TextInput 
        label="Name" 
        placeholder="Enter your full name" 
        value={name}
        handelChange={(e) => setName(e.target.value)}
        />
        <TextInput 
        label="Email Address" 
        placeholder="Enter your email address" 
        value={userEmail}
        handelChange={(e) => setEmail(e.target.value)}
        />

        <TextInput 
        label="Password" 
        placeholder="Enter your password" 
        value={userPassword}
        handelChange={(e) => setPassword(e.target.value)}
        />

        <Button text="SignUp" 
        onClick={handelSignUp}
        isLoading={loading}
        isDisabled={buttonDisabled}/>
        </div>
  </StyledContainer>
}

export default SignUp