export const runtime = "nodejs";

export async function POST(req) {
    try {
        const pdfParse = require("pdf-parse/lib/pdf-parse.js");

        const { resumeBase64, jd = "" } = await req.json();

        if (!resumeBase64) {
            return new Response(
                JSON.stringify({ error: "Resume missing" }),
                { status: 400 }
            );
        }

        // pdf parse
        const buffer = Buffer.from(resumeBase64, "base64");
        const data = await pdfParse(buffer);

        const resumeText = data.text.toLowerCase();
        const jdText = jd.toLowerCase();

        // skills
        const skills = [
            "Python", "Java", "JavaScript", "C++", "C#",
            "Ruby", "Swift", "Go", "PHP", "HTML", "CSS",
            "SQL", "R", "Front-End Development",
            "Back-End Development", "Full-Stack Development",
            "Responsive Design", "React", "Angular", "Vue.js",
            "Node.js", "WordPress", "Data Analysis", "Big Data",
            "Data Mining", "Machine Learning",
            "Artificial Intelligence (AI)", "Data Structures",
            "Database Management (MySQL, PostgreSQL)",
            "Data Warehousing", "Salesforce", "HubSpot",
            "Zoho", "Freshsales"
        ];

        const skillWeights = {
            "Python": 5,
            "Java": 4,
            "JavaScript": 5,
            "C++": 3,
            "C#": 3,
            "Ruby": 2,
            "Swift": 3,
            "Go": 3,
            "PHP": 2,
            "HTML": 5,
            "CSS": 5,
            "SQL": 5,
            "R": 3,
            "Front-End Development": 4,
            "Back-End Development": 4,
            "Full-Stack Development": 5,
            "Responsive Design": 4,
            "React": 5,
            "Angular": 4,
            "Vue.js": 3,
            "Node.js": 4,
            "WordPress": 3,
            "Data Analysis": 5,
            "Big Data": 4,
            "Data Mining": 4,
            "Machine Learning": 5,
            "Artificial Intelligence (AI)": 5,
            "Data Structures": 5,
            "Database Management (MySQL, PostgreSQL)": 4,
            "Data Warehousing": 3,
            "Salesforce": 3,
            "HubSpot": 2,
            "Zoho": 2,
            "Freshsales": 2
        };

        // resume skills
        const resumeSkillCounts = {};

        skills.forEach(skill => {
            const s = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${s}\\b`, "g");
            const matches = resumeText.match(regex);
            if (matches) resumeSkillCounts[skill] = matches.length;
        });

        // jdskills
        const jdSkillCounts = {};

        skills.forEach(skill => {
            const s = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`\\b${s}\\b`, "g");
            const matches = jdText.match(regex);
            if (matches) jdSkillCounts[skill] = matches.length;
        });

        // match and missing skills
        const matchedSkills = {};
        const missingSkills = {};

        Object.keys(jdSkillCounts).forEach(skill => {
            if (resumeSkillCounts[skill]) {
                matchedSkills[skill] = jdSkillCounts[skill];
            } else {
                missingSkills[skill] = jdSkillCounts[skill];
            }
        });

        // ats score = matchedweight/totaljdweight * 100
        let matchedWeight = 0;
        let totalJDWeight = 0;

        Object.keys(jdSkillCounts).forEach(skill => {
            totalJDWeight += skillWeights[skill] || 1;
            if (matchedSkills[skill]) {
                matchedWeight += skillWeights[skill] || 1;
            }
        });

        const atsScore = totalJDWeight
            ? Math.round((matchedWeight / totalJDWeight) * 100)
            : 0;

        // skillsScore
        const totalJDSkills = Object.keys(jdSkillCounts).length;
        const matchedSkillCount = Object.keys(matchedSkills).length;

        const skillsScore = totalJDSkills
            ? Math.round((matchedSkillCount / totalJDSkills) * 100)
            : 0;

        // contentscore
        const words = resumeText.split(/\s+/).length;
        const wordScore = words > 500 ? 40 : words > 200 ? 30 : 15;

        const bulletCount = (resumeText.match(/•|-|\*/g) || []).length;
        const bulletScore = bulletCount > 10 ? 30 : bulletCount > 5 ? 20 : 10;

        const actionVerbs = ["developed", "built", "designed", "implemented", "led"];
        const actionCount = actionVerbs.filter(v => resumeText.includes(v)).length;
        const actionScore = Math.min(actionCount * 6, 30);

        const contentScore = Math.min(wordScore + bulletScore + actionScore, 100);

        // structure score
        const sections = ["education", "experience", "skills", "projects", "certifications"];
        let structureScore = 0;

        sections.forEach(section => {
            if (resumeText.includes(section)) structureScore += 15;
        });

        if (resumeText.match(/•|-|\*/)) structureScore += 10;
        if (resumeText.match(/\n[A-Z ]{5,}\n/)) structureScore += 10;

        structureScore = Math.min(structureScore, 100);

        // toneScore
        let toneScore = 100;

        ["was responsible for", "worked on", "helped with"].forEach(p => {
            if (resumeText.includes(p)) toneScore -= 10;
        });

        ["hardworking", "passionate", "team player"].forEach(b => {
            if (resumeText.includes(b)) toneScore -= 5;
        });

        toneScore = Math.max(toneScore, 50);

        // overallScore
        const overallScore = Math.round(
            atsScore * 0.4 +
            skillsScore * 0.25 +
            contentScore * 0.2 +
            structureScore * 0.1 +
            toneScore * 0.05
        );

        // need improvements
        const improvements = [];

        Object.keys(missingSkills).forEach(skill => {
            improvements.push(`Add missing skill: ${skill}`);
        });

        if (contentScore < 70) {
            improvements.push("Improve experience descriptions");
            improvements.push("Add quantified achievements");
        }

        if (toneScore < 70) {
            improvements.push("Use more action verbs");
            improvements.push("Avoid passive language");
        }

        if (structureScore < 70) {
            improvements.push("Improve resume structure with clear sections");
            improvements.push("Use bullet points consistently");
        }

        if (atsScore < 60 || skillsScore < 60) {
            improvements.push("Tailor resume more closely to the job description");
        }

        // response
        return new Response(
            JSON.stringify({
                pdfUrl: `data:application/pdf;base64,${resumeBase64}`,

                resumeskills: Object.keys(resumeSkillCounts),
                jobskills: Object.keys(jdSkillCounts),
                matchedSkills: Object.keys(matchedSkills),
                missingSkills: Object.keys(missingSkills),

                atsScore,
                skillsScore,
                contentScore,
                structureScore,
                toneScore,
                overallScore,

                improvements
            }),
            { status: 200 }
        );

    } catch (err) {
        console.error("ANALYZE ERROR:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500 }
        );
    }
}
