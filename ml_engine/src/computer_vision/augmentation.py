"""Image augmentation utilities."""
from __future__ import annotations

import numpy as np


class ImageAugmentor:
    """Performs basic geometric and photometric transformations."""

    def augment(self, image: np.ndarray) -> list[np.ndarray]:
        # Horizontal flip & brightness adjustment
        h_flip = np.fliplr(image)
        bright = np.clip(image.astype(np.float32) * 1.2, 0, 255).astype(np.uint8)
        return [image, h_flip, bright]
