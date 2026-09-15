---
title: EEG 호흡 패턴 분류
order: 6
summary: >-
  EEG 뇌파 신호로 호흡 패턴을 분류합니다 (LDA · Random Forest) — SCI 제1저자 논문 코드.
period: "2018 — 2021"
role: 제1저자
repo: https://github.com/HongYongGi/EEG_ML
paper: https://www.mdpi.com/2076-3425/11/3/293
stack:
  - Python
  - scikit-learn
  - LDA
  - Random Forest
metrics:
  - label: 저널
    value: "Brain Sciences"
  - label: 연도
    value: "2021"
  - label: 역할
    value: "제1저자"
---

## 문제

호흡 패턴이 뇌파에 어떻게 반영되는지를 확인하고, 이를 신호만으로 구분할 수 있는지 검증하고자 했습니다.

## 접근

EEG 신호에서 특징을 추출해 LDA와 Random Forest로 호흡 패턴을 분류했습니다.

> TODO — 피험자 수, 측정 프로토콜, 사용한 특징(밴드 파워 등)을 적어주세요.

## 파이프라인

<div class="figure-todo">파이프라인 도식 이미지 자리 — /assets/projects/eeg-ml/pipeline.png</div>

> TODO — 전처리(필터링·아티팩트 제거) → 특징 추출 → 분류 → 검증(교차검증 방식) 순서로 정리해주세요.

## 결과

<div class="figure-todo">결과 이미지(before / after) 자리 — /assets/projects/eeg-ml/result.png</div>

Hong, Yong-Gi et al., "Identification of Breathing Patterns through EEG Signal Analysis Using Machine Learning", *Brain Sciences* 11(3):293, 2021.

> TODO — 분류 정확도와 혼동행렬을 넣어주세요.

## 배운 점

> TODO
