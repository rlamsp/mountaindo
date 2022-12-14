import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import ResultMap from './ResultMap';
import Share from 'react-native-share';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCloud,
  faCloudRain,
  faSnowflake,
  faSun,
  faWind,
} from '@fortawesome/free-solid-svg-icons';

import AppText from '../AppText';
import AppTextBold from '../AppTextBold';
import ShareModal from './ShareModal';

type Props = {
  timer: any;
  coords: any;
  totalDist: any;
  totalHigh: any;
  today: any;
  trailName: string;
  currentWeather: any;
  moveToTrackingEnd: any;
};

function TrackingEnd({
  timer,
  coords,
  totalDist,
  totalHigh,
  today,
  trailName,
  currentWeather,
  moveToTrackingEnd,
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const captureRef = useRef<any>(); // 캡쳐할 영역의 값을 가져오기 위한 ref
  const captureResultRef = useRef<any>();

  // 지정된 영역 캡쳐해서 uri 생성
  const getPhotoUri = async (): Promise<string> => {
    const uri = await captureRef.current.capture();
    return uri;
  };

  const getResultPhotoUri = async (): Promise<string> => {
    const uri = await captureResultRef.current.capture();
    return uri;
  };

  // sns로 공유하는 함수
  const onCapture = async (social: any) => {
    try {
      const uri = await getResultPhotoUri();

      const options = {
        title: '등산 기록',
        message: `등산 시간: ${timer}, 총 거리: ${totalDist}, 총 고도: ${totalHigh}`,
        url: uri,
        type: 'image/jpeg',
      };

      // 소셜 타입 미지정 or 지정
      if (social === null) {
        const result = await Share.open(options);
        if (result.dismissedAction) {
          Alert.alert('공유 실패', '사진을 공유하는데 실패했습니다.');
        }
      } else {
        const result = await Share.shareSingle({
          ...options,
          social,
        });
      }
    } catch (e) {
      console.error('error', e);
    }
  };

  // 이미지를 저장하는 함수
  const onSave = async () => {
    const uri = await getResultPhotoUri();
    const result = await CameraRoll.save(uri);
    Alert.alert('이미지 저장', '갤러리에 이미지가 저장되었습니다. ');
  };

  const getImageFile = async () => {
    const uri = await getPhotoUri();

    return uri;
  };

  useEffect(() => {
    setModalVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      <ViewShot ref={captureResultRef} options={{format: 'jpg', quality: 0.9}}>
        <View style={styles.viewShotContainer}>
          <ViewShot ref={captureRef} options={{format: 'jpg', quality: 0.9}}>
            <View style={styles.mapContainer}>
              <ResultMap coords={coords} />
            </View>
          </ViewShot>
          <View style={styles.textLabelGroup}>
            <View style={styles.iconGroup}>
              {currentWeather === '눈' ? (
                <FontAwesomeIcon
                  icon={faSnowflake}
                  size={15}
                  color={'skyblue'}
                  style={styles.weatherIcon}
                />
              ) : currentWeather === '흐림' ? (
                <FontAwesomeIcon
                  icon={faCloud}
                  size={15}
                  color={'grey'}
                  style={styles.weatherIcon}
                />
              ) : currentWeather === '비' ? (
                <FontAwesomeIcon
                  icon={faCloudRain}
                  size={15}
                  color={'skyblue'}
                  style={styles.weatherIcon}
                />
              ) : currentWeather === '바람' ? (
                <FontAwesomeIcon
                  icon={faWind}
                  size={15}
                  color={'skyblue'}
                  style={styles.weatherIcon}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faSun}
                  size={15}
                  color={'#FFCC29'}
                  style={styles.weatherIcon}
                />
              )}
              <AppTextBold style={styles.trailText}>{trailName}</AppTextBold>
            </View>
            <View>
              <AppTextBold style={styles.todayText}>{today}</AppTextBold>
            </View>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.textGroup}>
              <AppTextBold style={styles.resultText}>{timer}</AppTextBold>
              <AppText style={styles.text}>소요시간</AppText>
            </View>
            <View style={styles.textGroup}>
              <AppTextBold style={styles.resultText}>
                {totalDist} km
              </AppTextBold>
              <AppText style={styles.text}>총 거리</AppText>
            </View>
            <View style={styles.textGroup}>
              <AppTextBold style={styles.resultText}>{totalHigh} m</AppTextBold>
              <AppText style={styles.text}>총 고도</AppText>
            </View>
          </View>
        </View>
      </ViewShot>
      <View style={styles.shareButtonView}>
        <Pressable
          style={styles.shareButton}
          onPress={() => {
            setModalVisible(!modalVisible);
          }}>
          <AppTextBold style={styles.shareButtonText}>
            기록 저장하기
          </AppTextBold>
        </Pressable>
      </View>
      {modalVisible && (
        <ShareModal
          moveToTrackingEnd={moveToTrackingEnd}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onCapture={onCapture}
          onSave={onSave}
          imageFile={getImageFile()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: Dimensions.get('window').height,
  },
  mapContainer: {
    width: Dimensions.get('window').width,
    height: 200,
  },
  textContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  textLabelGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: 10,
    backgroundColor: 'white',
  },
  textGroup: {
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
  },
  weatherIcon: {
    marginBottom: 5,
  },
  trailText: {
    fontSize: 15,
    marginLeft: 5,
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayText: {
    fontSize: 15,
  },
  resultText: {
    fontSize: 16,
    marginVertical: 5,
  },
  shareButtonView: {
    alignItems: 'center',
    marginTop: 50,
  },
  shareButton: {
    width: 300,
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    backgroundColor: '#57d696',
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
  },
  viewShotContainer: {
    backgroundColor: 'white',
  },
});
export default TrackingEnd;
