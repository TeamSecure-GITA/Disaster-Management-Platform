from output.answer import AnswerFormatter

def test_answer_formatter():
    fmt = AnswerFormatter()
    res = fmt.format("Emergency update.", ["Sound siren", "Close gates"])
    assert "Key Action Items:" in res
