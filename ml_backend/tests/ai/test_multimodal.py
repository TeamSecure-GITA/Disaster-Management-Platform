import pytest
from app.ai.multimodal.image import ImageAnalyzer
from app.ai.multimodal.video import VideoAnalyzer

def test_image_analyzer_synthetic(tmp_path):
    img_file = tmp_path / "test_drone.jpg"
    img_file.write_bytes(b"\xff\xd8\xff\xe0" + b"\x00" * 100)
    analyzer = ImageAnalyzer()
    res = analyzer.analyze(str(img_file), context="flood debris")
    assert res is not None
    assert res.success is True
    assert res.status in ("provider_not_connected", "completed", "mock_completed", "success")

def test_video_analyzer_synthetic(tmp_path):
    vid_file = tmp_path / "test_drone.mp4"
    vid_file.write_bytes(b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 100)
    analyzer = VideoAnalyzer()
    res = analyzer.analyze(str(vid_file))
    assert res is not None
    assert res.success is True
    assert res.status in ("provider_not_connected", "completed", "mock_completed", "success")
