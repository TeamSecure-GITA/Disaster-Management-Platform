import pytest
from app.ai.tools.risk_tools import RiskTools
from app.ai.tools.shelter_tools import ShelterTools

@pytest.mark.asyncio
async def test_risk_tools():
    tools = RiskTools()
    res = await tools.analyze_risk({'hazard_type': 'flood', 'severity': 4})
    assert res is not None

@pytest.mark.asyncio
async def test_shelter_tools():
    tools = ShelterTools()
    res = await tools.search_shelters(latitude=19.07, longitude=72.87, radius_km=25.0)
    assert res is not None
