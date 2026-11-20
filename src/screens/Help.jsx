import { Page, BackLink } from '../components/Shell.jsx';
import Icon from '../components/Icon.jsx';

export default function Help() {
  return (
    <Page frog={false}>
      <BackLink label="뒤로" />
      <div className="col gap-4">
        <h1 className="h1">혼자 하긴 무섭죠</h1>
        <span className="note">그럴 땐 불러요. 식물도 병원에 가요.</span>
      </div>
      <div className="clinic col gap-8">
        <span className="note">공공 서비스로 운영하는 식물 병원</span>
        <span className="title-m">서울시 반려식물 클리닉</span>
        <span className="note">전문가가 진단하고 분갈이와 약제 처방을 도와줘요. 서울시 공공서비스예약에서 신청해요.</span>
        <a className="btn lime" href="https://yeyak.seoul.go.kr/" target="_blank" rel="noreferrer">예약하러 가기</a>
      </div>
      <div className="card col gap-8">
        <span className="title-s">가기 전에 챙겨요</span>
        <ul className="tips">
          <li>아픈 곳이 보이는 사진 두세 장</li>
          <li>마지막으로 물 준 날과 화분 놓인 자리</li>
          <li>서울 밖이라면 가까운 화원이나 농업기술센터에 물어봐요</li>
        </ul>
      </div>
      <div className="row gap-12 help-note">
        <Icon name="sos" size={22} color="var(--gray)" />
        <span className="note">이용 조건과 운영 시간은 예약 페이지에서 확인해요.</span>
      </div>
    </Page>
  );
}
