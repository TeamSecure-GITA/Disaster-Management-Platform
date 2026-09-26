import json
from pathlib import Path
from intent_router.intent_classifier import IntentClassifier

def main():
    classifier = IntentClassifier()
    examples_file = Path(__file__).resolve().parent.parent / "data" / "examples" / "chat_examples.json"
    with open(examples_file) as f:
        data = json.load(f)
    correct = 0
    for item in data:
        res = classifier.classify(item["query"])
        if res.category.value == item["expected_intent"]:
            correct += 1
    accuracy = correct / len(data) if data else 0.0
    print(f"Intent Classifier Benchmark Accuracy: {accuracy*100:.1f}% ({correct}/{len(data)})")

if __name__ == "__main__":
    main()
