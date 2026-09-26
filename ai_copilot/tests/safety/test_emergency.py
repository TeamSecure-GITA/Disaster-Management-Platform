from safety.emergency_guard import EmergencyGuard

def test_emergency_guard_immediate_peril():
    guard = EmergencyGuard()
    triggered, msg = guard.intercept_immediate_peril("Multiple families trapped in rising water!")
    assert triggered is True
    assert "LIFE SAFETY ESCALATION" in msg

def test_emergency_guard_standard():
    guard = EmergencyGuard()
    triggered, msg = guard.intercept_immediate_peril("Routine patrol report from post A")
    assert triggered is False
    assert "Standard priority" in msg
