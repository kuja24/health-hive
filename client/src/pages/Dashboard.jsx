import styled from 'styled-components'
import React, { useState, useEffect } from 'react'
import {counts} from "../utils/data"
import CountsCard from '../components/cards/CountsCard';
import WeeklyStat from '../components/cards/WeeklyStat';
import CategoryChart from '../components/cards/CategoryChart';
import AddWorkout from '../components/AddWorkout';
import WorkoutCard from '../components/cards/WorkoutCard';
import { addNewWorkout, fetchDashboardData, fetchWorkoutsByDate } from "../api";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
`;
const Wrapper = styled.div`
  flex: 1;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Title = styled.div`
  padding: 0px 16px;
  font-size: 22px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 500;
`;
const FlexWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 22px;
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Section = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 16px;
  gap: 22px;
  padding: 0px 16px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 100px;
  @media (max-width: 600px) {
    gap: 12px;
  }
`;
const Dashboard = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    const [buttonLoading, setButtonLoading] = useState(false);
    const [todaysWorkouts, setTodaysWorkouts] = useState([]);
    const [workout, setWorkout] = useState(`#Legs
  -Back Squat
  -5 setsX15 reps
  -30 kg
  -10 min
  -300 cal`);
  
    const getDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem("healthhive-token");
      await fetchDashboardData(token).then((res) => {
        setData(res.data);
        console.log(res.data);
        setLoading(false);
      });
    };
    const getTodaysWorkoutByDate = async () => {
      setLoading(true);
      const token = localStorage.getItem("healthhive-token");
      await fetchWorkoutsByDate(token, "").then((res) => {
        setTodaysWorkouts(res?.data?.todaysWorkouts);
        console.log(res.data);
        setLoading(false);
      });
    };
  
    const handleAddNewWorkout = async () => {
      setButtonLoading(true);
      const token = localStorage.getItem("healthhive-token");
      await addNewWorkout(token, { workoutString: workout })
        .then((res) => {
          getDashboardData();
          getTodaysWorkoutByDate();
          setButtonLoading(false);
        })
        .catch((err) => {
          alert(err);
        });
    };
  
    useEffect(() => {
      getDashboardData();
      getTodaysWorkoutByDate();
    }, []);
  return <Container>
    <Wrapper>
        <Title>Dashboard</Title>
        <FlexWrap>
            {counts.map((item) => (
                <CountsCard item={item} data={data} />
            ))}
        </FlexWrap>
        <FlexWrap>
            <WeeklyStat data={data} />
            <CategoryChart data={data} />
            <AddWorkout workout={workout} setWorkout={setWorkout}
            addNewWorkout={handleAddNewWorkout}
            buttonLoading={buttonLoading}
            />
        </FlexWrap>
        <Section>
          <Title>Today's workout</Title>
          <CardWrapper>
          {todaysWorkouts.map((workout) => (
              <WorkoutCard workout={workout} />
            ))}
          </CardWrapper>
        </Section>
    </Wrapper>
  </Container>
}

export default Dashboard