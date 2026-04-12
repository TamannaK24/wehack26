import json
from datetime import datetime, timezone
from pathlib import Path

from pymongo.errors import PyMongoError

from app.db import questions_collection

QUESTIONS_PATH = Path(__file__).resolve().parents[2] / "questions.json"
QUESTIONS_SOURCE_KEY = "questions.json"


def normalize_quiz_responses(responses):
    normalized_responses = []

    for item in responses:
        if not isinstance(item, dict):
            continue

        answer = item.get("answer", 0)
        if not isinstance(answer, int):
            try:
                answer = int(answer)
            except (TypeError, ValueError):
                answer = 0

        normalized_responses.append(
            {
                "id": str(item.get("id", "")),
                "question": str(item.get("question", "")),
                "answer": max(0, answer),
            }
        )

    return normalized_responses


def build_quiz_document(responses):
    return {
        "source": QUESTIONS_SOURCE_KEY,
        "submittedAt": datetime.now(timezone.utc).isoformat(),
        "responses": normalize_quiz_responses(responses),
    }


def save_quiz_document(document):
    QUESTIONS_PATH.write_text(json.dumps(document, indent=2), encoding="utf-8")


def sync_quiz_document_to_mongodb(document):
    questions_collection.replace_one(
        {"source": QUESTIONS_SOURCE_KEY},
        document,
        upsert=True,
    )


def persist_quiz_responses(responses):
    document = build_quiz_document(responses)
    save_quiz_document(document)

    try:
        sync_quiz_document_to_mongodb(document)
        mongo_synced = True
        mongo_error = None
    except PyMongoError as exc:
        mongo_synced = False
        mongo_error = str(exc)

    return {
        "document": document,
        "path": str(QUESTIONS_PATH),
        "mongoSynced": mongo_synced,
        "mongoError": mongo_error,
    }
