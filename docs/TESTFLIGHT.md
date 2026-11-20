# 아이폰에서 돌려보기 (TestFlight)

웹앱을 Capacitor 8로 감싼 iOS 프로젝트가 `ios/`에 있다. 화면과 로직은 웹과 같은 코드다.

- 번들 ID: `com.oiui030.greenroom` (`capacitor.config.json`, App Store Connect에 올리기 전까지는 바꿀 수 있다)
- 앱 이름: 초록방, 버전 0.2.0, 아이폰 전용, 세로 고정, iOS 15 이상
- 빌드에는 Xcode 26 이상이 필요하다 (Capacitor 8 요구 사항)

## 먼저 한 번만 할 일 (Apple 계정)

1. App Store Connect에서 새 앱을 만든다. 번들 ID는 위와 같게.
2. 아래 두 방법 중 하나로 빌드를 올린다.

## 방법 1. 맥의 Xcode로 올리기

```bash
git checkout develop && git pull
npm ci
npm run ios          # 웹 빌드 후 ios 프로젝트에 복사
npx cap open ios     # Xcode가 열린다
```

Xcode에서 App 타깃의 Signing & Capabilities에서 Team을 고르고, 기기를 Any iOS Device로 둔 뒤 Product > Archive, 이어서 Distribute App > TestFlight.

케이블로 연결한 아이폰에 바로 넣어 보려면 기기를 고르고 실행 버튼을 누르면 된다.

## 방법 2. GitHub Actions로 올리기 (맥 없이)

저장소 Settings > Secrets and variables > Actions에 네 개를 넣는다.

| 이름 | 값 |
|---|---|
| `APPLE_TEAM_ID` | Apple Developer 팀 ID (10자리) |
| `ASC_KEY_ID` | App Store Connect API 키 ID |
| `ASC_ISSUER_ID` | API 키 Issuer ID |
| `ASC_KEY_P8` | 내려받은 `.p8` 파일 내용 전체 |

API 키는 App Store Connect > 사용자 및 액세스 > 통합에서 만들고, 역할은 앱 관리 이상이어야 자동 서명이 된다.

그다음 Actions 탭에서 TestFlight 워크플로를 고르고, 브랜치를 develop으로 두고 Run workflow를 누른다. 테스트와 빌드를 거쳐 TestFlight에 올라간다. 빌드 번호는 실행 번호가 자동으로 들어간다.

이 워크플로는 아직 실제로 돌려 보지 못했다. 첫 실행에서 서명이나 러너 설정 문제로 멈추면 로그를 보고 고쳐야 한다.

## 실기기에서 볼 것

- 상단 시계와 노치 아래로 내용이 들어가지 않는지 (위쪽 안전 영역 여백을 넣어 둠)
- 하단 탭과 개구리 버튼이 홈 바와 겹치지 않는지
- 구조 작전 화면(어두운 배경)에서 상단 시계 글자가 보이는지
- 앱을 껐다 켜도 등록한 식물과 기록이 남는지
- 사람 도움 받기의 예약 링크가 사파리로 열리는지
