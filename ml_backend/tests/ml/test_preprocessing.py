import pytest
from app.ml.preprocessing.cleaning import DataCleaner

def test_data_cleaner():
    cleaner = DataCleaner()
    res = cleaner.clean({'rainfall': 15.5, 'slope': None})
    assert res is not None
    assert 'rainfall' in res.cleaned_features
