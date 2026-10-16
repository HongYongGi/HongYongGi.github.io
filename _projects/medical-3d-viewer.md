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

분할 실행과 확인, 수정, 내보내기를 한 화면에서 끝내는 웹 뷰어를 만들었습니다. UI와 추론은 Python(Streamlit + nnUNetv2)에 두고, 무거운 메시 생성은 Go 렌더러로 분리했습니다. 렌더러가 없을 때는 Plotly 기반 3D 뷰로 자동 대체됩니다.

## 파이프라인

1. **업로드** — CT NIfTI(선택적으로 DICOM) 입력, 환자·분석 이력은 SQLite에 기록
2. **추론** — `models.yaml`에 정의한 nnUNetv2 모델을 단독 또는 파이프라인(여러 모델 순차 실행 후 결과 병합)으로 실행. 선택적으로 ONNX 변환 후 Rust 추론 엔진 사용
3. **MPR** — Axial · Coronal · Sagittal · Oblique 재구성, 윈도잉, 거리·각도 측정
4. **3D** — Go 렌더러가 Marching Cubes로 메시를 만들고 단순화한 뒤 WebSocket으로 브라우저(Three.js)에 전달
5. **보정·내보내기** — 레이블 브러시/지우개로 수동 수정, NIfTI 분할과 3D 프린팅용 STL 다운로드

```
Streamlit (Python) :8501 ── UI · MPR · 분할 편집 · nnUNet 추론
        │ httpx
        ▼
Go 3D Renderer     :8080 ── NIfTI 로더 · Marching Cubes · WebSocket 뷰어
Rust Inference (선택)    ── ONNX Runtime 추론
```

## 결과

분할 실행 → MPR 확인 → 3D 확인 → 수동 보정 → STL 내보내기가 브라우저 한 화면 안에서 이어집니다. `docker compose up` 한 번으로 Streamlit과 Go 렌더러가 함께 올라가 별도 설치 없이 팀원과 공유할 수 있습니다.

## 배운 점

모든 것을 Python 한 곳에서 처리하면 큰 볼륨의 메시 생성 동안 UI가 멈췄습니다. 역할에 맞는 언어로 프로세스를 나누고(Python은 추론과 UI, Go는 메시), 렌더러가 없어도 동작하는 대체 경로를 두니 개발 환경과 배포 환경 모두에서 안정적으로 돌아갔습니다.
