from safety.human_confirmation import HumanConfirmationManager

def test_human_confirmation():
    mgr = HumanConfirmationManager()
    ticket = mgr.generate_confirmation_ticket("evacuation_order", {"zone": "Zone 4"})
    assert ticket["requires_confirmation"] is True
