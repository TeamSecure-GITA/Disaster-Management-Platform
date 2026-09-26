from safety.human_confirmation import HumanConfirmationManager

def test_human_confirmation_ticket():
    manager = HumanConfirmationManager()
    ticket = manager.generate_confirmation_ticket("evacuate_zone", {"zone": "Sector 3"})
    assert ticket["requires_confirmation"] is True
    assert ticket["action_type"] == "evacuate_zone"
    assert "WARNING" in ticket["confirmation_prompt"]
    assert ticket["details"]["zone"] == "Sector 3"
