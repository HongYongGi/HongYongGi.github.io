---
title: Medical 3D Viewer
order: 3
summary: >-
  nnUNetv2 분할·MPR·3D 시각화를 한 화면에서 처리하는 의료영상 뷰어 (Python + Go + Three.js).
period: "2026"
role: 설계·개발
repo: https://github.com/HongYongGi/medical-3d-viewer
stack:
  - Streamlit
  - nnUNetv2
  - Go
  - Three.js
  - VTK
metrics:
  - label: 뷰
    value: "MPR + 3D"
  - label: 분할
    value: "nnUNetv2"
  - label: 렌더링
    value: "Three.js"
---

## 문제

분할 결과를 확인하려면 3D Slicer 같은 별도 프로그램을 띄워야 했습니다. 모델을 돌리고 결과를 눈으로 확인하는 사이클이 매번 끊겼습니다.

## 접근

분할 실행과 확인을 한 화면에서 끝내는 웹 뷰어를 만들었습니다. 무거운 볼륨 처리는 Go로 빼고, 브라우저에서는 Three.js로 렌더링합니다.

## 파이프라인

<div class="figure-todo">파이프라인 도식 이미지 자리 — /assets/projects/medical-3d-viewer/pipeline.png</div>

> TODO — 업로드 → 전처리 → nnUNet 추론 → 메시 변환 → 브라우저 렌더링 흐름을 적어주세요.

## 결과

<div class="figure-todo">결과 이미지(before / after) 자리 — /assets/projects/medical-3d-viewer/result.png</div>

<div class="figure-todo">뷰어 화면 캡처 또는 조작 GIF 자리</div>

> TODO — 확인 사이클이 얼마나 짧아졌는지 적어주세요.

## 배운 점

> TODO
