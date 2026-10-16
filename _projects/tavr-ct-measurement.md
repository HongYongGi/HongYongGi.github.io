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
  - label: 분할 Dice
    value: "97%"
  - label: 랜드마크 MRE
    value: "2.3 mm"
  - label: 3mensio 대비 오차
    value: "2.42%"
---

## 문제

TAVR(경피적 대동맥판막 치환술) 계획을 세우려면 Annulus·LVOT·SoV·STJ의 직경·면적·둘레와 LCA/RCA 높이를 재야 합니다. 이 계측을 사람이 직접 하면 시간이 오래 걸리고 판독자에 따라 값이 달라집니다.

심장 CT 한 건만 넣으면 분할·랜드마크·3D 모델·계측까지 자동으로 나오는 엔드투엔드 시스템이 필요했습니다.

## 접근

분할 → 랜드마크 → 계측을 하나의 실행으로 잇는 것을 목표로 했습니다.

- 전심장 23-class 분할 후 Aorta/LV/Coronary를 세부 분할하는 캐스케이드 구성
- CT와 마스크를 2채널로 묶어 9점 랜드마크를 검출
- 분할에서 누락된 랜드마크는 확률맵(center-of-mass/argmax)으로 복구
- 계측은 타원 적합 기반으로, 임상에서 쓰는 방식과 같은 기준으로 값을 냄

## 파이프라인

1. **분할** — nnUNetv2 3-모델 캐스케이드 (전심장 23-class → Aorta/LV/Coronary 3-class → CT+Mask 2채널 랜드마크 9점)
2. **좌표계 정합** — IJK / RAS / VTK 3종 좌표계를 맞춤
3. **메시 생성** — VTK marching cubes로 클래스별 STL 추출
4. **판막 모델링** — Commissure 3점으로 절단한 3-leaflet 판막 구성
5. **석회화 추출** — HU 임계치 기반 자동 분리
6. **계측** — Annulus 법선 방향 CSA sweep으로 centerline을 피팅한 뒤, 국소 접선 기저의 수직 단면에서 지표 산출

운영은 폴링 워커 + REST 구조로, GPU는 lazy load하고 2-GPU 병렬 배치와 resume을 지원합니다. Docker/GitOps CI/CD로 배포합니다.

## 결과

![TAVR 리포트 — Annulus와 STJ 단면 계측](/assets/projects/tavr-ct-measurement/report-annulus-stj.jpg)
*자동 생성된 리포트의 Annulus·STJ 단면. 분할 윤곽(초록)에 타원(파랑 점선)을 맞춰 면적·둘레·최소/최대/평균 직경을 산출합니다.*

![CSA sweep과 권장 판막 크기](/assets/projects/tavr-ct-measurement/report-csa-sweep.jpg)
*Annulus에서 위로 단면적(CSA)을 쓸어 올리며 SoV(최대)와 STJ(최소) 높이를 자동 검출하고, Annulus 계측값으로 판막 크기를 권장합니다.*

![3D Plane View](/assets/projects/tavr-ct-measurement/report-3d-view.jpg)
*심장 구조물 메시 위에 centerline과 Annulus·LVOT·SoV·STJ 계측 평면, 관상동맥 기시부를 함께 표시한 3D 뷰.*

| 항목 | 결과 |
|------|------|
| Segmentation Dice | 97% |
| Landmark MRE | 2.3 mm |
| 3mensio 리포트 대비 계측 오차 | 2.42% |

CT 1건을 넣으면 9-class STL, 랜드마크, 판막·석회화 STL, TAVR 계측 리포트(JSON), 3D 뷰가 단일 실행으로 나옵니다. 단계별 부분 실패를 허용하고 E2E 테스트를 붙여 대량 케이스를 안정적으로 처리합니다.

## 배운 점

모델 정확도보다 먼저 막힌 곳은 좌표계였습니다. 영상(IJK), 환자(RAS), 메시(VTK)가 서로 다른 축을 쓰기 때문에, 한 곳이라도 어긋나면 계측 평면이 엉뚱한 위치에 놓입니다. 세 좌표계 변환을 한 곳에 모아두고 나서야 계측값이 안정됐습니다.

분할이 놓친 랜드마크를 확률맵으로 복구하는 로직도 같은 맥락입니다. 실제 케이스에서는 한 단계가 조금씩 틀리는 일이 흔해서, 단계별로 실패를 허용하고 다음 단계가 보완하도록 설계하는 것이 전체 파이프라인의 신뢰도를 올리는 데 더 효과적이었습니다.
