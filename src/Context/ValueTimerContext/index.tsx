import React, {createContext, useState, useEffect} from 'react';
import {Platform, AppState, Alert} from 'react-native';

import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-community/async-storage';
import SplashScreen from 'react-native-splash-screen';

interface Props {
  children: JSX.Element | Array<JSX.Element>;
}

interface IValueTimerContext {
  history: Array<IHistory>;
  getHistory: () => void;
  insertHistory: (data: IHistory) => void;
  hourlyRate: number;
  setHourlyRate: (value: number) => void;
  remainingSecs: number;
  setRemainingSecs: (value: number) => void;
  handleHourlyRate: (value: string) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  getTodayAmount: () => number;
  isShowGuide: boolean;
  appState: any;
  setAppState: (value: any) => void;
}

const ValueTimerContext = createContext<IValueTimerContext>({
  history: [],
  getHistory: (): void => {},
  insertHistory: (data: IHistory): void => {},
  hourlyRate: 0,
  setHourlyRate: (value: number) => {},
  remainingSecs: 0,
  setRemainingSecs: (value: number) => {},
  handleHourlyRate: (value: string) => {},
  isActive: false,
  setIsActive: () => {},
  getTodayAmount: (): number => 0,
  isShowGuide: false,
  appState: AppState.currentState,
  setAppState: () => {},
});

const ValueTimerContextProvider = ({children}: Props) => {
  const [db, setDB] = useState<any>('');
  const [history, setHistory] = useState<Array<IHistory>>([]);
  const [hourlyRate, setHourlyRate] = useState(8590);
  const [count, setCount] = useState(0);
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isShowGuide, setIsShowGuide] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  async function initHourlyRate() {
    const currentHourlyRate = await AsyncStorage.getItem('hourlyRate');

    if (currentHourlyRate) {
      setHourlyRate(Number(currentHourlyRate));
    } else {
      await AsyncStorage.setItem('hourlyRate', JSON.stringify(hourlyRate));
    }
  }

  async function checkGuide() {
    const appLaunchCount = await AsyncStorage.getItem('appLaunchCount');
    const isUserHaveChangeHourlyRateExperience = await AsyncStorage.getItem(
      'isUserHaveChangeHourlyRateExperience',
    );

    const count = appLaunchCount ? parseInt(appLaunchCount) : 0;

    if (count < 3 && !isUserHaveChangeHourlyRateExperience) {
      setIsShowGuide(true);
    }

    await AsyncStorage.setItem('appLaunchCount', `${count + 1}`);
  }

  useEffect(() => {
    initHourlyRate();
  }, []);

  const handleAppStateChange = nextAppState => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
    }

    setAppState(nextAppState);
  };

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => AppState.removeEventListener('change', handleAppStateChange);
  }, []);

  useEffect(() => {
    const checkData = async () => {
      try {
        const startTime = await AsyncStorage.getItem('startTime');
        const checkActive = await AsyncStorage.getItem('isActive');
        console.log('checktime run!');

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

    appState === 'active' && checkData();
  }, [appState]);

  useEffect(() => {
    checkGuide();
  }, []);

  useEffect(() => {
    const connectDB = async () => {
      const database = await SQLite.openDatabase(
        {
          name: 'valuetimerDB',
          location: Platform.OS === 'ios' ? 'Library' : 'default',
          createFromLocation: '~www/valuetimerDB.db',
          // createFromLocation:
          //   Platform.OS === 'ios'
          //     ? '~www/valuetimerDB.db'
          // : '../../android/app/src/main/assets/www/valuetimerDB.db',
        },
        () => {
          console.log('sql db connect success');
          SplashScreen.hide();
          setDB(database);
        },
        error => {
          console.log('error', error);
          SplashScreen.hide();
        },
      );
    };
    connectDB();
  }, []);

  useEffect(() => {
    db &&
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM history;', [], (tx, results) => {
          const rows = results.rows;
          let data = [];

          for (let i = 0; i < rows.length; i++) {
            data.push({
              ...rows.item(i),
            });
          }

          setHistory(data.reverse());
        });
      });
  }, [db, count]);

  const getHistory = () => {
    return history;
  };

  const insertHistory = async data => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO history (id, title, start_date, end_date, time, hourly_rate, currency, amount) values ( ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          null,
          `${data.title}`,
          `${data.start_date}`,
          `${data.end_date}`,
          `${data.time}`,
          `${data.hourly_rate}`,
          `${data.currency}`,
          `${data.amount}`,
        ],
        (tx, results) => {
          console.log('insert success');

          setCount(count + 1);
        },
      );
    });
  };

  const handleHourlyRate = (value: string) => {
    if (remainingSecs > 0) {
      return Alert.alert('타이머가 작동중엔 변경할 수 없습니다.');
    }
    const numberValue: number = Number(value);

    if (numberValue >= 0) {
      setHourlyRate(numberValue);
      AsyncStorage.setItem('hourlyRate', JSON.stringify(numberValue));
      AsyncStorage.setItem('isUserHaveChangeHourlyRateExperience', `true`);
      isShowGuide && setIsShowGuide(false);
    }

    // if (!numberValue) setHourlyRate(0);
  };

  const getTodayAmount = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const todayWithoutTime = new Date(`${year}/${month}/${day}`).getTime();

    return history
      .filter(item => item.end_date >= todayWithoutTime)
      .reduce((acc, cur) => acc + cur.amount, 0);
  };

  return (
    <ValueTimerContext.Provider
      value={{
        history,
        getHistory,
        insertHistory,
        hourlyRate,
        setHourlyRate,
        remainingSecs,
        setRemainingSecs,
        handleHourlyRate,
        isActive,
        setIsActive,
        getTodayAmount,
        isShowGuide,
        appState,
        setAppState,
      }}>
      {children}
    </ValueTimerContext.Provider>
  );
};

export {ValueTimerContext, ValueTimerContextProvider};
