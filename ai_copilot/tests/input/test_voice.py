from input.voice.audio_processor import AudioProcessor
from input.voice.speech_to_text import SpeechToTextService
from input.voice.voice_validator import VoiceValidator

def test_voice_processing():
    proc = AudioProcessor()
    stt = SpeechToTextService()
    val = VoiceValidator()
    raw = b"RIFF" + b"\x00" * 1000
    meta = proc.process_audio_bytes(raw, "audio/wav")
    assert meta["is_processable"] is True
    ok, _ = val.validate(raw, "audio/wav")
    assert ok is True
    res = stt.transcribe("mock_base64")
    assert res["confidence"] > 0.9
