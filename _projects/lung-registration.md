---
title: Lung Registration
order: 5
summary: >-
  VoxelMorph 기반 3D 폐 영상 정합 학습·추론 코드 (특허 10-2750467, 출원 10-2022-0132732 관련 연구).
period: "2022 — 2023"
role: 주발명자 · 구현
repo: https://github.com/HongYongGi/LungRegistration
stack:
  - VoxelMorph
  - CycleMorph
  - PyTorch
  - SimpleITK
  - nnUNet
metrics:
  - label: 좌하엽 부피 변화
    value: "+90.2 mL"
  - label: 우하엽
    value: "+52.5 mL"
  - label: 특허 등록
    value: "10-2750467"
---

## 문제

자세(supine/prone)에 따라 폐가 얼마나 움직이고 부피가 어떻게 바뀌는지는 알려져 있지만, 이를 정량적으로 측정하려면 서로 다른 시점의 영상을 정확히 맞춰야 합니다.

Multi-phase(Pre/Artery/Portal/Delayed) 정합에서도 같은 문제가 있었습니다. Phase마다 ROI의 형태와 contrast가 달라지고, 영상처리 기반 정합은 계산량이 커서 딥러닝 정합이 필요했습니다.

## 접근

Lung 분할 → Affine 정합 → 딥러닝 정합(VoxelMorph 기반 Cascade) 순서로 단계를 나눴습니다. Patch로 학습하고 Sliding-Window로 추론해 blocky artifact를 피했습니다. 양방향 일관성을 보기 위해 CycleMorph 구조도 실험했습니다.

## 파이프라인

1. **전처리·분할** — Resize 후 폐엽(LLL·LUL·RLL·RML)과 Airway 분할
2. **Affine** — rigid 전역 정렬
3. **DL Registration** — VoxelMorph 기반 Cascade, CycleMorph 실험
4. **추론** — Patch 학습 + Sliding-Window, 패치 중앙 3/4만 사용해 경계 artifact 제거
5. **정량화** — Vector Field × Pixel Spacing으로 부위별 부피(mL)·움직임(cm) 산출

손실함수는 정합(NCC) · deformation 평활(Grad) · Cycle(L1) · Identity(NCC)를 **1 : 0.01 : 1 : 1**로 맞췄습니다. 두 영상의 시작 위치가 어긋나는 문제는 NCC zero-padding 보정으로 해결했고, 이 방법을 특허에 반영했습니다.

![학습 곡선 — 전체·NCC·Grad·Cycle·Identity loss](/assets/projects/lung-registration/loss-curves.png)
*손실 항목별 학습/검증 곡선. 정합(NCC) 손실이 꾸준히 내려가는 동안 Grad 항이 deformation을 과하게 키우지 않는지 함께 확인했습니다.*

## 결과

![정합 전후 비교 — Moving / Fixed / Moved와 차이 맵](/assets/projects/lung-registration/result.png)
*위: Moving·Fixed·정합 결과. 가운데: 정합 전 차이 맵. 아래: 정합 후 차이 맵. 횡격막과 심장 경계의 차이가 크게 줄었습니다.*

Prone 자세에서 좌하엽 +90.2 mL, 우하엽 +52.5 mL의 부피 증가를 정량화했고(중간엽은 감소), 3D 평균 픽셀 이동은 2.8 cm였습니다. 좌하엽 부피 변화와 FVC 사이의 상관도 규명했으며, 폐섬유화가 30% 이상인 환자는 변화가 적었습니다.

이 연구로 「의료영상 정합방법 및 그 장치」를 주발명자로 출원(10-2022-0132732)했고, 2024년 12월 등록(10-2750467)되었습니다.

## 배운 점

3D 볼륨을 통째로 넣을 수 없어 patch로 학습했는데, 그대로 이어 붙이면 패치 경계마다 blocky artifact가 생겼습니다. Sliding-Window로 겹쳐 추론하고 각 패치의 중앙 3/4만 쓰는 단순한 규칙으로 해결했습니다. 모델 구조를 바꾸기 전에 추론 방식부터 의심해보는 습관이 여기서 생겼습니다.

정합 결과를 숫자로 바꾸는 단계도 중요했습니다. Vector Field에 Pixel Spacing을 곱해 mL·cm 단위로 바꾸고 나서야 임상 지표(FVC)와 비교할 수 있었고, 그때부터 정합이 "잘 맞는 그림"이 아니라 임상 질문에 답하는 도구가 됐습니다.
