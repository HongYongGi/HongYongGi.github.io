---
title: Cardiac Calcium / Stent Extraction
order: 2
summary: >-
  심장 CT에서 관상동맥·대동맥 석회화를 금속 스텐트와 분리해 추출합니다 (HU 임계치, NIfTI 분할마스크 내 연산).
period: "2026"
role: 설계·개발
repo: https://github.com/HongYongGi/cardiac-calcium-stent-extraction
stack:
  - Python
  - SimpleITK
  - NIfTI
  - HU thresholding
metrics:
  - label: 대상
    value: "관상동맥 · 대동맥"
  - label: 분리 대상
    value: "금속 스텐트"
  - label: 입력
    value: "NIfTI 분할마스크"
---

## 문제

석회화를 HU 임계치로 뽑으면 금속 스텐트가 함께 잡힙니다. 금속 스텐트의 HU는 대략 **1400–3071**로, 치밀한 석회화와 HU만으로는 구분되지 않습니다. 스텐트가 섞이면 두 가지 문제가 생깁니다.

- 스텐트 voxel이 ROI 통계(평균·표준편차)를 끌어올려 임계치가 높아지고, 대비가 낮은 미세 석회화가 묻힙니다.
- 스텐트 자체가 석회화로 잘못 분류됩니다.

## 접근

전역 임계치 대신 분할마스크(aorta/LV/coronary) 안쪽에서만 연산해 탐색 범위를 좁히고, **스텐트 라벨은 ROI에서 아예 제외**했습니다. 케이스마다 ROI의 HU 분포로 임계치를 다시 계산하는 적응형 방식입니다. 연구용 스크립트 묶음을 설치형 패키지(`ccse`)로 다시 정리했습니다.

## 파이프라인

1. **ROI 구성** — aorta(1) ∪ LV(2) ∪ coronary(3). 스텐트(4)는 의도적으로 제외
2. **적응형 임계치** — `threshold = mean_HU + 2.0 × std_HU` (ROI 전체 voxel 기준)
3. **석회화 후보** — `(CT > threshold) & ROI`
4. **노이즈 제거** — 부피 1.0 mm³ 이하 연결 요소 제거
5. **검증** — `calcium ∩ stent` voxel 수를 기록(정상이면 0). 라벨 경계 때문에 겹침이 생기면 `stent_minus_calcium` 마스크를 따로 출력
6. **산출** — 석회화 마스크(NIfTI), STL 표면, 석회화를 label 5로 합친 병합 라벨맵, QA 오버레이 이미지, 케이스별 요약 CSV

보조 기능으로 Aorta ∪ LV ∪ 스텐트 내강(3D convex hull로 채움)에서 최소 비용 경로를 찾아 대동맥 centerline도 뽑을 수 있습니다.

## 결과

| Label | 구조 |
|------:|------|
| 1 | aorta |
| 2 | LV |
| 3 | coronary |
| 4 | stent |
| 5 | calcium (이 패키지가 추가) |

CLI 하나(`ccse extract / stl / merge / viz-calcium / viz-merge`)로 nnU-Net 형식 데이터셋 전체를 일괄 처리하고, 석회화가 가장 많은 슬라이스를 골라 CT · 원본 분할 · 병합 분할을 나란히 보여주는 QA 패널을 자동으로 만듭니다. 순수 로직 함수(임계치 계산, 석회화 추출, 라벨 병합)는 파일 IO 없이 합성 볼륨으로 단위 테스트했고, 저장소에는 환자 데이터를 포함하지 않았습니다.

## 배운 점

처음에는 스텐트를 석회화와 "분리"하는 후처리를 고민했지만, 답은 스텐트를 처음부터 계산 범위에 넣지 않는 것이었습니다. 이미 분할된 라벨을 ROI 설계에 쓰면, 어려운 분리 문제가 단순한 집합 연산으로 바뀝니다.

또 결과가 맞는지 사람이 매번 열어보지 않아도 되도록 `calcium ∩ stent = 0`이라는 불변식을 기록하게 한 것이 대량 처리에서 가장 쓸모 있었습니다.
