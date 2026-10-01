import time
from typing import Dict, Any, Optional

class WarmTelemetry:
    def __init__(self):
        self.last_warm_timestamp: Optional[float] = None
        self.last_latency_ms: Optional[float] = None
        self.total_warm_requests: int = 0
        self.consecutive_failures: int = 0
        self.last_failure_timestamp: Optional[float] = None
        self.last_failure_reason: Optional[str] = None

    def record_success(self, latency_ms: float) -> None:
        self.last_warm_timestamp = time.time()
        self.last_latency_ms = round(latency_ms, 2)
        self.total_warm_requests += 1
        self.consecutive_failures = 0

    def record_failure(self, reason: str) -> None:
        self.last_failure_timestamp = time.time()
        self.last_failure_reason = str(reason)[:100]
        self.consecutive_failures += 1

    def get_status(self) -> Dict[str, Any]:
        now = time.time()
        seconds_since_last_warm = (
            round(now - self.last_warm_timestamp, 1) if self.last_warm_timestamp else None
        )
        is_warm = (
            seconds_since_last_warm is not None and seconds_since_last_warm < 600
        )  # Considered warm if touched in last 10 minutes

        return {
            "is_warm": is_warm,
            "seconds_since_last_warm": seconds_since_last_warm,
            "total_warm_requests": self.total_warm_requests,
            "last_latency_ms": self.last_latency_ms,
            "consecutive_failures": self.consecutive_failures,
            "last_failure_timestamp": self.last_failure_timestamp,
            "last_failure_reason": self.last_failure_reason,
        }

warm_tracker = WarmTelemetry()
