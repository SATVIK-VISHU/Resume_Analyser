from io import BytesIO

from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def create_test_pdf():
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (
            b"<< /Type /Page /Parent 2 0 R "
            b"/MediaBox [0 0 612 792] "
            b"/Resources << /Font << /F1 5 0 R >> >> "
            b"/Contents 4 0 R >>"
        ),
        (
            b"<< /Length 48 >>\n"
            b"stream\n"
            b"BT /F1 12 Tf 72 720 Td (Test resume) Tj ET\n"
            b"endstream"
        ),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]

    pdf = b"%PDF-1.4\n"
    offsets = [0]

    for i, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf += f"{i} 0 obj\n".encode()
        pdf += obj
        pdf += b"\nendobj\n"

    xref_offset = len(pdf)

    pdf += f"xref\n0 {len(objects) + 1}\n".encode()
    pdf += b"0000000000 65535 f \n"

    for offset in offsets[1:]:
        pdf += f"{offset:010d} 00000 n \n".encode()

    pdf += (
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_offset}\n%%EOF"
    ).encode()

    return BytesIO(pdf)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_invalid_resume_extension():
    response = client.post(
        "/analyze",
        files={
            "resume": (
                "resume.txt",
                BytesIO(b"dummy resume"),
                "text/plain",
            )
        },
        data={
            "job_title": "Software Engineer",
            "job_description": "Looking for a Python developer.",
        },
    )

    assert response.status_code == 400


def test_missing_job_description():
    response = client.post(
        "/analyze",
        files={
            "resume": (
                "resume.pdf",
                BytesIO(b"dummy resume"),
                "application/pdf",
            )
        },
        data={
            "job_title": "Software Engineer",
            "job_description": "",
        },
    )

    assert response.status_code == 400


def test_resume_too_large():
    large_file = BytesIO(b"x" * (10 * 1024 * 1024 + 1))

    response = client.post(
        "/analyze",
        files={
            "resume": (
                "resume.pdf",
                large_file,
                "application/pdf",
            )
        },
        data={
            "job_title": "Software Engineer",
            "job_description": "Looking for a Python developer.",
        },
    )

    assert response.status_code == 400


def test_stream_invalid_resume_extension():
    response = client.post(
        "/analyze-stream",
        files={
            "resume": (
                "resume.txt",
                BytesIO(b"dummy resume"),
                "text/plain",
            )
        },
        data={
            "job_title": "Software Engineer",
            "job_description": "Looking for a Python developer.",
        },
    )

    assert response.status_code == 200

    events = response.text.strip().splitlines()

    assert len(events) >= 1
    assert '"type": "error"' in events[0]
    assert "Resume must be a PDF or DOCX file." in events[0]


def test_stream_missing_job_description():
    resume_file = create_test_pdf()

    response = client.post(
        "/analyze-stream",
        files={
            "resume": (
                "resume.pdf",
                resume_file,
                "application/pdf",
            )
        },
        data={
            "job_title": "Software Engineer",
            "job_description": "",
        },
    )

    assert response.status_code == 200

    events = response.text.strip().splitlines()

    assert len(events) >= 1
    assert '"type": "error"' in events[-1]
    assert "job description" in events[-1].lower()