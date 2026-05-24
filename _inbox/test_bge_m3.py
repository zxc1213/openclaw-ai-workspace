"""BGE-M3 本地部署测试"""
import time
import torch
from FlagEmbedding import BGEM3FlagModel

print("=" * 50)
print("BGE-M3 本地部署测试")
print("=" * 50)

# 设备选择
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"\n📦 使用设备: {device}")
if device == "cuda":
    print(f"   GPU: {torch.cuda.get_device_name(0)}")
    print(f"   VRAM: {round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 1)} GB")

# 加载模型
print("\n⏳ 正在加载 BGE-M3 模型（首次需要下载 ~2GB）...")
t0 = time.time()
model = BGEM3FlagModel("BAAI/bge-m3", use_fp16=True, device=device,
    normalize_embeddings=True)
t1 = time.time()
print(f"✅ 模型加载完成，耗时 {t1-t0:.1f}s")

# 测试数据
test_cases = [
    {
        "name": "中文语义相似度",
        "sentences": [
            "OpenClaw 是一个开源的 AI 助手框架",
            "OpenClaw 是一个免费的智能助手平台",
            "今天天气不错，适合出去散步",
        ],
    },
    {
        "name": "中英跨语言",
        "sentences": [
            "机器学习是人工智能的一个分支",
            "Machine learning is a branch of artificial intelligence",
            "这道菜的配方很简单",
        ],
    },
    {
        "name": "长文本检索",
        "sentences": [
            "Ray 是一名程序员，居住在广州，平时喜欢研究各种 AI 技术。他最近在做一个基于 Tauri v2 的桌面客户端项目，需要连接 OpenClaw Gateway 来实现聊天功能。项目使用 Ed25519 签名方案来处理设备身份验证，通过 IndexedDB 存储密钥。他还搭建了一个 Team Dashboard 监控面板，端口 18788，用于监控 Agent 团队的状态。Ray 是个夜猫子，经常深夜灵感迸发，凌晨还在写代码。",
            "查询：Ray 用的什么签名方案做设备身份验证？",
            "查询：广州今天有什么好吃的？",
        ],
    },
]

# 逐个测试
for case in test_cases:
    print(f"\n{'=' * 50}")
    print(f"🧪 测试: {case['name']}")
    print(f"{'=' * 50}")

    sentences = case["sentences"]
    t0 = time.time()
    embeddings = model.encode(sentences, batch_size=len(sentences), max_length=8192)
    t1 = time.time()

    # 稠密向量相似度
    dense_vecs = embeddings["dense_vecs"]
    print(f"\n   输入 {len(sentences)} 条文本，耗时 {t1-t0:.3f}s")
    print(f"   向量维度: {dense_vecs.shape[1]}")
    print(f"   向量类型: dense")

    # 计算相似度矩阵
    import numpy as np
    from numpy.linalg import norm

    norms = norm(dense_vecs, axis=1, keepdims=True)
    normalized = dense_vecs / norms
    sim_matrix = normalized @ normalized.T

    print(f"\n   相似度矩阵:")
    for i, s in enumerate(sentences):
        label = s[:30] + "..." if len(s) > 30 else s
        print(f"   [{i}] {label}")

    print(f"\n   相似度:")
    for i in range(len(sentences)):
        for j in range(i+1, len(sentences)):
            print(f"   [{i}] ↔ [{j}]: {sim_matrix[i][j]:.4f}")

    # 显示稀疏向量信息（如果有）
    if "sparse_vecs" in embeddings:
        sparse = embeddings["sparse_vecs"]
        if sparse is not None:
            print(f"\n   稀疏向量: 也已生成（可用于 BM25 混合检索）")

    if "colbert_vecs" in embeddings:
        colbert = embeddings["colbert_vecs"]
        if colbert is not None:
            print(f"   ColBERT 向量: 也已生成（可用于延迟交互检索）")

# GPU 显存使用
if device == "cuda":
    mem_used = torch.cuda.memory_allocated() / 1024**3
    mem_reserved = torch.cuda.memory_reserved() / 1024**3
    print(f"\n{'=' * 50}")
    print(f"📊 GPU 显存使用:")
    print(f"   已用: {mem_used:.2f} GB")
    print(f"   预留: {mem_reserved:.2f} GB")

print(f"\n{'=' * 50}")
print("✅ 所有测试完成！")
