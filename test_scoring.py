from resume_Parser import JobD, Resume, MatchDetails, calculate_score


def test_perfect_score():
    job = JobD(
        role="Software Engineer",
        required_skills=["Python", "C++"],
        preferred_skills=["AWS"],
        minimum_experience=1,
        education_requirements=["B.Tech"],
        other_requirements=["Work authorization"],
        responsibilities=[]
    )

    resume = Resume(
        skills=["Python", "C++", "AWS"],
        education=["B.Tech"],
        total_experience_years=2
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=["Python", "C++", "AWS"],
        missing_important_skills=[],
        experience_requirement_met=True,
        education_requirement_met=True,
        other_requirements_met=True,
        final_verdict="Strong candidate"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 100


def test_partial_required_skills():
    job = JobD(
        role="Software Engineer",
        required_skills=["Python", "C++", "Java", "Go"],
        preferred_skills=[],
        minimum_experience=1,
        education_requirements=["B.Tech"],
        other_requirements=[],
        responsibilities=[]
    )

    resume = Resume(
        skills=["Python", "C++"],
        education=["B.Tech"],
        total_experience_years=2
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=["Python", "C++"],
        missing_important_skills=["Java", "Go"],
        experience_requirement_met=True,
        education_requirement_met=True,
        other_requirements_met=True,
        final_verdict="Good candidate"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 65


def test_no_experience_requirement():
    job = JobD(
        role="Software Engineer",
        required_skills=["Python"],
        preferred_skills=[],
        minimum_experience=None,
        education_requirements=[],
        other_requirements=[],
        responsibilities=[]
    )

    resume = Resume(
        skills=["Python"],
        education=[],
        total_experience_years=None
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=["Python"],
        missing_important_skills=[],
        experience_requirement_met=True,
        education_requirement_met=True,
        other_requirements_met=True,
        final_verdict="Good candidate"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 90

def test_skill_mismatch():
    job = JobD(
        role="Software Engineer",
        required_skills=["C", "SQL"],
        preferred_skills=[],
        minimum_experience=None,
        education_requirements=[],
        other_requirements=[],
        responsibilities=[]
    )

    resume = Resume(
        skills=["C++", "NoSQL"],
        education=[],
        total_experience_years=None
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=[],
        missing_important_skills=["C", "SQL"],
        experience_requirement_met=True,
        education_requirement_met=True,
        other_requirements_met=True,
        final_verdict="Not a match"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 40


def test_skill_normalization():
    job = JobD(
        role="Software Engineer",
        required_skills=["JavaScript", "React", "PostgreSQL", "Object Oriented Programming"],
        preferred_skills=[],
        minimum_experience=None,
        education_requirements=[],
        other_requirements=[],
        responsibilities=[]
    )

    resume = Resume(
        skills=["JS", "React.js", "Postgres", "OOP"],
        education=[],
        total_experience_years=None
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=["JS", "React.js", "Postgres", "OOP"],
        missing_important_skills=[],
        experience_requirement_met=True,
        education_requirement_met=True,
        other_requirements_met=True,
        final_verdict="Strong candidate"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 90

def test_skill_normalization_does_not_create_false_match():
    job = JobD(
        role="Software Engineer",
        required_skills=["C", "SQL"],
        preferred_skills=[],
        minimum_experience=None,
        education_requirements=[],
        other_requirements=[],
        responsibilities=[]
    )

    resume = Resume(
        skills=["C++", "NoSQL"],
        education=[],
        total_experience_years=None
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=[],
        missing_important_skills=["C", "SQL"],
        experience_requirement_met=True,
        education_requirement_met=True,
        other_requirements_met=True,
        final_verdict="Not a match"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 40

def test_experience_requirement_not_met():
    job = JobD(
        role="Software Engineer",
        required_skills=["Python"],
        preferred_skills=[],
        minimum_experience=2,
        education_requirements=[],
        other_requirements=[],
        responsibilities=[]
    )

    resume = Resume(
        skills=["Python"],
        education=[],
        total_experience_years=1
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=["Python"],
        missing_important_skills=[],
        experience_requirement_met=False,
        education_requirement_met=True,
        other_requirements_met=True,
        final_verdict="Insufficient experience"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 65

def test_education_requirement_not_met():
    job = JobD(
        role="Software Engineer",
        required_skills=["Python"],
        preferred_skills=[],
        minimum_experience=None,
        education_requirements=["B.Tech"],
        other_requirements=[],
        responsibilities=[]
    )

    resume = Resume(
        skills=["Python"],
        education=["B.A."],
        total_experience_years=None
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=["Python"],
        missing_important_skills=[],
        experience_requirement_met=True,
        education_requirement_met=False,
        other_requirements_met=True,
        final_verdict="Education requirement not met"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 80

def test_other_requirement_not_met():
    job = JobD(
        role="Software Engineer",
        required_skills=["Python"],
        preferred_skills=[],
        minimum_experience=None,
        education_requirements=[],
        other_requirements=["Work authorization"],
        responsibilities=[]
    )

    resume = Resume(
        skills=["Python"],
        education=[],
        total_experience_years=None
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=["Python"],
        missing_important_skills=[],
        experience_requirement_met=True,
        education_requirement_met=True,
        other_requirements_met=False,
        final_verdict="Other requirement not met"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert score == 85

def test_score_breakdown():
    job = JobD(
        role="Software Engineer",
        required_skills=["Python", "C++"],
        preferred_skills=["AWS"],
        minimum_experience=2,
        education_requirements=["B.Tech"],
        other_requirements=["Work authorization"],
        responsibilities=[]
    )

    resume = Resume(
        skills=["Python", "AWS"],
        education=["B.Tech"],
        total_experience_years=2
    )

    details = MatchDetails(
        candidate_name="Test Candidate",
        matching_skills=["Python"],
        missing_important_skills=["C++"],
        experience_requirement_met=True,
        education_requirement_met=True,
        other_requirements_met=True,
        final_verdict="Good candidate"
    )

    score, breakdown = calculate_score(job, resume, details)

    assert breakdown.required_skills == 25
    assert breakdown.experience == 25
    assert breakdown.preferred_skills == 10
    assert breakdown.education == 10
    assert breakdown.other_requirements == 5
    assert score == 75