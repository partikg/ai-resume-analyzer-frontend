export const runtime = "nodejs";

/* ===================== API ===================== */

export async function POST(req) {
    try {
        // ✅ FORCE pure CommonJS parser (NO tests, NO canvas)
        const pdfParse = require("pdf-parse/lib/pdf-parse.js");

        const { resumeBase64, jd = "" } = await req.json();

        if (!resumeBase64) {
            return new Response(
                JSON.stringify({ error: "Resume missing" }),
                { status: 400 }
            );
        }

        /* ---------- PDF TEXT EXTRACTION ---------- */
        const buffer = Buffer.from(resumeBase64, "base64");
        const data = await pdfParse(buffer); // ⬅️ buffer ONLY

        const resumeText = data.text.toLowerCase();
        const jdText = jd.toLowerCase();

        /* ---------- SIMPLE ANALYSIS (STABLE) ---------- */
        const skills = [
            "javascript", "react", "node", "html", "css",
            "python", "java", "sql", "data structures"
        ];

        const resumeSkills = skills.filter(s => resumeText.includes(s));
        const jdSkills = skills.filter(s => jdText.includes(s));

        const matchedSkills = resumeSkills.filter(s => jdSkills.includes(s));
        const missingSkills = jdSkills.filter(s => !resumeSkills.includes(s));

        const atsScore = jdSkills.length
            ? Math.round((matchedSkills.length / jdSkills.length) * 100)
            : 0;

        const toneScore = 40;
        const contentScore = 55;
        const structureScore = 60;
        const skillsScore = atsScore;

        return new Response(
            JSON.stringify({
                pdfUrl: `data:application/pdf;base64,${resumeBase64}`,

                // scores
                overallScore: atsScore,
                atsScore,
                toneScore,
                contentScore,
                structureScore,
                skillsScore,

                // skills
                resumeskills: resumeSkills,
                jobskills: jdSkills,
                matchedSkills,
                missingSkills,

                // improvements
                improvements: missingSkills.map(
                    s => `Add ${s} to your resume`
                )
            }),
            { status: 200 }
        );

    } catch (err) {
        console.error("PDF ERROR:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500 }
        );
    }
}
