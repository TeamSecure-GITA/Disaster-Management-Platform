from output.action import ActionBuilder

def test_action_builder():
    builder = ActionBuilder()
    action = builder.create_action("Deploy Boat", "Deploy rescue boat to north jetty")
    assert action.urgency == "immediate"
