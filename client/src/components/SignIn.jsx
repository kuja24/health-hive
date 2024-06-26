import React, { useState } from 'react';
import styled from 'styled-components';
import TextInput from "./TextInput";
import Button from "./Button";
import { UserSignIn } from "../api";
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
const Span = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: ${({ theme }) => theme.text_secondary + 90};
`;

const SignIn = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateFields = () => {
    if (!email || !password) {
      alert("Please enter all details");
      return false;
    }
    return true;
  };

  const handelSignIn = async () => {
    setLoading(true);
    setButtonDisabled(true);
    if (validateFields()) {
      await UserSignIn({ email, password })
        .then((res) => {
          dispatch(loginSuccess(res.data));
          alert("Login Success");
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
        <Title>Unlock your Fitness Journey! 🏋️‍♂️ </Title>
        <Title>Welcome To HealthHive </Title>
        <Span>Please login with your email & password</Span>
    </div>
    <div style={{
        display: "flex",
        gap: "20px",
        flexDirection: "column",
      }}>
        <TextInput 
        label="Email Address" 
        placeholder="Enter your email address" 
        value={email}
        handelChange={(e) => setEmail(e.target.value)}
        />

        <TextInput 
        label="Password" 
        placeholder="Enter your password" 
        value={password}
        handelChange={(e) => setPassword(e.target.value)}
        />

        <Button text="SignIn" 
        onClick={handelSignIn}
        isLoading={loading}
        isDisabled={buttonDisabled}
        />
    </div>
  </StyledContainer>
}

export default SignIn