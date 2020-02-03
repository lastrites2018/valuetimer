import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  AppState,
  TextInput,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import AsyncStorage from '@react-native-community/async-storage';

import styled from 'styled-components/native';
import {ValueTimerContext} from '~/Context/ValueTimerContext';

const TimerText = styled.Text`
  font-size: 50px;
  color: brown;
  /* margin-bottom: 10px; */
  /* margin-top: 10px; */
  margin: auto;
  /* align-items: center; */
  text-align: right;
  /* margin-right: 1; */
  /* margin-left: 1; */
  padding-left: 5px;
  padding-right: 5px;
`;

const ButtonStyle = styled.Text`
  font-size: 30px;
`;

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  border: 5px solid green;
  position: relative;
`;

const formatNumber = (number: number) => `0${number}`.slice(-2);

const getRemaining = (time: number) => {
  console.log('time: ', time);
  const hours = Math.floor(time / 3600);
  console.log('hours: ', hours);
  const leftTime = time - 3600 * hours;
  console.log('leftTime: ', leftTime);

  const mins = Math.floor(leftTime / 60);
  // const mins = Math.floor(time / 60);
  const secs = leftTime - mins * 60;
  console.log('secs: ', secs);
  // const secs = time - mins * 60;
  return {
    hours: formatNumber(hours),
    mins: formatNumber(mins),
    secs: formatNumber(secs),
  };
};

function numberWithCommas(number: string | number) {
  const commaAddedNumber = number.toString().split('.');
  commaAddedNumber[0] = commaAddedNumber[0].replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ',',
  );
  return commaAddedNumber.join('.');
}

const changeTimeToMoney = (time: number) => {
  const 시급 = 8500;
  const 초당시급 = Number((시급 / 3600).toFixed(4));
  // const 초당시급 = Math.floor(시급 / 3600);
  // return (초당시급 * time).toFixed(1);
  return Math.floor(초당시급 * time);
};

export default function Timer() {
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hourlyRate, setHourlyRate] = useState(8590);
  const [showRateInput, setShowRateInput] = useState(false);
  const {insertHistory} = useContext(ValueTimerContext);

  const {hours, mins, secs} = getRemaining(remainingSecs);
  const money = numberWithCommas(changeTimeToMoney(remainingSecs));

  const initHourlyRate = async () => {
    const currentHourlyRate = await AsyncStorage.getItem('hourlyRate');

    if (currentHourlyRate) {
      setHourlyRate(Number(currentHourlyRate));
    } else {
      await AsyncStorage.setItem('hourlyRate', JSON.stringify(hourlyRate));
    }
  };

  useEffect(() => {
    initHourlyRate();
  }, [hourlyRate]);

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

  const toggle = () => {
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

  const reset = () => {
    setRemainingSecs(0);
    AsyncStorage.setItem('time', '0');
    AsyncStorage.setItem('startTime', '0');
    AsyncStorage.setItem('isActive', 'false');
    // ! 정지 기능 제거함
    // AsyncStorage.setItem('totalPausedMillisecond', '');
    // AsyncStorage.setItem('pauseDate', '');

    if (remainingSecs > 0) {
      const example = {
        amount: 9000,
        currency: '$',
        date: '2019년 언제',
        hourly_rate: 4000,
        id: 1,
        time: 20,
        title: 'aaa',
      };

      // 시작일부터 종료일 추가하기
      const realData = {
        amount: changeTimeToMoney(remainingSecs),
        currency: '원',
        date: `${Date.now()}`,
        hourly_rate: 4000, // TODO 변수화 해야 하
        time: remainingSecs,
        title: '',
      };

      insertHistory(realData);
    }

    setIsActive(false);
  };

  useEffect(() => {
    let intervalId: number = 0;
    let timerId = null;

    if (isActive) {
      if (Platform.OS === 'ios') {
        BackgroundTimer.start();
      }

      intervalId = BackgroundTimer.setTimeout(() => {
        setRemainingSecs(remainingSecs => remainingSecs + 1);
        AsyncStorage.setItem('time', JSON.stringify(remainingSecs + 1));
      }, 1000);
    } else if (!isActive && remainingSecs !== 0) {
      BackgroundTimer.clearTimeout(intervalId);
    }
    return () => BackgroundTimer.clearTimeout(intervalId);
    // return () => BackgroundTimer.stopBackgroundTimer();
  }, [isActive, remainingSecs]);

  const handleHourlyRate = (value: string) => {
    console.log('value: ', value);

    if (Number(value) > 0) setHourlyRate(Number(value));
  };

  return (
    <Container>
      <View style={{flex: 1, height: 50, marginTop: 100}}>
        {/* <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}> */}
        {/* 생산적인 일이냐, 마이너스적인 일이냐에 따라  */}
        {/* <Text
          style={{
            textAlign: 'center',
            fontSize: 25,
            // position: 'absolute',
          }}>
          오늘 1000원을 벌었습니다.
        </Text> */}

        <Text
          style={{
            textAlign: 'center',
            fontSize: 25,
            // position: 'absolute',
          }}
          onPress={() => setShowRateInput(true)}>
          현재 시급은 {hourlyRate}원 입니다.
        </Text>
      </View>

      {/* <View> */}
      <View style={{flex: 2, marginTop: 100}}>
        <TimerText>{money} 원</TimerText>
        <TimerText>{`${hours} : ${mins} : ${secs}`}</TimerText>
      </View>
      <View
        style={{
          // marginTop: 20,
          flex: 3,
          margin: 'auto',
          flexDirection: 'row',
          alignContent: 'center',
          justifyContent: 'space-between',
          // padding: 30,
          // border: '30x solid',
          borderColor: '#f30',
          borderTopColor: '#f30',
          borderStyle: 'solid',
          // pnew Date().getTime()sition: 'absolute',
        }}>
        {!isActive && (
          <TouchableOpacity onPress={toggle} style={{marginRight: 100}}>
            <ButtonStyle>{!isActive && 'Start'}</ButtonStyle>
            {/* <ButtonStyle>{isActive ? 'Pause' : 'Start'}</ButtonStyle> */}
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={reset}>
          <ButtonStyle>Reset</ButtonStyle>
        </TouchableOpacity>
      </View>
    </Container>
  );
  // return <Text style={styles.timerText}>{`${mins}:${secs}`}</Text>
}
