import React, {createContext, useState, useEffect} from 'react';
import {Platform} from 'react-native';

import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-community/async-storage';

interface Props {
  children: JSX.Element | Array<JSX.Element>;
}

interface IHistory {
  id?: number;
  title: string;
  time: number;
  amount: number;
  currency: string;
  hourly_rate: number;
  start_date: number;
  end_date: number;
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
});

const ValueTimerContextProvider = ({children}: Props) => {
  const [db, setDB] = useState<any>('');
  const [history, setHistory] = useState<Array<IHistory>>([]);
  const [hourlyRate, setHourlyRate] = useState(8590);
  const [count, setCount] = useState(0);
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [isActive, setIsActive] = useState(false);

  async function initHourlyRate() {
    const currentHourlyRate = await AsyncStorage.getItem('hourlyRate');

    if (currentHourlyRate) {
      setHourlyRate(Number(currentHourlyRate));
    } else {
      await AsyncStorage.setItem('hourlyRate', JSON.stringify(hourlyRate));
    }
  }

  useEffect(() => {
    initHourlyRate();
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
        },
        error => {
          console.log('error', error);
        },
      );

      await setDB(database);
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
      return alert('타이머가 작동중엔 변경할 수 없습니다.');
    }
    const numberValue: number = Number(value);

    if (numberValue >= 0) {
      setHourlyRate(numberValue);
      AsyncStorage.setItem('hourlyRate', JSON.stringify(numberValue));
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
      }}>
      {children}
    </ValueTimerContext.Provider>
  );
};

export {ValueTimerContext, ValueTimerContextProvider};
