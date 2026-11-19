from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5-coder:7b"


class InterviewRequest(BaseModel):
    role: str


class GenerateQuestionsRequest(BaseModel):
    role: str
    difficulty: str
    count: int


class AnswerItem(BaseModel):
    id: int
    type: str
    question: str
    code_snippet: str = ""
    options: list[str] = []
    expected_answer: str = ""
    user_answer: str


class EvaluateAnswersRequest(BaseModel):
    role: str
    difficulty: str
    answers: list[AnswerItem]


@app.get("/")
def root():
    return {"message": "Backend is running"}


def clean_model_output(raw_output: str) -> str:
    cleaned_output = raw_output.strip()

    if cleaned_output.startswith("```json"):
        cleaned_output = cleaned_output[len("```json"):].strip()

    if cleaned_output.startswith("```"):
        cleaned_output = cleaned_output[len("```"):].strip()

    if cleaned_output.endswith("```"):
        cleaned_output = cleaned_output[:-3].strip()

    start = cleaned_output.find("{")
    end = cleaned_output.rfind("}") + 1

    if start != -1 and end != -1:
        cleaned_output = cleaned_output[start:end]

    return cleaned_output


def normalize_question(question: dict, index: int = 1):
    options = question.get("options", [])

    if not isinstance(options, list):
        options = []

    return {
        "id": int(question.get("id", index)),
        "type": str(question.get("type", "theory")),
        "question": str(question.get("question", "")),
        "code_snippet": str(question.get("code_snippet", "")),
        "options": options,
        "expected_answer": str(question.get("expected_answer", ""))
    }


def fix_evaluation_scores(parsed: dict) -> dict:
    reviews = parsed.get("reviews", [])

    if not isinstance(reviews, list) or len(reviews) == 0:
        parsed["overall_score"] = 0
        return parsed

    total_score = 0
    valid_review_count = 0

    for review in reviews:
        if not isinstance(review, dict):
            continue

        status = str(review.get("status", "")).lower().strip()
        feedback = str(review.get("feedback", "")).lower().strip()
        mistake = str(review.get("mistake", "")).lower().strip()

        try:
            score = int(review.get("score", 0))
        except Exception:
            score = 0

        score = max(0, min(score, 100))

        no_mistake_phrases = [
            "hata yok",
            "eksik yok",
            "yanlış yok",
            "problem yok",
            "cevap doğru",
            "doğru ve yeterli"
        ]

        has_no_mistake_text = any(
            phrase in mistake or phrase in feedback
            for phrase in no_mistake_phrases
        )

        if status == "correct" or has_no_mistake_text:
            score = 100
            review["status"] = "correct"

            if not review.get("feedback"):
                review["feedback"] = "Cevap doğru ve yeterli."

            if not review.get("mistake"):
                review["mistake"] = "Hata yok."

        elif status == "empty":
            score = 0

        elif status == "wrong":
            score = 0

        elif status == "partial":
            if score >= 100:
                score = 70
            elif score <= 0:
                score = 50

        review["score"] = score

        total_score += score
        valid_review_count += 1

    if valid_review_count > 0:
        parsed["overall_score"] = round(total_score / valid_review_count)
    else:
        parsed["overall_score"] = 0

    return parsed


