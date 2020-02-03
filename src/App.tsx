import React from 'react';
// import styled from 'styled-components/native'; // Styled 대문자일 경우에는 IDE 적용 안 됨;
import Navigator from '~/Components/Navigator';
import {ValueTimerContextProvider} from '~/Context/ValueTimerContext';

interface Props {}

const App: React.FC = ({}: Props) => {
  return (
    <ValueTimerContextProvider>
      <Navigator />
    </ValueTimerContextProvider>
  );
};

export default App;
