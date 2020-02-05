import React, {useState, useEffect, useContext} from 'react';
import {StyleSheet, Text, View, Platform, FlatList} from 'react-native';
import styled from 'styled-components/native';
import {ValueTimerContext} from '~/Context/ValueTimerContext';

import {getRemaining, numberWithCommas} from '~/util/index';

const History: React.FC = () => {
  const {history} = useContext(ValueTimerContext);

  return (
    <Container>
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
          const {hours, mins, secs} = getRemaining(item.time);

          const DisplayTime = () => {
            let displaySecond: string = secs;
            if (secs[0] === '0') {
              displaySecond = secs.slice(1);
            }

            if (hours !== '00') {
              return `${hours}시간 ${mins}분 ${displaySecond}초`;
            } else if (hours === '00' && mins !== '00') {
              return `${mins}분 ${displaySecond}초`;
            } else {
              return `${displaySecond}초`;
            }
          };

          let amountType: string = item.amount >= 0 ? 'positive' : 'negative';

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
                <List amountType={amountType}>
                  {new Date(item.start_date).toLocaleString('ko-KR')}
                </List>
                <List amountType={amountType}>
                  {new Date(item.end_date).toLocaleString('ko-KR')}
                </List>
              </View>
              <View>
                <List amountType={amountType}>{DisplayTime()}</List>
                <View>
                  <List amountType={amountType}>
                    시간당 {numberWithCommas(item.hourly_rate)}
                    {item.currency}
                  </List>
                </View>
              </View>

              <List amountType={amountType}>
                {numberWithCommas(item.amount)}
                {item.currency}
              </List>
            </View>
          );
        }}
      />
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
`;

interface IAmountType {
  readonly amountType?: string;
}

const List = styled.Text<IAmountType>`
  color: ${props => {
    if (props.amountType === 'positive') return '#0ca678';
    else if (props.amountType === 'negative') return '#f03e3e';
    else return '#000';
  }};
`;

export default History;
