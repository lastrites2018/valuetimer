import React from 'react';
// import styled from 'styled-components/native'; // Styled 대문자일 경우에는 IDE 적용 안 됨;

import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {mapping, light as lightTheme} from '@eva-design/eva';
import {EvaIconsPack} from '@ui-kitten/eva-icons';

import Navigator from '~/Components/Navigator';
import {ValueTimerContextProvider} from '~/Context/ValueTimerContext';

interface Props {}

const App: React.FC = ({}: Props) => {
  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={lightTheme}>
        <ValueTimerContextProvider>
          <Navigator />
        </ValueTimerContextProvider>
      </ApplicationProvider>
    </>
  );
};

export default App;
