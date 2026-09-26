from __future__ import annotations
from src.optimization.responder_dispatch import ResponderDispatchOptimizer

def test_responder_dispatch():
    opt = ResponderDispatchOptimizer()
    assign = opt.dispatch_nearest([{"incident_id": "inc_1"}], ["Unit_Alpha", "Unit_Bravo"])
    assert "inc_1" in assign
