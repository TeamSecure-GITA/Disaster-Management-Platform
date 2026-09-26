"""Benchmark model inference latency and memory throughput."""
from __future__ import annotations

import argparse
import logging
import time
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def benchmark(iterations: int = 500) -> dict[str, float]:
    logger.info(f"Running benchmark over {iterations} simulated inference calls...")
    times = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        _ = np.dot(np.random.randn(1, 20), np.random.randn(20, 1))
        times.append((time.perf_counter() - t0) * 1000)
    
    res = {
        "p50_latency_ms": float(np.percentile(times, 50)),
        "p95_latency_ms": float(np.percentile(times, 95)),
        "p99_latency_ms": float(np.percentile(times, 99)),
        "mean_latency_ms": float(np.mean(times)),
        "throughput_req_per_sec": float(1000 / np.mean(times))
    }
    logger.info(f"Benchmark results: {res}")
    return res


def main() -> None:
    parser = argparse.ArgumentParser(description="Benchmark models")
    parser.add_argument("--iterations", type=int, default=500)
    args = parser.parse_args()
    benchmark(args.iterations)


if __name__ == "__main__":
    main()
