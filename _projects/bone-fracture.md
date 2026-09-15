---
title: Bone Fracture Detection AI
order: 4
summary: >-
  X-ray 골절 검출 모델과 Grad-CAM 근거 시각화 (ResNet50, Acc 99.01% / AUC 0.9983).
period: "2026"
role: 설계·개발
repo: https://github.com/HongYongGi/bone-fracture
stack:
  - PyTorch
  - ResNet50
  - Grad-CAM
metrics:
  - label: Accuracy
    value: "99.01%"
  - label: AUC
    value: "0.9983"
  - label: 해석
    value: "Grad-CAM"
---

## 문제

골절 검출은 분류만으로는 임상에서 신뢰를 얻기 어렵습니다. 모델이 어디를 보고 판단했는지 보여줘야 판독자가 결과를 받아들일 수 있습니다.

## 접근

ResNet50 분류기에 Grad-CAM을 붙여, 예측 라벨과 함께 근거 영역을 히트맵으로 같이 냅니다.

## 파이프라인

<div class="figure-todo">파이프라인 도식 이미지 자리 — /assets/projects/bone-fracture/pipeline.png</div>

> TODO — 데이터셋 출처, 전처리, 학습 설정(에폭·옵티마이저·증강)을 적어주세요.

## 결과

<div class="figure-todo">결과 이미지(before / after) 자리 — /assets/projects/bone-fracture/result.png</div>

Accuracy 99.01%, AUC 0.9983.

> TODO — 혼동행렬과 Grad-CAM 예시 이미지(정답/오답 각각)를 넣어주세요. 오답 사례를 같이 보여주면 신뢰도가 더 올라갑니다.

## 배운 점

> TODO — 99%가 데이터셋 난이도 때문인지, 실제 임상 데이터에서도 유지될지에 대한 판단을 솔직하게 적으면 좋습니다.
