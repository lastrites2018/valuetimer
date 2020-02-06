import React, {useContext} from 'react';
import {Text, View, FlatList, StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {ValueTimerContext} from '~/Context/ValueTimerContext';

import {getRemaining, numberWithCommas} from '~/util/index';

import format from 'date-fns/format';
import koLocale from 'date-fns/locale/ko';

const History: React.FC = () => {
  const {history} = useContext(ValueTimerContext);

  const sumAmount = () => {
    return history.reduce((acc, cur) => acc + cur.amount, 0);
  };

  const todaySumAmount = () => {
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
    <Container>
      <Header>하루를 흑자로 만들어보세요.</Header>
      {/* <Header>Timeline</Header> */}
      <Header>오늘은 {todaySumAmount()}원 획득했습니다.</Header>
      <Header>지금까지 {sumAmount()}원 획득했습니다.</Header>

      {history.length === 0 && (
        <NoData>
          <Text style={{fontSize: 30}}>아직 데이터가 없습니다.</Text>
        </NoData>
      )}
      <FlatList
        data={history}
        keyExtractor={item => {
          return `historyList-${item.id}`;
        }}
        renderItem={({item}) => {
          const {hours, mins, secs} = getRemaining(item.time);

          let amountType: string = item.amount >= 0 ? 'positive' : 'negative';
          const timeDisplay = displayTime(hours, mins, secs);

          return (
            <View style={styles.listView}>
              <View>
                <Text>{dateOnly(item.start_date)}</Text>
                <Text>{dateOnly(item.end_date)}</Text>
              </View>
              <View>
                <Text>{timeDisplay}</Text>
                <List amountType={amountType}>
                  시간당 {numberWithCommas(item.hourly_rate)}
                  {item.currency}
                </List>
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

const styles = StyleSheet.create({
  listView: {
    flex: 1,
    margin: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const Container = styled.View`
  flex: 1;
  margin-top: 50px;
`;

const NoData = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

const dateOnly = (date: number): string => {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd HH:mm:ss', {locale: koLocale});
};

const displayTime = (hours: string, mins: string, secs: string) => {
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

const Header = styled.Text`
  text-align: center;
`;

export default History;
