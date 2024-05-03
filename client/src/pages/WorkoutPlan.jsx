import React from 'react'
import styled from 'styled-components'
import im from "../utils/Images/WorkoutPlan.png"
const Container = styled.div`
width: '100vw',
height: '100vh',
overflow: 'auto'
`;

const Image = styled.img`
backgroundSize: 'contain',
backgroundRepeat: 'no-repeat',
backgroundPosition: 'center',
width: '100%', // Ensure the image container fills the entire viewport
height: '100%', // Ensure the image container fills the entire viewport
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
`;


const WorkoutPlan = () => {
  return (
    <Container>
    
        <Image src={im} />
    
    </Container>
  )
}

export default WorkoutPlan