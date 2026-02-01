export const evaluateStudent = ({ student, job }) => {
  const reasons = [];
  const matchedSkills = [];

  const requiredSkills = job.eligibility.skills || [];
  const minSkillMatch = job.eligibility.minSkillMatch || 1;

  for (const skill of student.skills || []) {
    if (requiredSkills.includes(skill)) {
      matchedSkills.push(skill);
    }
  }

  if (matchedSkills.length < minSkillMatch) {
    reasons.push(
      `Required at least ${minSkillMatch} matching skills, found ${matchedSkills.length}.`
    );
  }

  return {
    status: reasons.length === 0 ? "SHORTLISTED" : "REJECTED",
    reasons,
    matchedSkills,
  };
};
