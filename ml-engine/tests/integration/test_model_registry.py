from pipelines.deployment.package_model import package_model_artifacts
from pipelines.deployment.register_model import register_model_to_registry
from pipelines.deployment.promote_model import promote_model_stage


def test_model_registry_lifecycle():
    pkg = package_model_artifacts("landslide", version="1.0.0")
    assert pkg.exists()
    assert (pkg / "manifest.json").exists()

    reg = register_model_to_registry("landslide", version="1.0.0", stage="development")
    assert reg.exists()
    assert (reg / "registry_meta.json").exists()

    stg = register_model_to_registry("landslide", version="1.0.0", stage="staging")
    promo = promote_model_stage("landslide", version="1.0.0", from_stage="staging", to_stage="production")
    assert promo.exists()
    assert (promo / "promotion_meta.json").exists()
