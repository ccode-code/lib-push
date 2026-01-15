# 기여 가이드

npm-push 프로젝트에 관심을 가져 주셔서 감사합니다! 모든 형태의 기여를 환영합니다.

## 기여 방법

### 문제 보고

버그를 발견했거나 기능 제안이 있는 경우 [GitHub Issues](https://github.com/ccode/npm-push/issues)를 통해 보고해 주세요.

### 코드 제출

1. 이 저장소를 Fork
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경 사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 열기

## 코드 표준

- 프로젝트의 코드 스타일을 따르기
- 적절한 주석 추가
- 모든 테스트가 통과하는지 확인
- 관련 문서 업데이트

## 라이선스

코드를 제출함으로써 MIT 라이선스에 따라 기여를 라이선스하는 데 동의하는 것으로 간주됩니다.

## 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/ccode/npm-push.git
cd npm-push

# 의존성 설치
bun install

# 테스트 실행
bun test

# 개발 모드
bun run dev
```

## 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따르세요:

- `feat`: 새 기능
- `fix`: 버그 수정
- `docs`: 문서 업데이트
- `style`: 코드 스타일 (코드 실행에 영향을 주지 않음)
- `refactor`: 리팩토링
- `test`: 테스트 관련
- `chore`: 빌드 프로세스 또는 보조 도구 변경

예: `feat: 다국어 지원 추가`

## 행동 강령

[행동 강령](CODE_OF_CONDUCT.ko.md)을 따르세요.

## 질문?

질문이 있으시면 Issues를 통해 문의해 주세요.

---

<div align="center">

[🇨🇳 中文](CONTRIBUTING.zh.md) | [🇺🇸 English](CONTRIBUTING.en.md) | [🇯🇵 日本語](CONTRIBUTING.ja.md) | [🇰🇷 한국어](CONTRIBUTING.ko.md)

</div>
