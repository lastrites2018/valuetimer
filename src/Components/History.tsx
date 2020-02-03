import React, {useState, useEffect, useContext} from 'react';
import {StyleSheet, Text, View, Platform, FlatList} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import styled from 'styled-components/native';
import {ValueTimerContext} from '~/Context/ValueTimerContext';

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const List = styled.Text`
  color: darkcyan;
`;

interface IHistory {
  id: number;
  title?: string;
}

const History: React.FC = () => {
  const {history, getHistory} = useContext(ValueTimerContext);

  return (
    <Container>
      {/* 총 벌어들인 수입 : , 재정 상황 적자 */}
      <View>
        <FlatList
          style={{marginTop: 200}}
          data={history.reverse()} // todo
          renderItem={({item}) => (
            <View style={{marginBottom: 10}}>
              <List>
                아이디 {item.id} 타이틀 {item.title}
              </List>
              <List>{item.time}초</List>
              <List>
                {item.amount}
                {item.currency}
              </List>
            </View>
          )}
        />
      </View>
    </Container>
  );
};

export default History;
