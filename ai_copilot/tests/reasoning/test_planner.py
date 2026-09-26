from reasoning.planner import ReasoningPlanner

def test_reasoning_planner():
    planner = ReasoningPlanner()
    plan = planner.create_plan(goal="Evacuation", hypotheses=[], steps=[])
    assert plan.goal == "Evacuation"
