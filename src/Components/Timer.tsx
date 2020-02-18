import React, {useState, useEffect, useContext} from 'react';
import {TouchableOpacity, AppState, Alert} from 'react-native';
import {Button} from '@ui-kitten/components';

import AsyncStorage from '@react-native-community/async-storage';

import styled from 'styled-components/native';
import {ValueTimerContext} from '~/Context/ValueTimerContext';
import {getRemaining, numberWithCommas} from '~/util/index';
import HourlyRateSetModal from '~/Components/HourlyRateSetModal';

interface IMoneyText {
  actType: boolean;
}

export default function Timer() {
  const {
    insertHistory,
    hourlyRate,
    remainingSecs,
    setRemainingSecs,
    isActive,
    setIsActive,
    getTodayAmount,
    isShowGuide,
  } = useContext(ValueTimerContext);

  const [actType, setActType] = useState(true);
  const [hourlyRateModalVisible, setHourlyRateModalVisible] = useState(false);
  const {hours, mins, secs} = getRemaining(remainingSecs);

  const setStartTime = () => {
    AsyncStorage.setItem('startTime', JSON.stringify(new Date().getTime()));
  };

  // const setPauseTime = () => {
  //   AsyncStorage.setItem('pauseDate', JSON.stringify(Date.now()));
  // };

  // const calculatePauseTime = async () => {
  //   const pausedDate = await AsyncStorage.getItem('pauseDate');
  //   const savedTotalPausedMillisecond = await AsyncStorage.getItem(
  //     'totalPausedMillisecond',
  //   );
  //   if (pausedDate) {
  //     let pausedMillisecond = Date.now() - Number(pausedDate);
  //     let totalPausedMillisecond: number = 0;

  //     if (savedTotalPausedMillisecond) {
  //       totalPausedMillisecond +=
  //         Number(savedTotalPausedMillisecond) + pausedMillisecond;
  //     } else {
  //       totalPausedMillisecond += pausedMillisecond;
  //     }

  //     return Math.floor(totalPausedMillisecond / 1000);
  //   } else {
  //     return 0;
  //   }
  // };

  // const resetPauseTime = async () => {
  //   const pausedDate = await AsyncStorage.getItem('pauseDate');
  //   let pausedMillisecond = Date.now() - Number(pausedDate);
  //   let savedTotalPausedMillisecond = await AsyncStorage.getItem(
  //     'totalPausedMillisecond',
  //   );

  //   let totalPausedMillisecond: number;

  //   if (savedTotalPausedMillisecond) {
  //     totalPausedMillisecond =
  //       Number(savedTotalPausedMillisecond) + pausedMillisecond;
  //   } else {
  //     totalPausedMillisecond = pausedMillisecond;
  //   }

  //   AsyncStorage.setItem(
  //     'totalPausedMillisecond',
  //     JSON.stringify(totalPausedMillisecond),
  //   );
  //   AsyncStorage.setItem('pauseDate', '');
  // };

  const changeTimeToMoney = (time: number) => {
    const wagePerSecond = Number((hourlyRate / 3600).toFixed(4));
    return Math.floor(wagePerSecond * time);
  };

  const toggle = () => {
    if (hourlyRateModalVisible) return;

    if (remainingSecs === 0 && isActive === false) {
      setStartTime();
    }
    // if (remainingSecs > 0 && isActive === true) {
    //   setPauseTime();
    // }
    // if (remainingSecs > 0 && isActive === false) {
    //   resetPauseTime();
    // }

    setIsActive(!isActive);

    AsyncStorage.setItem('isActive', JSON.stringify(!isActive));
  };

  const reset = async () => {
    const start_date = await AsyncStorage.getItem('startTime');

    if (start_date && start_date !== '0' && remainingSecs > 0) {
      const log = {
        amount: actType
          ? changeTimeToMoney(remainingSecs)
          : -changeTimeToMoney(remainingSecs),
        currency: '원',
        start_date: Number(start_date),
        end_date: Number(start_date) + remainingSecs * 1000,
        // end_date: `${Date.now()}`,
        hourly_rate: hourlyRate,
        time: remainingSecs,
        title: '',
      };

      await insertHistory(log);
    }

    await setRemainingSecs(0);
    await AsyncStorage.setItem('time', '0');
    await AsyncStorage.setItem('startTime', '0');
    await AsyncStorage.setItem('isActive', 'false');
    // ! 정지 기능 제거함
    // AsyncStorage.setItem('totalPausedMillisecond', '');
    // AsyncStorage.setItem('pauseDate', '');

    await setIsActive(false);
  };

  useEffect(() => {
    let timerId: any = null;

    if (isActive) {
      timerId = setTimeout(() => {
        setRemainingSecs(remainingSecs + 1);
        AsyncStorage.setItem('time', JSON.stringify(remainingSecs + 1));
      }, 1000);
    } else if (!isActive && remainingSecs !== 0) {
      clearTimeout(timerId);
    }
    return () => clearTimeout(timerId);
  }, [isActive, remainingSecs]);

  const money = numberWithCommas(changeTimeToMoney(remainingSecs));

  const textPress = () => {
    if (isActive || remainingSecs > 0) {
      return Alert.alert('타이머를 종료시킨 후에, 시간의 가치를 변경해주세요.');
    }

    setHourlyRateModalVisible(true);
  };

  return (
    <Container>
      <TopDisplayMessage>
        {isShowGuide && (
          <GuideText>👇를 눌러서 값을 변경할 수 있습니다.</GuideText>
        )}
        <HeaderText onPress={textPress}>
          당신의 시간의 가치는{' '}
          <HourlyRateText>{numberWithCommas(hourlyRate)}</HourlyRateText>원
          입니다.
        </HeaderText>
        <TodayTotalAmountText>
          오늘은 {numberWithCommas(getTodayAmount())}원을 획득했습니다.
        </TodayTotalAmountText>
      </TopDisplayMessage>

      {!isActive && (
        <HourlyRateSetModal
          hourlyRateModalVisible={hourlyRateModalVisible}
          setHourlyRateModalVisible={setHourlyRateModalVisible}
        />
      )}

      <MainTimer>
        <AmountType>
          {actType && (
            <Button status="success" onPress={() => setActType(!actType)}>
              창조
            </Button>
          )}
          {!actType && (
            <Button status="danger" onPress={() => setActType(!actType)}>
              소비
            </Button>
          )}
        </AmountType>

        <MoneyText actType={actType}>
          {actType ? '' : '-'}
          {money} 원
        </MoneyText>

        <TimerContainer>
          <TimerText>{hours}</TimerText>
          <ColonText>:</ColonText>
          <TimerText>{mins}</TimerText>
          <ColonText>:</ColonText>
          <TimerText>{secs}</TimerText>
        </TimerContainer>
      </MainTimer>

      <StartButtonContainer>
        {!isActive && (
          <TouchableOpacity>
            <Button onPress={toggle}>시작하기</Button>
          </TouchableOpacity>
        )}
        {isActive && (
          <TouchableOpacity>
            <Button onPress={reset} appearance="outline">
              종료하기
            </Button>
          </TouchableOpacity>
        )}
      </StartButtonContainer>
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;

const ColonText = styled.Text`
  min-width: 50px;
  font-size: 50px;
  text-align: center;
`;

const TimerText = styled.Text`
  min-width: 60px;
  font-size: 50px;
`;

const MoneyText = styled.Text<IMoneyText>`
  font-size: 50px;
  color: ${props => (props.actType ? '#0ca678' : '#f03e3e')};
  margin: auto;
  text-align: right;
  min-width: 100px;
`;

const HeaderText = styled.Text`
  text-align: center;
  font-size: 20px;
`;
const GuideText = styled.Text`
  text-align: center;
  font-size: 18px;
  color: orangered;
`;

const TodayTotalAmountText = styled.Text`
  text-align: center;
  font-size: 15px;
`;

const HourlyRateText = styled.Text`
  bottom: 0px;
  left: 0px;
  right: 0px;
  height: 40%;
  background: rgba(58, 175, 185, 0.2);
`;

const TopDisplayMessage = styled.View`
  flex: 0.5;
  margin-top: 80px;
`;

const AmountType = styled.View`
  align-items: center;
  justify-content: center;
`;

const MainTimer = styled.View`
  flex: 1.5;
`;

const StartButtonContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const TimerContainer = styled.View`
  justify-content: center;
  flex-direction: row;
`;
