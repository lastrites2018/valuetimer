import React, {createContext, useState, useEffect} from 'react';
import {Platform} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

interface Props {
  children: JSX.Element | Array<JSX.Element>;
}

interface IHistory {
  id: number;
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
}

const ValueTimerContext = createContext<IValueTimerContext>({
  history: [],
  getHistory: (): void => {},
  insertHistory: (data: IHistory): void => {},
});

const ValueTimerContextProvider = ({children}: Props) => {
  const [db, setDB] = useState<any>('');
  const [count, setCount] = useState<any>(0);
  const [history, setHistory] = useState<Array<IHistory>>([]);

  useEffect(() => {
    const connectDB = async () => {
      const database = await SQLite.openDatabase(
        {
          name: 'valuetimerDB',
          location: Platform.OS === 'ios' ? 'Library' : 'default',
          createFromLocation:
            Platform.OS === 'ios'
              ? '~www/valuetimerDB.db'
              : '../../android/app/src/main/assets/www/valuetimerDB.db',
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
          console.log('results: ', results);
        },
      );
    });
    await setCount(count + 1);
  };
  return (
    <ValueTimerContext.Provider value={{history, getHistory, insertHistory}}>
      {children}
    </ValueTimerContext.Provider>
  );
};

export {ValueTimerContext, ValueTimerContextProvider};
