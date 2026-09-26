from generation.structured_output import StructuredOutputParser

def test_structured_output_parser():
    parser = StructuredOutputParser()
    out = parser.parse_to_schema("Flash flood warning active for sector 4.")
    assert "answer" in out
    assert out["answer"] == "Flash flood warning active for sector 4."
    assert "actions" in out
    assert isinstance(out["actions"], list)
    assert len(out["actions"]) > 0
