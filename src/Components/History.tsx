import React, {useContext} from 'react';
import {Text, View, FlatList, StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {ValueTimerContext} from '~/Context/ValueTimerContext';

import {getRemaining, numberWithCommas} from '~/util/index';

import format from 'date-fns/format';
import koLocale from 'date-fns/locale/ko';

const History: React.FC = () => {
  const {history, getTodayAmount} = useContext(ValueTimerContext);

  const sumTotalAmount = () => {
    return history.reduce((acc, cur) => acc + cur.amount, 0);
  };

  const getDayHeader = (item: IHistory, index: number) => {
    const currentData = getDateObj(item.start_date);
    const beforeData = index > 0 && getDateObj(history[index - 1].start_date);

    if (
      index === 0 ||
      (beforeData &&
        (currentData.day !== beforeData.day ||
          currentData.month !== beforeData.month ||
          currentData.year !== beforeData.year))
    ) {
      const currentDataTime = new Date(
        `${currentData.year}/${currentData.month}/${currentData.day}`,
      ).getTime();

      return getDateOnly(currentDataTime);
    }

    return;
  };

  let todayEarned: number = getTodayAmount();
  let todayEarnedType: string = todayEarned >= 0 ? 'positive' : 'negative';

  let totalEarned: number = sumTotalAmount();
  let totalEarnedType: string = totalEarned >= 0 ? 'positive' : 'negative';

  return (
    <Container>
      <Header>하루를 흑자로 만들어보세요.</Header>
      {/* <Header>Timeline</Header> */}
      <Header>
        오늘은 <MoneyText amountType={todayEarnedType}>{todayEarned}</MoneyText>{' '}
        원 획득했습니다.
      </Header>
      <Header>
        지금까지{' '}
        <MoneyText amountType={todayEarnedType}>{totalEarned}</MoneyText> 원
        획득했습니다.
      </Header>

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
        renderItem={({item, index}) => {
          const DayHeader = getDayHeader(item, index);

          const {hours, mins, secs} = getRemaining(item.time);

          let amountType: string = item.amount >= 0 ? 'positive' : 'negative';
          const timeDisplay = displayTime(hours, mins, secs);

          return (
            <FlatListContainer>
              {DayHeader && (
                <>
                  <DayHeaderText>{DayHeader}</DayHeaderText>
                  <ShortBorder />
                </>
              )}

              <View style={styles.listView}>
                <View>
                  <TimeText>
                    {getTimeOnly(item.start_date)}-{getTimeOnly(item.end_date)}
                  </TimeText>
                </View>
                <CenterContainer>
                  <List>{timeDisplay}</List>
                  <List amountType={amountType}>
                    시간당 {numberWithCommas(item.hourly_rate)}
                    {item.currency}
                  </List>
                </CenterContainer>

                <LastContainer>
                  <List amountType={amountType}>
                    {numberWithCommas(item.amount)}
                    {item.currency}
                  </List>
                </LastContainer>
              </View>
            </FlatListContainer>
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

const getTimeOnly = (date: number): string => {
  if (!date) return '';
  return format(new Date(date), 'HH:mm', {locale: koLocale});
};

const getDateOnly = (date: number): string => {
  if (!date) return '';
  return format(new Date(date), 'yyyy-MM-dd', {locale: koLocale});
};

const getDateObj = (date: number) => {
  const day = new Date(date).getDate();
  const month = new Date(date).getMonth() + 1;
  const year = new Date(date).getFullYear();

  return {
    day,
    month,
    year,
  };
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

const DayHeaderText = styled.Text`
  margin-left: 20px;
  margin-top: 10px;
  font-size: 15px;
  font-weight: bold;
  flex: 1;
  margin: 5px auto;
`;

const ShortBorder = styled.View`
  margin: 2px auto;
  width: 50px;
  flex: 1;
  border-bottom-width: 3px;
  border-bottom-color: blanchedalmond;
`;

const TimeText = styled.Text`
  min-width: 90px;
`;

interface IAmountType {
  readonly amountType?: string;
}

const FlatListContainer = styled.View`
  border-bottom-width: 0.8px;
  border-bottom-color: #eee;
`;

const CenterContainer = styled.View`
  min-width: 80px;
  text-align: center;
`;

const MoneyText = styled.Text<IAmountType>`
  color: ${props => {
    if (props.amountType === 'positive') return '#0ca678';
    else if (props.amountType === 'negative') return '#f03e3e';
    else return '#000';
  }};
`;

const List = styled(MoneyText)`
  text-align: right;
`;

const Header = styled(MoneyText)`
  text-align: center;
`;

const LastContainer = styled.View`
  min-width: 50px;
`;

export default History;
