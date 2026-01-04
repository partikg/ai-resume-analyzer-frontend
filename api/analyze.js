import pdfParse from "pdf-parse";

const skills = [
    'Python', 'Java', 'JavaScript', 'C++', 'C#', 'Ruby', 'Swift', 'Go', 'PHP',
    'HTML', 'CSS', 'SQL', 'R', 'Front-End Development', 'Back-End Development',
    'Full-Stack Development', 'Responsive Design', 'React', 'Angular', 'Vue.js',
    'Node.js', 'WordPress', 'Data Analysis', 'Big Data', 'Data Mining',
    'Machine Learning', 'Artificial Intelligence (AI)', 'Data Structures',
    'Database Management (MySQL, PostgreSQL)', 'Data Warehousing',
    'Salesforce', 'HubSpot', 'Zoho', 'Freshsales'
];

const skillWeights = {
    Python: 5, Java: 4, JavaScript: 5, "C++": 3, "C#": 3, Ruby: 2, Swift: 3, Go: 3,
    PHP: 2, HTML: 5, CSS: 5, SQL: 5, R: 3,
    "Front-End Development": 4, "Back-End Development": 4,
    "Full-Stack Development": 5, "Responsive Design": 4,
    React: 5, Angular: 4, "Vue.js": 3, "Node.js": 4,
    WordPress: 3, "Data Analysis": 5, "Big Data": 4, "Data Mining": 4,
    "Machine Learning": 5, "Artificial Intelligence (AI)": 5,
    "Data Structures": 5,
    "Database Management (MySQL, PostgreSQL)": 4,
    "Data Warehousing": 3, Salesforce: 3, HubSpot: 2, Zoho: 2, Freshsales: 2
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Only POST allowed" });
    }

    try {
        const { resumeBase64, jd, company, jobTitle } = req.body;

        if (!resumeBase64 || !jd) {
            return res.status(400).json({ message: "Missing data" });
        }

        // base64 → buffer → pdf
        const buffer = Buffer.from(resumeBase64, "base64");
        const data = await pdfParse(buffer);

        const resumeText = data.text.toLowerCase();
        const jdText = jd.toLowerCase();

        const matchedSkillsCount = {};
        const jdmatchedSkillsCount = {};

        skills.forEach(skill => {
            const r = new RegExp(`\\b${skill.toLowerCase()}\\b`, "g");
            const rc = resumeText.match(r);
            const jc = jdText.match(r);

            if (rc) matchedSkillsCount[skill] = rc.length;
            if (jc) jdmatchedSkillsCount[skill] = jc.length;
        });

        const matchedSkills = {};
        const missingSkills = {};

        Object.keys(jdmatchedSkillsCount).forEach(skill => {
            matchedSkillsCount[skill]
                ? matchedSkills[skill] = true
                : missingSkills[skill] = true;
        });

        let matchedWeight = 0;
        let totalJDWeight = 0;

        Object.keys(jdmatchedSkillsCount).forEach(skill => {
            totalJDWeight += skillWeights[skill] || 1;
            if (matchedSkills[skill]) {
                matchedWeight += skillWeights[skill] || 1;
            }
        });

        const atsScore = totalJDWeight
            ? Math.round((matchedWeight / totalJDWeight) * 100)
            : 0;

        const skillsScore = Object.keys(jdmatchedSkillsCount).length
            ? Math.round(
                (Object.keys(matchedSkills).length /
                    Object.keys(jdmatchedSkillsCount).length) * 100
            )
            : 0;

        const contentScore = Math.min(100, resumeText.split(/\s+/).length > 300 ? 80 : 50);

        const structureScore = ["education", "experience", "skills", "projects"]
            .filter(s => resumeText.includes(s)).length * 20;

        const toneScore = resumeText.includes("responsible for") ? 70 : 90;

        const overallScore = Math.round(
            atsScore * 0.4 +
            skillsScore * 0.25 +
            contentScore * 0.2 +
            structureScore * 0.1 +
            toneScore * 0.05
        );

        res.json({
            resumeskills: Object.keys(matchedSkillsCount),
            jobskills: Object.keys(jdmatchedSkillsCount),
            matchedSkills: Object.keys(matchedSkills),
            missingSkills: Object.keys(missingSkills),
            atsScore,
            skillsScore,
            contentScore,
            structureScore,
            toneScore,
            overallScore,
            improvements: Object.keys(missingSkills).map(s => `Add skill: ${s}`)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
