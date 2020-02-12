import React, {useState, useEffect, useContext} from 'react';
import {
  // View,
  // Text,
  TouchableOpacity,
  AppState,
  // ScrollView,
} from 'react-native';
import {Button} from '@ui-kitten/components';

import AsyncStorage from '@react-native-community/async-storage';

import styled from 'styled-components/native';
import {ValueTimerContext} from '~/Context/ValueTimerContext';
import {getRemaining, numberWithCommas} from '~/util/index';
import HourlyRateSetModal from '~/Components/HourlyRateSetModal';

export default function Timer() {
  const {
    insertHistory,
    hourlyRate,
    remainingSecs,
    setRemainingSecs,
    isActive,
    setIsActive,
    getTodayAmount,
  } = useContext(ValueTimerContext);

  const [actType, setActType] = useState(true);
  const [hourlyRateModalVisible, setHourlyRateModalVisible] = useState(false);

  const {hours, mins, secs} = getRemaining(remainingSecs);

  useEffect(() => {
    const checkData = async () => {
      try {
        const startTime = await AsyncStorage.getItem('startTime');
        const checkActive = await AsyncStorage.getItem('isActive');

        if (startTime !== null && startTime !== '0') {
          const parsedTime: number = JSON.parse(startTime);

          // const pausedTime: number = await calculatePauseTime();

          const totalSec: number = Math.round((Date.now() - parsedTime) / 1000);
          // let totalSec: number =
          //   Math.round((Date.now() - parsedTime) / 1000) - pausedTime;

          await setRemainingSecs(totalSec);
        }
        if (checkActive === 'true') {
          setIsActive(true);
        }
      } catch (e) {
        console.log(e);
      }
    };

    checkData();
  }, [AppState.currentState]);

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

      insertHistory(log);
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
      return alert('타이머를 종료시킨 후에, 시간의 가치를 변경해주세요.');
    }

    setHourlyRateModalVisible(true);
  };

  return (
    <Container>
      <TopDisplayMessage>
        <HeaderText onPress={textPress}>
          당신의 시간의 가치는 <HourlyRateText>{hourlyRate}</HourlyRateText>원
          입니다.
        </HeaderText>
        <TodayTotalAmountText>
          오늘은 {getTodayAmount()}원을 획득했습니다.
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

        <TimerText>
          {actType ? '' : '-'}
          {money} 원
        </TimerText>
        <TimerText>{`${hours} : ${mins} : ${secs}`}</TimerText>
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

const TimerText = styled.Text`
  font-size: 50px;
  color: #0ca678;
  margin: auto;
  text-align: right;
  padding-left: 5px;
  padding-right: 5px;
`;

const HeaderText = styled.Text`
  text-align: center;
  font-size: 20px;
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