@app.post("/generate-question")
def generate_question(data: InterviewRequest):
    role = data.role.strip()

    if not role:
        raise HTTPException(status_code=400, detail="Role alanı boş olamaz.")

    prompt = f"""
Sen bir yazılım mülakat simülatörüsün.

Adayın seçtiği rol: {role}

Bu role uygun yalnızca 1 tane teknik mülakat sorusu üret.

Soru türlerinden sadece birini seç:
1. theory
2. coding
3. multiple-choice
4. bug-fixing

Cevabı SADECE geçerli JSON formatında döndür.

JSON formatı kesinlikle şu şekilde olmalı:

{{
  "type": "theory",
  "question": "Türkçe soru metni",
  "code_snippet": "",
  "options": [],
  "expected_answer": "Bu sorunun ideal doğru cevabı"
}}

Kurallar:
- Soru dili kesinlikle Türkçe olacak.
- Açıklama varsa Türkçe olacak.
- Eğer soru coding veya bug-fixing türündeyse kodu "code_snippet" içine yaz.
- Kod İngilizce kalabilir, ama soru metni Türkçe olsun.
- Eğer soru multiple-choice türündeyse "options" dizisine tam 4 seçenek ekle.
- Multiple-choice seçenekleri Türkçe olsun.
- Eğer soru theory türündeyse "code_snippet" boş string olsun.
- Eğer soru theory türündeyse "options" boş liste olsun.
- Her soru için "expected_answer" alanını mutlaka doldur.
- expected_answer alanında sorunun ideal doğru cevabını Türkçe olarak açıkla.
- Eğer coding sorusuysa expected_answer içinde çözüm mantığını ve örnek kodu ver.
- Eğer multiple-choice sorusuysa expected_answer içinde doğru seçeneği ve neden doğru olduğunu belirt.
- Soru giriş-orta seviye adaya uygun olsun.
- JSON dışında hiçbir şey yazma.
- Markdown kullanma.
- ```json yazma.
- Açıklama cümlesi ekleme.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        response.raise_for_status()
        result = response.json()

        raw_output = result.get("response", "").strip()
        print("MODEL OUTPUT:", raw_output)

        if not raw_output:
            raise HTTPException(status_code=500, detail="Model boş cevap döndürdü.")

        cleaned_output = clean_model_output(raw_output)

        try:
            parsed = json.loads(cleaned_output)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Model geçerli JSON döndürmedi."
            )

        return normalize_question(parsed)

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=500,
            detail="Ollama çalışmıyor. Önce Ollama'yı aç ve modeli indir."
        )

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=500,
            detail="Model cevap verirken zaman aşımına uğradı."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Question generation failed: {str(e)}"
        )


@app.post("/generate-questions")
def generate_questions(data: GenerateQuestionsRequest):
    role = data.role.strip()
    difficulty = data.difficulty.strip().lower()
    count = data.count

    if not role:
        raise HTTPException(status_code=400, detail="Role alanı boş olamaz.")

    if not difficulty:
        raise HTTPException(status_code=400, detail="Difficulty alanı boş olamaz.")

    if count < 1 or count > 10:
        raise HTTPException(status_code=400, detail="Count 1 ile 10 arasında olmalı.")

    prompt = f"""
Sen bir yazılım mülakat simülatörüsün.

Adayın seçtiği rol: {role}
Zorluk seviyesi: {difficulty}

Bu role ve zorluk seviyesine uygun tam olarak {count} tane teknik mülakat sorusu üret.

Soru türleri karışık olabilir:
1. theory
2. coding
3. multiple-choice
4. bug-fixing

Cevabı SADECE geçerli JSON formatında döndür.

JSON formatı kesinlikle şu şekilde olmalı:

{{
  "questions": [
    {{
      "id": 1,
      "type": "theory",
      "question": "Türkçe soru metni",
      "code_snippet": "",
      "options": [],
      "expected_answer": "Bu sorunun ideal doğru cevabı"
    }}
  ]
}}

