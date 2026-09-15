---
title: Lung Registration
order: 5
summary: >-
  VoxelMorph 기반 3D 폐 영상 정합 학습·추론 코드 (특허 출원 10-2022-0132732 관련 연구).
period: "2022 — 2023"
role: 공동발명자 · 구현
repo: https://github.com/HongYongGi/LungRegistration
stack:
  - VoxelMorph
  - PyTorch
  - SimpleITK
  - nnUNet
metrics:
  - label: 좌하엽 부피 변화
    value: "+90.2 mL"
  - label: 우하엽
    value: "+52.5 mL"
  - label: 특허 출원
    value: "10-2022-0132732"
---

## 문제

자세(supine/prone)에 따라 폐가 얼마나 움직이고 부피가 어떻게 바뀌는지는 알려져 있지만, 이를 정량적으로 측정하려면 치료 전후 영상을 정확히 맞춰야 합니다.

## 접근

Lung 분할 → Affine 정합 → 딥러닝 정합(VoxelMorph 기반 Cascade) 순서로 단계를 나눴습니다. Patch로 학습하고 Sliding-Window로 추론해 blocky artifact를 피했습니다.

## 파이프라인

<div class="figure-todo">파이프라인 도식 이미지 자리 — /assets/projects/lung-registration/pipeline.png</div>

1. **분할** — 폐 영역 추출
2. **Affine** — 전역 정렬
3. **DL Registration** — VoxelMorph 기반 Cascade
4. **추론** — Patch 학습 + Sliding-Window (center-crop)

손실함수는 NCC : Grad : L1 비율을 튜닝했습니다.

> TODO — 최종 손실 가중치와 학습 설정을 적어주세요.

## 결과

<div class="figure-todo">결과 이미지(before / after) 자리 — /assets/projects/lung-registration/result.png</div>

Prone 자세에서 좌하엽 +90.2 mL, 우하엽 +52.5 mL의 부피 증가를 정량화했고, 3D 평균 픽셀 이동은 2.8 cm였습니다. 좌하엽 부피 변화와 FVC 사이의 상관도 규명했습니다.

> TODO — 정합 전후 오버레이 이미지와 부피 변화 그래프를 넣어주세요.

## 배운 점

> TODO
