import React, {useState, useEffect, useContext} from 'react';
import {StyleSheet, Text, View, Platform, FlatList} from 'react-native';
import styled from 'styled-components/native';
import {ValueTimerContext} from '~/Context/ValueTimerContext';

import {getRemaining, numberWithCommas} from '~/util/index';

const Container = styled.View`
  /* flex: 1; */
  align-items: center;
  justify-content: center;
  /* align-items: flex-end; */
`;

const List = styled.Text`
  color: darkcyan;
`;

const History: React.FC = () => {
  const {history, getHistory} = useContext(ValueTimerContext);
  console.log('history: ', history);

  return (
    <View style={{flex: 1}}>
      {/* 총 벌어들인 수입 : , 재정 상황 적자 */}
      {history.length === 0 && (
        <View
          style={{
            flex: 1,
            // marginTop: 150,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Text style={{fontSize: 30}}>아직 데이터가 없습니다.</Text>
        </View>
      )}
      <FlatList
        style={{marginTop: 200}}
        data={history}
        renderItem={({item}) => {
          console.log('item: ', item);
          const {hours, mins, secs} = getRemaining(item.time);

          return (
            <View
              style={{
                flex: 1,
                marginBottom: 10,
                margin: 20,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <View>
                <List>{new Date(item.start_date).toLocaleString('ko-KR')}</List>
                <List>{new Date(item.end_date).toLocaleString('ko-KR')}</List>
              </View>
              <View>
                <List>
                  {hours !== '00' && `${hours}:`}
                  {mins}:{secs}
                </List>
                <View>
                  <Text>
                    시간당 {numberWithCommas(item.hourly_rate)}
                    {item.currency}
                  </Text>
                </View>
              </View>

              <Text>
                {item.amount}
                {item.currency}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
};

export default History;
