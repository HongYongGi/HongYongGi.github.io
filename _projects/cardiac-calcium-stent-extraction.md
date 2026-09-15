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

석회화를 HU 임계치로 뽑으면 금속 스텐트가 함께 잡힙니다. 스텐트는 석회화보다 HU가 높지만 경계가 겹쳐서, 단순 임계치만으로는 칼슘 스코어가 과대 추정됩니다.

## 접근

전역 임계치 대신 분할마스크(aorta/LV/coronary) 안쪽에서만 연산해 탐색 범위를 좁히고, 스텐트 마스크를 별도로 유지했습니다.

## 파이프라인

<div class="figure-todo">파이프라인 도식 이미지 자리 — /assets/projects/cardiac-calcium-stent-extraction/pipeline.png</div>

> TODO — 실제 단계(전처리 → 마스크 적용 → 임계치 → 스텐트 분리 → 라벨링)를 정리해주세요.

## 결과

<div class="figure-todo">결과 이미지(before / after) 자리 — /assets/projects/cardiac-calcium-stent-extraction/result.png</div>

> TODO — 스텐트 분리 전후의 칼슘 스코어 차이를 비교해서 넣으면 설득력이 큽니다.

## 배운 점

> TODO
