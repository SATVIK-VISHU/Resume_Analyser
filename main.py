import json
import logging
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from resume_Parser import (
    parse_job_description,
    parse_resume,
    final_score,
    read_resume,
)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Resume Screener API",
    description="Backend API for AI-powered resume analysis",
    version="1.0.0",
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://resume-analyser-1-axrf.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AI Resume Screener API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str | None = Form(None),
    job_description_file: UploadFile | None = File(None),
):
    # Check resume extension
    file_extension = Path(resume.filename).suffix.lower()

    if file_extension not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail="Resume must be a PDF or DOCX file."
        )

    # --------------------------------
    # Get job description
    # --------------------------------

    if job_description and job_description.strip():
        final_job_description = job_description

    elif job_description_file:
        jd_extension = Path(job_description_file.filename).suffix.lower()

        if jd_extension not in [".pdf", ".docx", ".txt"]:
            raise HTTPException(
                status_code=400,
                detail="Job description must be a PDF, DOCX, or TXT file."
            )

        if jd_extension == ".txt":
            jd_content = await job_description_file.read()

            if len(jd_content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="Job description file must be 10 MB or smaller."
                )

            try:
                final_job_description = jd_content.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Job description TXT file must be UTF-8 encoded."
                )

        else:
            temp_jd_path = Path(
                tempfile.gettempdir()
            ) / f"job_description_{next(tempfile._get_candidate_names())}{jd_extension}"
            jd_content = await job_description_file.read()

            if len(jd_content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="Job description file must be 10 MB or smaller."
                )

            temp_jd_path.write_bytes(jd_content)

            try:
                final_job_description = read_resume(temp_jd_path)

                if not final_job_description:
                    raise HTTPException(
                        status_code=400,
                        detail="Could not extract text from job description file."
                    )

            finally:
                if temp_jd_path.exists():
                    temp_jd_path.unlink()

    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide a job description or upload a JD file."
        )

    # Save uploaded resume temporarily
    temp_path = Path(
        tempfile.gettempdir()
    ) / f"resume_{next(tempfile._get_candidate_names())}{file_extension}"

    file_content = await resume.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Resume file must be 10 MB or smaller."
        )
    temp_path.write_bytes(file_content)

    try:
        # Read resume
        resume_text = read_resume(temp_path)

        if not resume_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from resume."
            )

        # Parse job description
        job = parse_job_description(final_job_description)

        # Parse resume
        parsed_resume = parse_resume(resume_text)

        # Compare resume with job
        result = final_score(job, parsed_resume)

        return {
            "candidate": parsed_resume.model_dump(),
            "job": job.model_dump(),
            "result": result.model_dump(),
        }

    finally:
        if temp_path.exists():
            temp_path.unlink()


@app.post("/analyze-stream")
async def analyze_resume_stream(
    resume: UploadFile = File(...),
    job_description: str | None = Form(None),
    job_description_file: UploadFile | None = File(None),
):
    async def generate():
        try:
            # -----------------------------
            # Validate resume
            # -----------------------------

            file_extension = Path(resume.filename).suffix.lower()

            if file_extension not in [".pdf", ".docx"]:
                yield json.dumps({
                    "type": "error",
                    "message": "Resume must be a PDF or DOCX file."
                }) + "\n"
                return

            yield json.dumps({
                "type": "progress",
                "stage": "Reading resume",
                "message": "Reading uploaded resume..."
            }) + "\n"

            temp_resume_path = Path(
                tempfile.gettempdir()
            ) / f"resume_stream_{next(tempfile._get_candidate_names())}{file_extension}"
            
            file_content = await resume.read()

            if len(file_content) > MAX_FILE_SIZE:
                yield json.dumps({
                    "type": "error",
                    "message": "Resume file must be 10 MB or smaller."
                }) + "\n"
                return
            
            temp_resume_path.write_bytes(file_content)

            try:
                resume_text = read_resume(temp_resume_path)
            finally:
                if temp_resume_path.exists():
                    temp_resume_path.unlink()

            if not resume_text:
                yield json.dumps({
                    "type": "error",
                    "message": "Could not extract text from resume."
                }) + "\n"
                return

            # -----------------------------
            # Get job description
            # -----------------------------

            if job_description and job_description.strip():
                final_job_description = job_description

            elif job_description_file:
                jd_extension = Path(
                    job_description_file.filename
                ).suffix.lower()

                if jd_extension not in [".pdf", ".docx", ".txt"]:
                    yield json.dumps({
                        "type": "error",
                        "message": "Job description must be a PDF, DOCX, or TXT file."
                    }) + "\n"
                    return

                if jd_extension == ".txt":
                    jd_content = await job_description_file.read()

                    if len(jd_content) > MAX_FILE_SIZE:
                        yield json.dumps({
                            "type": "error",
                            "message": "Job description file must be 10 MB or smaller."
                        }) + "\n"
                        return

                    try:
                        final_job_description = jd_content.decode("utf-8")
                    except UnicodeDecodeError:
                        yield json.dumps({
                            "type": "error",
                            "message": "Job description TXT file must be UTF-8 encoded."
                        }) + "\n"
                        return

                else:
                    temp_jd_path = Path(
                        tempfile.gettempdir()
                    ) / f"job_description_stream_{next(tempfile._get_candidate_names())}{jd_extension}"

                    jd_content = await job_description_file.read()

                    if len(jd_content) > MAX_FILE_SIZE:
                        yield json.dumps({
                            "type": "error",
                            "message": "Job description file must be 10 MB or smaller."
                        }) + "\n"
                        return

                    temp_jd_path.write_bytes(jd_content)

                    try:
                        final_job_description = read_resume(temp_jd_path)
                    finally:
                        if temp_jd_path.exists():
                            temp_jd_path.unlink()

                    if not final_job_description:
                        yield json.dumps({
                            "type": "error",
                            "message": "Could not extract text from job description file."
                        }) + "\n"
                        return

            else:
                yield json.dumps({
                    "type": "error",
                    "message": "Please provide a job description or upload a JD file."
                }) + "\n"
                return

            # -----------------------------
            # Parse job description
            # -----------------------------

            yield json.dumps({
                "type": "progress",
                "stage": "Understanding job",
                "message": "Understanding job requirements..."
            }) + "\n"

            job = parse_job_description(final_job_description)

            # -----------------------------
            # Parse resume
            # -----------------------------

            yield json.dumps({
                "type": "progress",
                "stage": "Analyzing candidate",
                "message": "Analyzing candidate experience and skills..."
            }) + "\n"

            parsed_resume = parse_resume(resume_text)

            # -----------------------------
            # Final comparison
            # -----------------------------

            yield json.dumps({
                "type": "progress",
                "stage": "Generating recommendation",
                "message": "Generating hiring recommendation..."
            }) + "\n"

            result = final_score(job, parsed_resume)

            # -----------------------------
            # Final result
            # -----------------------------

            yield json.dumps({
                "type": "result",
                "data": {
                    "candidate": parsed_resume.model_dump(),
                    "job": job.model_dump(),
                    "result": result.model_dump(),
                }
            }) + "\n"

        except Exception as e:
            logger.exception("Unexpected error during /analyze-stream")

            yield json.dumps({
                "type": "error",
                "message": "Something went wrong while analyzing the resume. Please try again."
            }) + "\n"

    return StreamingResponse(
        generate(),
        media_type="application/x-ndjson",
    )