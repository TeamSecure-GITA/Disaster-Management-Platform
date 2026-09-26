from safety.permission_check import PermissionChecker
from schemas.context import UserRole

def test_permission_checker():
    checker = PermissionChecker()
    ok_commander, _ = checker.check_permission(UserRole.INCIDENT_COMMANDER, "evacuation_order")
    assert ok_commander is True
    ok_citizen, _ = checker.check_permission(UserRole.CITIZEN, "evacuation_order")
    assert ok_citizen is False