Kurallar:
- Tam olarak {count} soru üret.
- Soru dili kesinlikle Türkçe olacak.
- Açıklama varsa Türkçe olacak.
- Kod örneği gerekiyorsa kod İngilizce kalabilir.
- Ancak soru metni Türkçe olmak zorunda.
- "type" değerleri sadece şunlardan biri olabilir: theory, coding, multiple-choice, bug-fixing.
- Eğer soru coding veya bug-fixing türündeyse "code_snippet" alanını doldur.
- Eğer soru multiple-choice türündeyse "options" dizisine tam 4 Türkçe seçenek ekle.
- Eğer soru theory türündeyse "code_snippet" boş string olsun.
- Eğer soru theory türündeyse "options" boş liste olsun.
- Her soru için "expected_answer" alanını mutlaka doldur.
- expected_answer alanında sorunun ideal doğru cevabını Türkçe olarak açıkla.
- Eğer coding sorusuysa expected_answer içinde çözüm mantığını ve örnek kodu ver.
- Eğer multiple-choice sorusuysa expected_answer içinde doğru seçeneği ve neden doğru olduğunu belirt.
- Sorular {difficulty} seviyesine uygun olsun.
- JSON dışında hiçbir şey yazma.
- Markdown kullanma.
- ```json yazma.
- Açıklama cümlesi ekleme.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=180
        )

        response.raise_for_status()
        result = response.json()

        raw_output = result.get("response", "").strip()
        print("MODEL OUTPUT:", raw_output)

        if not raw_output:
            raise HTTPException(status_code=500, detail="Model boş cevap döndürdü.")

        cleaned_output = clean_model_output(raw_output)

        try:
            parsed = json.loads(cleaned_output)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Model geçerli JSON döndürmedi."
            )

        questions = parsed.get("questions", [])

        if not isinstance(questions, list):
            raise HTTPException(
                status_code=500,
                detail="Model geçerli bir questions listesi döndürmedi."
            )

        normalized_questions = []

        for index, question in enumerate(questions, start=1):
            if isinstance(question, dict):
                normalized_questions.append(normalize_question(question, index))

        if len(normalized_questions) == 0:
            raise HTTPException(
                status_code=500,
                detail="Model soru listesi döndürmedi."
            )

        return {
            "questions": normalized_questions[:count]
        }

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=500,
            detail="Ollama çalışmıyor. Önce Ollama'yı aç ve modeli indir."
        )

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=500,
            detail="Model cevap verirken zaman aşımına uğradı."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Questions generation failed: {str(e)}"
        )


@app.post("/evaluate-answers")
def evaluate_answers(data: EvaluateAnswersRequest):
    if not data.answers:
        raise HTTPException(
            status_code=400,
            detail="Değerlendirilecek cevap bulunamadı."
        )

    answers_text = json.dumps(
        [answer.model_dump() for answer in data.answers],
        ensure_ascii=False,
        indent=2
    )

    prompt = f"""
Sen deneyimli bir yazılım mülakat değerlendiricisisin.

Adayın rolü: {data.role}
Zorluk seviyesi: {data.difficulty}

Aşağıda adaya sorulan sorular, doğru cevaplar ve adayın verdiği cevaplar var.

Veriler:
{answers_text}

Görevin:
Adayın her cevabını tek tek değerlendir.

Kurallar:
- Değerlendirme dili kesinlikle Türkçe olacak.
- Değerlendirme yaparken özellikle expected_answer alanını referans al.
- Cevap doğruysa status değeri "correct" olsun.
- Cevap kısmen doğru ama eksikse status değeri "partial" olsun.
- Cevap yanlışsa status değeri "wrong" olsun.
- Cevap boşsa status değeri "empty" olsun.
- Eğer status "correct" ise score mutlaka 100 olmalı.
- Eğer mistake alanında "Hata yok" yazıyorsa score mutlaka 100 olmalı.
- Eğer cevap tamamen yanlışsa score 0 olmalı.
- Eğer cevap boşsa score 0 olmalı.
- Her soruya 0 ile 100 arasında score ver.
- overall_score, reviews içindeki score değerlerinin ortalaması olmalı.
- Eğer tek soru varsa overall_score, o sorunun score değeriyle aynı olmalı.
- correct_answer alanını expected_answer'a göre yaz.
- mistake alanında adayın yaptığı hatayı veya eksik bıraktığı noktayı yaz.
- En sonda adayın eksiklerine göre çalışma rehberi çıkar.
- Çalışma rehberi maddeleri kısa, net ve uygulanabilir olsun.
- Sadece JSON döndür.
- Markdown kullanma.
- ```json yazma.
- JSON dışında hiçbir açıklama yazma.

JSON formatı kesinlikle şu şekilde olsun:

{{
  "overall_score": 75,
  "summary": "Genel değerlendirme metni",
  "reviews": [
    {{
      "id": 1,
      "status": "correct",
      "score": 100,
      "feedback": "Cevap doğru ve yeterli.",
      "correct_answer": "Doğru cevap açıklaması.",
      "mistake": "Hata yok."
    }}
  ],
  "study_guide": [
    "Eksik olunan konuyu tekrar et.",
    "Benzer teknik mülakat soruları çöz.",
    "Kod okuma ve hata ayıklama pratiği yap."
  ]
}}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=240
        )

        response.raise_for_status()
        result = response.json()

        raw_output = result.get("response", "").strip()
        print("EVALUATION OUTPUT:", raw_output)

        if not raw_output:
            raise HTTPException(
                status_code=500,
                detail="Model boş değerlendirme döndürdü."
            )

        cleaned_output = clean_model_output(raw_output)

        try:
            parsed = json.loads(cleaned_output)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Model geçerli değerlendirme JSON'u döndürmedi."
            )

        parsed = fix_evaluation_scores(parsed)

        return parsed

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=500,
            detail="Ollama çalışmıyor. Önce Ollama'yı aç ve modeli indir."
        )

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=500,
            detail="Değerlendirme yapılırken zaman aşımına uğradı."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Answer evaluation failed: {str(e)}"
        )