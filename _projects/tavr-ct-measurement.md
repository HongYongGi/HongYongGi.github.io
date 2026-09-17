---
title: TAVR CT Measurement Pipeline
order: 1
summary: >-
  심장 CT 분할·랜드마크로부터 TAVR 계측 17종을 자동 산출하는 파이프라인 (cardiosim-ai 핵심 모듈).
period: "2025.09 —"
role: 설계·개발
stack:
  - nnUNetv2
  - PyTorch/CUDA
  - VTK
  - SimpleITK
  - scipy
metrics:
  - label: 계측 항목
    value: "17종"
  - label: 입력
    value: "심장 CT 1건"
  - label: 산출
    value: "STL · 리포트 · 3D 뷰"
---

## 문제

TAVR(경피적 대동맥판막 치환술) 계획을 세우려면 Annulus·LVOT·SoV·STJ의 직경·면적·둘레와 LCA/RCA 높이를 재야 합니다. 이 계측을 사람이 직접 하면 시간이 오래 걸리고 판독자에 따라 값이 달라집니다.

> TODO — 기존 워크플로에서 실제로 얼마나 걸렸는지, 판독자 간 편차가 어느 정도였는지 적어주세요.

## 접근

분할 → 랜드마크 → 계측을 하나의 실행으로 잇는 것을 목표로 했습니다.

- 전심장 23-class 분할 후 Aorta/LV/Coronary를 세부 분할하는 캐스케이드 구성
- CT와 마스크를 2채널로 묶어 9점 랜드마크를 검출
- 분할에서 누락된 랜드마크는 확률맵(center-of-mass/argmax)으로 복구

## 파이프라인

<div class="figure-todo">파이프라인 도식 이미지 자리 — /assets/projects/tavr-ct-measurement/pipeline.png</div>

1. **분할** — nnUNetv2 3-모델 캐스케이드
2. **좌표계 정합** — IJK / RAS / VTK 3종 좌표계를 맞춤
3. **메시 생성** — VTK marching cubes로 STL 추출
4. **판막 모델링** — Commissure 3점 기반 3-leaflet 구성
5. **석회화 추출** — HU 임계치 기반 자동 분리
6. **계측** — Annulus 법선 방향 CSA sweep으로 centerline을 피팅한 뒤 지표 산출

## 결과

<div class="figure-todo">결과 이미지(before / after) 자리 — /assets/projects/tavr-ct-measurement/result.png</div>

CT 1건을 넣으면 9-class STL, 랜드마크, 판막·석회화 STL, TAVR 계측 리포트(JSON), 3D 뷰가 단일 실행으로 나옵니다.

> TODO — 계측 정확도(수동 계측 대비 오차), 처리 시간을 표로 넣어주세요.

## 배운 점

> TODO — 좌표계 정합에서 겪은 문제, 랜드마크 복구 로직을 넣게 된 계기 등 실제로 배운 점을 적어주세요.
