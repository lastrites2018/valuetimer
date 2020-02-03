import React, {createContext, useState, useEffect} from 'react';
import {Platform} from 'react-native';

import SQLite from 'react-native-sqlite-storage';

interface Props {
  children: JSX.Element | Array<JSX.Element>;
}

interface IHistory {
  id: number;
  title?: string;
}

interface IValueTimerContext {
  history: Array<IHistory>;
  getHistory: () => void;
  insertHistory: (data) => void;
  // removeTodoList: (index: number) => void;
}

const ValueTimerContext = createContext<IValueTimerContext>({
  history: [],
  getHistory: (): void => {},
  insertHistory: (data): void => {},
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
          console.log('db 접속 성공???d!!!!!');
        },
        error => {
          console.log('error', error);
        },
      );

      console.log('database:?? ', database);
      await setDB(database);
    };
    connectDB();
  }, []);

  useEffect(() => {
    db &&
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM history;', [], (tx, results) => {
          const rows = results.rows;
          console.log('rows: ', rows);
          let data = [];

          for (let i = 0; i < rows.length; i++) {
            data.push({
              ...rows.item(i),
            });
          }

          console.log('data:context ', data);
          setHistory(data);
        });
      });
  }, [db, count]);

  const getHistory = () => {
    return history;
  };

  const insertHistory = async data => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO history (id, title, date, time, hourly_rate, currency, amount) values ( ?, ?, ?, ?, ?, ?, ?)',
        [
          null,
          `${data.title}`,
          `${data.date}`,
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
