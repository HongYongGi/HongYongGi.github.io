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

ImageNet 사전학습 ResNet50을 전이학습한 이진 분류기(fractured / not_fractured)에 Grad-CAM을 붙여, 예측 라벨과 함께 근거 영역을 히트맵으로 같이 냅니다.

## 파이프라인

- **데이터** — Kaggle 골절 X-ray 데이터셋 2종을 병합. 두 번째 데이터셋이 첫 번째의 부분집합임을 확인해 중복을 정리했습니다. 총 10,581장 (Train 9,246 / Val 829 / Test 506), 클래스 비율은 약 50:50입니다.
- **전처리** — 224×224 리사이즈, ImageNet 평균·표준편차 정규화. 원본에 이미 rotation·copy 증강이 들어 있어 추가 증강은 하지 않았습니다.
- **모델** — ResNet50(IMAGENET1K_V2), 출력층을 Dropout(0.5) + Linear(2)로 교체
- **학습** — Adam, lr 1e-4, batch 32, 20 epoch, ReduceLROnPlateau(factor 0.1, patience 3), 검증 손실 기준 best 모델 저장

![학습 곡선](/assets/projects/bone-fracture/training-curves.png)
*Train 정확도는 몇 epoch 만에 100%에 도달하고, Validation은 99% 안팎에서 진동합니다.*

## 결과

| 지표 | 값 |
|------|------|
| Test Accuracy | 99.01% |
| AUC | 0.9983 |
| Precision (fractured) | 99.57% |
| Recall (fractured) | 98.32% |
| F1-Score (fractured) | 98.94% |

![Test set 혼동행렬](/assets/projects/bone-fracture/confusion-matrix.png)
*Test 506장 중 오분류 5장. 골절을 놓친 경우(4장)가 정상을 골절로 본 경우(1장)보다 많습니다.*

![Grad-CAM — 정답 사례와 오답 사례](/assets/projects/bone-fracture/gradcam.jpg)
*위: 골절 부위(금속 고정물 주변)에 집중해 맞힌 사례. 아래: 골절 영상을 정상으로 오판한 사례로, 히트맵이 관절 부위로 퍼져 있습니다.*

## 배운 점

99%라는 숫자를 그대로 믿기는 어렵습니다. 이 데이터셋은 원본 약 657장을 회전·복사로 8,500장 넘게 늘린 것이라, 같은 원본에서 나온 영상이 Train과 Test에 함께 들어갔을 가능성이 큽니다. Grad-CAM 결과에서도 거의 같은 영상이 반복해서 보입니다. 실제 성능을 보려면 원본 단위로 split을 다시 나누고, 다른 기관의 X-ray로 외부 검증을 해야 합니다.

그래서 이 프로젝트에서 남는 것은 정확도보다 근거 시각화와 오답 분석입니다. 오답 사례의 히트맵이 골절선이 아니라 관절 쪽으로 퍼져 있다는 것은, 모델이 무엇을 배웠는지 숫자만으로는 알 수 없다는 점을 보여줍니다.
