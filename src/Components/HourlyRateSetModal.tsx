import React, {useState, useContext, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Layout, Modal, Text, Input} from '@ui-kitten/components';
import {ValueTimerContext} from '~/Context/ValueTimerContext';

type HourlyRateSetModalProps = {
  hourlyRateModalVisible: boolean;
  setHourlyRateModalVisible: (value: boolean) => void;
};

const HourlyRateSetModal = ({
  hourlyRateModalVisible,
  setHourlyRateModalVisible,
}: HourlyRateSetModalProps) => {
  const [visible, setVisible] = useState(false);
  const {hourlyRate, handleHourlyRate} = useContext(ValueTimerContext);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    if (hourlyRateModalVisible && !visible) {
      timerId = setTimeout(() => {
        setVisible(true);
      }, 100);
    }

    return () => clearTimeout(timerId);
  }, [hourlyRateModalVisible]);

  const closeModal = async () => {
    await setVisible(false);
    await setHourlyRateModalVisible(false);
  };

  const renderModalElement = () => (
    <Layout level="3" style={styles.modalContainer}>
      <Text style={styles.header}>시간의 가치를 입력해주세요</Text>
      <Input
        value={String(hourlyRate)}
        status="success"
        onChangeText={handleHourlyRate}
        keyboardType={'numeric'}
        autoFocus
        // onEndEditing={() => setShowRateInput(false)}
        style={{marginLeft: 35, marginRight: 35}}
      />
      <View style={styles.buttonView}>
        <Button onPress={closeModal}>저장</Button>
      </View>
    </Layout>
  );

  return (
    <Layout>
      <Modal
        backdropStyle={styles.backdrop}
        onBackdropPress={closeModal}
        visible={visible}>
        {renderModalElement()}
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
    padding: 10,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonView: {
    margin: 20,
    flexDirection: 'row',
  },
});

export default HourlyRateSetModal;
