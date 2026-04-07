---
title: "RAG(Retrieval-Augmented Generation) 기본 개념과 구현 튜토리얼"
date: 2026-04-07 10:00:00 +0900
categories: [Medical AI]
tags: [rag, llm, langchain, vector-database, embedding]
---

## RAG란?

**RAG(Retrieval-Augmented Generation)**는 LLM이 답변을 생성하기 전에 외부 데이터베이스에서 관련 문서를 검색하여 참고하는 기법입니다.

LLM은 학습 데이터에 없는 정보에 대해 잘못된 답변(Hallucination)을 생성할 수 있습니다. RAG는 이 문제를 해결하기 위해 **검색(Retrieval)**과 **생성(Generation)**을 결합합니다.

### LLM만 사용할 때의 한계

- 학습 데이터의 cutoff 이후 정보를 모름
- 사내 문서, 개인 데이터에 접근 불가
- Hallucination 발생 가능성

### RAG가 해결하는 것

- 최신 정보 반영 가능
- 사내/개인 문서 기반 답변 생성
- 출처를 명시하여 Hallucination 감소

## RAG 파이프라인 구조

RAG는 크게 **Indexing**과 **Querying** 두 단계로 나뉩니다.

### 1단계: Indexing (사전 준비)

```
문서 로드 → 텍스트 분할(Chunking) → 임베딩 생성 → 벡터 DB 저장
```

### 2단계: Querying (질의 응답)

```
사용자 질문 → 질문 임베딩 → 유사 문서 검색 → LLM에 컨텍스트와 함께 전달 → 답변 생성
```

## 핵심 구성 요소

### Embedding Model

텍스트를 고차원 벡터로 변환합니다. 의미적으로 유사한 텍스트는 벡터 공간에서 가까이 위치합니다.

대표적인 모델:
- `text-embedding-3-small` (OpenAI)
- `BAAI/bge-m3` (오픈소스, 다국어 지원)
- `jhgan/ko-sroberta-multitask` (한국어 특화)

### Vector Database

임베딩 벡터를 저장하고 유사도 검색을 수행합니다.

| DB | 특징 |
|---|---|
| **ChromaDB** | 로컬, 간편, 프로토타이핑에 적합 |
| **FAISS** | Meta 개발, 대규모 검색에 강점 |
| **Pinecone** | 클라우드 관리형, 프로덕션용 |
| **Weaviate** | 하이브리드 검색 지원 |

### Chunking (텍스트 분할)

긴 문서를 적절한 크기로 나누는 전략입니다.

- **Fixed Size**: 고정 글자 수로 분할 (간단하지만 문맥 손실 가능)
- **Recursive**: 문단 → 문장 → 단어 순서로 재귀적 분할
- **Semantic**: 의미 단위로 분할 (가장 정확하지만 느림)

일반적으로 **chunk_size=500~1000**, **chunk_overlap=50~200** 정도가 적절합니다.

## Python 구현 예제

### 설치

```bash
pip install langchain langchain-openai langchain-community chromadb
```

### 전체 코드

```python
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

# 1. 문서 로드
loader = TextLoader("my_document.txt", encoding="utf-8")
documents = loader.load()

# 2. 텍스트 분할
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    separators=["\n\n", "\n", ".", " "]
)
splits = text_splitter.split_documents(documents)
print(f"분할된 청크 수: {len(splits)}")

# 3. 임베딩 + 벡터 DB 저장
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(
    documents=splits,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# 4. Retriever 생성
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3}  # 상위 3개 문서 검색
)

# 5. RAG 체인 구성
llm = ChatOpenAI(model="gpt-4o", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    return_source_documents=True
)

# 6. 질의
result = qa_chain.invoke({"query": "이 문서의 핵심 내용은?"})
print(result["result"])

# 출처 확인
for doc in result["source_documents"]:
    print(f"- {doc.page_content[:100]}...")
```

### PDF 문서 사용 시

```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("paper.pdf")
documents = loader.load()
# 이후 동일한 파이프라인 적용
```

## 검색 품질 향상 팁

### 1. Hybrid Search

키워드 검색(BM25)과 벡터 검색을 결합하면 정확도가 올라갑니다.

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

bm25_retriever = BM25Retriever.from_documents(splits)
bm25_retriever.k = 3

vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.4, 0.6]
)
```

### 2. Reranking

검색 결과를 다시 한번 정렬하여 관련성이 높은 문서를 상위로 올립니다.

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain_community.document_compressors import FlashrankRerank

compressor = FlashrankRerank(top_n=3)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vector_retriever
)
```

### 3. Multi-Query Retriever

하나의 질문을 여러 관점으로 변환하여 검색 범위를 넓힙니다.

```python
from langchain.retrievers.multi_query import MultiQueryRetriever

multi_retriever = MultiQueryRetriever.from_llm(
    retriever=vector_retriever,
    llm=llm
)
```

## 평가 지표

RAG 시스템의 성능을 측정하는 주요 지표입니다.

| 지표 | 설명 |
|---|---|
| **Context Relevancy** | 검색된 문서가 질문과 관련 있는가 |
| **Faithfulness** | 답변이 검색된 문서에 근거하는가 |
| **Answer Relevancy** | 답변이 질문에 적절한가 |

[RAGAS](https://github.com/explodinggradients/ragas) 라이브러리로 자동 평가가 가능합니다.

## 정리

| 단계 | 핵심 |
|---|---|
| 문서 로드 | TextLoader, PyPDFLoader 등 |
| Chunking | RecursiveCharacterTextSplitter (500~1000자) |
| Embedding | OpenAI 또는 오픈소스 모델 |
| Vector DB | ChromaDB (프로토타입), FAISS/Pinecone (프로덕션) |
| Retrieval | Hybrid Search + Reranking으로 품질 향상 |
| Generation | 검색된 컨텍스트와 함께 LLM에 전달 |

RAG는 LLM을 실제 업무에 적용하기 위한 가장 실용적인 방법입니다. 다음 글에서는 의료 논문 PDF를 활용한 RAG 시스템 구축을 다뤄보겠습니다.
